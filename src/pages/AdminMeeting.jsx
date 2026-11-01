import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  fetchConsentedWorkers, 
  createMeeting, 
  fetchMeetings, 
  deleteMeeting, 
  logMessageSent 
} from '../lib/supabase';
import { PROFESSIONS, getProfessionLabel } from '../constants/professions';
import { JAIPUR_AREAS, getAreaLabel } from '../constants/areas';
import { 
  normalizePhoneNumber, 
  formatHindiDate, 
  formatHindiTime, 
  buildMeetingMessage 
} from '../utils/formatters';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Send, 
  CheckCircle2, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  Briefcase,
  MessageSquare,
  Check,
  Search,
  UserCheck,
  X,
  CheckSquare
} from 'lucide-react';

export default function AdminMeeting() {
  // Master data
  const [allWorkers, setAllWorkers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form State
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default to tomorrow
    return d.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    meeting_date: defaultDate,
    meeting_time: '10:30',
    location: 'जय भगवान कार्यालय, मानसरोवर, जयपुर',
    notes: '',
    target_trade: 'all',
    target_area: 'all'
  });

  // Active Queue State (for dispatching WhatsApp messages)
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [queueWorkers, setQueueWorkers] = useState([]);
  const [sentWorkerIds, setSentWorkerIds] = useState(new Set());
  const [dispatchStatus, setDispatchStatus] = useState(null);

  // Worker Selection State (Custom selection by name/category vs all)
  const [selectionMode, setSelectionMode] = useState('custom'); // 'custom' | 'all'
  const [selectedWorkerIds, setSelectedWorkerIds] = useState(new Set());
  const [workerFilterTrade, setWorkerFilterTrade] = useState('all');
  const [workerSearch, setWorkerSearch] = useState('');

  // Modals & Feedback
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }

  const queueRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [workersData, meetingsData] = await Promise.all([
        fetchConsentedWorkers(),
        fetchMeetings()
      ]);
      setAllWorkers(workersData || []);
      setMeetings(meetingsData || []);
    } catch (err) {
      console.error('Error loading meeting data:', err);
      showFeedback('error', 'डेटा लोड करने में समस्या आई। कृपया पृष्ठ रीफ्रेश करें।');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Helper to filter workers by trade and area
  // Note: consent=true and status='active' already filtered at DB query level
  const filterEligibleWorkers = (workersList, trade, area) => {
    return workersList.filter(w => {
      // Trade filter
      if (trade && trade !== 'all' && trade !== 'सभी') {
        if (w.profession !== trade) return false;
      }

      // Area filter
      if (area && area !== 'all' && area !== 'सभी') {
        if (w.area !== area) return false;
      }

      return true;
    });
  };

  // Visible workers in custom selector (filtered by trade tab and search query)
  const visibleWorkersForSelection = useMemo(() => {
    return allWorkers.filter(w => {
      if (workerFilterTrade !== 'all' && w.profession !== workerFilterTrade) {
        return false;
      }
      if (workerSearch.trim()) {
        const q = workerSearch.toLowerCase();
        const matchName = (w.name || '').toLowerCase().includes(q);
        const matchMobile = (w.mobile || '').includes(q);
        const matchArea = (w.area || '').toLowerCase().includes(q);
        if (!matchName && !matchMobile && !matchArea) return false;
      }
      return true;
    });
  }, [allWorkers, workerFilterTrade, workerSearch]);

  // Breakdown of selected workers by trade (e.g. "3 इलेक्ट्रीशियन, 5 प्लंबर")
  const selectedBreakdown = useMemo(() => {
    const counts = {};
    allWorkers.forEach(w => {
      if (selectedWorkerIds.has(w.id)) {
        const t = w.profession || 'Other';
        counts[t] = (counts[t] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([trade, count]) => `${count} ${getProfessionLabel(trade).split('/')[0].trim()}`)
      .join(', ');
  }, [allWorkers, selectedWorkerIds]);

  const handleToggleWorkerSelection = (id) => {
    setSelectedWorkerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectVisible = () => {
    setSelectedWorkerIds(prev => {
      const next = new Set(prev);
      visibleWorkersForSelection.forEach(w => next.add(w.id));
      return next;
    });
  };

  const handleDeselectVisible = () => {
    setSelectedWorkerIds(prev => {
      const next = new Set(prev);
      visibleWorkersForSelection.forEach(w => next.delete(w.id));
      return next;
    });
  };

  const handleClearAllSelection = () => {
    setSelectedWorkerIds(new Set());
  };

  // Live message preview string for the form
  const messagePreview = useMemo(() => {
    return buildMeetingMessage({
      title: formData.title || 'कारीगर बैठक',
      date: formData.meeting_date,
      time: formData.meeting_time,
      location: formData.location,
      notes: formData.notes,
      workerName: '{कारीगर का नाम}'
    });
  }, [formData]);

  // Count of workers matching currently selected trade and area in the form
  const prospectiveCount = useMemo(() => {
    return filterEligibleWorkers(allWorkers, formData.target_trade, formData.target_area).length;
  }, [allWorkers, formData.target_trade, formData.target_area]);

  // Count of workers to be targeted upon submit
  const targetCount = selectionMode === 'custom' 
    ? selectedWorkerIds.size 
    : prospectiveCount;

  // Handle Form Submission (Create Meeting & Queue Workers)
  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showFeedback('error', 'कृपया मीटिंग का विषय / नाम दर्ज करें।');
      return;
    }
    if (!formData.meeting_date) {
      showFeedback('error', 'कृपया मीटिंग की तारीख चुनें।');
      return;
    }
    if (!formData.meeting_time) {
      showFeedback('error', 'कृपया मीटिंग का समय चुनें।');
      return;
    }
    if (!formData.location.trim()) {
      showFeedback('error', 'कृपया मीटिंग का स्थान दर्ज करें।');
      return;
    }

    let targets = [];
    if (selectionMode === 'custom') {
      if (selectedWorkerIds.size === 0) {
        showFeedback('error', 'कृपया मीटिंग के लिए कम से कम एक कारीगर चुनें (नीचे सूची में टिक करें) या "कैटेगरी अनुसार सभी" मोड चुनें।');
        return;
      }
      targets = allWorkers.filter(w => selectedWorkerIds.has(w.id));
    } else {
      targets = filterEligibleWorkers(
        allWorkers,
        formData.target_trade,
        formData.target_area
      );
      if (targets.length === 0) {
        showFeedback('error', 'चयनित फ़िल्टर के अनुसार कोई कारीगर उपलब्ध नहीं है।');
        return;
      }
    }

    setFormSubmitting(true);

    try {
      const meetingPayload = {
        ...formData,
        target_trade: selectionMode === 'custom' ? (selectedBreakdown || 'चुनिंदा कारीगर') : formData.target_trade,
        target_area: selectionMode === 'custom' ? 'सभी क्षेत्र' : formData.target_area
      };

      const created = await createMeeting(meetingPayload);
      setMeetings(prev => [created, ...prev]);

      setActiveMeeting(created);
      setQueueWorkers(targets);
      setSentWorkerIds(new Set());

      showFeedback('success', `मीटिंग सहेजी गई! ${targets.length} कारीगरों को संदेश भेजने के लिए कतार तैयार है।`);

      // Scroll smoothly down to the worker queue
      setTimeout(() => {
        queueRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err) {
      console.error('Error creating meeting:', err);
      showFeedback('error', 'मीटिंग सहेजने में त्रुटि हुई: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Dispatch WhatsApp Message to a specific worker
  const handleSendToWorker = async (worker) => {
    if (!activeMeeting) return;

    const rawPhone = worker.whatsapp || worker.mobile;
    const phone = normalizePhoneNumber(rawPhone);

    if (!phone) {
      showFeedback('error', `${worker.name} का मान्य फोन नंबर उपलब्ध नहीं है।`);
      return;
    }

    // Generate personalized message
    const personalizedMessage = buildMeetingMessage({
      title: activeMeeting.title,
      date: activeMeeting.meeting_date,
      time: activeMeeting.meeting_time,
      location: activeMeeting.location,
      notes: activeMeeting.notes,
      workerName: worker.name || 'कारीगर साथी'
    });

    // wa.me direct URL
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(personalizedMessage)}`;

    // Open WhatsApp in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');

    // Update sent set
    setSentWorkerIds(prev => new Set([...prev, worker.id]));

    // Log to Supabase message_logs table
    try {
      await logMessageSent({
        workerId: worker.id,
        workerName: worker.name,
        workerMobile: phone,
        templateType: 'meeting',
        message: personalizedMessage
      });
    } catch (logErr) {
      console.warn('Could not record meeting message log:', logErr);
    }
  };

  // Find next unsent worker in queue
  const nextUnsentWorker = useMemo(() => {
    return queueWorkers.find(w => !sentWorkerIds.has(w.id));
  }, [queueWorkers, sentWorkerIds]);

  // "दोबारा भेजें" on an existing past meeting
  const handleReloadMeetingQueue = (meeting) => {
    let targets = [];
    if (meeting.target_trade && meeting.target_trade !== 'all' && !meeting.target_trade.includes(',')) {
      targets = filterEligibleWorkers(
        allWorkers,
        meeting.target_trade,
        meeting.target_area
      );
      setSelectionMode('all');
    } else {
      targets = allWorkers;
      setSelectionMode('custom');
    }

    setSelectedWorkerIds(new Set(targets.map(w => w.id)));
    setActiveMeeting(meeting);
    setQueueWorkers(targets);
    setSentWorkerIds(new Set());

    // Also populate the form so admin can see/edit if needed
    setFormData({
      title: meeting.title,
      meeting_date: meeting.meeting_date,
      meeting_time: meeting.meeting_time,
      location: meeting.location,
      notes: meeting.notes || '',
      target_trade: meeting.target_trade || 'all',
      target_area: meeting.target_area || 'all'
    });

    showFeedback('info', `"${meeting.title}" के लिए ${targets.length} कारीगरों की कतार लोड हो गई है।`);

    setTimeout(() => {
      queueRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Delete meeting confirmation handler
  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;

    try {
      await deleteMeeting(meetingToDelete.id);
      setMeetings(prev => prev.filter(m => m.id !== meetingToDelete.id));

      if (activeMeeting?.id === meetingToDelete.id) {
        setActiveMeeting(null);
        setQueueWorkers([]);
        setSentWorkerIds(new Set());
      }

      showFeedback('success', 'मीटिंग रिकॉर्ड सफलतापूर्वक हटा दिया गया।');
    } catch (err) {
      console.error('Delete meeting error:', err);
      showFeedback('error', 'मीटिंग हटाने में त्रुटि हुई: ' + err.message);
    } finally {
      setMeetingToDelete(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 px-2 sm:px-4">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-orange-600/15 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] sm:text-xs font-bold text-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>जय भगवान कार्यकर्ता बैठक प्रबंधन (Meetings)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            कारीगर बैठक व WhatsApp आमंत्रण
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
            जयपुर के कारीगरों (मिस्त्री, इलेक्ट्रीशियन, प्लंबर आदि) के लिए मीटिंग आयोजित करें और सीधे WhatsApp पर एक-क्लिक में व्यक्तिगत आमंत्रण भेजें।
          </p>
        </div>
      </div>

      {/* Floating / Inline Feedback Banner */}
      {feedback && (
        <div 
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shadow-md transition-all animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
          {feedback.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
          {feedback.type === 'info' && <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Grid: Form & Live Preview */}
      <div ref={formRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Meeting Creation Form (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                नई मीटिंग शेड्यूल करें
              </h2>
              <p className="text-xs text-slate-500">
                मीटिंग का विवरण भरें और लक्षित कारीगर चुनें
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateMeeting} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                मीटिंग का विषय / नाम <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="उदा. मासिक कारीगर बैठक व नई दरों पर चर्चा"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-slate-800"
              />
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>तारीख <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.meeting_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-semibold text-slate-800"
                />
                {formData.meeting_date && (
                  <p className="text-[11px] text-amber-700 font-bold mt-1 px-1">
                    {formatHindiDate(formData.meeting_date)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>समय <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.meeting_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_time: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-semibold text-slate-800"
                />
                {formData.meeting_time && (
                  <p className="text-[11px] text-amber-700 font-bold mt-1 px-1">
                    {formatHindiTime(formData.meeting_time)}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>स्थान / जगह <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                placeholder="उदा. जय भगवान कार्यालय, मानसरोवर, जयपुर"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-slate-800"
              />
            </div>

            {/* Worker Selection Section */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>कारीगर आमंत्रण चयन (Select Workers)</span>
                </label>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {selectionMode === 'custom' ? `${selectedWorkerIds.size} कारीगर चुने गए` : `सभी (${prospectiveCount})`}
                </span>
              </div>

              {/* Selection Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectionMode('custom')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectionMode === 'custom'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>नाम व ट्रेड से चुनें ({selectedWorkerIds.size})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('all')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectionMode === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  <span>कैटेगरी अनुसार सभी ({prospectiveCount})</span>
                </button>
              </div>

              {/* If selectionMode === 'custom': show granular interactive selector */}
              {selectionMode === 'custom' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
                  
                  {/* Category Filter Pills */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-0.5">
                      <span>ट्रेड चुनें (Select Trade):</span>
                      {selectedWorkerIds.size > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllSelection}
                          className="text-rose-600 font-bold hover:underline"
                        >
                          सब हटाएं (Clear All)
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setWorkerFilterTrade('all')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          workerFilterTrade === 'all'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>सभी कार्य</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          workerFilterTrade === 'all' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {allWorkers.length}
                        </span>
                      </button>

                      {PROFESSIONS.map(p => {
                        const totalInTrade = allWorkers.filter(w => w.profession === p.id).length;
                        if (totalInTrade === 0) return null;
                        const selectedInTrade = allWorkers.filter(w => w.profession === p.id && selectedWorkerIds.has(w.id)).length;
                        const isTabActive = workerFilterTrade === p.id;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setWorkerFilterTrade(p.id)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isTabActive
                                ? 'bg-amber-600 text-white shadow-sm'
                                : selectedInTrade > 0
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>{p.labelHi.split('/')[0].trim()}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              isTabActive 
                                ? 'bg-amber-700 text-white' 
                                : selectedInTrade > 0 
                                ? 'bg-amber-600 text-white font-bold' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {selectedInTrade > 0 ? `${selectedInTrade}/${totalInTrade}` : totalInTrade}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search and Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="नाम या मोबाइल से खोजें..."
                        value={workerSearch}
                        onChange={(e) => setWorkerSearch(e.target.value)}
                        className="w-full pl-8 pr-7 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                      {workerSearch && (
                        <button
                          type="button"
                          onClick={() => setWorkerSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
                      <button
                        type="button"
                        onClick={handleSelectVisible}
                        className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors shadow-2xs"
                      >
                        दिख रहे सभी चुनें ({visibleWorkersForSelection.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectVisible}
                        className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-600 transition-colors"
                      >
                        हटाएं
                      </button>
                    </div>
                  </div>

                  {/* Selected Breakdown Box */}
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>कुल {selectedWorkerIds.size} कारीगर चुने गए</span>
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold">
                        {selectedWorkerIds.size === 0 ? 'सूची से चुनें' : 'तैयार ✓'}
                      </span>
                    </div>
                    {selectedBreakdown ? (
                      <p className="text-[11px] text-amber-800 font-bold mt-1">
                        🎯 {selectedBreakdown}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1">
                        नीचे दिए गए कारीगरों पर क्लिक करके चुनें (उदा. 3 इलेक्ट्रीशियन, 5 प्लंबर)।
                      </p>
                    )}
                  </div>

                  {/* Worker Checklist (Scrollable) */}
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                    {visibleWorkersForSelection.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 font-medium">
                        इस फ़िल्टर में कोई कारीगर नहीं मिला।
                      </div>
                    ) : (
                      visibleWorkersForSelection.map(worker => {
                        const isSelected = selectedWorkerIds.has(worker.id);
                        return (
                          <div
                            key={worker.id}
                            onClick={() => handleToggleWorkerSelection(worker.id)}
                            className={`p-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-colors select-none ${
                              isSelected ? 'bg-amber-50/70 hover:bg-amber-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                                isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {worker.name}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 flex-shrink-0">
                                    {getProfessionLabel(worker.profession).split('/')[0].trim()}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {getAreaLabel(worker.area)} • 📞 +91 {normalizePhoneNumber(worker.whatsapp || worker.mobile)}
                                </p>
                              </div>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              isSelected ? 'bg-amber-200 text-amber-900' : 'text-slate-400 bg-slate-50'
                            }`}>
                              {isSelected ? 'चुना गया ✓' : '+ जोड़ें'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              ) : (
                /* Mode 2: Category Dropdowns */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                      <span>लक्षित ट्रेड</span>
                    </label>
                    <select
                      value={formData.target_trade}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_trade: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-semibold text-slate-800"
                    >
                      <option value="all">सभी ट्रेड / कार्य (All Trades)</option>
                      {PROFESSIONS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.labelHi} ({p.labelEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>लक्षित इलाका (जयपुर)</span>
                    </label>
                    <select
                      value={formData.target_area}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_area: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-semibold text-slate-800"
                    >
                      <option value="all">सभी क्षेत्र / इलाके (All Jaipur)</option>
                      {JAIPUR_AREAS.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.labelHi} ({a.labelEn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Extra Notes */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>अतिरिक्त विवरण / नोट्स (वैकल्पिक)</span>
                <span className="text-[11px] font-normal text-slate-400">वैकल्पिक</span>
              </label>
              <textarea
                rows="2"
                placeholder="उदा. कृपया समय पर पहुंचें और अपने पहचान पत्र साथ लाएं।"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-slate-800"
              />
            </div>

            {/* Submit Button with Dynamic Target Count */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-[0.99]"
              >
                {formSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>मीटिंग सहेजी जा रही है...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>मीटिंग सहेजें व कतार बनाएं ({targetCount} कारीगर)</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                {selectionMode === 'custom' ? (
                  <>आपकी पसंद अनुसार <strong className="text-amber-700">{selectedWorkerIds.size} कारीगरों</strong> को WhatsApp पर संदेश भेजा जाएगा।</>
                ) : (
                  <>चयनित फिल्टर के अनुसार कुल <strong className="text-amber-700">{prospectiveCount} कारीगरों</strong> को WhatsApp पर संदेश भेजा जाएगा।</>
                )}
              </p>
            </div>

          </form>
        </div>

        {/* Right: Live Message Preview (5 cols on lg) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>लाइव WhatsApp संदेश प्रीव्यू</span>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
              Live Preview
            </span>
          </div>

          {/* WhatsApp Chat Bubble */}
          <div className="bg-[#0b141a] rounded-2xl p-4 border border-slate-800/80 shadow-inner">
            <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tl-sm text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed shadow-sm">
              {messagePreview}
            </div>
            <div className="flex justify-end mt-1.5 px-1">
              <span className="text-[10px] text-slate-400">
                10:30 AM • WhatsApp Direct
              </span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>स्वचालित पर्सनलाइज़ेशन</span>
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              हर कारीगर को भेजने पर <code className="text-amber-200">{'{कारीगर का नाम}'}</code> उसके असली नाम (उदा. &quot;रमेश कुमार जी&quot;) से बदल जाएगा और सीधे उनके WhatsApp चैट में खुलेगा।
            </p>
          </div>
        </div>

      </div>

      {/* SECTION 2: Active Dispatch Queue (Visible when a meeting is created or reloaded) */}
      {activeMeeting && (
        <div 
          ref={queueRef}
          className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-300 shadow-xl space-y-6 scroll-mt-20 animate-in fade-in"
        >
          {/* Queue Header & Progress */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>सक्रिय प्रेषण कतार (Active Queue)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {activeMeeting.title}
              </h3>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 pt-0.5">
                <span>📅 {formatHindiDate(activeMeeting.meeting_date)}</span>
                <span>•</span>
                <span>⏰ {formatHindiTime(activeMeeting.meeting_time)}</span>
                <span>•</span>
                <span>📍 {activeMeeting.location}</span>
              </p>
            </div>

            {/* Counter Badge */}
            <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 text-right flex sm:flex-col justify-between items-center sm:items-end">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                प्रेषण प्रगति (Progress)
              </span>
              <span className="text-base sm:text-xl font-black text-slate-900">
                <strong className="text-emerald-600">{sentWorkerIds.size}</strong> / {queueWorkers.length} भेजा गया
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: queueWorkers.length > 0 
                  ? `${Math.round((sentWorkerIds.size / queueWorkers.length) * 100)}%` 
                  : '0%'
              }}
            ></div>
          </div>

          {/* Big Action: Send to Next Worker */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                त्वरित प्रेषण बटन (Quick Send)
              </span>
              <p className="text-xs sm:text-sm text-slate-700">
                {nextUnsentWorker ? (
                  <>अगला संदेश: <strong className="text-slate-950 font-bold">{nextUnsentWorker.name}</strong> ({getProfessionLabel(nextUnsentWorker.profession)} • {getAreaLabel(nextUnsentWorker.area)})</>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5 justify-center sm:justify-start">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>सभी {queueWorkers.length} कारीगरों को संदेश भेजा जा चुका है! 🎉</span>
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => nextUnsentWorker && handleSendToWorker(nextUnsentWorker)}
              disabled={!nextUnsentWorker}
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
              <span>
                {nextUnsentWorker ? 'अगले कारीगर को भेजें' : 'सभी को भेज दिया ✅'}
              </span>
            </button>
          </div>

          {/* Filtered Workers List Table / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                लक्षित कारीगरों की सूची ({queueWorkers.length} कारीगरों को भेजना है)
              </h4>
              <span className="text-xs text-slate-400">
                {sentWorkerIds.size} पूर्ण • {queueWorkers.length - sentWorkerIds.size} शेष
              </span>
            </div>

            {queueWorkers.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">
                  इस ट्रेड या क्षेत्र में कोई सहमति-प्राप्त कारीगर उपलब्ध नहीं है।
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  कृपया फॉर्म में ट्रेड या एरिया फ़िल्टर बदलकर दोबारा प्रयास करें।
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-96 overflow-y-auto">
                {queueWorkers.map((worker, index) => {
                  const isSent = sentWorkerIds.has(worker.id);
                  const phone = normalizePhoneNumber(worker.whatsapp || worker.mobile);

                  return (
                    <div 
                      key={worker.id || index}
                      className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                        isSent ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Worker info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isSent ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isSent ? '✓' : index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {worker.name}
                            </span>
                            {isSent && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                <span>भेजा गया</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {getProfessionLabel(worker.profession)} • {getAreaLabel(worker.area)} • 📞 +91 {phone}
                          </p>
                        </div>
                      </div>

                      {/* Send Button */}
                      <button
                        onClick={() => handleSendToWorker(worker)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                          isSent
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSent ? 'दोबारा भेजें' : 'भेजें'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: Past Meetings History ("पुरानी मीटिंग्स") */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                पुरानी मीटिंग्स (Past Meetings History)
              </h3>
              <p className="text-xs text-slate-500">
                पूर्व में आयोजित की गई बैठकें और संदेश पुनः प्रेषण
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            कुल: {meetings.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-bold text-slate-500">मीटिंग्स लोड हो रही हैं...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">कोई पूर्व मीटिंग रिकॉर्ड नहीं मिला।</p>
            <p className="text-xs text-slate-400 mt-1">ऊपर दिए गए फॉर्म से नई मीटिंग बनाएं।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((m) => (
              <div 
                key={m.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  activeMeeting?.id === m.id 
                    ? 'border-amber-400 bg-amber-50/40 shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                      {m.title}
                    </h4>
                    {activeMeeting?.id === m.id && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        सक्रिय
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>{formatHindiDate(m.meeting_date)}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{formatHindiTime(m.meeting_time)}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{m.location}</span>
                    </p>
                  </div>

                  {/* Target trade & area tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      ट्रेड: {m.target_trade === 'all' || !m.target_trade ? 'सभी कार्य' : getProfessionLabel(m.target_trade)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      क्षेत्र: {m.target_area === 'all' || !m.target_area ? 'सभी जयपुर' : getAreaLabel(m.target_area)}
                    </span>
                  </div>

                  {m.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                      📝 {m.notes}
                    </p>
                  )}
                </div>

                {/* Actions: Resend Queue & Delete */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleReloadMeetingQueue(m)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>दोबारा भेजें (Reload Queue)</span>
                  </button>

                  <button
                    onClick={() => setMeetingToDelete(m)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="मीटिंग हटाएं"
                    aria-label="Delete Meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(meetingToDelete)}
        title="मीटिंग रिकॉर्ड हटाएं (Delete Meeting)"
        message={`क्या आप वाकई "${meetingToDelete?.title}" मीटिंग को हमेशा के लिए हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।`}
        confirmText="हाँ, हटाएं"
        cancelText="रद्द करें"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setMeetingToDelete(null)}
      />

    </div>
  );
}

