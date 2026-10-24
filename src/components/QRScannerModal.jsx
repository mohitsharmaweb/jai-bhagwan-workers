import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, Link as LinkIcon, RefreshCw, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [manualUrl, setManualUrl] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let html5QrCode = null;

    if (isOpen) {
      setCameraError(null);
      setIsScanning(true);

      const startScanner = async () => {
        try {
          html5QrCode = new Html5Qrcode('qr-reader-container');
          scannerRef.current = html5QrCode;

          const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0 
          };

          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              handleScanSuccess(decodedText);
            },
            () => {
              // Ignore standard frame scan errors
            }
          );
        } catch (err) {
          console.warn('Camera scan initialization error:', err);
          setCameraError(
            'Camera access unavailable or permission denied. You can upload an image with a QR code or paste the URL below.'
          );
          setIsScanning(false);
        }
      };

      // Slight delay to ensure DOM element is mounted
      const timer = setTimeout(() => {
        startScanner();
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.stop().catch(() => {}).then(() => {
            scannerRef.current?.clear();
          });
        }
      };
    }
  }, [isOpen]);

  const handleScanSuccess = (url) => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
    }

    // Process scanned URL
    processScannedValue(url);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader-container');
      }
      const result = await scannerRef.current.scanFile(file, true);
      processScannedValue(result);
    } catch (err) {
      setCameraError('Could not detect a QR code in the uploaded image.');
    }
  };

  const processScannedValue = (url) => {
    onClose();
    if (url.includes('/register')) {
      // If full or relative URL pointing to register
      try {
        const parsed = new URL(url, window.location.origin);
        navigate(parsed.pathname + parsed.search);
      } catch (e) {
        navigate('/register');
      }
    } else {
      alert(`Scanned Content: ${url}`);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    processScannedValue(manualUrl.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Scan ApnaWorker QR</h3>
              <p className="text-xs text-slate-500">Scan with your mobile camera or upload QR image</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Scanner view */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 aspect-square max-h-[280px] mx-auto flex items-center justify-center">
            <div id="qr-reader-container" className="w-full h-full"></div>
            {cameraError && (
              <div className="absolute inset-0 p-4 bg-slate-900/90 text-white flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                <p className="text-sm font-medium">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload QR Image
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 py-1"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image Instead
            </button>
            <span className="text-xs text-slate-400">Point at registration QR</span>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">Or enter URL manually</span>
            </div>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Paste /register URL here..."
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!manualUrl.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
            >
              Open
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
