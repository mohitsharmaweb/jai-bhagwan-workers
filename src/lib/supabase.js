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
 * Register a new worker (Public endpoint)
 * Note: Public/anon users only have INSERT permission (no SELECT),
 * so we must NOT chain .select() here.
 */
export const registerWorker = async (workerData) => {
  const normMobile = normalizePhoneNumber(workerData.mobile);
  const normWhatsapp = normalizePhoneNumber(workerData.whatsapp || workerData.mobile);

  const payload = {
    name: workerData.name.trim(),
    mobile: normMobile,
    whatsapp: normWhatsapp,
    profession: workerData.profession,
    profession_other: workerData.profession_other || null,
    experience: parseInt(workerData.experience, 10) || 0,
    area: workerData.area,
    area_other: workerData.area_other || null,
    address: workerData.address ? workerData.address.trim() : null,
    consent: Boolean(workerData.consent),
    status: 'active',
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('workers')
    .insert([payload]);

  if (error) {
    const err = new Error(error.message || 'पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।');
    err.code = error.code;
    throw err;
  }

  return payload;
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
  return data || [];
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
  return data || [];
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

  const { data, error } = await supabase
    .from('workers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating worker in Supabase:', error);
    const err = new Error(error.message);
    err.code = error.code;
    throw err;
  }
  return data;
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
