import React, { useState, useEffect } from 'react';
import { 
  isFirebaseConfigured, 
  getActiveFirebaseConfig, 
  saveCustomFirebaseConfig, 
  clearCustomFirebaseConfig, 
  testFirebaseConnection,
  exportWorkersCSV,
  exportFullDatabaseJSON,
  fetchAllSubmissions,
  fetchApprovedWorkers
} from '../firebase/firebase';
import { importMockDatabaseJSON } from '../firebase/mockStorage';
import { 
  Database, 
  ShieldCheck, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Key, 
  RefreshCw, 
  ExternalLink, 
  HelpCircle,
  HardDrive,
  Check,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';

export default function AdminDatabase() {
  const activeConfig = getActiveFirebaseConfig();
  const isCloud = isFirebaseConfigured;

  const [workersCount, setWorkersCount] = useState(0);
  const [subsCount, setSubsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form states
  const [pasteMode, setPasteMode] = useState('json'); // 'json' | 'fields'
  const [jsonInput, setJsonInput] = useState('');
  const [fieldInputs, setFieldInputs] = useState({
    apiKey: '',
    projectId: '',
    authDomain: '',
    appId: '',
    storageBucket: '',
    messagingSenderId: ''
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [w, s] = await Promise.all([
          fetchApprovedWorkers(),
          fetchAllSubmissions()
        ]);
        setWorkersCount(w.length);
        setSubsCount(s.length);
      } catch (e) {
        // silent
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  const handleJsonPaste = (text) => {
    setJsonInput(text);
    try {
      // Clean string if copied as JS object or JSON
      let cleaned = text.trim();
      if (cleaned.startsWith('const firebaseConfig =') || cleaned.startsWith('var firebaseConfig =')) {
        cleaned = cleaned.replace(/const firebaseConfig =|var firebaseConfig =|;/g, '').trim();
      }
      // Convert unquoted keys to quoted JSON if needed
      cleaned = cleaned.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
      // Replace single quotes with double quotes
      cleaned = cleaned.replace(/'/g, '"');
      const parsed = JSON.parse(cleaned);
      if (parsed.apiKey && parsed.projectId) {
        setFieldInputs({
          apiKey: parsed.apiKey || '',
          projectId: parsed.projectId || '',
          authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
          appId: parsed.appId || '',
          storageBucket: parsed.storageBucket || `${parsed.projectId}.appspot.com`,
          messagingSenderId: parsed.messagingSenderId || ''
        });
        setTestResult({ success: true, message: 'JSON credentials parsed successfully! Click "Save & Connect" below.' });
      }
    } catch (e) {
      // User may still be typing
    }
  };

  const handleTestAndConnect = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    let configToSave = { ...fieldInputs };

    if (pasteMode === 'json' && jsonInput.trim()) {
      try {
        let cleaned = jsonInput.trim();
        if (cleaned.includes('apiKey')) {
          cleaned = cleaned.replace(/const firebaseConfig =|var firebaseConfig =|;/g, '').trim();
          cleaned = cleaned.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
          cleaned = cleaned.replace(/'/g, '"');
          const parsed = JSON.parse(cleaned);
          configToSave = {
            apiKey: parsed.apiKey || '',
            projectId: parsed.projectId || '',
            authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
            appId: parsed.appId || '',
            storageBucket: parsed.storageBucket || `${parsed.projectId}.appspot.com`,
            messagingSenderId: parsed.messagingSenderId || ''
          };
        }
      } catch (err) {
        setTesting(false);
        setTestResult({ success: false, message: 'Invalid JSON format. Please verify the copied config.' });
        return;
      }
    }

    if (!configToSave.apiKey || !configToSave.projectId) {
      setTesting(false);
      setTestResult({ success: false, message: 'API Key and Project ID are required.' });
      return;
    }

    // Live test connection
    const result = await testFirebaseConnection(configToSave);
    setTesting(false);

    if (result.success) {
      setTestResult({ success: true, message: 'Connection verified! Connecting database now...' });
      setTimeout(async () => {
        await saveCustomFirebaseConfig(configToSave);
      }, 1000);
    } else {
      setTestResult({
        success: false,
        message: 'Could not connect to Firebase: ' + (result.error || 'Please verify your Project ID and API Key.')
      });
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        importMockDatabaseJSON(text);
        setImportMsg({ success: true, message: 'Backup restored successfully! Refreshing database...' });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        setImportMsg({ success: false, message: 'Failed to import backup: ' + err.message });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Database className="w-3.5 h-3.5 text-brand-600" />
          <span>Storage & Cloud Infrastructure</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          डेटाबेस प्रबंधन व क्लाउड सिंक (Database Settings)
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          कारीगरों का सारा डेटा सुरक्षित रखें, क्लाउड डेटाबेस (Firestore) कनेक्ट करें और किसी भी समय एक्सेल व बैकअप डाउनलोड करें।
        </p>
      </div>

      {/* Status Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
        isCloud 
          ? 'bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 border-emerald-300' 
          : 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-amber-300'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
              isCloud ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-amber-600 shadow-amber-500/30'
            }`}>
              {isCloud ? <Cloud className="w-7 h-7" /> : <HardDrive className="w-7 h-7" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">
                  {isCloud ? 'लाइव क्लाउड डेटाबेस कनेक्टेड (Firestore Live)' : 'ऑफ़लाइन / लोकल डिवाइस स्टोरेज (Local Storage)'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isCloud ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isCloud ? '🟢 Live Sync Active' : '🟡 Offline Mode'}
                </span>
              </div>

              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                {isCloud ? (
                  <>
                    आपकी डायरेक्टरी सीधे <strong>Firebase Cloud Firestore</strong> से जुड़ी है। जब भी कोई कारीगर अपने फोन या QR कोड से फॉर्म भरेगा, उसका डेटा सीधे आपके पास रियल-टाइम में सुरक्षित सेव होगा।
                  </>
                ) : (
                  <>
                    वर्तमान में आपका डेटा केवल इसी डिवाइस के लोकल स्टोरेज में सुरक्षित है। किसी भी मोबाइल या स्कैनर से भरे गए फॉर्म का डेटा सीधे प्राप्त करने के लिए नीचे <strong>Firebase Cloud Database</strong> कनेक्ट करें।
                  </>
                )}
              </p>

              {activeConfig?.projectId && (
                <div className="mt-2 text-xs font-mono text-slate-500">
                  Project ID: <span className="font-bold text-slate-800">{activeConfig.projectId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick counts */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial p-4 bg-white rounded-2xl border border-slate-200 text-center min-w-[110px] shadow-sm">
              <span className="text-2xl font-black text-slate-900 block">
                {loadingStats ? '...' : workersCount}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                स्वीकृत कारीगर
              </span>
            </div>

            <div className="flex-1 md:flex-initial p-4 bg-white rounded-2xl border border-slate-200 text-center min-w-[110px] shadow-sm">
              <span className="text-2xl font-black text-brand-600 block">
                {loadingStats ? '...' : subsCount}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                पेंडिंग आवेदन
              </span>
            </div>
          </div>
        </div>

        {isCloud && (
          <div className="mt-6 pt-6 border-t border-emerald-200/80 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>सभी डेटा सुरक्षित रूप से क्लाउड पर एन्क्रिप्टेड है।</span>
            </span>

            <button
              onClick={() => {
                if (window.confirm('क्या आप क्लाउड डेटाबेस डिस्कनेक्ट करके ऑफ़लाइन मोड पर लौटना चाहते हैं?')) {
                  clearCustomFirebaseConfig();
                }
              }}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Disconnect Cloud DB</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: 1. Connect Firebase & 2. Export / Backup Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Firebase Setup Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-600" />
                <span>Firebase Cloud Database सेटअप करें</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Firebase Console से अपनी वेब ऐप कॉन्फ़िगरेशन यहाँ पेस्ट करें
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPasteMode('json')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${pasteMode === 'json' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                Auto JSON
              </button>
              <button
                type="button"
                onClick={() => setPasteMode('fields')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${pasteMode === 'fields' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                Fields
              </button>
            </div>
          </div>

          <form onSubmit={handleTestAndConnect} className="space-y-4">
            {pasteMode === 'json' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Firebase Web App Config JSON पेस्ट करें
                </label>
                <textarea
                  rows="6"
                  value={jsonInput}
                  onChange={(e) => handleJsonPaste(e.target.value)}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "myproject.firebaseapp.com",\n  "projectId": "myproject",\n  "appId": "1:..."\n}`}
                  className="w-full px-3.5 py-2.5 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Firebase Console ➔ Project Settings ➔ General ➔ Your Apps ➔ Web App (firebaseConfig) से कॉपी करके यहाँ पेस्ट करें।
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">API Key *</label>
                  <input
                    type="text"
                    value={fieldInputs.apiKey}
                    onChange={(e) => setFieldInputs({ ...fieldInputs, apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Project ID *</label>
                  <input
                    type="text"
                    value={fieldInputs.projectId}
                    onChange={(e) => setFieldInputs({ ...fieldInputs, projectId: e.target.value })}
                    placeholder="my-workers-app"
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">App ID</label>
                  <input
                    type="text"
                    value={fieldInputs.appId}
                    onChange={(e) => setFieldInputs({ ...fieldInputs, appId: e.target.value })}
                    placeholder="1:123456789:web:abcdef"
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>
            )}

            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={testing}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {testing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>कनेक्शन टेस्ट हो रहा है...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>टेस्ट व क्लाउड डेटाबेस कनेक्ट करें (Save & Connect)</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Guide */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              <span>मुफ्त Firebase डेटाबेस कैसे प्राप्त करें? (3 आसान चरण)</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-500 text-[11px] leading-relaxed">
              <li>
                <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-0.5">
                  console.firebase.google.com <ExternalLink className="w-3 h-3" />
                </a> पर जाएं और <strong>Create Project</strong> पर क्लिक करें।
              </li>
              <li>
                बाएं मेनू में <strong>Build ➔ Firestore Database</strong> पर क्लिक करके <strong>Create Database</strong> करें (Start in Test mode चुनें)।
              </li>
              <li>
                <strong>Project Settings ➔ General ➔ Your Apps</strong> में Web App (<code>&lt;/&gt;</code>) जोड़ें और मिला हुआ <code>firebaseConfig</code> यहाँ पेस्ट करें!
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: Export, Backup & Restore Tools */}
        <div className="space-y-6">
          
          {/* Export to Excel Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Excel / CSV में डेटा डाउनलोड करें
                </h3>
                <p className="text-xs text-slate-500">
                  नाम, मोबाइल नंबर, पेशा, इलाका, आधार नंबर व स्टेटस के साथ पूरी शीट
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              सभी स्वीकृत कारीगरों व पेंडिंग आवेदनों की सूची को सीधे एक्सेल (Excel/Google Sheets) में खोलें व अपने कंप्यूटर या फोन पर ऑफलाइन सुरक्षित रखें।
            </p>

            <button
              onClick={exportWorkersCSV}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>एक्सेल फाइल डाउनलोड करें (Download CSV/Excel)</span>
            </button>
          </div>

          {/* Full Database JSON Backup */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  संपूर्ण डेटाबेस बैकअप (JSON Backup)
                </h3>
                <p className="text-xs text-slate-500">
                  फ़ोटो, आईडी, तारीख व सम्पूर्ण विवरण सहित 100% फुल बैकअप
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              डेटा खोने से बचने के लिए संपूर्ण डेटाबेस का बैकअप डाउनलोड करें, या किसी अन्य फोन/कंप्यूटर पर एक क्लिक में रिस्टोर करें।
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                onClick={exportFullDatabaseJSON}
                className="w-full sm:flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>बैकअप डाउनलोड (Export JSON)</span>
              </button>

              <label className="w-full sm:flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-4 h-4" />
                <span>{importing ? 'रिस्टोर हो रहा है...' : 'बैकअप रिस्टोर (Restore)'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>

            {importMsg && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                importMsg.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {importMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{importMsg.message}</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
