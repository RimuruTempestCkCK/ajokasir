# AjoKasir - Sistem POS & Manajemen Inventori

AjoKasir adalah aplikasi Point of Sale (POS) dan Manajemen Inventori berbasis web modern, ringan, dan responsif. Aplikasi ini dirancang untuk membantu pemilik usaha (UMKM) dalam mengelola proses penjualan kasir, pembelian ke supplier, penyesuaian stok barang, serta pemantauan laporan keuangan bisnis secara *real-time*.

Aplikasi ini menggunakan arsitektur **Hybrid Cloud**, di mana data disinkronisasikan secara otomatis ke **Supabase (Cloud)** jika terhubung, dan memiliki fitur fallback otomatis ke **LocalStorage (Demo Mode)** jika kredensial Supabase tidak dikonfigurasi.

Repository GitHub: [https://github.com/RimuruTempestCkCK/ajokasir](https://github.com/RimuruTempestCkCK/ajokasir)

---

## 🚀 Fitur Utama

1. **Role-Based Access Control (RBAC)**: Pembatasan hak akses menu berdasarkan peran pengguna (**Owner, Kasir, Gudang**).
2. **Kasir POS (Point of Sale)**:
   - Pencarian barang dinamis & support barcode scanner (menggunakan input barcode khusus).
   - Perhitungan diskon dan pajak (PPN) otomatis.
   - Pilihan metode pembayaran yang variatif: Tunai (Cash), QRIS, dan Transfer Bank.
   - Cetak struk belanja (Receipt) dalam format thermal printer 80mm.
   - Layangan ramah mobile dengan sistem tab navigasi produk vs keranjang.
3. **Manajemen Inventori (Master Barang)**:
   - Pengelolaan data barang, kategori barang, supplier, dan pelanggan.
   - Warning/alarm otomatis jika stok barang hampir habis (mencapai batas minimum stok).
   - Log histori mutasi stok (Barang Masuk, Barang Keluar, Penjualan, Purchase Order).
4. **Stock Opname**:
   - Penyesuaian stok fisik gudang dengan stok sistem disertai catatan alasan.
5. **Purchase Order (PO) Supplier**:
   - Pembuatan PO belanja barang ke supplier.
   - Alur penerimaan barang PO secara bertahap (Pending -> Received) yang otomatis menambahkan stok barang bersangkutan ketika diterima.
6. **Laporan Bisnis & Keuangan (Owner)**:
   - Laporan Penjualan (Harian, Bulanan, Tahunan).
   - Laporan Laba Rugi Bersih (setelah dipotong COGS/harga pokok dan pajak).
   - Laporan 10 Barang Terlaris.
   - Laporan Nilai Aset Inventori Gudang saat ini.

---

## 👥 Hak Akses Pengguna (RBAC)

| Menu / Halaman | Owner | Kasir | Gudang | Keterangan |
| :--- | :---: | :---: | :---: | :--- |
| **Dashboard** | ✅ | ✅ | ✅ | Tampilan disesuaikan dengan peran |
| **Kasir POS** | ✅ | ✅ | 👁️ | Gudang hanya bisa melihat menu produk |
| **Master Barang** | ✅ | 👁️ | ✅ | Kasir hanya bisa melihat daftar & harga |
| **Kategori Barang**| ✅ | ❌ | 👁️ | Kasir tidak memiliki akses |
| **Data Supplier** | ✅ | ❌ | ✅ | Mengelola database supplier barang |
| **Data Pelanggan** | ✅ | ✅ | ❌ | Terintegrasi dengan diskon member POS |
| **Purchase Order** | ✅ | ❌ | ✅ | Gudang membuat PO, Owner memberi approval |
| **Histori Stok** | ✅ | 👁️ | ✅ | Melacak riwayat mutasi stok |
| **Laporan Keuangan**| ✅ | Terbatas| Terbatas| Owner melihat Laba Rugi & Aset |
| **Kelola Karyawan** | ✅ | ❌ | ❌ | Hanya Owner yang bisa menambah akun staff |
| **Pengaturan Toko** | ✅ | ❌ | ❌ | Mengatur Nama Toko, Alamat, dan Pajak |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite (Build Tool), Lucide React (Icons).
- **Styling**: Custom CSS (Responsive Grid & Drawer Layout).
- **Backend & Database**: Supabase (PostgreSQL, GoTrue Auth, Row Level Security).

---

## 💻 Panduan Instalasi Lokal

### 1. Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di komputer Anda (Disarankan versi LTS / v20+).

### 2. Kloning Repository
```bash
git clone https://github.com/RimuruTempestCkCK/ajokasir.git
cd ajokasir
```

### 3. Instalasi Dependency
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env` di direktori utama proyek:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Menjalankan Proyek secara Lokal
```bash
npm run dev
```
Aplikasi akan berjalan di alamat `http://localhost:5173`.

---

## 🗄️ Konfigurasi Supabase (Database & Auth)

Untuk menghubungkan aplikasi ini ke Supabase secara utuh, ikuti konfigurasi database berikut:

### 1. Inisialisasi Tabel
Buka **Supabase Dashboard > SQL Editor**, buat **New Query**, tempel seluruh kode dari berkas [`supabase_setup.sql`](supabase_setup.sql) yang ada di folder root proyek ini, kemudian klik **Run**.
Ini akan membuat:
- Tabel `profiles`, `categories`, `products`, `suppliers`, `customers`, `transactions`, `transaction_items`, `purchases`, `purchase_items`, `stock_logs`, dan `settings`.
- Triggers otomatis untuk penyesuaian stok (penjualan memotong stok, retur/pembatalan mengembalikan stok, dan penerimaan PO menambahkan stok).

### 2. Nonaktifkan Konfirmasi Email (Sangat Penting)
Supaya Anda bisa mendaftarkan akun karyawan (Kasir & Gudang) menggunakan email dummy (seperti `kasir@ajokasir.com`) langsung dari aplikasi tanpa perlu melakukan verifikasi tautan email:
1. Masuk ke **Supabase Dashboard > Authentication > Sign In / Providers**.
2. Klik provider **Email**.
3. Matikan sakelar **Confirm email** menjadi **OFF**.
4. Klik **Save**.

### 3. Catatan Penting untuk Mengatasi Error Login 500
Jika Anda mendapati error status `500` (`"Database error querying schema"`) saat mencoba login dengan akun kasir/gudang yang baru dibuat, itu terjadi karena adanya kolom bernilai `NULL` di tabel bawaan `auth.users`. 

Atasi dengan menjalankan query SQL ini sekali di **SQL Editor** Supabase:
```sql
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  recovery_token = COALESCE(recovery_token, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  email_change_token_current = COALESCE(email_change_token_current, '');
```

---

## 📄 Lisensi

Proyek ini dibangun untuk tujuan membantu operasional toko kelontong dan manajemen usaha mikro. Anda bebas memodifikasi dan membagikannya kembali.
