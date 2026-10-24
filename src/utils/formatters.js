/**
 * Validates 10-digit Indian mobile number starting with 6, 7, 8, or 9
 */
export function validateIndianPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.toString().trim().replace(/[\s\-\+]/g, '');
  const digitsOnly = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
  return /^[6-9]\d{9}$/.test(digitsOnly);
}

/**
 * Cleans phone number to standard 10 digits
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.toString().trim().replace(/[\s\-\+]/g, '');
  return cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
}

/**
 * Formats 10-digit phone number as +91 XXXXX XXXXX
 */
export function formatPhone(phone) {
  const clean = cleanPhoneNumber(phone);
  if (clean.length !== 10) return phone || '';
  return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
}

/**
 * Generates unique readable Registration ID: e.g. AW-892415
 */
export function generateRegId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `AW-${randomNum}`;
}

/**
 * Formats Firestore timestamp, ISO string or JS Date
 */
export function formatDate(val) {
  if (!val) return 'N/A';
  try {
    let date;
    if (val.toDate && typeof val.toDate === 'function') {
      date = val.toDate();
    } else if (val.seconds) {
      date = new Date(val.seconds * 1000);
    } else {
      date = new Date(val);
    }
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (err) {
    return 'N/A';
  }
}
