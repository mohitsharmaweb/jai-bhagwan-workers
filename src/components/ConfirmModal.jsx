import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'success' | 'info'
  onConfirm,
  onCancel,
  showInput = false,
  inputPlaceholder = '',
  inputValue = '',
  onInputChange = () => {}
}) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
          iconBg: 'bg-emerald-100',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500'
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6 text-brand-600" />,
          iconBg: 'bg-brand-100',
          btnBg: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500'
        };
      case 'danger':
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-100',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl flex-shrink-0 ${colors.iconBg}`}>
            {colors.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>

            {showInput && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason / Internal Note
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder={inputPlaceholder}
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                />
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`w-full sm:w-auto px-5 py-2 text-sm font-semibold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-offset-2 ${colors.btnBg}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
