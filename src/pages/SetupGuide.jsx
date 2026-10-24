import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Key, 
  Smartphone, 
  Globe,
  AlertTriangle
} from 'lucide-react';

export default function SetupGuide() {
  const { isConfigured } = useAuth();
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
          <span>Beginner Setup Documentation</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Complete Firebase & Admin Setup Guide
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Follow these clear, step-by-step instructions to connect your live Firebase project, set up your admin privileges, and share the app with workers.
        </p>
      </div>

      {/* Status Card */}
      <div className={`p-6 rounded-3xl border ${
        isConfigured 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <h3 className="font-bold text-base">
              {isConfigured ? 'Firebase is Connected & Configured!' : 'App Running in Offline/Demo Mode'}
            </h3>
            <p className="text-xs sm:text-sm mt-0.5">
              {isConfigured
                ? 'Your .env credentials are valid. Worker submissions and admin approvals sync directly with your live Google Cloud Firestore.'
                : 'Your .env file still contains placeholder values or is not yet configured. Follow Steps 1 to 5 below to connect your real Firebase database.'}
            </p>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-6">

        {/* STEP 1 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">1</span>
            <h3 className="text-lg font-bold text-slate-900">Create a Free Firebase Project</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Firebase is Google's secure cloud database and hosting platform. It provides a generous free tier (Spark plan) that costs $0/month.
          </p>
          <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 space-y-2">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-brand-600 font-semibold underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="w-3 h-3" /></a> and sign in with your Google account.</li>
            <li>Click <strong>"Add project"</strong> and name it <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">apnaworker</code> (or any name you prefer).</li>
            <li>Google Analytics can be left disabled or enabled, then click <strong>"Create project"</strong>.</li>
          </ol>
        </div>

        {/* STEP 2 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">2</span>
            <h3 className="text-lg font-bold text-slate-900">Enable Email/Password Authentication</h3>
          </div>
          <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 space-y-2">
            <li>In your Firebase project sidebar, click on <strong>"Build" → "Authentication"</strong>.</li>
            <li>Click <strong>"Get started"</strong>.</li>
            <li>Under <strong>Sign-in method</strong>, choose <strong>"Email/Password"</strong>.</li>
            <li>Toggle the switch to <strong>Enable</strong> and click <strong>"Save"</strong>.</li>
            <li>Go to the <strong>"Users"</strong> tab and click <strong>"Add user"</strong>. Enter your desired administrator email and password (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">admin@apnaworker.com</code>).</li>
            <li><strong className="text-brand-700">Crucial:</strong> Copy the newly created user's <strong>UID</strong> (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">7aBc91DeF...</code>). You will use this in Step 4.</li>
          </ol>
        </div>

        {/* STEP 3 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">3</span>
            <h3 className="text-lg font-bold text-slate-900">Create Cloud Firestore Database</h3>
          </div>
          <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 space-y-2">
            <li>In the sidebar, click <strong>"Build" → "Firestore Database"</strong>.</li>
            <li>Click <strong>"Create database"</strong>.</li>
            <li>Choose a location closest to you (e.g., <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">asia-south1</code> for Mumbai/India).</li>
            <li>Choose <strong>"Start in production mode"</strong> and click <strong>"Create"</strong>.</li>
          </ol>
        </div>

        {/* STEP 4 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">4</span>
            <h3 className="text-lg font-bold text-slate-900">Grant Administrator Privileges (Security Rule)</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To prevent unauthorized signups, ApnaWorker verifies that an admin's UID exists in the private <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">admins</code> collection in Firestore.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-2">
            <p>1. In Cloud Firestore, click <strong>"Start collection"</strong>.</p>
            <p>2. Set Collection ID to: <strong className="font-mono text-brand-700">admins</strong></p>
            <p>3. Set Document ID to: <strong>Your Admin User UID</strong> (from Step 2)</p>
            <p>4. Add the following fields:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 font-mono text-xs text-slate-800">
              <li><code className="text-brand-700">role</code> (string): <strong className="text-slate-900">admin</strong></li>
              <li><code className="text-brand-700">active</code> (boolean): <strong className="text-slate-900">true</strong></li>
              <li><code className="text-brand-700">email</code> (string): <strong className="text-slate-900">your-email@example.com</strong></li>
            </ul>
            <p>5. Click <strong>"Save"</strong>.</p>
          </div>
        </div>

        {/* STEP 5 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">5</span>
            <h3 className="text-lg font-bold text-slate-900">Get Web App Credentials & Fill .env File</h3>
          </div>
          <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 space-y-2">
            <li>In Firebase Console, click the <strong>Gear icon ⚙️ (Project settings)</strong> → <strong>General</strong>.</li>
            <li>Scroll down to <strong>"Your apps"</strong> and click the <strong>Web (&lt;/&gt;)</strong> icon.</li>
            <li>Register app with name <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">ApnaWorker Web</code>.</li>
            <li>Copy the configuration keys into your local project <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.env</code> file:</li>
          </ol>

          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-100 text-xs rounded-2xl overflow-x-auto font-mono">
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=apnaworker.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apnaworker
VITE_FIREBASE_STORAGE_BUCKET=apnaworker.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...`}
            </pre>
            <button
              onClick={() => copyToClipboard(`VITE_FIREBASE_API_KEY=\nVITE_FIREBASE_AUTH_DOMAIN=\nVITE_FIREBASE_PROJECT_ID=\nVITE_FIREBASE_STORAGE_BUCKET=\nVITE_FIREBASE_MESSAGING_SENDER_ID=\nVITE_FIREBASE_APP_ID=`, 'env')}
              className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'env' ? 'Copied' : 'Copy Template'}</span>
            </button>
          </div>
        </div>

        {/* STEP 6 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">6</span>
            <h3 className="text-lg font-bold text-slate-900">Publish Firestore Security Rules</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            ApnaWorker includes a strict, production-ready <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">firestore.rules</code> file that blocks public reads and validates all submitted fields.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-2">
            <p>In Firebase Console → <strong>Firestore Database</strong> → <strong>"Rules"</strong> tab:</p>
            <p>Paste the content of your local <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">firestore.rules</code> and click <strong>"Publish"</strong>.</p>
            <p>Or if using Firebase CLI on terminal:</p>
            <code className="block p-2.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs">
              firebase deploy --only firestore:rules
            </code>
          </div>
        </div>

        {/* STEP 7 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">7</span>
            <h3 className="text-lg font-bold text-slate-900">How to Open on Your Phone & Share</h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700">
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl">
              <h4 className="font-bold text-brand-900 mb-1 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-600" />
                <span>Testing Locally on your Phone via Wi-Fi</span>
              </h4>
              <p className="text-brand-800 text-xs">
                When you run <code className="bg-brand-100 px-1 py-0.5 rounded font-mono">npm run dev</code>, Vite starts with network host enabled. Open the <strong>Network URL</strong> shown in the terminal (e.g. <code className="bg-brand-100 px-1 py-0.5 rounded font-mono">http://192.168.1.XX:5173/register</code>) in your mobile browser while connected to the same Wi-Fi.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-600" />
                <span>Publishing Live on Firebase Hosting (Free Public HTTPS URL)</span>
              </h4>
              <p className="text-slate-600 text-xs mb-3">
                Run the following commands in your project folder to deploy your app live on Google servers:
              </p>
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs space-y-1">
                <p>npm run build</p>
                <p>firebase login</p>
                <p>firebase deploy --only hosting</p>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                You will receive a permanent HTTPS link (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">https://apnaworker.web.app</code>) that you can paste into WhatsApp or print on flyers as a QR code!
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
