// Demo merchant data — simulates QRIS registry
export interface MerchantProfile {
  id: string;
  name: string;
  category: string;
  pjsp: string;
  location: string;
  nmid: string; // Nomor Merchant ID (QRIS standard field)
}

export const DEMO_MERCHANT: MerchantProfile = {
  id: '109xxxxxxx',
  name: 'Prototipe QR Merchant',
  category: 'UMKM — Merchant',
  pjsp: 'BRI - BRIVAS',
  location: 'Indonesia',
  nmid: 'ID109xxxxxxx',
};
