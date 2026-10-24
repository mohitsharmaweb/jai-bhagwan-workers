import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatPhone, formatDate } from '../utils/formatters';
import { 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ChevronRight, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Archive, 
  CheckCircle,
  Copy,
  ShieldCheck
} from 'lucide-react';

export default function WorkerCard({
  worker,
  onApprove,
  onReject,
  onDelete,
  onToggleActive,
  onEdit,
  isPendingView = false
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPhone = (e) => {
    e.stopPropagation();
    if (worker.phone) {
      navigator.clipboard.writeText(worker.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
      worker.active === false ? 'border-slate-200 bg-slate-50/50 opacity-80' : 'border-slate-200/80 hover:border-brand-300'
    }`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
              {worker.fullName ? worker.fullName.charAt(0).toUpperCase() : 'W'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {worker.fullName}
                </h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  {worker.regId || worker.id}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                  <Briefcase className="w-3 h-3" />
                  {worker.categoryLabel || worker.category}
                </span>
                {worker.experience && (
                  <span className="text-slate-500">
                    • {worker.experience} yrs exp
                  </span>
                )}
                {(worker.aadhaarFront || worker.aadhaarNumber) && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Aadhaar</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <StatusBadge status={worker.status} active={worker.active} />
        </div>

        {/* Location and Phone */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{worker.area}, {worker.city}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a
                href={`tel:${worker.phone}`}
                className="font-mono font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {formatPhone(worker.phone)}
              </a>
            </div>
            <button
              onClick={handleCopyPhone}
              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
              title="Copy Phone Number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Short description */}
        {worker.description && (
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {worker.description}
          </p>
        )}

        {/* Sub-details: date */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Applied: {formatDate(worker.createdAt)}</span>
          </div>
          {worker.approvedAt && (
            <span>Approved: {formatDate(worker.approvedAt)}</span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2 flex-wrap">
        <Link
          to={`/admin/worker/${worker.id || worker.regId}`}
          className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 py-1"
        >
          <span>View Full Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-1.5">
          {/* If Pending: Approve & Reject buttons */}
          {isPendingView && worker.status === 'pending' && (
            <>
              {onReject && (
                <button
                  type="button"
                  onClick={() => onReject(worker)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition-colors"
                  title="Reject Submission"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              )}
              {onApprove && (
                <button
                  type="button"
                  onClick={() => onApprove(worker)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                  title="Approve Worker"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              )}
            </>
          )}

          {/* If Approved view: Edit, Toggle Active/Archive, Delete */}
          {!isPendingView && (
            <>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(worker)}
                  className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  title="Edit Worker Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}

              {onToggleActive && (
                <button
                  type="button"
                  onClick={() => onToggleActive(worker)}
                  className={`p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200 ${
                    worker.active === false
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-amber-600 hover:bg-amber-50'
                  }`}
                  title={worker.active === false ? 'Activate Worker' : 'Archive / Deactivate Worker'}
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(worker)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
