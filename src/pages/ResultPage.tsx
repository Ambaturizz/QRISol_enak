import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ResultPage() {
  const [params] = useSearchParams();
  const [animated, setAnimated] = useState(false);

  const valid = params.get('valid') === '1';
  const reason = params.get('reason') ?? 'UNKNOWN';
  const merchantName = params.get('merchantName') ?? '—';
  const pjsp = params.get('pjsp') ?? '—';
  const expiry = Number(params.get('expiry') ?? 0);
  const scannedAt = Number(params.get('scannedAt') ?? Date.now());

  const reasonLabels: Record<string, { title: string; desc: string; icon: string }> = {
    EXPIRED: {
      title: 'QR Code Expired',
      desc: 'This QR code has expired. This is a hallmark of a fake static QR placed by scammers. Valid tokens are only good for 30 seconds.',
      icon: 'timer_off'
    },
    INVALID_SIGNATURE: {
      title: 'Invalid Digital Signature',
      desc: 'Cryptographic signature does not match. This QR Code has likely been manipulated or generated without a valid PJSP key.',
      icon: 'gpp_bad'
    },
    MALFORMED: {
      title: 'Unknown QR Format',
      desc: 'This QR Code is not a Dynamic Secure QRIS token. It might be a regular static QR or irrelevant.',
      icon: 'qr_code_scanner'
    },
  };

  const rejectionInfo = reasonLabels[reason] ?? {
    title: 'Transaction Rejected',
    desc: 'QR Code could not be validated.',
    icon: 'error'
  };

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-background min-h-screen font-sans text-on-background antialiased flex flex-col">
      {/* Navbar: TopAppBar */}
      <header className="bg-surface z-50 sticky top-0 border-b border-surface-container">
        <div className="flex items-center w-full px-5 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-primary text-xl">🛡️</span>
            <span className="text-lg font-bold text-primary">Dynamic Secure QRIS</span>
          </div>
          <div className="ml-auto">
            <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 p-1">
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center px-5 pt-8 pb-32 max-w-lg mx-auto w-full">
        {/* Status Header */}
        <div className={`flex flex-col items-center text-center mb-6 transition-all duration-500 transform ${animated ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
          {valid ? (
            <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(108,248,187,0.4)]">
              <span className="text-[48px] text-on-secondary-container">✔️</span>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-error-container flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(255,218,214,0.4)]">
              <span className="text-[48px] text-on-error-container">❌</span>
            </div>
          )}
          
          <h1 className={`text-2xl font-bold mb-1 ${valid ? 'text-secondary' : 'text-error'}`}>
            {valid ? 'Payment Authorized' : rejectionInfo.title}
          </h1>
          <p className="text-base text-outline">
            {valid ? 'QR Token valid, signature verified' : 'Transaction blocked to protect you'}
          </p>
        </div>

        {/* Details Card */}
        <div className={`w-full bg-surface-container-lowest rounded-xl shadow-sm p-6 mb-6 border ${valid ? 'border-outline-variant/30' : 'border-error/30'} transition-all duration-500 delay-100 transform ${animated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {valid ? (
            <>
              <div className="text-center mb-6 pb-4 border-b border-outline-variant/30">
                <p className="text-sm font-medium text-on-surface-variant mb-1">Total Payment</p>
                <p className="text-4xl font-bold text-on-background">Rp50.000</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-base text-on-surface-variant">Merchant Name</span>
                  <span className="text-sm font-semibold text-on-background">{merchantName}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-base text-on-surface-variant">PJSP</span>
                  <span className="text-sm font-semibold text-on-background">{pjsp}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-base text-on-surface-variant">Token Validity</span>
                  <span className="text-sm font-semibold text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full">
                    Valid ({Math.max(0, Math.round((expiry - scannedAt) / 1000))}s left)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-base text-on-surface-variant">Scan Time</span>
                  <span className="text-sm font-semibold text-on-background">
                    {new Date(scannedAt).toLocaleTimeString('id-ID')}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-4 pb-4 border-b border-error/20">
                <p className="text-sm font-medium text-error mb-2">{rejectionInfo.desc}</p>
                <p className="text-xs text-on-surface-variant">Spoofing attempt logged & reported.</p>
              </div>
              <div className="flex flex-col gap-3">
                {merchantName !== '—' && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-base text-on-surface-variant">Merchant (Claimed)</span>
                    <span className="text-sm font-semibold text-on-background">{merchantName}</span>
                  </div>
                )}
                {expiry > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-base text-on-surface-variant">Expired Status</span>
                    <span className="text-sm font-semibold text-error bg-error-container/50 px-2 py-0.5 rounded-full">
                      Past {Math.round((scannedAt - expiry) / 1000)}s
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-base text-on-surface-variant">Scan Time</span>
                  <span className="text-sm font-semibold text-on-background">
                    {new Date(scannedAt).toLocaleTimeString('id-ID')}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`w-full flex flex-col gap-3 mb-6 transition-all duration-500 delay-200 transform ${animated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {valid && (
            <button className="w-full bg-secondary text-on-secondary text-sm font-semibold py-4 rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Confirm Payment
              <span className="text-lg">→</span>
            </button>
          )}
          <Link to="/scanner" className="w-full bg-transparent border border-primary text-primary text-sm font-semibold py-3 rounded-lg hover:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span className="text-lg">📱</span>
            {valid ? 'Scan Again' : 'Try Scanning Again'}
          </Link>
          <Link to="/" className="w-full bg-transparent text-outline text-sm font-semibold py-3 rounded-lg hover:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
            Back to Home
          </Link>
        </div>

        {/* Info Box */}
        <div className={`w-full ${valid ? 'bg-surface-container text-primary' : 'bg-error-container/30 text-error'} rounded-lg p-4 flex gap-3 items-start transition-all duration-500 delay-300 transform ${animated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <span className="text-xl mt-0.5">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold mb-1">QRIS Security</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {valid 
                ? 'This transaction uses Dynamic Secure QRIS. Digital signature has been verified by central system, ensuring merchant authenticity and bill amount.' 
                : 'Spoofing Warning: Our system detected an anomaly in this QR. Do not proceed with payment if you suspect a fake QR sticker has been pasted over the original QRIS.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
