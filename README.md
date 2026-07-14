# AjoKasir - Sistem POS & Manajemen Inventori (Multi-Store & Cloud Sync)

AjoKasir adalah aplikasi Point of Sale (POS) dan Manajemen Inventori berbasis web modern, ringan, responsif, dan kaya fitur. Aplikasi ini dirancang untuk mendukung manajemen jaringan toko kelontong atau ritel (Multi-Store) baik pada tingkat operasional cabang maupun tingkat pengawasan korporat secara *real-time*.

Aplikasi ini menggunakan arsitektur **Hybrid Cloud**, di mana data disinkronisasikan secara otomatis ke **Supabase (Cloud)** jika terhubung, dan memiliki fitur fallback otomatis ke **LocalStorage (Demo Mode)** jika kredensial Supabase tidak dikonfigurasi.

Repository GitHub: [https://github.com/RimuruTempestCkCK/ajokasir](https://github.com/RimuruTempestCkCK/ajokasir)

---

## 🚀 Fitur Utama

1. **Multi-Store Management & Super Admin Panel**:
   - Akun khusus **Super Admin** untuk memantau performa bisnis di semua cabang toko.
   - Manajemen Cabang Toko (Daftar Toko) dan Akun Pemilik (Kelola Owner).
   - Penjelajahan Detail Toko: Masuk ke cabang manapun langsung dari daftar toko untuk memantau inventori, transaksi, karyawan, dan setelan toko tersebut secara terisolasi.
2. **Dashboard Visual Profesional Per Aktor**:
   - **Super Admin**: Grafik kontribusi omzet antar cabang toko dan statistik pertumbuhan mitra.
   - **Owner**: Grafik penjualan 7 hari terakhir, distribusi kategori terlaris, dan grafik jam sibuk toko (*peak hours*).
   - **Kasir**: Progress pencapaian target harian kasir dan rasio metode pembayaran (Tunai vs QRIS).
   - **Gudang**: Grafik alokasi kesehatan stok barang (Aman, Kritis, Kosong) dan grafik status pengiriman Purchase Order (PO).
3. **Role-Based Access Control (RBAC)**: Pembatasan hak akses menu berdasarkan peran pengguna (**Super Admin, Owner, Kasir, Gudang**).
4. **Kasir POS (Point of Sale)**:
   - Pencarian barang dinamis & support barcode scanner (menggunakan input barcode khusus).
   - Perhitungan diskon dan pajak (PPN) otomatis.
   - Pilihan metode pembayaran yang variatif: Tunai (Cash), QRIS, dan Transfer Bank.
   - Cetak struk belanja (Receipt) dalam format thermal printer 80mm.
5. **Manajemen Inventori (Master Barang)**:
   - Pengelolaan data barang, kategori barang, supplier, dan pelanggan.
   - Warning/alarm otomatis jika stok barang hampir habis (mencapai batas minimum stok).
   - Log histori mutasi stok (Barang Masuk, Barang Keluar, Penjualan, Purchase Order).
6. **Stock Opname & Purchase Order (PO)**:
   - Penyesuaian stok fisik gudang dengan stok sistem disertai catatan alasan.
   - Alur penerimaan barang PO secara bertahap (Pending -> Received) yang otomatis menambahkan stok barang ketika diterima.
7. **Laporan Bisnis & Keuangan (Owner & Super Admin)**:
   - Laporan Laba Rugi Bersih (setelah dipotong COGS/harga pokok dan pajak) dan Nilai Aset Inventori Gudang saat ini.

---

## 👥 Hak Akses Pengguna (RBAC)

| Menu / Halaman | Super Admin | Owner | Kasir | Gudang | Keterangan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | Tampilan grafik & chart disesuaikan per peran |
| **Daftar Toko** | ✅ | ❌ | ❌ | ❌ | Mengelola pendaftaran & masuk ke detail toko cabang |
| **Kelola Owner** | ✅ | ❌ | ❌ | ❌ | Registrasi akun owner toko cabang |
| **Kasir POS** | ❌ | ✅ | ✅ | 👁️ | Super Admin & Gudang tidak memiliki akses transaksi |
| **Master Barang** | 👁️ (Detail) | ✅ | 👁️ | ✅ | Kasir hanya bisa melihat daftar & harga barang |
| **Kategori Barang**| 👁️ (Detail) | ✅ | ❌ | ✅ | Kasir tidak memiliki akses |
| **Data Supplier** | 👁️ (Detail) | ✅ | ❌ | ✅ | Mengelola database supplier barang |
| **Data Pelanggan** | 👁️ (Detail) | ✅ | ✅ | ❌ | Terintegrasi dengan diskon member POS |
| **Purchase Order** | 👁️ (Detail) | ✅ | ❌ | ✅ | Gudang membuat PO, Owner memberi approval |
| **Histori Stok** | 👁️ (Detail) | ✅ | 👁️ | ✅ | Melacak riwayat mutasi stok |
| **Laporan Keuangan**| 👁️ (Detail) | ✅ | Terbatas| Terbatas| Owner melihat Laba Rugi & Aset |
| **Kelola Karyawan** | ✅ (Detail) | ✅ | ❌ | ❌ | Mengelola akun karyawan (Kasir/Gudang) per cabang |
| **Pengaturan Toko** | ✅ (Detail) | ✅ | ❌ | ❌ | Mengatur Nama Toko, Alamat, dan Pajak |
| **Profil Saya** | ✅ | ✅ | ✅ | ✅ | Mengubah sandi & profil personal |

*Catatan: **✅ (Detail)** berarti Super Admin dapat mengakses dan mengelola data tersebut dengan cara masuk ke detail toko terpilih di halaman **Daftar Toko**.*

---

## 💻 Akun Pengujian Default (Seeding Data)

Di dalam file database seeding, terdapat **2 cabang toko** (*AjoKasir Mart* di Padang dan *Ajo Minang Swalayan* di Bukittinggi) serta **7 akun default** untuk mempermudah pengujian. Password disamakan dengan alamat email masing-masing:

| Akun Pengguna | Email | Password | Asosiasi Toko |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@ajokasir.com` | `superadmin@ajokasir.com` | Global (Semua Toko) |
| **Owner Toko 1** | `owner@ajokasir.com` | `owner@ajokasir.com` | Toko 1 (Padang) |
| **Kasir Toko 1** | `kasir@ajokasir.com` | `kasir@ajokasir.com` | Toko 1 (Padang) |
| **Staf Gudang Toko 1** | `gudang@ajokasir.com` | `gudang@ajokasir.com` | Toko 1 (Padang) |
| **Owner Toko 2** | `owner2@ajokasir.com` | `owner2@ajokasir.com` | Toko 2 (Bukittinggi) |
| **Kasir Toko 2** | `kasir2@ajokasir.com` | `kasir2@ajokasir.com` | Toko 2 (Bukittinggi) |
| **Staf Gudang Toko 2** | `gudang2@ajokasir.com` | `gudang2@ajokasir.com` | Toko 2 (Bukittinggi) |

---

## 📂 Arsitektur Kode Utama

- **`src/layouts/AppLayout.tsx`**: Layout shell aplikasi (Sidebar & Hamburger Drawer responsif).
- **`src/components/dashboard/`**:
  - `SuperAdminDashboard.tsx`: Dashboard analisis grafik kontribusi omzet korporat.
  - `OwnerDashboard.tsx`: Dashboard finansial, kategori produk terlaris, dan grafik jam sibuk toko.
  - `KasirDashboard.tsx`: Dashboard target penjualan harian dan metode pembayaran.
  - `GudangDashboard.tsx`: Dashboard kesehatan stok barang dan status pengapalan PO.
- **`src/pages/StoreDetail.tsx`**: Halaman multi-tab yang membungkus semua detail data operasional toko cabang untuk diinspeksi oleh Super Admin.
- **`src/db.ts`**: Database Adapter (Menyediakan API integrasi LocalStorage/Supabase PostgreSQL).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite (Build Tool), Lucide React (Icons).
- **Styling**: Vanilla CSS (Responsive Grid, Cards, & Sidebar Drawer Layout).
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
- Tabel database, trigger sinkronisasi otomatis stok, serta trigger pembaruan profil pengguna (`auth.users`).
- RLS Policies aman yang mencegah kebocoran data antar cabang toko, serta fungsi `public.get_user_role` bypass dengan mode security definer.

### 2. Nonaktifkan Konfirmasi Email (Sangat Penting)
Supaya Anda bisa mendaftarkan akun karyawan (Kasir & Gudang) menggunakan email dummy langsung dari aplikasi tanpa perlu melakukan verifikasi tautan email:
1. Masuk ke **Supabase Dashboard > Authentication > Providers > Email**.
2. Matikan sakelar **Confirm email** menjadi **OFF**.
3. Klik **Save**.
