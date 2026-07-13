import React, { useState, useEffect } from 'react';
import { db, isDemoMode, Profile, Settings } from './db';
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
import logo from './assets/logo.png';
import { showConfirm } from './utils/swal';

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Truck,
  Users,
  History,
  ClipboardList,
  BarChart3,
  UserCog,
  Settings as SettingsIcon,
  User,
  LogOut,
  Store,
  Database,
  CloudLightning,
  Menu,
  X
} from 'lucide-react';

function App() {
  const [user, setUser] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checkUserSession = async () => {
    try {
      const sessionUser = await db.getCurrentUser();
      setUser(sessionUser);
      if (sessionUser) {
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

    // Proteksi Keamanan Frontend (Anti Maling Source Code / Gambar)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      // Mencegah penyeretan gambar (drag-and-drop) ke luar browser/desktop
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Mencegah F12 (Inspect Element)
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Mencegah Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J (Developer Tools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
      }
      // Mencegah Ctrl+U (Melihat Source Code Mentah)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
      // Mencegah Ctrl+S (Menyimpan Halaman Web secara lokal)
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLoginSuccess = async () => {
    setLoading(true);
    await checkUserSession();
  };

  const handleLogout = async () => {
    const result = await showConfirm(
      'Keluar dari Aplikasi?',
      'Apakah Anda yakin ingin keluar dari sesi AjoKasir saat ini?',
      'Ya, Keluar',
      'Batal'
    );
    if (result.isConfirmed) {
      await db.logout();
      setUser(null);
      setActivePage('dashboard');
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

  // Define sidebar menu options based on role
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['owner', 'kasir', 'gudang'] },
    { id: 'penjualan', label: 'Kasir POS', icon: <ShoppingBag size={18} />, roles: ['owner', 'kasir'] },
    { id: 'barang', label: 'Master Barang', icon: <Package size={18} />, roles: ['owner', 'kasir', 'gudang'] },
    { id: 'kategori', label: 'Kategori Barang', icon: <Layers size={18} />, roles: ['owner', 'gudang'] },
    { id: 'supplier', label: 'Data Supplier', icon: <Truck size={18} />, roles: ['owner', 'gudang'] },
    { id: 'pelanggan', label: 'Data Pelanggan', icon: <Users size={18} />, roles: ['owner', 'kasir'] },
    { id: 'riwayat', label: 'Riwayat Transaksi', icon: <History size={18} />, roles: ['owner', 'kasir', 'gudang'] },
    { id: 'pembelian', label: 'Pembelian PO', icon: <Truck size={18} />, roles: ['owner', 'gudang'] },
    { id: 'stok', label: 'Histori Stok', icon: <ClipboardList size={18} />, roles: ['owner', 'kasir', 'gudang'] },
    { id: 'laporan', label: 'Laporan Keuangan', icon: <BarChart3 size={18} />, roles: ['owner', 'kasir', 'gudang'] },
    { id: 'pengguna', label: 'Kelola Karyawan', icon: <UserCog size={18} />, roles: ['owner'] },
    { id: 'settings', label: 'Pengaturan Toko', icon: <SettingsIcon size={18} />, roles: ['owner'] },
    { id: 'profil', label: 'Profil Saya', icon: <User size={18} />, roles: ['owner', 'kasir', 'gudang'] },
  ];

  const activeMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  // Render current view
  const renderView = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard userRole={user.role} onNavigate={setActivePage} />;
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
        return <Dashboard userRole={user.role} onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-container">
      
      {/* SIDEBAR BACKDROP OVERLAY FOR MOBILE */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="sidebar-logo">
            <img 
              src={logo} 
              alt="AjoKasir Logo" 
              style={{
                height: '42px',
                width: 'auto',
                objectFit: 'contain',
                userSelect: 'none',
                pointerEvents: 'none'
              }} 
            />
          </div>
          <button 
            className="mobile-close-btn" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {activeMenuItems.map(item => (
            <a
              key={item.id}
              className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => {
                setActivePage(item.id);
                setSidebarOpen(false); // Close sidebar on mobile after clicking
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-card">
            <div className="user-avatar">
              {user.full_name[0]?.toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.full_name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', gap: '8px' }} onClick={handleLogout}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR HEADER */}
      <header className="mobile-header">
        <button 
          className="btn btn-icon" 
          onClick={() => setSidebarOpen(true)}
          style={{ width: '40px', height: '40px', backgroundColor: 'transparent' }}
        >
          <Menu size={24} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src={logo} 
            alt="AjoKasir Logo" 
            style={{
              height: '28px',
              width: 'auto',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none'
            }} 
          />
        </div>
        
        <div style={{ width: '40px' }}></div> {/* Spacer for balance */}
      </header>

      {/* MAIN CONTAINER */}
      <main className="main-content">
        {/* HYBRID CLOUD CLUSTER STATUS BANNER */}
        {isDemoMode ? (
          <div className="demo-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} />
              <span>Running in <strong>Demo Mode (Local Storage)</strong>.</span>
            </div>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>
              Config `.env` (VITE_SUPABASE_URL & ANON_KEY) to activate cloud sync.
            </span>
          </div>
        ) : (
          <div className="demo-banner" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CloudLightning size={16} color="#059669" />
              <span>Cloud Connected to <strong>Supabase</strong>.</span>
            </div>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>
              Real-time database active.
            </span>
          </div>
        )}

        {/* Top bar */}
        <header className="top-navbar">
          <div>
            <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>
              {settings?.shop_name || 'AjoKasir Mart'}
            </strong>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--mute)' }}>
            {settings?.shop_address || 'Jl. Khatib Sulaiman No. 12'}
          </div>
        </header>

        {/* Active Page view render */}
        <div className="page-container">
          {renderView()}
        </div>
      </main>

    </div>
  );
}

export default App;
