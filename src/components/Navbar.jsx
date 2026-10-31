import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  ShieldCheck, 
  QrCode, 
  LogOut, 
  Menu, 
  X, 
  MessageSquare,
  Calendar,
  Building2,
  Sparkles,
  Home
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                  जय भगवान <span className="text-amber-600">वर्कर्स</span>
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-amber-300">
                  जयपुर
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold hidden xs:block">
                Worker Management Platform (Jaipur)
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/register"
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                isActive('/register')
                  ? 'bg-amber-50 text-amber-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>पंजीकरण फॉर्म (/register)</span>
            </Link>

            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/admin')
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>डैशबोर्ड</span>
                </Link>

                <Link
                  to="/admin/workers"
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/admin/workers')
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-600" />
                  <span>डायरेक्टरी</span>
                </Link>

                <Link
                  to="/admin/message"
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/admin/message')
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp मैसेज</span>
                </Link>

                <Link
                  to="/admin/meeting"
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/admin/meeting')
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>मीटिंग्स</span>
                </Link>

                <Link
                  to="/admin/qr"
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/admin/qr')
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-slate-600" />
                  <span>QR कोड</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>लॉगआउट</span>
                </button>
              </>
            ) : null}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs"
            >
              फॉर्म भरें
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>होमपेज (Home)</span>
          </Link>

          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-700 bg-amber-50"
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>कारीगर पंजीकरण फॉर्म (/register)</span>
          </Link>

          {isAdmin ? (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>एडमिन डैशबोर्ड (Dashboard)</span>
              </Link>

              <Link
                to="/admin/workers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                <Users className="w-4 h-4 text-slate-600" />
                <span>कारीगर डायरेक्टरी (Workers List)</span>
              </Link>

              <Link
                to="/admin/message"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp मैसेज भेजें (/admin/message)</span>
              </Link>

              <Link
                to="/admin/meeting"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-800 bg-amber-50"
              >
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>मीटिंग्स व आमंत्रण (/admin/meeting)</span>
              </Link>

              <Link
                to="/admin/qr"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                <QrCode className="w-4 h-4 text-slate-600" />
                <span>QR कोड व डाउनलोड</span>
              </Link>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>लॉगआउट करें (Sign Out)</span>
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </header>
  );
}
