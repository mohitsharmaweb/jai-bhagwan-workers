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
 * Normalizes phone number: strips spaces, dashes, parentheses, +91, 0 prefix; keeps last 10 digits
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.toString().trim().replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.slice(2);
  }
  // Strip leading zeros
  cleaned = cleaned.replace(/^0+/, '');
  const digits = cleaned.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Backward-compatible cleanPhoneNumber alias
 */
export function cleanPhoneNumber(phone) {
  return normalizePhoneNumber(phone);
}

/**
 * Format date in Hindi with day, Hindi month name, year, and weekday in Hindi
 * e.g. "5 नवंबर 2026 (गुरुवार)"
 */
export function formatHindiDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.toString().split('-');
    let d;
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      d = new Date(year, month, day);
    } else {
      d = new Date(dateStr);
    }

    if (isNaN(d.getTime())) return dateStr;

    const weekdays = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const months = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

    const dayNum = d.getDate();
    const monthName = months[d.getMonth()];
    const yearNum = d.getFullYear();
    const weekdayName = weekdays[d.getDay()];

    return `${dayNum} ${monthName} ${yearNum} (${weekdayName})`;
  } catch (err) {
    return dateStr;
  }
}

/**
 * Format time in 12-hour format with Hindi period (सुबह / दोपहर / शाम / रात)
 * e.g. "10:30" -> "सुबह 10:30 बजे", "14:15" -> "दोपहर 2:15 बजे", "18:00" -> "शाम 6:00 बजे"
 */
export function formatHindiTime(timeStr) {
  if (!timeStr) return '';
  try {
    const parts = timeStr.toString().split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = (parts[1] || '00').slice(0, 2);
    if (isNaN(hours)) return timeStr;

    let period = 'सुबह';
    if (hours >= 12 && hours < 16) {
      period = 'दोपहर';
    } else if (hours >= 16 && hours < 20) {
      period = 'शाम';
    } else if (hours >= 20 || hours < 4) {
      period = 'रात';
    } else {
      period = 'सुबह';
    }

    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${period} ${hour12}:${minutes.padStart(2, '0')} बजे`;
  } catch (err) {
    return timeStr;
  }
}

/**
 * Builds personalized Hindi meeting WhatsApp message template
 */
export function buildMeetingMessage({ title, date, time, location, notes, workerName = '{naam}' }) {
  const formattedDate = formatHindiDate(date);
  const formattedTime = formatHindiTime(time);

  const lines = [
    `नमस्ते ${workerName} जी 🙏`,
    `*${title ? title.trim() : 'मीटिंग सूचना'}*`,
    `📅 तारीख: ${formattedDate || 'तारीख'}`,
    `⏰ समय: ${formattedTime || 'समय'}`,
    `📍 जगह: ${location ? location.trim() : 'जयपुर कार्यालय'}`
  ];

  if (notes && notes.trim()) {
    lines.push(`📝 ${notes.trim()}`);
  }

  lines.push('कृपया समय पर पहुँचें। धन्यवाद!');
  lines.push('- जय भगवान वर्कर मैनेजमेंट');

  return lines.join('\n');
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
