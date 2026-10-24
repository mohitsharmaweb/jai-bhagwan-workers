import React, { useEffect, useState, useMemo } from 'react';
import { fetchAllSubmissions, approveWorker, rejectWorker, deleteSubmission } from '../firebase/firebase';
import WorkerCard from '../components/WorkerCard';
import ConfirmModal from '../components/ConfirmModal';
import { WORKER_CATEGORIES } from '../utils/categories';
import { 
  Clock, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  X,
  AlertCircle
} from 'lucide-react';

export default function AdminPending() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter tabs: 'pending' | 'rejected' | 'all'
  const [currentTab, setCurrentTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [selectedSub, setSelectedSub] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'delete'
  const [rejectReason, setRejectReason] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await fetchAllSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // 1. Tab filter
      if (currentTab === 'pending' && sub.status !== 'pending') return false;
      if (currentTab === 'rejected' && sub.status !== 'rejected') return false;

      // 2. Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = sub.fullName?.toLowerCase().includes(query);
        const matchesPhone = sub.phone?.includes(query);
        const matchesCity = sub.city?.toLowerCase().includes(query);
        const matchesArea = sub.area?.toLowerCase().includes(query);
        const matchesReg = sub.regId?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesCity && !matchesArea && !matchesReg) {
          return false;
        }
      }

      // 3. Category
      if (selectedCategory !== 'all' && sub.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [submissions, currentTab, searchTerm, selectedCategory]);

  const handleApproveConfirm = async () => {
    if (!selectedSub) return;
    try {
      await approveWorker(selectedSub);
      setModalType(null);
      setSelectedSub(null);
      await loadSubmissions();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedSub) return;
    try {
      await rejectWorker(selectedSub.id, rejectReason);
      setModalType(null);
      setSelectedSub(null);
      setRejectReason('');
      await loadSubmissions();
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSub) return;
    try {
      await deleteSubmission(selectedSub.id);
      setModalType(null);
      setSelectedSub(null);
      await loadSubmissions();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Registration Applications
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Verify new worker applications before adding them to the private directory
          </p>
        </div>

        <button
          onClick={loadSubmissions}
          disabled={loading}
          className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-colors shadow-sm"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setCurrentTab('pending')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                currentTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Review ({pendingCount})</span>
            </button>

            <button
              onClick={() => setCurrentTab('rejected')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                currentTab === 'rejected'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Rejected ({rejectedCount})</span>
            </button>

            <button
              onClick={() => setCurrentTab('all')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition-colors ${
                currentTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({submissions.length})
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="all">All Professions</option>
              {WORKER_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by worker name, phone number, city, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading applications...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Applications Found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'all'
              ? 'No submissions match your query. Try clearing the search or category filter.'
              : currentTab === 'pending'
              ? 'Great news! There are no pending worker submissions requiring review.'
              : 'No submissions in this status view.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubmissions.map((sub) => (
            <WorkerCard
              key={sub.id || sub.regId}
              worker={sub}
              isPendingView={true}
              onApprove={(item) => {
                setSelectedSub(item);
                setModalType('approve');
              }}
              onReject={(item) => {
                setSelectedSub(item);
                setModalType('reject');
              }}
              onDelete={(item) => {
                setSelectedSub(item);
                setModalType('delete');
              }}
            />
          ))}
        </div>
      )}

      {/* Confirm Approve Modal */}
      <ConfirmModal
        isOpen={modalType === 'approve'}
        title="Approve Worker Profile?"
        message={`Are you sure you want to approve "${selectedSub?.fullName}" (${selectedSub?.categoryLabel || selectedSub?.category})? This will immediately add them to the verified worker directory.`}
        confirmText="Approve Worker"
        type="success"
        onConfirm={handleApproveConfirm}
        onCancel={() => {
          setModalType(null);
          setSelectedSub(null);
        }}
      />

      {/* Confirm Reject Modal */}
      <ConfirmModal
        isOpen={modalType === 'reject'}
        title="Reject Application?"
        message={`Rejecting "${selectedSub?.fullName}". Their submission will be moved to the Rejected tab.`}
        confirmText="Reject Application"
        type="danger"
        showInput={true}
        inputPlaceholder="Reason for rejection (e.g. Phone invalid, duplicate application, not a skilled tradesman)..."
        inputValue={rejectReason}
        onInputChange={setRejectReason}
        onConfirm={handleRejectConfirm}
        onCancel={() => {
          setModalType(null);
          setSelectedSub(null);
          setRejectReason('');
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={modalType === 'delete'}
        title="Delete Submission Record?"
        message={`Permanently remove this registration record for "${selectedSub?.fullName}"?`}
        confirmText="Delete"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setModalType(null);
          setSelectedSub(null);
        }}
      />

    </div>
  );
}
