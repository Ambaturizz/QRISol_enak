import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  generateToken,
  encodeToken,
  TOKEN_TTL_MS,
  type QRTokenPayload,
} from '../lib/crypto';
import { DEMO_MERCHANT } from '../lib/merchant';

const TICK_MS = 100;

export default function MerchantDashboard() {
  const [token, setToken]       = useState<QRTokenPayload | null>(null);
  const [encoded, setEncoded]   = useState<string>('');
  const [remaining, setRemaining] = useState<number>(TOKEN_TTL_MS);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const regenerate = () => {
    const t = generateToken(
      DEMO_MERCHANT.id, DEMO_MERCHANT.name,
      DEMO_MERCHANT.category, DEMO_MERCHANT.pjsp
    );
    setToken(t);
    setEncoded(encodeToken(t));
    setRemaining(TOKEN_TTL_MS);
    setRefreshCount(c => c + 1);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    regenerate();
    intervalRef.current = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= TICK_MS) {
          regenerate();
          return TOKEN_TTL_MS;
        }
        return prev - TICK_MS;
      });
    }, TICK_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const seconds   = Math.ceil(remaining / 1000);
  const progress  = remaining / TOKEN_TTL_MS;          // 1 → 0
  const r         = 44;
  const circ      = 2 * Math.PI * r;
  const dashOffset = circ * (1 - progress);
  const timerColor = seconds > 15 ? '#006c49' : seconds > 7 ? '#f59e0b' : '#ba1a1a';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b1c30' }}>

      {/* ── MINIMAL TOP BAR ── */}
      <header className="flex items-center justify-between px-5 py-3" style={{ background: '#002068' }}>
        <Link to="/" className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="text-xs text-white font-medium">Home</span>
        </Link>

        <span className="text-sm font-bold text-white">MerchantPay</span>

        <button
          onClick={() => setShowDetail(d => !d)}
          className="text-xs px-2.5 py-1 rounded-full border transition-all"
          style={{
            borderColor: showDetail ? '#6cf8bb' : 'rgba(255,255,255,0.3)',
            color: showDetail ? '#6cf8bb' : 'rgba(255,255,255,0.6)',
            background: showDetail ? 'rgba(108,248,187,0.1)' : 'transparent',
          }}>
          {showDetail ? 'Hide' : 'Technical Details'}
        </button>
      </header>

      {/* ── MAIN: FULL-SCREEN QR ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8 gap-6 max-w-sm mx-auto w-full">

        {/* Merchant badge */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6cf8bb' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6cf8bb' }}>Ready to Receive Payment</span>
          </div>
          <p className="font-bold text-lg text-white">{DEMO_MERCHANT.name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#747684' }}>{DEMO_MERCHANT.category} · NMID: {DEMO_MERCHANT.nmid}</p>
        </div>

        {/* ── QR CODE — full prominence ── */}
        <div
          className="relative flex items-center justify-center rounded-2xl p-5 shadow-2xl"
          style={{
            background: '#ffffff',
            boxShadow: isRefreshing
              ? '0 0 0 4px #6cf8bb, 0 20px 60px rgba(0,32,104,0.5)'
              : '0 20px 60px rgba(0,32,104,0.5)',
            transition: 'box-shadow 0.3s ease',
          }}>
          {/* Corner brackets */}
          {[
            'top-3 left-3 border-t-[3px] border-l-[3px] rounded-tl-lg',
            'top-3 right-3 border-t-[3px] border-r-[3px] rounded-tr-lg',
            'bottom-3 left-3 border-b-[3px] border-l-[3px] rounded-bl-lg',
            'bottom-3 right-3 border-b-[3px] border-r-[3px] rounded-br-lg',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-6 h-6 animate-bracket ${cls}`}
              style={{ borderColor: '#003399' }} />
          ))}

          {encoded ? (
            <QRCodeSVG
              value={encoded}
              size={240}
              level="H"
              marginSize={1}
              style={{
                display: 'block',
                opacity: isRefreshing ? 0.4 : 1,
                transition: 'opacity 0.3s ease',
              }}
            />
          ) : (
            <div className="w-60 h-60 flex items-center justify-center" style={{ color: '#c4c5d5' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="animate-spin">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="30" />
              </svg>
            </div>
          )}

          {/* Refresh flash overlay */}
          {isRefreshing && (
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(108,248,187,0.15)' }}>
              <span className="text-2xl font-bold" style={{ color: '#006c49' }}>↻</span>
            </div>
          )}
        </div>

        {/* ── COUNTDOWN RING + LABEL ── */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle cx="50" cy="50" r={r} fill="none"
                stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
              {/* Progress */}
              <circle cx="50" cy="50" r={r} fill="none"
                stroke={timerColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.4s ease' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
              style={{ color: timerColor }}>
              {seconds}
            </span>
          </div>
          <p className="text-xs text-center" style={{ color: '#747684' }}>
            QR updates automatically in <strong style={{ color: 'white' }}>{seconds} seconds</strong>
          </p>
          <button
            onClick={regenerate}
            className="mt-1 text-xs px-4 py-2 rounded-full border font-semibold transition-all active:scale-95 hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
            ↻ Refresh now
          </button>
        </div>

        {/* ── DETAIL PANEL (toggle) — for judges ── */}
        {showDetail && token && (
          <div className="w-full rounded-2xl p-5 border animate-scale-in"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#6cf8bb' }}>
              🔐 Active Cryptographic Token
            </p>

            {/* JSON preview */}
            <div className="rounded-xl p-3 mb-4 font-mono text-xs leading-relaxed overflow-x-auto"
              style={{ background: '#0b1c30', color: '#b5c4ff' }}>
              <pre>{JSON.stringify({
                merchantId: token.merchantId,
                pjsp: token.pjsp,
                timestamp: token.timestamp,
                expiry: token.expiry,
                nonce: token.nonce,
                signature: token.signature.substring(0, 20) + '…',
              }, null, 2)}</pre>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { label: 'Issued', value: new Date(token.timestamp).toLocaleTimeString('id-ID') },
                { label: 'Expires', value: new Date(token.expiry).toLocaleTimeString('id-ID') },
                { label: 'Nonce', value: token.nonce, mono: true },
                { label: 'Hash SHA-256', value: token.signature.substring(0, 32) + '…', mono: true },
                { label: 'Total Refresh', value: `${refreshCount}×` },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between items-start gap-3 py-1 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-xs flex-shrink-0" style={{ color: '#747684' }}>{label}</span>
                  <span className={`text-xs text-right break-all font-medium ${mono ? 'font-mono' : ''}`}
                    style={{ color: '#ffffff' }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
              style={{ background: 'rgba(108,248,187,0.08)', color: '#6cf8bb', border: '1px solid rgba(108,248,187,0.2)' }}>
              This token contains SHA-256 signature of <code className="font-mono">merchantId|timestamp|nonce|SECRET_KEY</code>.
              Fake static QR will have expired token — transaction automatically rejected.
            </div>
          </div>
        )}
      </main>

      {/* ── BOTTOM INFO ── */}
      <div className="pb-8 text-center px-5">
        <p className="text-xs" style={{ color: '#444653' }}>
          Powered by Dynamic Secure QRIS · PJSP: {DEMO_MERCHANT.pjsp}
        </p>
      </div>
    </div>
  );
}
