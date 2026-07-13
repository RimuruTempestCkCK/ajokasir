Gambaran Sistem

AjoKasir adalah aplikasi Point of Sale (POS) berbasis web yang membantu usaha dalam mengelola proses penjualan, pembelian, persediaan barang, serta laporan bisnis. Sistem dapat diakses oleh tiga jenis pengguna, yaitu:

Kasir
Gudang
Owner

Masing-masing pengguna memiliki hak akses yang berbeda sesuai tugasnya.

1. Aktor Sistem
Aktor	Deskripsi
Owner	Mengelola seluruh data dan memantau perkembangan bisnis.
Kasir	Melayani transaksi penjualan kepada pelanggan.
Gudang	Mengelola stok barang dan pembelian dari supplier.
2. Kebutuhan Fungsional
A. Login

Semua pengguna dapat:

Login
Logout
Mengubah password
Melihat profil
B. Owner

Owner dapat mengelola seluruh sistem.

Dashboard
Melihat total penjualan
Melihat omzet
Melihat laba
Melihat stok hampir habis
Melihat grafik penjualan
Melihat transaksi terbaru
Master Data

Owner dapat:

CRUD Barang
CRUD Kategori
CRUD Supplier
CRUD Pelanggan
CRUD Pengguna
Mengatur Role
Transaksi

Owner dapat:

Melihat seluruh transaksi
Membatalkan transaksi
Melakukan retur
Melihat histori transaksi
Pembelian

Owner dapat:

Melihat pembelian
Menambah pembelian
Approve pembelian
Laporan

Owner dapat melihat:

Laporan Penjualan Harian
Laporan Bulanan
Laporan Tahunan
Laporan Barang Terlaris
Laporan Stok
Laporan Laba Rugi
Laporan Pembelian
Pengaturan

Owner dapat:

Mengubah profil toko
Mengatur pajak
Backup database (opsional)
Mengatur printer
C. Kasir

Kasir fokus pada penjualan.

Dashboard

Kasir dapat melihat:

Total transaksi hari ini
Pendapatan hari ini
Jumlah transaksi
Penjualan

Kasir dapat:

Scan barcode
Cari barang
Tambah ke keranjang
Mengubah jumlah barang
Menghapus barang
Menggunakan diskon
Menggunakan voucher (opsional)
Memilih metode pembayaran
Cetak struk
Riwayat

Kasir dapat:

Melihat transaksi sendiri
Cetak ulang struk
Profil

Kasir dapat:

Mengubah password
D. Gudang

Gudang fokus pada persediaan.

Barang

Gudang dapat:

Menambah barang
Mengubah barang
Menghapus barang
Mengatur stok minimum
Stok

Gudang dapat:

Barang masuk
Barang keluar
Penyesuaian stok (Stock Opname)
Melihat histori stok
Supplier

Gudang dapat:

Melihat supplier
Menambah supplier
Pembelian

Gudang dapat:

Membuat Purchase Order
Menerima barang
Menginput barang masuk
Laporan

Gudang dapat melihat:

Laporan stok
Barang hampir habis
Barang masuk
Barang keluar
3. Hak Akses
Menu	Owner	Kasir	Gudang
Dashboard	✅	✅	✅
Barang	✅	👁️	✅
Kategori	✅	❌	👁️
Supplier	✅	❌	✅
Pelanggan	✅	✅	❌
Penjualan	✅	✅	👁️
Pembelian	✅	❌	✅
Stok	✅	👁️	✅
Laporan	✅	Terbatas	Terbatas
Pengguna	✅	❌	❌
Pengaturan	✅	❌	❌

Keterangan:

✅ = Kelola (CRUD)
👁️ = Hanya melihat
❌ = Tidak memiliki akses
4. Kebutuhan Non-Fungsional
Perangkat Lunak
Browser (Chrome, Edge, Firefox)
Internet
Supabase
Vercel
Keamanan
Login menggunakan Email/Username
Password terenkripsi
Role Based Access Control (RBAC)
Session Login
Performa
Dashboard dimuat kurang dari 3 detik
Pencarian barang cepat
Mendukung ribuan data barang
Backup
Data tersimpan di Supabase
Backup berkala (manual atau otomatis)
5. Modul Utama Aplikasi
Login
Dashboard
Master Barang
Kategori
Supplier
Pelanggan
Penjualan
Pembelian
Stok
Stock Opname
Laporan
Manajemen Pengguna
Profil
Pengaturan