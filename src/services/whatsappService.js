import { supabase } from '../lib/supabase';
import { compileTemplate } from '../constants/templates';
import { normalizePhoneNumber } from '../utils/formatters';

/**
 * Format 10-digit Indian phone number to WhatsApp international standard
 * e.g., 9829012345 -> 919829012345
 */
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '';
  const digits = normalizePhoneNumber(phone);
  return digits ? `91${digits}` : '';
};

/**
 * Generate direct click-to-chat wa.me link
 * @param {string} phone 10-digit or 12-digit number
 * @param {string} text Message body
 */
export const createWhatsAppChatUrl = (phone, text) => {
  const formattedPhone = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
};

/**
 * Open WhatsApp directly in a new window/tab or mobile app
 */
export const openWhatsAppChat = (phone, text) => {
  const url = createWhatsAppChatUrl(phone, text);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Save sent message log into Supabase 'message_logs' table
 */
export const recordMessageLog = async ({ workerId, workerName, workerMobile, templateType = 'custom', message }) => {
  try {
    const { data, error } = await supabase
      .from('message_logs')
      .insert([
        {
          worker_id: workerId || null,
          worker_name: workerName,
          worker_mobile: workerMobile,
          template_type: templateType,
          message: message,
          sent_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn('Could not record message log to Supabase:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Exception recording message log:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Architecture hook for future Meta WhatsApp Business Cloud API
 * When ready, call a Supabase Edge Function or backend endpoint:
 * POST /api/send-whatsapp
 */
export const sendViaCloudApi = async ({ phone, templateName, variables }) => {
  // Placeholder ready for WhatsApp Cloud API integration
  console.log('Sending via WhatsApp Cloud API:', { phone, templateName, variables });
  // Example future implementation:
  // return await fetch('/api/whatsapp-cloud-send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ phone, templateName, variables })
  // });
  return { success: true, mode: 'cloud_api_ready' };
};
