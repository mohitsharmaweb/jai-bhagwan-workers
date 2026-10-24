import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchAllWorkers, 
  fetchMessageLogs, 
  logMessageSent 
} from '../lib/supabase';
import { PROFESSIONS, getProfessionLabel } from '../constants/professions';
import { JAIPUR_AREAS, getAreaLabel } from '../constants/areas';
import { MESSAGE_TEMPLATES, compileTemplate } from '../constants/templates';
import { createWhatsAppChatUrl } from '../services/whatsappService';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  History, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Square,
  Phone
} from 'lucide-react';

export default function AdminMessaging() {
  const [workers, setWorkers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'

  // Composition State
  const [selectedTemplateId, setSelectedTemplateId] = useState('diwali');
  const [messageBody, setMessageBody] = useState(MESSAGE_TEMPLATES[0].template);

  // Audience Filtering State
  const [targetFilter, setTargetFilter] = useState('all'); // 'all' | 'profession' | 'area'
  const [selectedProfession, setSelectedProfession] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [consentOnly, setConsentOnly] = useState(true);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState(new Set());

  // Track sent status locally during the session
  const [sentMap, setSentMap] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workerData, logData] = await Promise.all([
        fetchAllWorkers(),
        fetchMessageLogs()
      ]);
      setWorkers(workerData || []);
      setLogs(logData || []);
    } catch (err) {
      console.error('Error loading messaging data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle template selection
  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    const tmpl = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setMessageBody(tmpl.template);
    }
  };

  // Filtered workers list for messaging
  const eligibleWorkers = useMemo(() => {
    return workers.filter(w => {
      // 1. Consent check
      if (consentOnly && !w.consent) {
        return false;
      }

      // 2. Target audience filter
      if (targetFilter === 'profession' && selectedProfession !== 'all' && w.profession !== selectedProfession) {
        return false;
      }
      if (targetFilter === 'area' && selectedArea !== 'all' && w.area !== selectedArea) {
        return false;
      }

      return true;
    });
  }, [workers, consentOnly, targetFilter, selectedProfession, selectedArea]);

  // Sync selected workers set with eligible list on filter change
  useEffect(() => {
    setSelectedWorkerIds(new Set(eligibleWorkers.map(w => w.id)));
  }, [eligibleWorkers]);

  // Manual selection toggles
  const handleToggleWorker = (id) => {
    setSelectedWorkerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedWorkerIds.size === eligibleWorkers.length) {
      setSelectedWorkerIds(new Set());
    } else {
      setSelectedWorkerIds(new Set(eligibleWorkers.map(w => w.id)));
    }
  };

  // Workers that are checked for sending
  const targetWorkersList = eligibleWorkers.filter(w => selectedWorkerIds.has(w.id));

  // Single Worker WhatsApp Send & Log
  const handleSendToWorker = async (worker) => {
    const personalizedText = compileTemplate(messageBody, worker);
    const waUrl = createWhatsAppChatUrl(worker.whatsapp || worker.mobile, personalizedText);

    // Open WhatsApp Chat
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Record Log in Supabase
    try {
      await logMessageSent({
        workerId: worker.id,
        workerName: worker.name,
        workerMobile: worker.whatsapp || worker.mobile,
        templateType: selectedTemplateId,
        message: personalizedText
      });

      // Mark locally as sent
      setSentMap(prev => ({ ...prev, [worker.id]: true }));

      // Refresh log count
      const updatedLogs = await fetchMessageLogs();
      setLogs(updatedLogs || []);
    } catch (err) {
      console.error('Failed to log message:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            WhatsApp संदेश प्रसारण (Messaging Hub)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            कारीगरों को त्योहारों की शुभकामनाएं, मीटिंग सूचना या नए काम के संदेश भेजें
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'compose'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>संदेश भेजें (Broadcast)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-amber-600" />
            <span>संदेश इतिहास ({logs.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* Message History Tab */
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">भेजे गए संदेशों का इतिहास</h3>
              <p className="text-xs text-slate-500">किस कारीगर को कब कौन सा संदेश भेजा गया</p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              title="रिफ्रेश करें"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-10 text-center text-slate-400 space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">अभी तक कोई संदेश इतिहास उपलब्ध नहीं है।</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((item, idx) => (
                <div key={item.id || idx} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">{item.worker_name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(item.sent_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-amber-700">
                    +91 {item.worker_mobile} • <span className="uppercase text-slate-500">{item.template_type}</span>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-line">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Compose & Dispatch Hub */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Template & Message Editor (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Template Selector */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>रेडी-मेड टेम्पलेट्स (Templates)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {MESSAGE_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t.id)}
                    className={`p-3 rounded-2xl text-left border text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                      selectedTemplateId === t.id
                        ? 'bg-amber-50/80 border-amber-500 text-amber-950 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{t.title}</span>
                    {selectedTemplateId === t.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Text Editor */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  संदेश सामग्री (Message Text)
                </label>
                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                  {`{naam}`} ऑटो-बदलेगा
                </span>
              </div>

              <textarea
                rows={9}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-300 text-xs sm:text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                placeholder="यहाँ अपना संदेश लिखें..."
              />

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-700">उपलब्ध टोकन (Placeholders):</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-amber-800">{`{naam}`}</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-amber-800">{`{profession}`}</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-amber-800">{`{area}`}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Audience Target & Dispatch Queue (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Filter Audience Box */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>किसे भेजना है? (Target Audience)</span>
              </h3>

              {/* Target Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'सभी कारीगर' },
                  { id: 'profession', label: 'पेशा-वार' },
                  { id: 'area', label: 'जयपुर क्षेत्र-वार' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTargetFilter(tab.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      targetFilter === tab.id
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Specific Trade Dropdown */}
              {targetFilter === 'profession' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">विशिष्ट पेशा चुनें:</label>
                  <select
                    value={selectedProfession}
                    onChange={(e) => setSelectedProfession(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="all">सभी पेशे (All Trades)</option>
                    {PROFESSIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.labelHi} ({p.labelEn})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Specific Area Dropdown */}
              {targetFilter === 'area' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">विशिष्ट जयपुर क्षेत्र चुनें:</label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="all">सभी क्षेत्र (All Areas)</option>
                    {JAIPUR_AREAS.map(a => (
                      <option key={a.id} value={a.id}>{a.labelHi} ({a.labelEn})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Consent Guard Checkbox */}
              <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={consentOnly}
                    onChange={(e) => setConsentOnly(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>केवल सहमति (Consent) देने वाले कारीगरों को ही भेजें</span>
                </label>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Recipient Queue & Direct Dispatch List */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    प्राप्तकर्ता सूची (Recipients Queue)
                  </h3>
                  <p className="text-xs text-slate-500">
                    चयनित: <span className="font-extrabold text-amber-700">{selectedWorkerIds.size}</span> / {eligibleWorkers.length} कारीगर
                  </p>
                </div>

                <button
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 py-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {selectedWorkerIds.size === eligibleWorkers.length ? 'सभी अचयनित करें' : 'सभी चुनें'}
                </button>
              </div>

              {eligibleWorkers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">चयनित फ़िल्टर के अनुसार कोई कारीगर उपलब्ध नहीं है।</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {eligibleWorkers.map(worker => {
                    const isChecked = selectedWorkerIds.has(worker.id);
                    const isSent = sentMap[worker.id];
                    const personalizedPreview = compileTemplate(messageBody, worker);

                    return (
                      <div
                        key={worker.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isChecked
                            ? 'bg-white border-slate-200 hover:border-amber-300 shadow-sm'
                            : 'bg-slate-50/60 border-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          
                          {/* Checkbox + Info */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleWorker(worker.id)}
                              className="mt-0.5 text-slate-400 hover:text-slate-600"
                            >
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-amber-600" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                {worker.name}
                              </h4>
                              <p className="text-[11px] font-mono text-slate-500 font-semibold">
                                +91 {worker.whatsapp || worker.mobile} • {worker.profession} ({worker.area})
                              </p>
                            </div>
                          </div>

                          {/* Direct WhatsApp Action Button */}
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleSendToWorker(worker)}
                              className={`py-2 px-3.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm ${
                                isSent
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{isSent ? 'भेजा गया ✓' : 'WhatsApp भेजें'}</span>
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Instructions Callout */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>एक-क्लिक WhatsApp सुविधा:</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  "WhatsApp भेजें" बटन दबाते ही कारीगर का नाम स्वचालित रूप से जुड़ जाएगा और उनके मोबाइल पर WhatsApp चैट सीधे खुल जाएगी। भेजने के बाद इतिहास में स्वतः दर्ज हो जाएगा।
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
