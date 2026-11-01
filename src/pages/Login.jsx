import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'लॉगिन विफल हुआ। कृपया अपनी साख जांचें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-850/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl text-white relative">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-b-full shadow-lg shadow-amber-500/50"></div>

        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            जय भगवान प्रबंधन लॉगिन
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Supabase Protected Admin Dashboard Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              एडमिन ईमेल (Admin Email)
            </label>
            <div className="relative flex rounded-2xl bg-slate-900/80 border border-slate-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 overflow-hidden">
              <span className="inline-flex items-center px-4 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@jaibhagwan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3.5 pr-4 bg-transparent text-white placeholder:text-slate-600 focus:outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              पासवर्ड (Password)
            </label>
            <div className="relative flex rounded-2xl bg-slate-900/80 border border-slate-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 overflow-hidden">
              <span className="inline-flex items-center px-4 text-slate-500">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3.5 pr-4 bg-transparent text-white placeholder:text-slate-600 focus:outline-none text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>लॉगिन करें (Sign In with Supabase)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <Link
            to="/register"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← रजिस्ट्रेशन फॉर्म पर जाएं (/register)
          </Link>
        </div>

      </div>
    </div>
  );
}
