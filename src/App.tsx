import React, { useState, useEffect } from 'react';
import { db, Profile, Settings, Store } from './db';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Barang } from './pages/Barang';
import { Kategori } from './pages/Kategori';
import { SupplierPage } from './pages/Supplier';
import { PelangganPage } from './pages/Pelanggan';
import { Penjualan } from './pages/Penjualan';
import { Riwayat } from './pages/Riwayat';
import { Pembelian } from './pages/Pembelian';
import { Stok } from './pages/Stok';
import { Laporan } from './pages/Laporan';
import { Pengguna } from './pages/Pengguna';
import { SettingsPage } from './pages/Settings';
import { Profil } from './pages/Profil';
import { StoresPage } from './pages/Stores';
import { OwnersPage } from './pages/Owners';
import { AppLayout } from './layouts/AppLayout';
import { StoreDetailPage } from './pages/StoreDetail';

function App() {
  const [user, setUser] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Super Admin Store switching states
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const checkUserSession = async () => {
    try {
      const sessionUser = await db.getCurrentUser();
      setUser(sessionUser);
      if (sessionUser) {
        if (sessionUser.role === 'super_admin') {
          const storeList = await db.getStores();
          setStores(storeList);
          const currentStoreId = db.getStoreId();
          setSelectedStoreId(currentStoreId);
        }
        const storeSettings = await db.getSettings();
        setSettings(storeSettings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const handleLoginSuccess = async () => {
    setLoading(true);
    await checkUserSession();
  };

  const handleLogout = async () => {
    if (window.confirm('Keluar dari aplikasi AjoKasir?')) {
      await db.logout();
      setUser(null);
      setSelectedStoreId(null);
      setStores([]);
      setActivePage('dashboard');
      setIsSidebarOpen(false);
    }
  };

  const handleStoreChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = e.target.value;
    db.setStoreId(storeId);
    setSelectedStoreId(storeId);
    setLoading(true);
    try {
      const storeSettings = await db.getSettings();
      setSettings(storeSettings);
      setActivePage('dashboard');
    } catch (err) {
      console.error('Gagal memuat pengaturan toko:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = async (storeId: string) => {
    db.setStoreId(storeId);
    setSelectedStoreId(storeId);
    setLoading(true);
    try {
      const storeSettings = await db.getSettings();
      setSettings(storeSettings);
      setActivePage('store-detail');
    } catch (err) {
      console.error('Gagal memuat detail toko:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--surface-soft)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Memuat AjoKasir...</h2>
          <div className="user-avatar" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }}>A</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render current view
  const renderView = () => {
    switch (activePage) {
      case 'stores':
        return <StoresPage userRole={user.role} onSelectStore={handleStoreSelect} />;
      case 'owners':
        return <OwnersPage userRole={user.role} />;
      case 'store-detail':
        return <StoreDetailPage userRole={user.role} selectedStoreId={selectedStoreId} />;
      case 'dashboard':
        return <Dashboard userRole={user.role} onNavigate={setActivePage} selectedStoreId={selectedStoreId} />;
      case 'barang':
        return <Barang userRole={user.role} />;
      case 'kategori':
        return <Kategori userRole={user.role} />;
      case 'supplier':
        return <SupplierPage userRole={user.role} />;
      case 'pelanggan':
        return <PelangganPage userRole={user.role} />;
      case 'penjualan':
        return <Penjualan userRole={user.role} currentUser={user} />;
      case 'riwayat':
        return <Riwayat userRole={user.role} />;
      case 'pembelian':
        return <Pembelian userRole={user.role} currentUser={user} />;
      case 'stok':
        return <Stok userRole={user.role} />;
      case 'laporan':
        return <Laporan userRole={user.role} />;
      case 'pengguna':
        return <Pengguna userRole={user.role} />;
      case 'settings':
        return <SettingsPage userRole={user.role} />;
      case 'profil':
        return <Profil currentUser={user} />;
      default:
        return <Dashboard userRole={user.role} onNavigate={setActivePage} selectedStoreId={selectedStoreId} />;
    }
  };

  return (
    <AppLayout
      user={user}
      stores={stores}
      selectedStoreId={selectedStoreId}
      settings={settings}
      activePage={activePage}
      setActivePage={setActivePage}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      handleStoreChange={handleStoreChange}
      handleStoreSelect={handleStoreSelect}
      handleLogout={handleLogout}
    >
      {renderView()}
    </AppLayout>
  );
}

export default App;
