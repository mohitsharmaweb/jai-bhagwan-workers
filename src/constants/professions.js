/**
 * Professions / Trades List (Hindi + English)
 */
export const PROFESSIONS = [
  { id: 'Mistri', labelEn: 'Mistri / Mason', labelHi: 'मिस्त्री / राजमिस्त्री', icon: 'Hammer' },
  { id: 'Electrician', labelEn: 'Electrician', labelHi: 'इलेक्ट्रीशियन / बिजली मिस्त्री', icon: 'Zap' },
  { id: 'Plumber', labelEn: 'Plumber', labelHi: 'प्लंबर / नल मिस्त्री', icon: 'Wrench' },
  { id: 'Painter', labelEn: 'Painter', labelHi: 'पेंटर / पुताई वाला', icon: 'Paintbrush' },
  { id: 'Carpenter', labelEn: 'Carpenter', labelHi: 'बढ़ई / कारपेंटर / लकड़ी कारीगर', icon: 'Axe' },
  { id: 'Contractor', labelEn: 'Contractor', labelHi: 'ठेकेदार / कांट्रैक्टर', icon: 'Briefcase' },
  { id: 'Builder', labelEn: 'Builder', labelHi: 'बिल्डर', icon: 'Building2' },
  { id: 'Shopkeeper', labelEn: 'Shopkeeper / Trader', labelHi: 'दुकानदार / व्यापारी', icon: 'Store' },
  { id: 'Helper', labelEn: 'Helper / Labor', labelHi: 'हेल्पर / बेलदार / लेबर', icon: 'Users' },
  { id: 'Driver', labelEn: 'Driver', labelHi: 'ड्राइवर / चालक', icon: 'Truck' },
  { id: 'Other', labelEn: 'Other Trade', labelHi: 'अन्य काम (लिखें)', icon: 'PlusCircle' }
];

export const getProfessionLabel = (id, lang = 'hi') => {
  const item = PROFESSIONS.find(p => p.id === id);
  if (!item) return id;
  return lang === 'hi' ? item.labelHi : item.labelEn;
};
