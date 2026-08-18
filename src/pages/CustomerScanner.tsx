import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { validateToken, type ValidationResult } from '../lib/crypto';

export default function CustomerScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const startScanner = async () => {
    setError(null);
    setPermissionDenied(false);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      const config = { fps: 10, qrbox: { width: 240, height: 240 } };
      const onSuccess = (decodedText: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        const result: ValidationResult = validateToken(decodedText);
        scanner.stop().catch(() => {});

        const params = new URLSearchParams();
        params.set('valid', result.valid ? '1' : '0');
        params.set('reason', result.reason);
        if (result.payload) {
          params.set('merchantName', result.payload.merchantName);
          params.set('merchantId', result.payload.merchantId);
          params.set('pjsp', result.payload.pjsp);
          params.set('expiry', String(result.payload.expiry));
          params.set('scannedAt', String(result.scannedAt ?? Date.now()));
        }

        navigate(`/result?${params.toString()}`);
      };
      const onError = () => { /* ignore per-frame errors */ };

      try {
        // Try exact environment first
        await scanner.start({ facingMode: { exact: 'environment' } }, config, onSuccess, onError);
      } catch (e1) {
        try {
          // Fallback to environment
          await scanner.start({ facingMode: 'environment' }, config, onSuccess, onError);
        } catch (e2) {
          // Fallback to explicit camera list
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            // Try to find a camera with "back" or "environment" in label
            let backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            if (!backCamera) backCamera = devices[devices.length - 1]; // usually last is back
            
            await scanner.start(backCamera.id, config, onSuccess, onError);
          } else {
            throw new Error('No cameras found.');
          }
        }
      }

      setScanning(true);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? String(err);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('notallowed')) {
        setPermissionDenied(true);
      } else {
        setError(`Cannot access camera. ${msg}`);
      }
    }
  };


  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setScanning(false);
    isProcessingRef.current = false;
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000000' }}>

      {/* Top Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-4 py-3">
        <Link to="/" onClick={stopScanner}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <span className="text-yellow-300 text-sm">⚡</span>
          <span className="text-white text-xs font-semibold uppercase tracking-wider">Flash</span>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <span className="text-white text-sm">?</span>
        </div>
      </header>

      {/* Camera / Scanner Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        {/* Hidden scanner div */}
        <div id="qr-reader" className="absolute inset-0 z-0 w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />

        {/* Camera background overlay */}
        {!scanning && (
          <div className="absolute inset-0 z-0"
            style={{ background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)' }} />
        )}

        {/* Viewfinder overlay */}
        <div className="relative z-10 flex flex-col items-center gap-6">

          {/* Scanner Frame */}
          <div className="relative w-64 h-64" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)' }}>

            {/* Corner Brackets */}
            {[
              'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
              'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
              'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
              'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-8 h-8 animate-bracket ${cls}`}
                style={{ borderColor: '#003ab5' }} />
            ))}

            {/* Scanning Line */}
            {scanning && (
              <div
                className="absolute left-0 right-0 h-0.5 animate-scan z-20"
                style={{ background: '#003ab5', boxShadow: '0 0 8px 2px rgba(0,58,181,0.6)' }}
              />
            )}

            {/* Center content when not scanning */}
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,58,181,0.2)', border: '2px solid rgba(0,58,181,0.5)' }}>
                  <span className="text-3xl">📷</span>
                </div>
              </div>
            )}
          </div>

          {/* Instruction Text */}
          <p className="text-white text-base font-medium text-center drop-shadow-lg px-8">
            {scanning ? 'Point at the merchant\'s QR Code' : 'Press the button below to start scanning'}
          </p>

          {permissionDenied && (
            <div className="mx-4 rounded-xl p-3 text-center text-sm"
              style={{ background: 'rgba(186,26,26,0.85)', color: '#fff' }}>
              ⛔ Camera permission denied. Please allow camera access in your browser settings.
            </div>
          )}

          {error && (
            <div className="mx-4 rounded-xl p-3 text-center text-sm"
              style={{ background: 'rgba(134,84,0,0.85)', color: '#fff' }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-20 px-4 pb-8 pt-4">
        <div className="rounded-2xl border p-4 flex flex-col gap-3"
          style={{ background: '#ffffff', borderColor: '#c3c5d8' }}>

          {/* Wallet Info */}
          <div className="flex items-center justify-between border-b pb-3"
            style={{ borderColor: '#e2e7ff' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: '#eaedff' }}>
                <span className="text-lg">👛</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#737687' }}>
                  MerchantPay Wallet
                </p>
                <p className="text-lg font-bold" style={{ color: '#131b2e' }}>Rp1.240.500</p>
              </div>
            </div>
            <button className="text-xs font-bold uppercase px-3 py-1 rounded-full"
              style={{ background: '#eaedff', color: '#003ab5' }}>
              Top Up
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {scanning ? (
              <button onClick={stopScanner}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border active:scale-95 transition-all"
                style={{ background: '#ffdad6', borderColor: '#ba1a1a', color: '#ba1a1a' }}>
                ⏹ Stop Scan
              </button>
            ) : (
              <button onClick={startScanner}
                className="flex-1 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-all"
                style={{ background: '#003ab5', color: '#ffffff' }}>
                📷 Start Scan QRIS
              </button>
            )}
            <button
              className="flex-1 py-3 rounded-xl text-sm font-semibold border active:scale-95 transition-all"
              style={{ borderColor: '#c3c5d8', color: '#434656', background: '#ffffff' }}>
              ⌨️ Manual Input
            </button>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 justify-center">
            <span className="text-xs" style={{ color: '#737687' }}>
              🔐 QR Tokens are cryptographically validated by PJSP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
