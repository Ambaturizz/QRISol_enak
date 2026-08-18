import CryptoJS from 'crypto-js';

// ---------------------------------------------------------------------------
// SIMULATION CONFIG
// In a real PJSP integration, SECRET_KEY would be held server-side.
// Here it is a shared demo constant to prove the signature concept end-to-end.
// ---------------------------------------------------------------------------
export const SECRET_KEY = 'DYNAMIC_SECURE_QRIS_PJSP_SECRET_2026';
export const TOKEN_TTL_MS = 30_000; // 30 seconds

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface QRTokenPayload {
  merchantId: string;
  merchantName: string;
  merchantCategory: string;
  pjsp: string;         // Licensed PJSP issuing the token
  timestamp: number;    // ms since epoch — token creation time
  expiry: number;       // ms since epoch — token expiry time
  nonce: string;        // Random value to prevent replay
  signature: string;    // SHA-256(merchantId + timestamp + nonce + SECRET_KEY)
}

export interface ValidationResult {
  valid: boolean;
  reason: 'OK' | 'EXPIRED' | 'INVALID_SIGNATURE' | 'MALFORMED';
  payload?: QRTokenPayload;
  scannedAt?: number;
}

// ---------------------------------------------------------------------------
// Token Generation
// ---------------------------------------------------------------------------
export function generateSignature(
  merchantId: string,
  timestamp: number,
  nonce: string
): string {
  const data = `${merchantId}|${timestamp}|${nonce}|${SECRET_KEY}`;
  return CryptoJS.SHA256(data).toString();
}

export function generateToken(
  merchantId: string,
  merchantName: string,
  merchantCategory: string = 'F&B',
  pjsp: string = 'BRI - BRIVAS'
): QRTokenPayload {
  const now = Date.now();
  const nonce = Math.random().toString(36).substring(2, 10).toUpperCase();
  const signature = generateSignature(merchantId, now, nonce);

  return {
    merchantId,
    merchantName,
    merchantCategory,
    pjsp,
    timestamp: now,
    expiry: now + TOKEN_TTL_MS,
    nonce,
    signature,
  };
}

export function encodeToken(payload: QRTokenPayload): string {
  // Use encodeURIComponent to handle any Unicode chars before btoa
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

// ---------------------------------------------------------------------------
// Token Validation (runs on scanner side)
// ---------------------------------------------------------------------------
export function validateToken(raw: string): ValidationResult {
  const scannedAt = Date.now();

  let payload: QRTokenPayload;
  try {
    payload = JSON.parse(decodeURIComponent(atob(raw))) as QRTokenPayload;
  } catch {
    return { valid: false, reason: 'MALFORMED', scannedAt };
  }

  // 1. Check expiry
  if (scannedAt > payload.expiry) {
    return { valid: false, reason: 'EXPIRED', payload, scannedAt };
  }

  // 2. Verify signature
  const expected = generateSignature(payload.merchantId, payload.timestamp, payload.nonce);
  if (expected !== payload.signature) {
    return { valid: false, reason: 'INVALID_SIGNATURE', payload, scannedAt };
  }

  return { valid: true, reason: 'OK', payload, scannedAt };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function msToSeconds(ms: number): number {
  return Math.max(0, Math.round(ms / 1000));
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
