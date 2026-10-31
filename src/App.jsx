import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import AdminSidebar from './components/AdminSidebar';

// Pages
import PublicRegister from './pages/PublicRegister';
import RegisterSuccess from './pages/RegisterSuccess';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminWorkers from './pages/AdminWorkers';
import AdminMessaging from './pages/AdminMessaging';
import AdminMeeting from './pages/AdminMeeting';
import AdminQR from './pages/AdminQR';

// Icons for Home
import { 
  Users, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Wrench, 
  Zap, 
  Hammer, 
  Lock,
  Building2,
  MessageSquare
} from 'lucide-react';

/**
 * Route protection wrapper for all /admin routes
 */
function ProtectedRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs sm:text-sm font-bold text-slate-600">प्रबंधन प्रमाणीकरण की जांच हो रही है...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

/**
 * Modern Homepage Landing View
 */
function HomePage() {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>जय भगवान वर्कर्स डायरेक्टरी • जयपुर (Jaipur)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          जयपुर के कुशल कारीगरों का भरोसेमंद नेटवर्क
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          मिस्त्री, इलेक्ट्रीशियन, प्लंबर, कारपेंटर और पेंटर साथियों के लिए आसान स्व-पंजीकरण। त्योहारों की शुभकामनाएं, आवश्यक मीटिंग्स और नए काम के संदेश अब सीधे WhatsApp पर।
        </p>

        {/* Action Button */}
        <div className="flex items-center justify-center pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-orange-600/25 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Users className="w-5 h-5" />
            <span>कारीगर पंजीकरण फॉर्म भरें (Register Now)</span>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4 hover:border-amber-200 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">QR कोड से आसान रजिस्ट्रेशन</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            बिना किसी ऐप डाउनलोड या पासवर्ड के, कारीगर मोबाइल से QR कोड स्कैन करके 1 मिनट में अपना फॉर्म भर सकते हैं।
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4 hover:border-emerald-200 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">एक-क्लिक WhatsApp संदेश</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            दीपावली, होली शुभकामनाएँ या जरूरी काम की सूचना सीधे कारीगर के नाम के साथ एक क्लिक में WhatsApp पर भेजें।
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4 hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">सुरक्षित व व्यवस्थित डेटा</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            पेशा-वार, इलाका-वार (मानसरोवर, मालवीय नगर आदि) त्वरित खोज व फ़िल्टर के साथ Excel/CSV में डाउनलोड की सुविधा।
          </p>
        </div>

      </div>

      {/* Trades Carousel/Chips */}
      <div className="bg-slate-100/80 rounded-3xl p-6 sm:p-8 border border-slate-200 text-center space-y-4">
        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
          जयपुर के मुख्य कार्य क्षेत्र (Available Trades)
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {['मिस्त्री (राजमिस्त्री)', 'इलेक्ट्रीशियन', 'प्लंबर', 'पेंटर', 'कारपेंटर', 'हेल्पर / लेबर', 'ड्राइवर', 'टाइल्स कारीगर'].map((trade) => (
            <span
              key={trade}
              className="px-4 py-2 rounded-xl bg-white text-slate-800 font-extrabold text-xs sm:text-sm border border-slate-200 shadow-sm"
            >
              {trade}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<PublicRegister />} />
          <Route path="/register/success" element={<RegisterSuccess />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/workers" element={
            <ProtectedRoute>
              <AdminWorkers />
            </ProtectedRoute>
          } />

          <Route path="/admin/message" element={
            <ProtectedRoute>
              <AdminMessaging />
            </ProtectedRoute>
          } />

          <Route path="/admin/meeting" element={
            <ProtectedRoute>
              <AdminMeeting />
            </ProtectedRoute>
          } />

          <Route path="/admin/qr" element={
            <ProtectedRoute>
              <AdminQR />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
