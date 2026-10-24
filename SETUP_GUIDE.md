# 🛠️ जय भगवान वर्कर्स - सेटअप एवं परिनियोजन गाइड (Setup & Deployment Guide)

यह गाइड आपको **जय भगवान वर्कर मैनेजमेंट वेब ऐप** को Supabase डेटाबेस से जोड़ने, लोकल कंप्यूटर पर चलाने और Vercel पर लाइव इंटरनेट पर डिप्लॉय करने की पूरी जानकारी देती है।

---

## 📋 चरण 1: Supabase प्रोजेक्ट सेटअप

1. **Supabase पर जाएं:**
   - [supabase.com](https://supabase.com) खोलें और अपने Google / GitHub खाते से लॉगिन करें।
2. **नया प्रोजेक्ट बनाएं:**
   - **New Project** पर क्लिक करें।
   - **Name:** `jai-bhagwan-workers`
   - **Database Password:** एक मजबूत पासवर्ड दर्ज करें।
   - **Region:** `South Asia (Mumbai)` चुनें (यह भारत में सबसे तेज़ रहेगा)।
   - **Create New Project** पर क्लिक करें और 1-2 मिनट प्रतीक्षा करें।

3. **डेटाबेस स्कीमा और RLS रन करें:**
   - बायीं मेन्यू में **SQL Editor** पर क्लिक करें।
   - **New query** खोलें।
   - प्रोजेक्ट में मौजूद `supabase_schema.sql` फाइल का पूरा कोड कॉपी करके SQL Editor में पेस्ट करें।
   - **Run** (Ctrl + Enter) दबाएं।
   - इससे दोनों टेबल्स (`workers` और `message_logs`), इंडेक्स और Row Level Security (RLS) नीतियां तैयार हो जाएंगी।

4. **API Keys कॉपी करें:**
   - बायीं मेन्यू में नीचे गियर आइकॉन **Project Settings** -> **API** पर जाएं।
   - **Project URL** कॉपी करें (उदा. `https://xyzcompany.supabase.co`)।
   - **Project API keys** में से `anon` / `public` key कॉपी करें।

5. **एडमिन यूजर बनाएं:**
   - बायीं मेन्यू में **Authentication** -> **Users** पर जाएं।
   - **Add user** -> **Create user** पर क्लिक करें।
   - अपना ईमेल और पासवर्ड दर्ज करें (उदा. `admin@jaibhagwan.com` और पासवर्ड)।
   - **Auto Confirm User** को ऑन रखें ताकि तुरंत लॉगिन हो सके।

---

## 💻 चरण 2: लोकल कंप्यूटर पर रन करना

1. अपने प्रोजेक्ट फोल्डर में `.env` फाइल बनाएं (या `.env.example` को `.env` नाम दें):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

2. पैकेज इंस्टॉल करें (यदि पहले नहीं किए हों):
   ```bash
   npm install
   ```

3. डेवलपमेंट सर्वर शुरू करें:
   ```bash
   npm run dev
   ```

4. ब्राउज़र में [http://localhost:5173](http://localhost:5173) खोलें:
   - **पब्लिक रजिस्ट्रेशन फॉर्म:** `http://localhost:5173/register`
   - **एडमिन लॉगिन:** `http://localhost:5173/login`
   - **WhatsApp मैसेजिंग:** `http://localhost:5173/admin/message`
   - **QR कोड व पोस्टर:** `http://localhost:5173/admin/qr`

---

## 🚀 चरण 3: Vercel पर मुफ्त लाइव डिप्लॉयमेंट

1. अपने कोड को GitHub पर पुश करें:
   ```bash
   git add .
   git commit -m "Complete Jai Bhagwan Worker Management System"
   git push origin main
   ```

2. [vercel.com](https://vercel.com) पर जाएं और लॉगिन करें।
3. **Add New** -> **Project** पर क्लिक करें और अपना GitHub रिपॉजिटरी चुनें।
4. **Environment Variables** सेक्शन में निम्न जोड़ें:
   - `VITE_SUPABASE_URL`: (Supabase Project URL)
   - `VITE_SUPABASE_ANON_KEY`: (Supabase Anon Key)
5. **Deploy** बटन पर क्लिक करें। 1 मिनट के अंदर आपकी ऐप लाइव हो जाएगी (उदा. `https://jaibhagwan-workers.vercel.app`)!

---

## 📲 चरण 4: WhatsApp मैसेजिंग कैसे काम करती है?

1. एडमिन डैशबोर्ड में **WhatsApp मैसेज** (`/admin/message`) पर जाएं।
2. रेडी-मेड टेम्पलेट चुनें (दीपावली, होली, मीटिंग, नया काम) या अपना संदेश लिखें।
3. प्राप्तकर्ता फ़िल्टर करें (सभी, विशिष्ट पेशा जैसे इलेक्ट्रीशियन, या क्षेत्र जैसे मानसरोवर)।
4. हर कारीगर के सामने **"WhatsApp भेजें"** पर क्लिक करें:
   - ऐप स्वचालित रूप से `{naam}`, `{profession}`, `{area}` को उस कारीगर के वास्तविक नाम व काम से बदल देगी।
   - कारीगर के फ़ोन नंबर के साथ सीधे WhatsApp चैट खुल जाएगी।
   - भेजा गया संदेश स्वतः `message_logs` टेबल में दर्ज हो जाएगा।
