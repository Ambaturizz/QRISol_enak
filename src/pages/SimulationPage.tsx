import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_MERCHANT } from '../lib/merchant';

/* ─── types ─── */
interface Token { id: string; sig: string; iat: string; exp: string; raw: string; }
interface LogEntry { tag: string; msg: string; cls: string; }
interface HistoryEntry { success: boolean; amount: string; ref: string; ts: string; }

/* ─── helpers ─── */
const C = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const rand = (n: number) => Array.from({ length: n }, () => C[Math.floor(Math.random() * C.length)]).join('');
const sigHex = () => [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
const fmtTime = (d: Date) => d.toTimeString().slice(0, 8);
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function makeToken(): Token {
  const now = new Date(), exp = new Date(now.getTime() + 30_000);
  return { id: `TKN-${rand(3)}-${rand(4)}`, sig: `SHA256:${sigHex()}`, iat: fmtTime(now), exp: fmtTime(exp), raw: rand(32) };
}

function drawQR(canvas: HTMLCanvasElement, token: Token) {
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const size = 200, cell = 7, cols = Math.floor(size / cell);
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
  let seed = token.raw.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const sr = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  ctx.fillStyle = '#0b1c30';
  for (let r = 0; r < cols; r++) for (let c = 0; c < cols; c++) if (sr() > 0.5) ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
  const finder = (x: number, y: number) => {
    ctx.fillStyle = '#0b1c30'; ctx.fillRect(x, y, 49, 49);
    ctx.fillStyle = '#fff';    ctx.fillRect(x + 7, y + 7, 35, 35);
    ctx.fillStyle = '#0b1c30'; ctx.fillRect(x + 14, y + 14, 21, 21);
  };
  finder(0, 0); finder(size - 49, 0); finder(0, size - 49);
}

/* ═══ COMPONENT ═══ */
export default function SimulationPage() {
  const [token, setToken]           = useState<Token>(makeToken);
  const [countdown, setCountdown]   = useState(30);
  const [shimmer, setShimmer]       = useState(false);
  const [logs, setLogs]             = useState<LogEntry[]>([
    { tag: 'SYS', msg: 'Dynamic QR Security v2.4 ready.', cls: '' },
    { tag: 'OK',  msg: `Merchant verified: ${DEMO_MERCHANT.nmid}`, cls: 'ok' },
  ]);
  const [history, setHistory]       = useState<HistoryEntry[]>([]);
  const [loading, setLoading]       = useState(false);
  const [loadText, setLoadText]     = useState('');
  const [loadStep, setLoadStep]     = useState('');
  const [result, setResult]         = useState<null | 'success' | 'fraud'>(null);
  const [resultRows, setResultRows] = useState<Array<{ label: string; val: string; cls: string }>>([]);
  const [resultTitle, setResultTitle] = useState('');
  const [resultSub, setResultSub]   = useState('');
  const [toastHtml, setToastHtml]   = useState<string | null>(null);
  const [toastShow, setToastShow]   = useState(false);
  const [busy, setBusy]             = useState(false);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const logRef       = useRef<HTMLDivElement>(null);
  const countRef     = useRef(30);

  /* draw QR on token change */
  useEffect(() => {
    if (canvasRef.current) drawQR(canvasRef.current, token);
    setShimmer(true);
    const t = setTimeout(() => setShimmer(false), 500);
    return () => clearTimeout(t);
  }, [token]);

  /* auto-scroll log */
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = useCallback((tag: string, msg: string, cls = '') =>
    setLogs(p => [...p, { tag, msg, cls }]), []);

  /* 30-second timer */
  useEffect(() => {
    const iv = setInterval(() => {
      countRef.current -= 1;
      setCountdown(countRef.current);
      if (countRef.current <= 0) {
        const t = makeToken();
        setToken(t);
        addLog('NEW', `Token rotated → ${t.id}`, 'ok');
        countRef.current = 30;
        setCountdown(30);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [addLog]);

  /* toast lifecycle */
  useEffect(() => {
    if (toastHtml !== null) {
      setToastShow(true);
      const t = setTimeout(() => setToastShow(false), 8000);
      return () => clearTimeout(t);
    }
  }, [toastHtml]);

  const pct = (countdown / 30) * 100;
  const barClr = pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#22c55e';
  const valClr = (c: string) => c === 'ok' ? '#22c55e' : c === 'err' ? '#ef4444' : c === 'warn' ? '#f59e0b' : '#e2e8f0';

  /* ── simulate scan ── */
  async function simulate(type: 'honest' | 'fraud') {
    if (busy) return;
    setBusy(true); setLoading(true);
    const steps: [number, string, string][] = type === 'honest' ? [
      [500, 'Verifying identity in QR Registry…', 'Sending token signature to server'],
      [700, 'Verifying identity in QR Registry…', 'Validating HMAC-SHA256 signature'],
      [500, 'Confirming payment details…',         'Token status: ACTIVE & VALID ✓'],
    ] : [
      [500, 'Checking token validity and signature…', 'Comparing token with active registry'],
      [700, 'Checking token validity and signature…', 'Token not found in active session'],
      [500, 'Running fraud analysis…',                 'Signature mismatch detected'],
    ];
    for (const [ms, txt, step] of steps) { setLoadText(txt); setLoadStep(step); await sleep(ms); }
    setLoading(false);
    type === 'honest' ? resolveSuccess() : resolveFraud();
    setBusy(false);
  }

  function resolveSuccess() {
    const amount = 'Rp ' + (Math.floor(Math.random() * 900 + 100) * 1000).toLocaleString('id-ID');
    const ref    = 'PAY-' + Math.random().toString(36).slice(2, 10).toUpperCase();
    const now    = new Date().toLocaleTimeString('en-GB');
    setResultTitle('Payment Successful');
    setResultSub('Token verified. Funds transferred securely.');
    setResultRows([
      { label: 'Merchant',    val: DEMO_MERCHANT.name,   cls: '' },
      { label: 'NMID',        val: DEMO_MERCHANT.nmid,   cls: '' },
      { label: 'PJSP',        val: DEMO_MERCHANT.pjsp,   cls: '' },
      { label: 'Amount',      val: amount,               cls: 'ok' },
      { label: 'Token',       val: token.id,             cls: '' },
      { label: 'Signature',   val: '✓ VALID',            cls: 'ok' },
      { label: 'Timestamp',   val: now,                  cls: '' },
      { label: 'Reference',   val: ref,                  cls: '' },
      { label: 'Status',      val: 'APPROVED',           cls: 'ok' },
    ]);
    setResult('success');
    addLog('TXN', `Approved ${amount} · ${ref}`, 'ok');
    setHistory(h => [{ success: true, amount, ref, ts: now }, ...h.slice(0, 4)]);
  }

  function resolveFraud() {
    const fake = 'TKN-OLD-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const now  = new Date().toLocaleTimeString('en-GB');
    setResultTitle('Transaction Blocked');
    setResultSub('Expired or counterfeit QR detected. No funds moved.');
    setResultRows([
      { label: 'Attempted Token', val: fake,                        cls: 'err' },
      { label: 'Token Status',    val: 'EXPIRED',                   cls: 'err' },
      { label: 'Signature',       val: '✗ INVALID / MISMATCH',      cls: 'err' },
      { label: 'Registry',        val: '✗ NOT FOUND',               cls: 'err' },
      { label: 'Timestamp',       val: now,                         cls: '' },
      { label: 'Threat Level',    val: 'HIGH — Spoofing Suspected', cls: 'warn' },
      { label: 'Status',          val: 'BLOCKED',                   cls: 'err' },
    ]);
    setResult('fraud');
    addLog('ALERT', `BLOCKED: ${fake} — expired signature`, 'err');
    setHistory(h => [{ success: false, amount: 'Blocked', ref: fake, ts: now }, ...h.slice(0, 4)]);
    setToastHtml(
      `Token <strong style="color:#fca5a5">${fake}</strong> has expired and its HMAC signature is invalid. ` +
      `An automatic spoofing incident report has been dispatched to <strong style="color:#fca5a5">` +
      `${DEMO_MERCHANT.pjsp}</strong> and the merchant system for immediate review.`
    );
  }

  /* ─── timer ring SVG ─── */
  const R = 34, circ = 2 * Math.PI * R;
  const ringClr = pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ minHeight: '100vh', background: '#0b1c30', color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* ── TOAST ── */}
      <div style={{
        position: 'fixed', top: 20, left: '50%',
        transform: `translateX(-50%) translateY(${toastShow ? '0' : '-160px'})`,
        transition: 'transform .45s cubic-bezier(.34,1.56,.64,1)',
        background: '#1c0a0a', border: '1px solid rgba(239,68,68,.5)',
        borderRadius: 12, padding: '12px 16px', maxWidth: 480,
        width: 'calc(100% - 32px)', zIndex: 300,
        display: 'flex', gap: 12, alignItems: 'flex-start',
        boxShadow: '0 12px 40px rgba(239,68,68,.2)',
      }}>
        <div style={{ marginTop: 1, flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⛔</div>
        <div>
          <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#ef4444', marginBottom: 4, letterSpacing: '.01em' }}>Security Alert — Fraud Detected</div>
          <div style={{ fontSize: '.73rem', color: '#b5b5b5', lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: toastHtml ?? '' }} />
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(11,28,48,.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111d2e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: '32px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 280 }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,.08)', borderTopColor: '#4f8ef7', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>{loadText}</div>
              <div style={{ fontSize: '.72rem', color: '#5a6a80', fontFamily: 'Courier New, monospace' }}>{loadStep}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT MODAL ── */}
      {result && (
        <div onClick={() => setResult(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111d2e', border: `1px solid ${result === 'success' ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`, borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            {/* Status icon */}
            <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', background: result === 'success' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${result === 'success' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}` }}>
              {result === 'success' ? '✓' : '✗'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: result === 'success' ? '#22c55e' : '#ef4444', marginBottom: 4 }}>{resultTitle}</div>
              <div style={{ fontSize: '.78rem', color: '#5a6a80' }}>{resultSub}</div>
            </div>
            {/* Rows */}
            <div style={{ width: '100%', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,.06)' }}>
              {resultRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', fontSize: '.78rem', background: i % 2 === 0 ? 'rgba(255,255,255,.02)' : 'transparent', borderBottom: i < resultRows.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                  <span style={{ color: '#5a6a80' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: valClr(row.cls), fontFamily: row.cls === '' && row.label === 'Reference' ? 'Courier New, monospace' : undefined, fontSize: row.label === 'Reference' ? '.73rem' : undefined }}>{row.val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setResult(null)} style={{ marginTop: 4, padding: '10px 32px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, background: 'transparent', color: '#8892a4', fontSize: '.82rem', fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(11,28,48,.95)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5a6a80', textDecoration: 'none', fontSize: '.78rem', transition: 'color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
          onMouseLeave={e => (e.currentTarget.style.color = '#5a6a80')}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Home
        </Link>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: '#e2e8f0' }}>Security Simulation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.7rem', color: '#22c55e', fontWeight: 600 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s ease-in-out infinite' }} />
          Live
        </div>
      </header>

      {/* ── SPLIT ── */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

        {/* ░ LEFT — MERCHANT ░ */}
        <section style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16, borderRight: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#3a4a60' }}>Merchant Display</div>

          {/* Merchant card */}
          <div style={{ background: '#0f1e30', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {/* Header */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{DEMO_MERCHANT.name}</div>
                <div style={{ fontSize: '.68rem', color: '#5a6a80', marginTop: 2 }}>NMID: {DEMO_MERCHANT.nmid} · {DEMO_MERCHANT.category}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#22c55e', fontWeight: 600, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 20, padding: '3px 10px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s ease-in-out infinite' }} />
                Verified
              </div>
            </div>

            {/* QR */}
            <div style={{ position: 'relative', padding: 14, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
              <canvas ref={canvasRef} width={200} height={200} style={{ display: 'block', opacity: shimmer ? 0.2 : 1, transition: 'opacity .3s' }} />
              {/* Scan line */}
              <div style={{ position: 'absolute', left: 14, right: 14, height: 1.5, background: 'linear-gradient(90deg,transparent,#002068,transparent)', animation: 'scanLine 2s linear infinite' }} />
              {/* Corners */}
              {([['tl',0,0,undefined,undefined],['tr',0,undefined,0,undefined],['bl',undefined,0,undefined,0],['br',undefined,undefined,0,0]] as [string, number|undefined, number|undefined, number|undefined, number|undefined][]).map(([id, t, l, b, r]) => (
                <div key={id} style={{ position: 'absolute', width: 18, height: 18, borderStyle: 'solid', borderColor: '#002068', borderWidth: id === 'tl' ? '2px 0 0 2px' : id === 'tr' ? '2px 2px 0 0' : id === 'bl' ? '0 0 2px 2px' : '0 2px 2px 0', top: t !== undefined ? t + 6 : undefined, left: l !== undefined ? l + 6 : undefined, bottom: b !== undefined ? b + 6 : undefined, right: r !== undefined ? r + 6 : undefined }} />
              ))}
            </div>

            {/* Timer row */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* SVG ring */}
              <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                <svg width="56" height="56" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="6" />
                  <circle cx="40" cy="40" r={R} fill="none" stroke={ringClr} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
                    style={{ transition: 'stroke-dashoffset .9s linear, stroke .4s ease' }} />
                </svg>
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.95rem', fontWeight: 700, color: ringClr, fontVariantNumeric: 'tabular-nums' }}>{countdown}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.72rem', color: '#5a6a80', marginBottom: 6 }}>Token refreshes automatically every 30 seconds</div>
                <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barClr, borderRadius: 2, transition: 'width .9s linear, background .4s' }} />
                </div>
              </div>
            </div>

            {/* Token metadata */}
            <div style={{ width: '100%', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 10, overflow: 'hidden' }}>
              {([['Token ID', token.id], ['HMAC-SHA256', token.sig], ['Issued', token.iat], ['Expires', token.exp]] as [string, string][]).map(([lbl, val], i, arr) => (
                <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                  <span style={{ fontSize: '.68rem', color: '#5a6a80' }}>{lbl}</span>
                  <span style={{ fontSize: '.65rem', fontFamily: 'Courier New, monospace', color: '#4f8ef7', maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System log */}
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#3a4a60', marginBottom: 6 }}>System Log</div>
            <div ref={logRef} style={{ background: '#090f1a', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, padding: '10px 12px', fontFamily: 'Courier New, monospace', fontSize: '.65rem', maxHeight: 80, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {logs.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, lineHeight: 1.4 }}>
                  <span style={{ color: l.cls === 'ok' ? '#22c55e' : l.cls === 'err' ? '#ef4444' : l.cls === 'warn' ? '#f59e0b' : '#3a4a60', flexShrink: 0 }}>{l.tag}</span>
                  <span style={{ color: l.cls === 'ok' ? '#4ade80' : l.cls === 'err' ? '#fca5a5' : l.cls === 'warn' ? '#fcd34d' : '#5a6a80' }}>{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ░ RIGHT — BUYER ░ */}
        <section style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#3a4a60' }}>Buyer Application</div>

          {/* Phone shell */}
          <div style={{ background: '#0f1e30', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, overflow: 'hidden' }}>
            {/* Status bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', background: '#090f1a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  {[4, 7, 10, 13].map(h => <div key={h} style={{ width: 3, height: h, background: '#22c55e', borderRadius: 1 }} />)}
                </div>
                <span style={{ fontSize: '.65rem', color: '#5a6a80' }}>5G</span>
              </div>
              <span style={{ fontSize: '.72rem', fontWeight: 600, color: '#e2e8f0' }}>PayNusa</span>
              <span style={{ fontSize: '.68rem', color: '#5a6a80' }}>Rp 850.000</span>
            </div>

            {/* Viewfinder */}
            <div style={{ position: 'relative', background: '#060d16', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {/* subtle grid */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,142,247,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.04) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
              {/* Scanner box */}
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                {[{id:'tl',t:0,l:0,bw:'2px 0 0 2px'},{id:'tr',t:0,r:0,bw:'2px 2px 0 0'},{id:'bl',b:0,l:0,bw:'0 0 2px 2px'},{id:'br',b:0,r:0,bw:'0 2px 2px 0'}].map((c: any) => (
                  <div key={c.id} style={{ position: 'absolute', width: 20, height: 20, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.5)', borderWidth: c.bw, top: c.t, bottom: c.b, left: c.l, right: c.r }} />
                ))}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ opacity: .2 }}>
                    <path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M15 3h4a2 2 0 012 2v4M15 21h4a2 2 0 002-2v-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: 10, fontSize: '.65rem', color: 'rgba(255,255,255,.3)', letterSpacing: '.05em' }}>POINT AT QR CODE</div>
            </div>

            {/* Scan buttons */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button disabled={busy} onClick={() => simulate('honest')}
                style={{ width: '100%', padding: '13px 16px', border: '1px solid rgba(34,197,94,.3)', borderRadius: 10, fontSize: '.82rem', fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(34,197,94,.06)', color: '#e2e8f0', opacity: busy ? .4 : 1, textAlign: 'left', transition: 'all .15s' }}
                onMouseEnter={e => { if(!busy) e.currentTarget.style.background = 'rgba(34,197,94,.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,.06)'; }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', flexShrink: 0 }}>✓</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Honest Buyer — Scan Active QR</div>
                  <div style={{ fontSize: '.68rem', color: '#5a6a80', marginTop: 2 }}>Scans the current valid token from merchant display</div>
                </div>
              </button>

              <button disabled={busy} onClick={() => simulate('fraud')}
                style={{ width: '100%', padding: '13px 16px', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, fontSize: '.82rem', fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(239,68,68,.05)', color: '#e2e8f0', opacity: busy ? .4 : 1, textAlign: 'left', transition: 'all .15s' }}
                onMouseEnter={e => { if(!busy) e.currentTarget.style.background = 'rgba(239,68,68,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.05)'; }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', flexShrink: 0 }}>⚠</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Fraud Attempt — Expired / Fake Sticker QR</div>
                  <div style={{ fontSize: '.68rem', color: '#5a6a80', marginTop: 2 }}>Scans an old screenshot or counterfeit static sticker</div>
                </div>
              </button>
            </div>

            {/* Info strip */}
            <div style={{ margin: '0 16px 16px', padding: '10px 12px', background: 'rgba(79,142,247,.05)', border: '1px solid rgba(79,142,247,.1)', borderRadius: 8, fontSize: '.68rem', color: '#5a6a80', lineHeight: 1.6 }}>
              Every scan is verified against the <span style={{ color: '#4f8ef7', fontWeight: 600 }}>QR Registry &amp; HMAC Signature DB</span> before funds are released.
            </div>
          </div>

          {/* Transaction history */}
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#3a4a60', marginBottom: 6 }}>Transaction History</div>
            <div style={{ background: '#0f1e30', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, overflow: 'hidden' }}>
              {history.length === 0
                ? <div style={{ padding: '20px', textAlign: 'center', fontSize: '.75rem', color: '#3a4a60' }}>No transactions yet</div>
                : history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', background: h.success ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)' }}>{h.success ? '✓' : '✗'}</div>
                      <div>
                        <div style={{ fontSize: '.75rem', fontWeight: 600, color: h.success ? '#4ade80' : '#fca5a5' }}>{h.success ? 'Payment Approved' : 'Transaction Blocked'}</div>
                        <div style={{ fontSize: '.63rem', color: '#3a4a60', marginTop: 1 }}>{h.ts}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '.78rem', fontWeight: 700, color: h.success ? '#22c55e' : '#ef4444' }}>{h.amount}</div>
                      <div style={{ fontSize: '.6rem', color: '#3a4a60', fontFamily: 'Courier New, monospace' }}>{h.ref}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes scanLine { 0%{top:14px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:214px;opacity:0} }
      `}</style>
    </div>
  );
}
