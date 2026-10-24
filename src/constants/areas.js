/**
 * Jaipur Localities / Areas List (Hindi + English)
 */
export const JAIPUR_AREAS = [
  { id: 'Malviya Nagar', labelEn: 'Malviya Nagar', labelHi: 'मालवीय नगर' },
  { id: 'Mansarovar', labelEn: 'Mansarovar', labelHi: 'मानसरोवर' },
  { id: 'Vaishali Nagar', labelEn: 'Vaishali Nagar', labelHi: 'वैशाली नगर' },
  { id: 'Jhotwara', labelEn: 'Jhotwara', labelHi: 'झोटवाड़ा' },
  { id: 'Sanganer', labelEn: 'Sanganer', labelHi: 'सांगानेर' },
  { id: 'Bani Park', labelEn: 'Bani Park', labelHi: 'बनी पार्क' },
  { id: 'Sitapura', labelEn: 'Sitapura Industrial Area', labelHi: 'सीतापुरा' },
  { id: 'Jagatpura', labelEn: 'Jagatpura', labelHi: 'जगतपुरा' },
  { id: 'Ajmer Road', labelEn: 'Ajmer Road / 200 Ft Bypass', labelHi: 'अजमेर रोड / 200 फीट' },
  { id: 'Vidyadhar Nagar', labelEn: 'Vidyadhar Nagar', labelHi: 'विद्याधर नगर' },
  { id: 'Tonk Road', labelEn: 'Tonk Road / Durgapura', labelHi: 'टोंक रोड / दुर्गापुरा' },
  { id: 'Other', labelEn: 'Other Area (Jaipur)', labelHi: 'अन्य क्षेत्र (जयपुर)' }
];

export const getAreaLabel = (id, lang = 'hi') => {
  const item = JAIPUR_AREAS.find(a => a.id === id);
  if (!item) return id;
  return lang === 'hi' ? item.labelHi : item.labelEn;
};
