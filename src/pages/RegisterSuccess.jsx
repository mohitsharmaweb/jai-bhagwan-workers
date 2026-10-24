import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  UserCheck, 
  Phone, 
  Briefcase, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  Building2
} from 'lucide-react';
import { getProfessionLabel } from '../constants/professions';
import { getAreaLabel } from '../constants/areas';

export default function RegisterSuccess() {
  const location = useLocation();
  const worker = location.state?.worker;

  useEffect(() => {
    // Fire confetti cannon
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti effect skipped', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-100 py-10 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-100 text-center relative overflow-hidden">
        
        {/* Top green accent strip */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>पंजीकरण सफल (Registration Complete)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          धन्यवाद! आपका फॉर्म जमा हो गया है
        </h1>
        
        <p className="text-sm font-semibold text-emerald-700 mt-1">
          Thank you! You are now successfully registered.
        </p>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          आपकी जानकारी जय भगवान वर्कर्स लिस्ट (जयपुर) में सुरक्षित सहेज ली गई है। आगामी त्योहारों व नए काम के संदेश आपके WhatsApp पर भेजे जाएंगे।
        </p>

        {/* Summary Card if worker data present */}
        {worker && (
          <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
              पंजीकृत विवरण (Summary):
            </h3>

            <div className="flex items-center gap-2 text-sm text-slate-800 font-bold">
              <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{worker.name}</span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-semibold">+91 {worker.mobile}</span>
              {worker.whatsapp && worker.whatsapp !== worker.mobile && (
                <span className="text-[11px] text-slate-500">(WA: {worker.whatsapp})</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <Briefcase className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>
                {worker.profession === 'Other' && worker.profession_other 
                  ? worker.profession_other 
                  : getProfessionLabel(worker.profession, 'hi')}
                {' '}• {worker.experience || '0'} वर्ष अनुभव
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>
                {worker.area === 'Other' && worker.area_other 
                  ? worker.area_other 
                  : getAreaLabel(worker.area, 'hi')}
                {' '}(जयपुर)
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Link
            to="/register"
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>एक और कारीगर पंजीकृत करें (Register Another)</span>
          </Link>

          <Link
            to="/"
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>मुख्य पृष्ठ पर जाएं (Go to Home)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
