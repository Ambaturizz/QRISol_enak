import os

replacements = {
    "src/pages/HomePage.tsx": [
        ("QR Dinamis untuk<br className=\"hidden md:block\" /> Pedagang UMKM", "Dynamic QR for<br className=\"hidden md:block\" /> MSME Merchants"),
        ("Anti-spoofing layer berbasis kriptografi yang memberikan pedagang kecil", "Cryptography-based anti-spoofing layer that gives small merchants"),
        ("perlindungan setara Dynamic QRIS — <strong style={{ color: '#002068' }}>tanpa EDC, tanpa biaya, hanya software.</strong>", "protection equivalent to Dynamic QRIS — <strong style={{ color: '#002068' }}>without EDC, without cost, software only.</strong>"),
        ("Lihat Merchant App", "View Merchant App"),
        ("Coba Scanner App", "Try Scanner App"),
        ("Untuk Pedagang", "For Merchants"),
        ("Untuk Juri", "For Judges"),
        ("Refresh dalam 24 detik", "Refresh in 24 seconds"),
        ("Sesederhana 3 Langkah", "As Simple as 3 Steps"),
        ("Unduh & Login", "Download & Login"),
        ("Instal PWA gratis. Login dengan nomor QRIS yang sudah terdaftar. Tidak perlu hardware baru.", "Install free PWA. Login with registered QRIS number. No new hardware needed."),
        ("Tampilkan Layar", "Display Screen"),
        ("Layar langsung menampilkan QR yang terus berputar setiap 30 detik. Tidak ada tombol, tidak ada menu — hanya QR.", "Screen directly shows QR that rotates every 30 seconds. No buttons, no menus — just QR."),
        ("Terima Pembayaran", "Accept Payment"),
        ("Pelanggan scan QR aktif. Pembayaran masuk ke rekening Anda. Jika QR sudah expired, sistem otomatis menolak.", "Customer scans active QR. Payment goes to your account. If QR is expired, system automatically rejects."),
        ("Struktur Token", "Token Structure"),
        ("misal: BRI", "e.g.: BRI"),
        ("pegang", "holds"),
        ("di-encode jadi QR, refresh tiap 30 detik", "encoded to QR, refreshes every 30 secs"),
        ("Kunci tidak pernah keluar dari chain QRIS yang ada", "Key never leaves existing QRIS chain"),
        ("App cek apakah Date.now() < expiry", "App checks if Date.now() < expiry"),
        ("Re-compute signature & bandingkan", "Re-compute signature & compare"),
        ("Match → lanjut. Tidak match → REJECT", "Match → proceed. Not match → REJECT"),
        ("Stiker palsu punya token lama (sudah expired)", "Fake sticker has old token (expired)"),
        ("Validasi timestamp gagal otomatis", "Timestamp validation fails automatically"),
        ("Transaksi ditolak sebelum dana keluar", "Transaction rejected before funds leave"),
        ("Alert real-time ke merchant & PJSP", "Real-time alert to merchant & PJSP"),
        ("Mengapa Dynamic Secure QRIS?", "Why Dynamic Secure QRIS?"),
        ("Bukan otoritas baru. Bukan infrastruktur baru. Hanya lapisan keamanan yang sudah lama seharusnya ada.", "Not a new authority. Not a new infrastructure. Just a security layer that should have been there all along."),
        ("Dalam Regulasi yang Ada", "Within Existing Regulations"),
        ("Key custody tetap di PJSP berlisensi Bank Indonesia. Tidak ada trust authority baru. Tidak ada perubahan regulasi yang dibutuhkan.", "Key custody remains with BI-licensed PJSP. No new trust authority. No regulatory changes needed."),
        ("Zero Upfront Cost", "Zero Upfront Cost"),
        ("Software-only. Tidak perlu EDC, tidak perlu mesin kasir berbayar. Cukup smartphone yang sudah dimiliki pedagang.", "Software-only. No EDC needed, no paid cashier machine needed. Just the smartphone the merchant already owns."),
        ("Tepat Sasaran", "Right on Target"),
        ("Dirancang untuk UMKM dan pedagang kaki lima — segmen yang paling banyak dirugikan spoofing, tapi paling sedikit dilindungi.", "Designed for MSMEs and street vendors — the segment most harmed by spoofing, but least protected."),
        ("Demo Hackathon — Simulasi End-to-End", "Hackathon Demo — End-to-End Simulation"),
        ("Buka dua tab: <strong>Merchant App</strong> generate QR → <strong>Scanner App</strong> scan → lihat validasi realtime", "Open two tabs: <strong>Merchant App</strong> generates QR → <strong>Scanner App</strong> scans → see realtime validation"),
        ("Buka Merchant App", "Open Merchant App"),
        ("Buka Scanner App", "Open Scanner App")
    ],
    "src/pages/MerchantDashboard.tsx": [
        ("Beranda", "Home"),
        ("Sembunyikan", "Hide"),
        ("Detail Teknis", "Technical Details"),
        ("Siap Menerima Pembayaran", "Ready to Receive Payment"),
        ("QR diperbarui otomatis dalam <strong style={{ color: 'white' }}>{seconds} detik</strong>", "QR updates automatically in <strong style={{ color: 'white' }}>{seconds} seconds</strong>"),
        ("Refresh sekarang", "Refresh now"),
        ("Token Kriptografis Aktif", "Active Cryptographic Token"),
        ("Diterbitkan", "Issued"),
        ("Kedaluwarsa", "Expires"),
        ("Total Refresh", "Total Refresh"),
        ("Token ini berisi signature SHA-256 dari <code className=\"font-mono\">merchantId|timestamp|nonce|SECRET_KEY</code>.", "This token contains SHA-256 signature of <code className=\"font-mono\">merchantId|timestamp|nonce|SECRET_KEY</code>."),
        ("QR statis palsu akan memiliki token yang sudah expired — transaksi otomatis ditolak.", "Fake static QR will have expired token — transaction automatically rejected.")
    ],
    "src/pages/ResultPage.tsx": [
        ("QR Code Kedaluwarsa", "QR Code Expired"),
        ("Kode QR ini sudah melewati masa berlakunya. Ini adalah tanda khas QR statis palsu yang dipasang oleh penipu. Token yang valid hanya berlaku 30 detik.", "This QR code has expired. This is a hallmark of a fake static QR placed by scammers. Valid tokens are only good for 30 seconds."),
        ("Tanda Tangan Digital Tidak Valid", "Invalid Digital Signature"),
        ("Signature kriptografis tidak cocok. QR Code ini kemungkinan telah dimanipulasi atau dibuat tanpa kunci PJSP yang sah.", "Cryptographic signature does not match. This QR Code has likely been manipulated or generated without a valid PJSP key."),
        ("Format QR Tidak Dikenal", "Unknown QR Format"),
        ("QR Code ini bukan token Dynamic Secure QRIS. Mungkin QR statis biasa atau QR tidak relevan.", "This QR Code is not a Dynamic Secure QRIS token. It might be a regular static QR or irrelevant."),
        ("Transaksi Ditolak", "Transaction Rejected"),
        ("QR Code tidak dapat divalidasi.", "QR Code could not be validated."),
        ("Pembayaran Diotorisasi", "Payment Authorized"),
        ("Token QR valid, tanda tangan terverifikasi", "QR Token valid, signature verified"),
        ("Transaksi diblokir untuk melindungi Anda", "Transaction blocked to protect you"),
        ("Total Pembayaran", "Total Payment"),
        ("Percobaan spoofing dicatat & dilaporkan.", "Spoofing attempt logged & reported."),
        ("Merchant (Klaim)", "Merchant (Claimed)"),
        ("Status Kedaluwarsa", "Expired Status"),
        ("Lewat {Math.round((scannedAt - expiry) / 1000)}s", "Past {Math.round((scannedAt - expiry) / 1000)}s"),
        ("Waktu Scan", "Scan Time"),
        ("Konfirmasi Pembayaran", "Confirm Payment"),
        ("Scan Lagi", "Scan Again"),
        ("Coba Scan Ulang", "Try Scanning Again"),
        ("Kembali ke Beranda", "Back to Home"),
        ("Keamanan QRIS", "QRIS Security"),
        ("Transaksi ini menggunakan Dynamic Secure QRIS. Tanda tangan digital telah diverifikasi oleh sistem pusat, memastikan keaslian merchant dan nominal tagihan.", "This transaction uses Dynamic Secure QRIS. Digital signature has been verified by central system, ensuring merchant authenticity and bill amount."),
        ("Peringatan Spoofing: Sistem kami mendeteksi anomali pada QR ini. Jangan lanjutkan pembayaran jika Anda mencurigai stiker QR palsu telah ditempel di atas QRIS asli.", "Spoofing Warning: Our system detected an anomaly in this QR. Do not proceed with payment if you suspect a fake QR sticker has been pasted over the original QRIS.")
    ]
}

def replace_in_file(filepath, rep_list):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found!")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old_str, new_str in rep_list:
        content = content.replace(old_str, new_str)
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Replaced strings in {filepath}")

for filepath, rep_list in replacements.items():
    replace_in_file(filepath, rep_list)

