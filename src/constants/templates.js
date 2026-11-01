/**
 * WhatsApp Ready Message Templates
 * Placeholders:
 * {naam} -> Worker Name
 * {profession} -> Worker Profession / Trade
 * {area} -> Worker Jaipur Area
 */
export const MESSAGE_TEMPLATES = [
  {
    id: 'diwali',
    title: '🪔 Diwali Wishes (दीपावली शुभकामना)',
    template: `नमस्ते {naam} जी 🙏

जय भगवान की तरफ से आपको और आपके पूरे परिवार को दीपावली के पावन पर्व की हार्दिक शुभकामनाएं! 🪔✨

माता लक्ष्मी आपके जीवन में सुख, शांति और समृद्धि लेकर आएं। भगवान की कृपा से आपका काम और रोज़गार हमेशा फलता-फूलता रहे।

शुभ दीपावली!
— जय भगवान (जयपुर)`
  },
  {
    id: 'holi',
    title: '🎨 Holi Wishes (होली शुभकामना)',
    template: `नमस्ते {naam} जी 🙏

जय भगवान परिवार की तरफ से आपको और आपके परिवार को होली के पावन पर्व की हार्दिक शुभकामनाएं! 🎨🌈

यह रंगों का त्यौहार आपके जीवन में खुशहाली, उत्तम स्वास्थ्य और भरपूर काम-रोज़गार लेकर आए।

हैप्पी होली!
— जय भगवान (जयपुर)`
  },
  {
    id: 'meeting',
    title: '🤝 Meeting Reminder (कार्यकर्ता बैठक)',
    template: `नमस्ते {naam} जी 🙏

जय भगवान की तरफ से सभी कारीगर और मिस्त्री साथियों के लिए एक जरूरी बैठक रखी गई है:

📅 दिन: रविवार
⏰ समय: सुबह 10:30 बजे
📍 स्थान: जयपुर कार्यालय / मुख्य मीटिंग हॉल

इस बैठक में आगामी कार्यों, नई दरों और साथी मजदूरों की सुविधाओं पर विचार किया जाएगा। आपकी उपस्थिति अत्यंत आवश्यक है। कृपया समय पर पधारें।

धन्यवाद,
— जय भगवान हार्डवेयर, सैनिटरी एंड इलेक्ट्रिकल्स (जयपुर)`
  },
  {
    id: 'new_work',
    title: '🔨 Naya Kaam (नए काम की आवश्यकता)',
    template: `नमस्ते {naam} जी 🙏

जयपुर ({area}) में {profession} के लिए नए काम / साइट पर कुशल कारीगरों की तत्काल आवश्यकता है।

यदि आप उपलब्ध हैं या काम करना चाहते हैं, तो कृपया तुरंत इस नंबर पर रिप्लाई करें या संपर्क करें।

धन्यवाद,
— जय भगवान हार्डवेयर, सैनिटरी एंड इलेक्ट्रिकल्स (जयपुर)`
  },
  {
    id: 'custom',
    title: '📝 Custom Message (अपना मैसेज लिखें)',
    template: `नमस्ते {naam} जी 🙏

[यहाँ अपना संदेश लिखें]

धन्यवाद,
— जय भगवान हार्डवेयर, सैनिटरी एंड इलेक्ट्रिकल्स (जयपुर)`
  }
];

/**
 * Replace dynamic tokens in template string
 */
export const compileTemplate = (templateStr, worker) => {
  if (!templateStr) return '';
  return templateStr
    .replace(/{naam}/g, worker.name || 'कारीगर साथी')
    .replace(/{profession}/g, worker.profession_other || worker.profession || 'कारीगर')
    .replace(/{area}/g, worker.area_other || worker.area || 'जयपुर');
};
