import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  fetchWorkerById, 
  approveWorker, 
  rejectWorker, 
  updateWorker, 
  deleteWorker, 
  toggleWorkerActiveStatus 
} from '../firebase/firebase';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { formatPhone, formatDate } from '../utils/formatters';
import { WORKER_CATEGORIES } from '../utils/categories';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Archive, 
  Edit3, 
  ShieldCheck, 
  Copy, 
  Check,
  User,
  X,
  CreditCard,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText
} from 'lucide-react';

export default function AdminWorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedAadhaar, setCopiedAadhaar] = useState(false);

  // Modals
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'delete' | 'archive' | 'edit'
  const [rejectReason, setRejectReason] = useState('');
  const [editFormData, setEditFormData] = useState({});

  // Lightbox modal for Aadhaar photos
  const [lightboxImage, setLightboxImage] = useState(null); // { title: string, src: string }
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchWorkerById(id);
      if (!data) {
        setError('Worker record not found.');
      } else {
        setWorker(data);
      }
    } catch (err) {
      setError(err.message || 'Error loading profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCopyPhone = () => {
    if (worker?.phone) {
      navigator.clipboard.writeText(worker.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAadhaar = () => {
    if (worker?.aadhaarNumber) {
      navigator.clipboard.writeText(worker.aadhaarNumber.replace(/\s/g, ''));
      setCopiedAadhaar(true);
      setTimeout(() => setCopiedAadhaar(false), 2000);
    }
  };

  const handleDownloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApprove = async () => {
    try {
      await approveWorker(worker);
      setModalType(null);
      await loadData();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  const handleReject = async () => {
    try {
      await rejectWorker(worker.id || id, rejectReason);
      setModalType(null);
      await loadData();
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWorker(worker.id || id);
      navigate('/admin/workers');
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleToggleArchive = async () => {
    try {
      await toggleWorkerActiveStatus(worker.id || id, worker.active);
      setModalType(null);
      await loadData();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      fullName: worker.fullName || '',
      phone: worker.phone || '',
      category: worker.category || '',
      city: worker.city || '',
      area: worker.area || '',
      experience: worker.experience || '',
      preferredAreas: worker.preferredAreas || '',
      additionalServices: worker.additionalServices || '',
      description: worker.description || '',
      aadhaarNumber: worker.aadhaarNumber || ''
    });
    setModalType('edit');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const selectedCat = WORKER_CATEGORIES.find(c => c.id === editFormData.category);
      await updateWorker(worker.id || id, {
        ...editFormData,
        categoryLabel: selectedCat ? selectedCat.label : editFormData.category
      });
      setModalType(null);
      await loadData();
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const openLightbox = (title, src) => {
    setZoomLevel(1);
    setRotation(0);
    setLightboxImage({ title, src });
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold">Loading worker profile...</p>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="mt-1 text-sm text-slate-500">{error || 'This worker record does not exist or has been deleted.'}</p>
        <Link
          to="/admin/workers"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
          ID: {worker.regId || worker.id}
        </span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-brand-500/20 flex-shrink-0">
              {worker.fullName ? worker.fullName.charAt(0).toUpperCase() : 'W'}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {worker.fullName}
                </h1>
                <StatusBadge status={worker.status} active={worker.active} />
              </div>

              <div className="mt-2 flex items-center gap-2 flex-wrap text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                  <Briefcase className="w-3.5 h-3.5" />
                  {worker.categoryLabel || worker.category}
                </span>
                {worker.experience && (
                  <span className="text-slate-600 font-medium">
                    • {worker.experience} Years Experience
                  </span>
                )}
                {(worker.aadhaarFront || worker.aadhaarNumber) && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aadhaar Attached</span>
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{worker.area}, {worker.city}</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`tel:${worker.phone}`}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Worker</span>
            </a>

            <a
              href={`https://wa.me/91${worker.phone}?text=Hello%20${encodeURIComponent(worker.fullName)},%20we%20have%20a%20work%20requirement%20from%20ApnaWorker.`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {worker.status === 'pending' ? (
              <>
                <button
                  onClick={() => setModalType('approve')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve Profile</span>
                </button>

                <button
                  onClick={() => setModalType('reject')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setModalType('archive')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span>{worker.active === false ? 'Re-activate Profile' : 'Deactivate / Archive'}</span>
              </button>
            )}

            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
          </div>

          <button
            onClick={() => setModalType('delete')}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Record</span>
          </button>
        </div>
      </div>

      {/* SECTION: Aadhaar Card Verification Viewer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Aadhaar Card Document & Verification (आधार कार्ड विवरण)
              </h2>
              <p className="text-xs text-slate-500">
                Worker identity verification documents uploaded during registration
              </p>
            </div>
          </div>

          {worker.aadhaarNumber ? (
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl border border-slate-200 tracking-wider">
                {worker.aadhaarNumber}
              </span>
              <button
                onClick={handleCopyAadhaar}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                title="Copy Aadhaar Number"
              >
                {copiedAadhaar ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-400 italic">
              No Aadhaar number entered
            </span>
          )}
        </div>

        {/* Aadhaar Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Front Photo Card */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  <span>Aadhaar Front Photo (अगला भाग)</span>
                </span>
                {worker.aadhaarFront && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Attached
                  </span>
                )}
              </div>

              {worker.aadhaarFront ? (
                <div 
                  onClick={() => openLightbox(`${worker.fullName} - Aadhaar Front`, worker.aadhaarFront)}
                  className="group relative cursor-pointer rounded-xl overflow-hidden border border-slate-200 bg-white aspect-[16/10] flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={worker.aadhaarFront}
                    alt="Aadhaar Front"
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                    <ZoomIn className="w-5 h-5" />
                    <span>Click to Zoom</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white aspect-[16/10] flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <CreditCard className="w-8 h-8 stroke-[1.5] mb-2 text-slate-300" />
                  <span className="text-xs font-medium">Front photo not uploaded</span>
                </div>
              )}
            </div>

            {worker.aadhaarFront && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openLightbox(`${worker.fullName} - Aadhaar Front`, worker.aadhaarFront)}
                  className="text-xs text-brand-600 font-bold flex items-center gap-1 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Screen</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadImage(worker.aadhaarFront, `${worker.regId || 'worker'}_aadhaar_front.jpg`)}
                  className="text-xs text-slate-600 font-semibold flex items-center gap-1 hover:text-slate-900"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Back Photo Card */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  <span>Aadhaar Back Photo (पिछला भाग - पता)</span>
                </span>
                {worker.aadhaarBack && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Attached
                  </span>
                )}
              </div>

              {worker.aadhaarBack ? (
                <div 
                  onClick={() => openLightbox(`${worker.fullName} - Aadhaar Back`, worker.aadhaarBack)}
                  className="group relative cursor-pointer rounded-xl overflow-hidden border border-slate-200 bg-white aspect-[16/10] flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={worker.aadhaarBack}
                    alt="Aadhaar Back"
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                    <ZoomIn className="w-5 h-5" />
                    <span>Click to Zoom</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white aspect-[16/10] flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <CreditCard className="w-8 h-8 stroke-[1.5] mb-2 text-slate-300" />
                  <span className="text-xs font-medium">Back photo not uploaded</span>
                </div>
              )}
            </div>

            {worker.aadhaarBack && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openLightbox(`${worker.fullName} - Aadhaar Back`, worker.aadhaarBack)}
                  className="text-xs text-brand-600 font-bold flex items-center gap-1 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Screen</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadImage(worker.aadhaarBack, `${worker.regId || 'worker'}_aadhaar_back.jpg`)}
                  className="text-xs text-slate-600 font-semibold flex items-center gap-1 hover:text-slate-900"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contact & Location Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            <span>Contact & Coverage</span>
          </h3>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Mobile Phone</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-slate-900 text-base">{formatPhone(worker.phone)}</span>
                <button
                  onClick={handleCopyPhone}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  title="Copy Phone"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">City</span>
              <span className="font-medium text-slate-800">{worker.city}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Locality / Sector</span>
              <span className="font-medium text-slate-800">{worker.area}</span>
            </div>

            {worker.preferredAreas && (
              <div>
                <span className="text-xs text-slate-400 block">Preferred Service Territories</span>
                <span className="font-medium text-slate-800">{worker.preferredAreas}</span>
              </div>
            )}
          </div>
        </div>

        {/* Trade & Expertise */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-600" />
            <span>Skills & Verification</span>
          </h3>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Primary Trade</span>
              <span className="font-semibold text-slate-900">{worker.categoryLabel || worker.category}</span>
            </div>

            {worker.additionalServices && (
              <div>
                <span className="text-xs text-slate-400 block">Additional Skills & Services</span>
                <span className="font-medium text-slate-800">{worker.additionalServices}</span>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-400 block">Experience</span>
              <span className="font-medium text-slate-800">{worker.experience ? `${worker.experience} Years` : 'Not specified'}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Application Timestamp</span>
              <span className="font-medium text-slate-700">{formatDate(worker.createdAt)}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Worker Declaration & Consent Confirmed</span>
            </div>
          </div>
        </div>

      </div>

      {/* Description / Bio */}
      {worker.description && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Work Description & Bio
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {worker.description}
          </p>
        </div>
      )}

      {/* Rejection Note if applicable */}
      {worker.rejectReason && (
        <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
            Rejection Reason / Internal Note
          </h3>
          <p className="text-sm text-rose-800">{worker.rejectReason}</p>
        </div>
      )}

      {/* Lightbox Modal with Zoom & Rotation */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4">
          {/* Lightbox Header */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white py-2">
            <h3 className="font-bold text-sm truncate">{lightboxImage.title}</h3>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownloadImage(lightboxImage.src, `${worker.regId || 'worker'}_doc.jpg`)}
                className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => setLightboxImage(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Lightbox Image Container */}
          <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4">
            <img
              src={lightboxImage.src}
              alt="Enlarged document"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Lightbox Footer Tip */}
          <div className="text-white/60 text-xs py-2 text-center">
            Click outside or press X to close • Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {modalType === 'edit' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Worker Profile</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Aadhaar Card Number</label>
                <input
                  type="text"
                  value={editFormData.aadhaarNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, aadhaarNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                  placeholder="XXXX XXXX XXXX"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trade Category</label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  {WORKER_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={editFormData.area}
                    onChange={(e) => setEditFormData({ ...editFormData, area: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Experience (Years)</label>
                <input
                  type="number"
                  value={editFormData.experience}
                  onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional Services</label>
                <input
                  type="text"
                  value={editFormData.additionalServices}
                  onChange={(e) => setEditFormData({ ...editFormData, additionalServices: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={modalType === 'approve'}
        title="Approve Worker?"
        message={`Approve ${worker.fullName} and publish to the verified directory?`}
        confirmText="Approve"
        type="success"
        onConfirm={handleApprove}
        onCancel={() => setModalType(null)}
      />

      <ConfirmModal
        isOpen={modalType === 'reject'}
        title="Reject Worker Application?"
        message={`Provide an optional reason for declining this application.`}
        confirmText="Reject Application"
        type="danger"
        showInput={true}
        inputPlaceholder="Reason for rejection..."
        inputValue={rejectReason}
        onInputChange={setRejectReason}
        onConfirm={handleReject}
        onCancel={() => setModalType(null)}
      />

      <ConfirmModal
        isOpen={modalType === 'delete'}
        title="Permanently Delete Record?"
        message={`This action will permanently delete ${worker.fullName}'s profile.`}
        confirmText="Delete Permanently"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setModalType(null)}
      />

      <ConfirmModal
        isOpen={modalType === 'archive'}
        title={worker.active === false ? 'Activate Profile?' : 'Archive Profile?'}
        message={
          worker.active === false
            ? `Re-activate ${worker.fullName} in the directory?`
            : `Deactivate ${worker.fullName}? They will be marked as inactive.`
        }
        confirmText={worker.active === false ? 'Activate' : 'Deactivate'}
        type="info"
        onConfirm={handleToggleArchive}
        onCancel={() => setModalType(null)}
      />

    </div>
  );
}
