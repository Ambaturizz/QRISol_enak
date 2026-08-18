import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import jsQR from 'jsqr';
import { validateToken, type ValidationResult } from '../lib/crypto';

export default function CustomerScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  const stopScanner = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    isProcessingRef.current = false;
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && !isProcessingRef.current) {
      isProcessingRef.current = true;
      stopScanner();

      const result: ValidationResult = validateToken(code.data);
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
      return;
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [navigate, stopScanner]);

  const startScanner = useCallback(async () => {
    setError(null);
    setPermissionDenied(false);
    isProcessingRef.current = false;

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current!;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true'); // required on iOS Safari
      await video.play();

      setScanning(true);
      animFrameRef.current = requestAnimationFrame(tick);
    } catch (err: unknown) {
      const e = err as DOMException;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
      } else if (e.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError(`Camera error: ${e.message || e.name}`);
      }
    }
  }, [tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  return (
    <div className="min-h-screen flex flex-col bg-black">

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

      {/* Camera Area — fills available space */}
      <div className="relative flex-1" style={{ minHeight: 0 }}>

        {/* Live camera feed — always mounted, hidden when not scanning */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          style={{ display: scanning ? 'block' : 'none' }}
        />

        {/* Hidden canvas used for QR analysis — never visible */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Background shown when camera is off */}
        {!scanning && (
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)' }} />
        )}

        {/* Viewfinder overlay — sits on top of video */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 pointer-events-none">

          {/* Scanner Frame */}
          <div className="relative w-64 h-64" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}>

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

            {/* Placeholder icon when not scanning */}
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

          {/* Errors — pointer-events-auto so they're tappable if needed */}
          <div className="pointer-events-auto flex flex-col gap-2 px-4 w-full items-center">
            {permissionDenied && (
              <div className="rounded-xl p-3 text-center text-sm w-full max-w-xs"
                style={{ background: 'rgba(186,26,26,0.85)', color: '#fff' }}>
                ⛔ Camera permission denied. Please allow camera access in your browser settings.
              </div>
            )}
            {error && (
              <div className="rounded-xl p-3 text-center text-sm w-full max-w-xs"
                style={{ background: 'rgba(134,84,0,0.85)', color: '#fff' }}>
                ⚠️ {error}
              </div>
            )}
          </div>
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
