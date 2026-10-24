import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  fetchAllWorkers, 
  registerWorker, 
  updateWorker, 
  deleteWorker 
} from '../lib/supabase';
import { PROFESSIONS, getProfessionLabel } from '../constants/professions';
import { JAIPUR_AREAS, getAreaLabel } from '../constants/areas';
import { createWhatsAppChatUrl } from '../services/whatsappService';
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  X, 
  AlertCircle,
  ShieldCheck,
  Building2,
  ChevronDown
} from 'lucide-react';

export default function AdminWorkers() {
  const [searchParams] = useSearchParams();
  const initialProfession = searchParams.get('profession') || 'all';
  const shouldOpenAdd = searchParams.get('action') === 'add';

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState(initialProfession);
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(shouldOpenAdd);
  const [editingWorker, setEditingWorker] = useState(null);
  const [deletingWorker, setDeletingWorker] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    whatsapp: '',
    profession: 'Mistri',
    profession_other: '',
    experience: 3,
    area: 'Mansarovar',
    area_other: '',
    address: '',
    consent: true
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllWorkers();
      setWorkers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('कारीगरों की सूची लोड नहीं हो सकी।');
    } finally {
      setLoading(false);
    }
  };

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return workers.filter(w => {
      // 1. Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (w.name || '').toLowerCase().includes(query);
        const matchesMobile = (w.mobile || '').includes(query);
        const matchesAddress = (w.address || '').toLowerCase().includes(query);
        const matchesProfOther = (w.profession_other || '').toLowerCase().includes(query);
        const matchesAreaOther = (w.area_other || '').toLowerCase().includes(query);
        if (!matchesName && !matchesMobile && !matchesAddress && !matchesProfOther && !matchesAreaOther) {
          return false;
        }
      }

      // 2. Profession filter
      if (selectedProfession !== 'all' && w.profession !== selectedProfession) {
        return false;
      }

      // 3. Area filter
      if (selectedArea !== 'all' && w.area !== selectedArea) {
        return false;
      }

      // 4. Experience filter
      if (selectedExperience !== 'all') {
        const exp = parseInt(w.experience, 10) || 0;
        if (selectedExperience === '0-2' && exp > 2) return false;
        if (selectedExperience === '3-5' && (exp < 3 || exp > 5)) return false;
        if (selectedExperience === '6-10' && (exp < 6 || exp > 10)) return false;
        if (selectedExperience === '10+' && exp < 10) return false;
      }

      return true;
    });
  }, [workers, searchQuery, selectedProfession, selectedArea, selectedExperience]);

  // Open Edit Modal
  const handleOpenEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name || '',
      mobile: worker.mobile || '',
      whatsapp: worker.whatsapp || worker.mobile || '',
      profession: worker.profession || 'Mistri',
      profession_other: worker.profession_other || '',
      experience: worker.experience || 0,
      area: worker.area || 'Mansarovar',
      area_other: worker.area_other || '',
      address: worker.address || '',
      consent: worker.consent !== false
    });
    setFormError('');
  };

  // Reset & Open Add Modal
  const handleOpenAdd = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      mobile: '',
      whatsapp: '',
      profession: 'Mistri',
      profession_other: '',
      experience: 3,
      area: 'Mansarovar',
      area_other: '',
      address: '',
      consent: true
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Save (Add or Update)
  const handleSaveWorker = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.mobile.trim()) {
      setFormError('नाम और 10 अंकों का मोबाइल नंबर अनिवार्य है।');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      setFormError('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    setFormSubmitting(true);

    try {
      if (editingWorker) {
        // Update
        const updated = await updateWorker(editingWorker.id, {
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          whatsapp: (formData.whatsapp || formData.mobile).trim(),
          profession: formData.profession,
          profession_other: formData.profession_other || null,
          experience: parseInt(formData.experience, 10) || 0,
          area: formData.area,
          area_other: formData.area_other || null,
          address: formData.address ? formData.address.trim() : null,
          consent: Boolean(formData.consent)
        });
        setWorkers(prev => prev.map(w => w.id === editingWorker.id ? { ...w, ...updated } : w));
        setEditingWorker(null);
      } else {
        // Add new
        const created = await registerWorker(formData);
        setWorkers(prev => [created, ...prev]);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving worker:', err);
      if (err.message === 'DUPLICATE_MOBILE') {
        setFormError('यह मोबाइल नंबर पहले से किसी अन्य कार्यकर्ता के पास पंजीकृत है।');
      } else {
        setFormError(err.message || 'सहेजने में त्रुटि हुई।');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete worker
  const handleDeleteConfirm = async () => {
    if (!deletingWorker) return;
    try {
      await deleteWorker(deletingWorker.id);
      setWorkers(prev => prev.filter(w => w.id !== deletingWorker.id));
      setDeletingWorker(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('हटाने में समस्या आई: ' + err.message);
    }
  };

  // Export to CSV with UTF-8 BOM for Excel Hindi character support
  const handleExportCSV = () => {
    if (filteredWorkers.length === 0) {
      alert('निर्यात के लिए कोई डेटा नहीं है।');
      return;
    }

    const headers = [
      'ID',
      'Name (नाम)',
      'Mobile (मोबाइल)',
      'WhatsApp Number',
      'Profession (काम)',
      'Experience (वर्ष)',
      'Jaipur Area (क्षेत्र)',
      'Full Address (पता)',
      'WhatsApp Consent',
      'Registration Date'
    ];

    const rows = filteredWorkers.map(w => [
      w.id,
      `"${(w.name || '').replace(/"/g, '""')}"`,
      w.mobile || '',
      w.whatsapp || w.mobile || '',
      `"${w.profession === 'Other' && w.profession_other ? w.profession_other : getProfessionLabel(w.profession, 'hi')}"`,
      w.experience || 0,
      `"${w.area === 'Other' && w.area_other ? w.area_other : getAreaLabel(w.area, 'hi')}"`,
      `"${(w.address || '').replace(/"/g, '""')}"`,
      w.consent ? 'हाँ (Yes)' : 'नहीं (No)',
      new Date(w.created_at || Date.now()).toLocaleDateString('en-IN')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Jai_Bhagwan_Workers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            कारीगर डायरेक्टरी (Workers Directory)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            कुल: <span className="font-bold text-slate-900">{filteredWorkers.length}</span> / {workers.length} कारीगर प्रदर्शित
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Excel / CSV डाउनलोड</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>नया कारीगर जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="नाम, मोबाइल, इलाका खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Profession Dropdown */}
          <div>
            <select
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="all">सभी पेशे / काम (All Trades)</option>
              {PROFESSIONS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.labelHi} ({p.labelEn})
                </option>
              ))}
            </select>
          </div>

          {/* Jaipur Area Dropdown */}
          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="all">सभी जयपुर क्षेत्र (All Areas)</option>
              {JAIPUR_AREAS.map(a => (
                <option key={a.id} value={a.id}>
                  {a.labelHi} ({a.labelEn})
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="all">सभी अनुभव (All Experience)</option>
              <option value="0-2">0 - 2 वर्ष (प्रारंभिक)</option>
              <option value="3-5">3 - 5 वर्ष (मध्यम)</option>
              <option value="6-10">6 - 10 वर्ष (अनुभवी)</option>
              <option value="10+">10+ वर्ष (वरिष्ठ कारीगर)</option>
            </select>
          </div>

        </div>

        {/* Filter Summary Tags if active */}
        {(selectedProfession !== 'all' || selectedArea !== 'all' || selectedExperience !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
            <span className="text-slate-400 font-bold">सक्रिय फ़िल्टर:</span>
            {selectedProfession !== 'all' && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 flex items-center gap-1 font-semibold">
                ट्रेड: {selectedProfession}
                <button onClick={() => setSelectedProfession('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedArea !== 'all' && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 flex items-center gap-1 font-semibold">
                इलाका: {selectedArea}
                <button onClick={() => setSelectedArea('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedProfession('all');
                setSelectedArea('all');
                setSelectedExperience('all');
              }}
              className="text-amber-700 underline text-xs font-bold ml-auto"
            >
              सभी रीसेट करें
            </button>
          </div>
        )}
      </div>

      {/* Workers Table (Desktop) & Cards (Mobile) */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs sm:text-sm font-bold text-slate-600">कारीगर डेटा लोड हो रहा है...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">कोई कारीगर नहीं मिला</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            दिए गए फ़िल्टर या खोज के आधार पर कोई रिकॉर्ड नहीं मिला। कृपया अपने फ़िल्टर रीसेट करें या नया कारीगर जोड़ें।
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
          >
            नया कारीगर जोड़ें
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-5">कारीगर (Name)</th>
                    <th className="py-4 px-4">मोबाइल / WhatsApp</th>
                    <th className="py-4 px-4">काम (Trade)</th>
                    <th className="py-4 px-4">अनुभव</th>
                    <th className="py-4 px-4">जयपुर क्षेत्र</th>
                    <th className="py-4 px-4 text-center">सहमति</th>
                    <th className="py-4 px-5 text-right">कार्य (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredWorkers.map((worker) => {
                    const waUrl = createWhatsAppChatUrl(
                      worker.whatsapp || worker.mobile,
                      `नमस्ते ${worker.name} जी 🙏 जय भगवान (जयपुर) की तरफ से संपर्क कर रहे हैं।`
                    );

                    return (
                      <tr key={worker.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3.5 px-5">
                          <p className="font-extrabold text-slate-900">{worker.name}</p>
                          {worker.address && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">{worker.address}</p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          <div>+91 {worker.mobile}</div>
                          {worker.whatsapp && worker.whatsapp !== worker.mobile && (
                            <div className="text-[10px] text-slate-400 font-sans">WA: {worker.whatsapp}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200/60">
                            {worker.profession === 'Other' && worker.profession_other 
                              ? worker.profession_other 
                              : getProfessionLabel(worker.profession, 'hi').split('/')[0]}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {worker.experience || '0'} वर्ष
                        </td>

                        <td className="py-3.5 px-4 text-slate-800 font-medium">
                          {worker.area === 'Other' && worker.area_other 
                            ? worker.area_other 
                            : getAreaLabel(worker.area, 'hi')}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {worker.consent ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              सहमति
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              नहीं
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp चैट खोलें"
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => handleOpenEdit(worker)}
                              title="संशोधित करें (Edit)"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeletingWorker(worker)}
                              title="हटाएं (Delete)"
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View: High-Quality Cards */}
          <div className="md:hidden space-y-3">
            {filteredWorkers.map(worker => {
              const waUrl = createWhatsAppChatUrl(
                worker.whatsapp || worker.mobile,
                `नमस्ते ${worker.name} जी 🙏 जय भगवान (जयपुर) की तरफ से संपर्क कर रहे हैं।`
              );

              return (
                <div key={worker.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">{worker.name}</h4>
                      <p className="text-xs font-mono font-bold text-amber-700 mt-0.5">+91 {worker.mobile}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200">
                      {worker.profession === 'Other' && worker.profession_other 
                        ? worker.profession_other 
                        : getProfessionLabel(worker.profession, 'hi').split('/')[0]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span className="truncate">
                        {worker.area === 'Other' && worker.area_other 
                          ? worker.area_other 
                          : getAreaLabel(worker.area, 'hi')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{worker.experience || '0'} वर्ष अनुभव</span>
                    </div>
                  </div>

                  {worker.address && (
                    <p className="text-xs text-slate-500 leading-snug">
                      📍 {worker.address}
                    </p>
                  )}

                  {/* Actions for Mobile */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp भेजें</span>
                    </a>

                    <button
                      onClick={() => handleOpenEdit(worker)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeletingWorker(worker)}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Worker Modal */}
      {(isAddModalOpen || editingWorker) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingWorker(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingWorker ? 'कारीगर जानकारी संशोधित करें' : 'नया कारीगर जोड़ें (Add Worker)'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              प्रबंधन द्वारा सीधे कार्यकर्ता को डायरेक्टरी में दर्ज करें
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveWorker} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">पूरा नाम *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="उदा. रमेश कुमार शर्मा"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">मोबाइल नंबर (10 अंक) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                    placeholder="9829012345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">WhatsApp नंबर</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value.replace(/\D/g, '') }))}
                    placeholder="खाली छोड़ें यदि समान है"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">पेशा / काम *</label>
                  <select
                    value={formData.profession}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {PROFESSIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.labelHi}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">अनुभव (वर्ष)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {formData.profession === 'Other' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">अन्य काम लिखें *</label>
                  <input
                    type="text"
                    value={formData.profession_other}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession_other: e.target.value }))}
                    placeholder="उदा. वेल्डर, फैब्रिकेटर"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">जयपुर क्षेत्र *</label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {JAIPUR_AREAS.map(a => (
                    <option key={a.id} value={a.id}>{a.labelHi}</option>
                  ))}
                </select>
              </div>

              {formData.area === 'Other' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">अन्य क्षेत्र लिखें *</label>
                  <input
                    type="text"
                    value={formData.area_other}
                    onChange={(e) => setFormData(prev => ({ ...prev, area_other: e.target.value }))}
                    placeholder="उदा. राजा पार्क, विद्याधर नगर"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">पूरा पता (वैकल्पिक)</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="मकान नंबर, गली या लैंडमार्क"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">
                    WhatsApp मैसेज सहमति उपलब्ध है (Consent Granted)
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingWorker(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  रद्द करें (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  {formSubmitting ? 'सहेज रहे हैं...' : editingWorker ? 'अपडेट करें' : 'जमा करें (Save)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              कारीगर रिकॉर्ड हटाएं?
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              क्या आप सचमुच <span className="font-bold text-slate-900">{deletingWorker.name}</span> (+91 {deletingWorker.mobile}) को डायरेक्टरी से हटाना चाहते हैं?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingWorker(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                रद्द करें
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                हाँ, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
