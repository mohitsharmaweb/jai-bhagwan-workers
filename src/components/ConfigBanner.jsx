import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle, ExternalLink, HelpCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ConfigBanner() {
  const { isConfigured } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (!isConfigured) {
    return (
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white px-4 py-2.5 text-xs sm:text-sm font-medium shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-100" />
            <span>
              <strong>Setup Needed:</strong> Real Firebase credentials not configured in <code className="bg-amber-700/60 px-1.5 py-0.5 rounded text-[11px] font-mono">.env</code>. Running with local preview database.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/setup"
              className="inline-flex items-center gap-1 bg-white text-amber-800 px-2.5 py-1 rounded font-semibold text-xs hover:bg-amber-50 transition-colors shadow-sm"
            >
              <span>View Setup Instructions</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-amber-700/50 rounded transition-colors text-amber-100 hover:text-white"
              title="Dismiss for this session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
