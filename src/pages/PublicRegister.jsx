import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerWorker } from '../lib/supabase';
import { PROFESSIONS } from '../constants/professions';
import { JAIPUR_AREAS } from '../constants/areas';
import { 
  User, 
  Phone, 
  MessageSquare, 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckSquare, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';

export default function PublicRegister() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    whatsapp: '',
    sameAsMobile: true,
    profession: 'Mistri',
    profession_other: '',
    experience: '3',
    area: 'Mansarovar',
    area_other: '',
    address: '',
    consent: true
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileError, setMobileError] = useState('');

  // Validate 10-digit Indian Mobile number
  const isValidMobile = (num) => /^[6-9]\d{9}$/.test(num.trim());

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({
      ...prev,
      mobile: val,
      whatsapp: prev.sameAsMobile ? val : prev.whatsapp
    }));
    if (val.length === 10 && !isValidMobile(val)) {
      setMobileError('कृपया वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)');
    } else {
      setMobileError('');
    }
  };

  const handleWhatsappChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, whatsapp: val }));
  };

  const handleCheckboxSame = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      sameAsMobile: checked,
      whatsapp: checked ? prev.mobile : prev.whatsapp
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Full name validation
    if (!formData.name.trim()) {
      setErrorMsg('कृपया अपना पूरा नाम दर्ज करें (Please enter full name)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Mobile validation
    if (!isValidMobile(formData.mobile)) {
      setErrorMsg('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें (Valid 10-digit number required)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. WhatsApp validation
    const actualWhatsapp = formData.sameAsMobile ? formData.mobile : formData.whatsapp;
    if (!isValidMobile(actualWhatsapp)) {
      setErrorMsg('कृपया सही WhatsApp नंबर दर्ज करें (Valid WhatsApp number required)');
      return;
    }

    // 4. Consent check
    if (!formData.consent) {
      setErrorMsg('कृपया WhatsApp मैसेज प्राप्त करने की सहमति (Consent) बॉक्स पर टिक करें।');
      return;
    }

    // 5. Custom Profession & Area check
    if (formData.profession === 'Other' && !formData.profession_other.trim()) {
      setErrorMsg('कृपया अपना काम / पेशा (Profession) लिखें।');
      return;
    }
    if (formData.area === 'Other' && !formData.area_other.trim()) {
      setErrorMsg('कृपया जयपुर का अपना क्षेत्र / इलाका (Area) लिखें।');
      return;
    }

    setLoading(true);

    try {
      const result = await registerWorker({
        ...formData,
        whatsapp: actualWhatsapp
      });

      // Navigate to celebration / success page
      navigate('/register/success', { 
        state: { 
          worker: result || formData 
        } 
      });
    } catch (err) {
      console.error('Registration submission error:', err);
      if (err.message === 'DUPLICATE_MOBILE') {
        setErrorMsg('यह मोबाइल नंबर पहले से पंजीकृत है (This mobile number is already registered)');
      } else {
        setErrorMsg(err.message || 'पंजीकरण पूरा करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-slate-50 to-slate-100 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100 text-center mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>जय भगवान वर्कर्स डायरेक्टरी • जयपुर (Jaipur)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            कारीगर पंजीकरण फॉर्म
          </h1>
          <p className="text-sm font-semibold text-amber-700 mt-1">
            Worker Registration Form
          </p>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            जयपुर के सभी कुशल मिस्त्री, इलेक्ट्रीशियन, प्लंबर व कारीगर साथी नीचे अपनी जानकारी भरें ताकि आपको समय पर काम व त्योहारों के संदेश मिल सकें।
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">कृपया ध्यान दें (Notice):</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-8 space-y-6">
          
          {/* Field 1: Full Name */}
          <div className="space-y-1.5">
            <label className="block text-sm sm:text-base font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" />
                पूरा नाम <span className="text-xs font-normal text-slate-500">(Full Name)</span>
              </span>
              <span className="text-xs font-bold text-red-600">*ज़रूरी</span>
            </label>
            <input
              type="text"
              required
              placeholder="उदा. रमेश कुमार शर्मा"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
            />
          </div>

          {/* Field 2: Mobile Number */}
          <div className="space-y-1.5">
            <label className="block text-sm sm:text-base font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600" />
                मोबाइल नंबर <span className="text-xs font-normal text-slate-500">(10 Digit Mobile)</span>
              </span>
              <span className="text-xs font-bold text-red-600">*ज़रूरी</span>
            </label>
            <div className="relative flex rounded-2xl border border-slate-300 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 overflow-hidden bg-white">
              <span className="inline-flex items-center px-4 bg-slate-100 text-slate-600 font-bold text-sm border-r border-slate-300">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9829012345"
                value={formData.mobile}
                onChange={handleMobileChange}
                className="w-full px-4 py-3.5 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none font-bold tracking-wider"
              />
            </div>
            {mobileError && (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {mobileError}
              </p>
            )}
          </div>

          {/* Field 3: WhatsApp Number */}
          <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sameAsMobile}
                onChange={handleCheckboxSame}
                className="w-5 h-5 text-amber-600 rounded-lg border-slate-300 focus:ring-amber-500"
              />
              <span className="text-sm sm:text-base font-bold text-slate-800">
                मोबाइल नंबर ही WhatsApp नंबर है
              </span>
            </label>

            {!formData.sameAsMobile && (
              <div className="pt-2 space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  अलग WhatsApp नंबर दर्ज करें:
                </label>
                <div className="relative flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden bg-white">
                  <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-600 font-bold text-xs border-r border-slate-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9414012345"
                    value={formData.whatsapp}
                    onChange={handleWhatsappChange}
                    className="w-full px-3 py-2.5 text-slate-900 text-sm focus:outline-none font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Field 4: Profession */}
          <div className="space-y-1.5">
            <label className="block text-sm sm:text-base font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600" />
                काम / पेशा <span className="text-xs font-normal text-slate-500">(Profession / Trade)</span>
              </span>
              <span className="text-xs font-bold text-red-600">*ज़रूरी</span>
            </label>
            <select
              value={formData.profession}
              onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-slate-900 text-base font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {PROFESSIONS.map(item => (
                <option key={item.id} value={item.id}>
                  {item.labelHi} ({item.labelEn})
                </option>
              ))}
            </select>

            {formData.profession === 'Other' && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="अपना काम लिखें (उदा. फैब्रिकेशन, वेल्डर, टाइल्स मिस्त्री)"
                  value={formData.profession_other}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession_other: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-amber-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Field 5: Experience */}
          <div className="space-y-1.5">
            <label className="block text-sm sm:text-base font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                अनुभव (साल में) <span className="text-xs font-normal text-slate-500">(Experience in Years)</span>
              </span>
              <span className="text-xs font-bold text-red-600">*ज़रूरी</span>
            </label>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {['1', '3', '5', '10', '15+'].map((yr) => {
                const numericVal = yr.replace('+', '');
                const isSelected = formData.experience === numericVal || (yr === '15+' && parseInt(formData.experience) >= 15);
                return (
                  <button
                    type="button"
                    key={yr}
                    onClick={() => setFormData(prev => ({ ...prev, experience: numericVal }))}
                    className={`py-2.5 px-1 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {yr} साल
                  </button>
                );
              })}
            </div>
            <div className="pt-2">
              <input
                type="number"
                min="0"
                max="50"
                placeholder="या सही साल दर्ज करें (उदा. 7)"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Field 6: Jaipur Area */}
          <div className="space-y-1.5">
            <label className="block text-sm sm:text-base font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                जयपुर क्षेत्र / इलाका <span className="text-xs font-normal text-slate-500">(Jaipur Area)</span>
              </span>
              <span className="text-xs font-bold text-red-600">*ज़रूरी</span>
            </label>
            <select
              value={formData.area}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-slate-900 text-base font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {JAIPUR_AREAS.map(item => (
                <option key={item.id} value={item.id}>
                  {item.labelHi} ({item.labelEn})
                </option>
              ))}
            </select>

            {formData.area === 'Other' && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="जयपुर का अपना इलाका लिखें (उदा. राजा पार्क, विद्याधर नगर, सांगानेर रोड)"
                  value={formData.area_other}
                  onChange={(e) => setFormData(prev => ({ ...prev, area_other: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-amber-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Field 7: Full Address (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-sm sm:text-base font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                पूरा पता <span className="text-xs font-normal text-slate-500">(Full Address - Optional)</span>
              </span>
              <span className="text-xs font-medium text-slate-400">वैकल्पिक</span>
            </label>
            <textarea
              rows={2}
              placeholder="मकान नंबर, गली, लैंडमार्क, पिनकोड (यदि उपलब्ध हो)"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Field 8: Consent Checkbox */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.consent}
                onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                className="w-5 h-5 mt-0.5 text-amber-600 rounded-md border-amber-400 focus:ring-amber-500"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                मुझे WhatsApp पर त्योहारों की बधाई, मीटिंग्स और नए काम के संदेश भेजने की अनुमति (Consent) है।
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-8">
              (I permit receiving official WhatsApp messages for work and greetings)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-orange-600/25 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>पंजीकरण दर्ज हो रहा है...</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-5 h-5" />
                <span>रजिस्ट्रेशन जमा करें (Submit Registration)</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info & Admin link */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-slate-500">
            सुरक्षित एवं गोपनीय डेटा • केवल जय भगवान प्रबंधन हेतु
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-700 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/60"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>प्रबंधन लॉगिन (Admin Login)</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
