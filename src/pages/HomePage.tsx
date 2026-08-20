import { Link } from 'react-router-dom';
import { useState } from 'react';

const LOGO_URL = "/logo.webp";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'merchant' | 'judge'>('merchant');

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased" style={{ background: '#f8f9ff', color: '#0b1c30' }}>

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(248,249,255,0.92)', backdropFilter: 'blur(12px)', borderColor: '#c4c5d5' }}>
        <div className="flex items-center justify-between max-w-5xl mx-auto px-5 h-14">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="Logo" className="w-7 h-7 rounded-md object-contain" />
            <span className="font-bold text-base" style={{ color: '#002068' }}>Dynamic Secure QRIS</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/merchant"
              className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all active:scale-95 hover:bg-white"
              style={{ borderColor: '#003399', color: '#002068' }}>
              Merchant App
            </Link>
            <Link to="/scanner"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all active:scale-95 hover:opacity-90"
              style={{ background: '#002068' }}>
              Scanner App
            </Link>
            <Link to="/simulation"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all active:scale-95 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#7c5cf7)' }}>
              🔐 Simulation
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="max-w-5xl mx-auto px-5 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
            style={{ background: '#e5eeff', borderColor: '#b5c4ff', color: '#002068' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#006c49' }} />
            Hackathon Demo — Dynamic Secure QRIS 2026
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight" style={{ color: '#002068' }}>
            Dynamic QR for<br className="hidden md:block" /> MSME Merchants
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#444653' }}>
            Cryptography-based anti-spoofing layer that gives small merchants
            protection equivalent to Dynamic QRIS — <strong style={{ color: '#002068' }}>without EDC, without cost, software only.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link to="/merchant"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-base transition-all active:scale-95 hover:opacity-90 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #002068, #003399)' }}>
              🏪 View Merchant App
            </Link>
            <Link to="/scanner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all active:scale-95 hover:bg-white border"
              style={{ borderColor: '#c4c5d5', color: '#444653' }}>
              📱 Try Scanner App
            </Link>
            <Link to="/simulation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-base transition-all active:scale-95 hover:opacity-90 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c5cf7)' }}>
              🔐 Security Simulation
            </Link>
          </div>
        </section>

        {/* ── TAB SWITCHER ── */}
        <section className="max-w-5xl mx-auto px-5 mb-12">
          <div className="flex rounded-xl overflow-hidden border max-w-sm mx-auto" style={{ borderColor: '#c4c5d5', background: '#ffffff' }}>
            <button
              onClick={() => setActiveTab('merchant')}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{
                background: activeTab === 'merchant' ? '#002068' : 'transparent',
                color: activeTab === 'merchant' ? '#ffffff' : '#444653',
              }}>
              🏪 For Merchants
            </button>
            <button
              onClick={() => setActiveTab('judge')}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{
                background: activeTab === 'judge' ? '#002068' : 'transparent',
                color: activeTab === 'judge' ? '#ffffff' : '#444653',
              }}>
              🔬 For Judges
            </button>
          </div>

          {/* ── TAB: PEDAGANG ── */}
          {activeTab === 'merchant' && (
            <div className="mt-8 grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Mockup */}
              <div className="flex justify-center">
                <div className="relative w-56 rounded-3xl overflow-hidden shadow-2xl border-4" style={{ borderColor: '#003399' }}>
                  {/* Phone mockup */}
                  <div className="flex flex-col items-center py-8 px-4 gap-5" style={{ background: '#f8f9ff' }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#002068' }}>MerchantPay</p>
                    {/* Logo placeholder */}
                    <div className="relative w-36 h-36 rounded-xl flex items-center justify-center border-2" style={{ borderColor: '#003399', background: '#ffffff' }}>
                      <img src="/logo.webp" alt="App Logo" className="w-24 h-24 object-contain" />
                      {/* Pulsing ring */}
                      <div className="absolute -inset-1 rounded-xl border-2 animate-ping opacity-20" style={{ borderColor: '#003399' }} />
                    </div>
                    {/* Timer */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#006c49' }} />
                      <span className="text-xs font-semibold" style={{ color: '#444653' }}>Refresh in 24 seconds</span>
                    </div>
                    <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: '#e5eeff' }}>
                      <div className="h-full rounded-full" style={{ background: '#006c49', width: '80%', transition: 'width 1s linear' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Steps */}
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold" style={{ color: '#002068' }}>As Simple as 3 Steps</h2>
                {[
                  { n: '1', icon: '📲', title: 'Download & Login', desc: 'Install free PWA. Login with registered QRIS number. No new hardware needed.' },
                  { n: '2', icon: '🖥️', title: 'Display Screen', desc: 'Screen directly shows QR that rotates every 30 seconds. No buttons, no menus — just QR.' },
                  { n: '3', icon: '💰', title: 'Accept Payment', desc: 'Customer scans active QR. Payment goes to your account. If QR is expired, system automatically rejects.' },
                ].map(({ n, icon, title, desc }) => (
                  <div key={n} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: '#003399' }}>{n}</div>
                    <div>
                      <p className="font-semibold text-base" style={{ color: '#0b1c30' }}>{icon} {title}</p>
                      <p className="text-sm mt-0.5" style={{ color: '#747684' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB: JURI ── */}
          {activeTab === 'judge' && (
            <div className="mt-8 flex flex-col gap-8">
              {/* Token anatomy */}
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#c4c5d5', background: '#ffffff' }}>
                <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: '#002068', borderColor: '#003399' }}>
                  <span className="text-white font-mono text-xs font-semibold">QRTokenPayload — Token Structure</span>
                </div>
                <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto">
                  <pre style={{ color: '#0b1c30' }}>{`{
  "merchantId": "109xxxxxxx",
  "merchantName": "Prototipe QR Merchant",
  "pjsp": "BRI - BRIVAS",
  "timestamp": 1755689123000,
  "expiry":    1755689153000,  // +30 detik
  "nonce": "X7K2M9QA",         // random, anti-replay
  "signature": "sha256(merchantId|timestamp|nonce|SECRET_KEY)"
}`}</pre>
                </div>
              </div>

              {/* Flow steps */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    step: 'PJSP Issues Token',
                    color: '#002068',
                    bgColor: '#e5eeff',
                    icon: '🏦',
                    points: [
                      'PJSP (e.g.: BRI) holds SECRET_KEY',
                      'Generate SHA-256 signature from merchantId + timestamp + nonce',
                      'Token encoded to QR, refreshes every 30 secs',
                      'Key never leaves existing QRIS chain',
                    ],
                  },
                  {
                    step: 'Customer Scans',
                    color: '#005236',
                    bgColor: '#e8fff4',
                    icon: '📱',
                    points: [
                      'Scan QR — dapat payload JSON terenkripsi',
                      'App checks if Date.now() < expiry',
                      'Re-compute signature & compare',
                      'Match → proceed. Not match → REJECT',
                    ],
                  },
                  {
                    step: 'Spoof Detected',
                    color: '#93000a',
                    bgColor: '#fff0f0',
                    icon: '🚨',
                    points: [
                      'Fake sticker has old token (expired)',
                      'Timestamp validation fails automatically',
                      'Transaction rejected before funds leave',
                      'Real-time alert to merchant & PJSP',
                    ],
                  },
                ].map(({ step, color, bgColor, icon, points }) => (
                  <div key={step} className="rounded-xl border p-5 flex flex-col gap-3" style={{ borderColor: color + '33', background: bgColor }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm font-bold" style={{ color }}>{step}</span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {points.map(p => (
                        <li key={p} className="flex items-start gap-2 text-xs" style={{ color: '#444653' }}>
                          <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color }}>→</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── VALUE PROPOSITION ── */}
        <section style={{ background: '#002068' }} className="py-14">
          <div className="max-w-5xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">Why Dynamic Secure QRIS?</h2>
            <p className="text-center text-sm mb-10" style={{ color: '#b5c4ff' }}>Not a new authority. Not a new infrastructure. Just a security layer that should have been there all along.</p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: '🔗',
                  title: 'Within Existing Regulations',
                  desc: 'Key custody remains with BI-licensed PJSP. No new trust authority. No regulatory changes needed.',
                },
                {
                  icon: '💸',
                  title: 'Zero Upfront Cost',
                  desc: 'Software-only. No EDC needed, no paid cashier machine needed. Just the smartphone the merchant already owns.',
                },
                {
                  icon: '🎯',
                  title: 'Right on Target',
                  desc: 'Designed for MSMEs and street vendors — the segment most harmed by spoofing, but least protected.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="font-bold text-white mb-1.5">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#b5c4ff' }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 rounded-xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#6cf8bb' }}>✦ Hackathon Demo — End-to-End Simulation</p>
              <p className="text-white text-base mb-5">Open two tabs: <strong>Merchant App</strong> generates QR → <strong>Scanner App</strong> scans → see realtime validation</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/merchant"
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:opacity-90"
                  style={{ background: '#6cf8bb', color: '#002113' }}>
                  🏪 Open Merchant App
                </Link>
                <Link to="/scanner"
                  className="px-6 py-3 rounded-xl font-semibold text-sm border transition-all active:scale-95 hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}>
                  📱 Open Scanner App
                </Link>
                <Link to="/simulation"
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#4f8ef7,#7c5cf7)', color: '#ffffff' }}>
                  🔐 Security Simulation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-6 text-center" style={{ background: '#0b1c30' }}>
          <p className="text-xs" style={{ color: '#747684' }}>
            Hackathon Demo · Dynamic Secure QRIS · 2026 · Built with Vite + React + CryptoJS
          </p>
        </footer>
      </main>
    </div>
  );
}
