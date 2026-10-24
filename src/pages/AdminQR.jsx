import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Printer, 
  ExternalLink, 
  Sparkles,
  Building2,
  Users
} from 'lucide-react';

export default function AdminQR() {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  // Derive registration public URL
  const registerUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/register` 
    : 'https://jaibhagwan-workers.vercel.app/register';

  // Copy registration link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(registerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Download high-resolution PNG of the QR Code
  const handleDownloadPNG = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Scale up for high-print quality
    canvas.width = 1200;
    canvas.height = 1200;

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 100, 100, 1000, 1000);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'Jai_Bhagwan_Worker_Registration_QR.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Print poster
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            रजिस्ट्रेशन QR कोड व लिंक
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            कारीगरों को जोड़ने के लिए QR कोड डाउनलोड करें या लिंक WhatsApp पर शेयर करें
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>पोस्टर प्रिंट करें (Print)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left: Printable QR Poster Card */}
        <div 
          ref={qrRef}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center space-y-5 print:border-none print:shadow-none"
        >
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>जय भगवान • जयपुर (Jaipur)</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-2">
              कारीगर पंजीकरण (QR Code)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              स्कैन करें और तुरंत अपना रजिस्ट्रेशन फॉर्म भरें
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-6 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 inline-block mx-auto shadow-inner">
            <QRCodeSVG
              value={registerUrl}
              size={240}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "https://api.iconify.design/lucide:hard-hat.svg?color=%23d97706",
                x: undefined,
                y: undefined,
                height: 38,
                width: 38,
                excavate: true,
              }}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              मिस्त्री • इलेक्ट्रीशियन • प्लंबर • पेंटर • बढ़ई
            </p>
            <p className="text-xs text-amber-700 font-semibold">
              अपने मोबाइल के कैमरे या स्कैनर से ऊपर दिए गए कोड को स्कैन करें
            </p>
          </div>

          {/* Download PNG Button */}
          <button
            onClick={handleDownloadPNG}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 print:hidden"
          >
            <Download className="w-4 h-4" />
            <span>हाई-क्वालिटी QR कोड इमेज डाउनलोड करें (PNG)</span>
          </button>
        </div>

        {/* Right: Shareable Link & Quick Instructions */}
        <div className="space-y-6">
          
          {/* Direct Link Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-600" />
              <span>डायरेक्ट रजिस्ट्रेशन लिंक (Direct Web Link)</span>
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              आप इस लिंक को सीधे कारीगरों के WhatsApp ग्रुप में कॉपी करके भेज सकते हैं:
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-slate-800 truncate select-all">
                {registerUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 ${
                  copied 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>कॉपी हुआ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>कॉपी लिंक</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>नए टैब में फॉर्म खोलकर देखें</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Sharing Tips */}
          <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200/70 space-y-3">
            <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>सुझाव: कारीगरों तक कैसे पहुंचाएं?</span>
            </h3>

            <ul className="text-xs text-slate-700 space-y-2.5 font-medium">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <span>QR कोड का प्रिंट निकालकर अपनी दुकान, कार्यालय या साइट नोटिस बोर्ड पर लगाएं।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <span>WhatsApp ग्रुप में ऊपर दिया गया लिंक साझा करें और साथियों से फॉर्म भरने को कहें।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                <span>फॉर्म में लॉगिन की आवश्यकता नहीं है, कोई भी 1 मिनट में मोबाइल से जानकारी भर सकता है।</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
