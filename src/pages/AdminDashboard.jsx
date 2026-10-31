import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllWorkers } from '../lib/supabase';
import { PROFESSIONS, getProfessionLabel } from '../constants/professions';
import { JAIPUR_AREAS, getAreaLabel } from '../constants/areas';
import { 
  Users, 
  MessageSquare, 
  Calendar,
  QrCode, 
  ShieldCheck, 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  UserPlus, 
  Download, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllWorkers();
      setWorkers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('डेटा लोड करने में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  // Metrics computation
  const totalWorkers = workers.length;
  const consentWorkers = workers.filter(w => w.consent).length;
  const consentPercent = totalWorkers > 0 ? Math.round((consentWorkers / totalWorkers) * 100) : 0;

  // Profession counts
  const professionCounts = PROFESSIONS.map(p => {
    const count = workers.filter(w => w.profession === p.id).length;
    return { ...p, count };
  });

  // Top Jaipur areas
  const areaCounts = JAIPUR_AREAS.map(a => {
    const count = workers.filter(w => w.area === a.id).length;
    return { ...a, count };
  }).filter(a => a.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-600/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>जय भगवान प्रबंधन कंट्रोल सेंटर (Jaipur)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            कारीगर प्रबंधन डैशबोर्ड
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm font-medium leading-relaxed">
            जयपुर के सभी पंजीकृत कारीगरों का केंद्रीय डेटाबेस। यहाँ से आप सीधे त्योहारों पर WhatsApp बधाई भेज सकते हैं और नए काम का आवंटन कर सकते हैं।
          </p>

          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              to="/admin/message"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm shadow-md hover:bg-amber-50 flex items-center gap-2 transition-transform active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp मैसेज भेजें (/admin/message)</span>
            </Link>

            <Link
              to="/admin/meeting"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>मीटिंग्स व आमंत्रण (/admin/meeting)</span>
            </Link>

            <Link
              to="/admin/qr"
              className="px-5 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>QR कोड व लिंक देखें</span>
            </Link>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Workers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">कुल पंजीकृत कारीगर</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{loading ? '...' : totalWorkers}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Total Registered Workers</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* WhatsApp Consent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">WhatsApp सहमति (Consent)</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{loading ? '...' : consentWorkers}</h3>
            <p className="text-[11px] text-emerald-700 mt-1 font-semibold">{consentPercent}% कारीगर संदेश हेतु तैयार</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Active Trades */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">विभिन्न पेशे / काम</p>
            <h3 className="text-3xl font-black text-indigo-600 mt-1">{PROFESSIONS.length}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Mistri, Electrician, Plumber आदि</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Jaipur Localities */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">सक्रिय जयपुर क्षेत्र</p>
            <h3 className="text-3xl font-black text-rose-600 mt-1">{loading ? '...' : areaCounts.length}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">मानसरोवर, मालवीय नगर, आदि</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Profession-wise Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              पेशा-वार कारीगर संख्या (Profession Breakdown)
            </h2>
            <p className="text-xs text-slate-500">किस ट्रेड में कितने कारीगर उपलब्ध हैं</p>
          </div>
          <Link
            to="/admin/workers"
            className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>सभी देखें</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {professionCounts.map(item => (
            <Link
              key={item.id}
              to={`/admin/workers?profession=${item.id}`}
              className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all hover:border-amber-300 group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 group-hover:text-amber-700">
                  {item.labelEn}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-black group-hover:bg-amber-200 group-hover:text-amber-900">
                  {item.count}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                {item.labelHi.split('/')[0]}
              </h4>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column: Top Jaipur Localities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Jaipur Areas Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                जयपुर प्रमुख क्षेत्र (Top Areas)
              </h3>
              <p className="text-xs text-slate-500">स्थानीय उपलब्धता के अनुसार</p>
            </div>
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>

          <div className="space-y-3 pt-1">
            {areaCounts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">अभी कोई क्षेत्र डेटा उपलब्ध नहीं है</p>
            ) : (
              areaCounts.slice(0, 6).map(area => {
                const pct = totalWorkers > 0 ? Math.round((area.count / totalWorkers) * 100) : 0;
                return (
                  <div key={area.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{area.labelHi} ({area.labelEn})</span>
                      <span className="text-slate-600">{area.count} कारीगर ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Operations Center */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            त्वरित कार्य (Quick Actions)
          </h3>

          <div className="space-y-2.5">
            <Link
              to="/admin/workers?action=add"
              className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/60 flex items-center justify-between text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-amber-700" />
                <div className="text-left">
                  <p className="text-xs font-bold">नया कारीगर जोड़ें</p>
                  <p className="text-[11px] text-slate-500">Add Worker Manually</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-700" />
            </Link>

            <Link
              to="/admin/message"
              className="w-full p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 flex items-center justify-between text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <div className="text-left">
                  <p className="text-xs font-bold">दीवाली / होली संदेश भेजें</p>
                  <p className="text-[11px] text-slate-500">Festival WhatsApp Broadcast</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </Link>

            <Link
              to="/admin/qr"
              className="w-full p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 flex items-center justify-between text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-indigo-700" />
                <div className="text-left">
                  <p className="text-xs font-bold">QR कोड पोस्टर डाउनलोड</p>
                  <p className="text-[11px] text-slate-500">Download Printable QR</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-700" />
            </Link>

            <Link
              to="/register"
              target="_blank"
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-700" />
                <div className="text-left">
                  <p className="text-xs font-bold">पब्लिक रजिस्ट्रेशन फॉर्म देखें</p>
                  <p className="text-[11px] text-slate-500">Open Public /register Form</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
