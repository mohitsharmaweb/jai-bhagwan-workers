import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar,
  QrCode, 
  ExternalLink, 
  LogOut, 
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export default function AdminSidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/admin',
      label: 'डैशबोर्ड (Overview)',
      icon: LayoutDashboard,
      end: true
    },
    {
      to: '/admin/workers',
      label: 'कारीगर डायरेक्टरी (Workers)',
      icon: Users
    },
    {
      to: '/admin/message',
      label: 'WhatsApp प्रसारण (Messaging)',
      icon: MessageSquare,
      badge: 'New',
      badgeColor: 'bg-emerald-500 text-white'
    },
    {
      to: '/admin/meeting',
      label: 'मीटिंग्स (Meetings)',
      icon: Calendar,
      badge: 'New',
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      to: '/admin/qr',
      label: 'QR कोड व लिंक (QR Center)',
      icon: QrCode
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Admin Identity header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-black text-slate-900 truncate">जय भगवान प्रबंधन</h4>
            <p className="text-[11px] text-slate-500 truncate" title={currentUser?.email || ''}>
              {currentUser?.email || 'admin@jaibhagwan'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav list */}
      <div className="p-3 space-y-1.5 flex-1">
        <div className="px-3 pt-2 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
          कंट्रोल पैनल (Navigation)
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="px-3 pt-6 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
          पब्लिक लिंक (Public Access)
        </div>

        <a
          href="/register"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>रजिस्ट्रेशन फॉर्म</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Footer logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>लॉगआउट करें (Sign Out)</span>
        </button>
      </div>
    </aside>
  );
}
