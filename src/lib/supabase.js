import { createClient } from '@supabase/supabase-js';

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
 */
export const registerWorker = async (workerData) => {
  const payload = {
    name: workerData.name.trim(),
    mobile: workerData.mobile.trim(),
    whatsapp: (workerData.whatsapp || workerData.mobile).trim(),
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
    if (error.code === '23505') {
      throw new Error('DUPLICATE_MOBILE');
    }
    throw new Error(error.message || 'पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।');
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
 * Update worker details (For Logged-in Admin)
 */
export const updateWorker = async (id, updates) => {
  const { data, error } = await supabase
    .from('workers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating worker in Supabase:', error);
    throw error;
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
