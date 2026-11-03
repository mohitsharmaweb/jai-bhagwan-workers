import { createClient } from '@supabase/supabase-js';
import { normalizePhoneNumber } from '../utils/formatters';

// Retrieve credentials from environment
const getSupabaseConfig = () => {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

  const url = metaEnv.VITE_SUPABASE_URL || procEnv.VITE_SUPABASE_URL || 'https://emrsmroridoytmjxibqb.supabase.co';
  const anonKey = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY || procEnv.VITE_SUPABASE_ANON_KEY || procEnv.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ThRrOTnESMRzlxh0pgxXJg_w9hueTDm';

  return { url, anonKey };
};

export const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabaseConfig();

// Initialize Pure Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// ==============================================================================
// SUPABASE DATABASE OPERATIONS
// ==============================================================================

/**
 * Unpacks worker object: extracts photo and reference if they were safely packed into address.
 */
export const unpackWorker = (w) => {
  if (!w) return w;
  let photo = w.photo || '';
  let reference = w.reference || '';
  let address = w.address || '';

  if (address && address.includes('[__META__:')) {
    try {
      const match = address.match(/\[__META__:([\s\S]*?)\]$/);
      if (match && match[1]) {
        const meta = JSON.parse(match[1]);
        if (!photo && meta.photo) photo = meta.photo;
        if (!reference && meta.reference) reference = meta.reference;
        address = address.replace(/\[__META__:[\s\S]*?\]$/, '').trim();
      }
    } catch (e) {
      console.warn('Could not parse packed worker address meta:', e);
    }
  }

  return {
    ...w,
    photo,
    reference,
    address
  };
};

/**
 * Register a new worker (Public endpoint)
 * Note: Public/anon users only have INSERT permission (no SELECT),
 * so we must NOT chain .select() here.
 */
export const registerWorker = async (workerData) => {
  const normMobile = normalizePhoneNumber(workerData.mobile);
  const normWhatsapp = normalizePhoneNumber(workerData.whatsapp || workerData.mobile);

  const rawAddress = workerData.address ? workerData.address.trim() : '';
  const photo = workerData.photo || null;
  const reference = workerData.reference ? workerData.reference.trim() : null;

  const basePayload = {
    name: workerData.name.trim(),
    mobile: normMobile,
    whatsapp: normWhatsapp,
    profession: workerData.profession,
    profession_other: workerData.profession_other || null,
    experience: parseInt(workerData.experience, 10) || 0,
    area: workerData.area,
    area_other: workerData.area_other || null,
    consent: Boolean(workerData.consent),
    status: 'active',
    created_at: new Date().toISOString()
  };

  // Attempt 1: Try with dedicated columns
  const fullPayload = {
    ...basePayload,
    address: rawAddress || null,
    reference: reference,
    photo: photo
  };

  let { error } = await supabase
    .from('workers')
    .insert([fullPayload]);

  // Self-healing fallback: if 'photo' or 'reference' columns do not exist yet in Supabase schema (PGRST204 / 42703)
  if (error && (error.code === 'PGRST204' || error.code === '42703' || (error.message && error.message.includes('schema cache')))) {
    console.warn('Supabase missing dedicated columns, packing photo/reference safely into address:', error.message);

    // Pack photo & reference into address so photo is NEVER LOST!
    let packedAddress = rawAddress;
    if (photo || reference) {
      const meta = {};
      if (photo) meta.photo = photo;
      if (reference) meta.reference = reference;
      packedAddress = `${rawAddress}\n[__META__:${JSON.stringify(meta)}]`.trim();
    }

    const fallbackPayload = {
      ...basePayload,
      address: packedAddress || null
    };

    const retryRes = await supabase
      .from('workers')
      .insert([fallbackPayload]);

    error = retryRes.error;
  }

  if (error) {
    const err = new Error(error.message || 'पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।');
    err.code = error.code;
    throw err;
  }

  return {
    ...fullPayload,
    photo,
    reference,
    address: rawAddress
  };
};

/**
 * Fetch all registered workers (For Logged-in Admin)
 */
export const fetchAllWorkers = async () => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workers from Supabase:', error);
    throw error;
  }
  return (data || []).map(unpackWorker);
};

/**
 * Fetch only consented, active workers (For Meeting / WhatsApp dispatch)
 * Filters at DB level: consent = true, status = 'active'
 */
export const fetchConsentedWorkers = async () => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('consent', true)
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching consented workers from Supabase:', error);
    throw error;
  }
  return (data || []).map(unpackWorker);
};

/**
 * Update worker details (For Logged-in Admin)
 */
export const updateWorker = async (id, updates) => {
  const payload = { ...updates };
  if (payload.mobile) {
    payload.mobile = normalizePhoneNumber(payload.mobile);
  }
  if (payload.whatsapp) {
    payload.whatsapp = normalizePhoneNumber(payload.whatsapp);
  }

  const rawAddress = payload.address ? payload.address.trim() : '';
  const photo = payload.photo || null;
  const reference = payload.reference ? payload.reference.trim() : null;

  let { data, error } = await supabase
    .from('workers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  // Self-healing fallback: if 'photo' or 'reference' columns do not exist yet in Supabase schema cache
  if (error && (error.code === 'PGRST204' || error.code === '42703' || (error.message && error.message.includes('schema cache')))) {
    console.warn('Supabase missing optional columns on update, packing into address:', error.message);
    const fallbackPayload = { ...payload };
    delete fallbackPayload.photo;
    delete fallbackPayload.reference;

    if (photo || reference) {
      const meta = {};
      if (photo) meta.photo = photo;
      if (reference) meta.reference = reference;
      fallbackPayload.address = `${rawAddress}\n[__META__:${JSON.stringify(meta)}]`.trim();
    }

    const retryRes = await supabase
      .from('workers')
      .update(fallbackPayload)
      .eq('id', id)
      .select()
      .single();

    data = retryRes.data;
    error = retryRes.error;
  }

  if (error) {
    console.error('Error updating worker in Supabase:', error);
    const err = new Error(error.message);
    err.code = error.code;
    throw err;
  }
  return unpackWorker(data);
};

/**
 * Delete a worker (For Logged-in Admin)
 */
export const deleteWorker = async (id) => {
  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting worker in Supabase:', error);
    throw error;
  }
  return true;
};

/**
 * Fetch message dispatch history (For Logged-in Admin)
 */
export const fetchMessageLogs = async () => {
  const { data, error } = await supabase
    .from('message_logs')
    .select('*')
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error fetching message logs from Supabase:', error);
    return [];
  }
  return data || [];
};

/**
 * Record sent message log (For Logged-in Admin)
 */
export const logMessageSent = async (logData) => {
  const payload = {
    worker_id: logData.workerId || null,
    worker_name: logData.workerName,
    worker_mobile: logData.workerMobile,
    template_type: logData.templateType || 'custom',
    message: logData.message,
    sent_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('message_logs')
    .insert([payload])
    .select();

  if (error) {
    console.warn('Supabase message log insert issue:', error.message);
  }
  return data;
};

// ==============================================================================
// MEETINGS OPERATIONS (ADMIN ONLY)
// ==============================================================================

/**
 * Create a new meeting (Admin only)
 */
export const createMeeting = async (meetingData) => {
  const payload = {
    title: meetingData.title.trim(),
    meeting_date: meetingData.meeting_date,
    meeting_time: meetingData.meeting_time,
    location: meetingData.location.trim(),
    notes: meetingData.notes ? meetingData.notes.trim() : null,
    target_trade: meetingData.target_trade || 'all',
    target_area: meetingData.target_area || 'all',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('meetings')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error creating meeting in Supabase:', error);
    const err = new Error(error.message);
    err.code = error.code;
    throw err;
  }
  return data;
};

/**
 * Fetch all meetings (Admin only)
 */
export const fetchMeetings = async () => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching meetings from Supabase:', error);
    throw error;
  }
  return data || [];
};

/**
 * Delete a meeting (Admin only)
 */
export const deleteMeeting = async (id) => {
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting meeting from Supabase:', error);
    const err = new Error(error.message);
    err.code = error.code;
    throw err;
  }
  return true;
};
