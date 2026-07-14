import React from 'react';
import { 
  Store as StoreIcon, 
  Menu, 
  X, 
  LogOut, 
  Database, 
  CloudLightning,
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
  UserCheck
} from 'lucide-react';
import { Store, Profile, isDemoMode } from '../db';

interface AppLayoutProps {
  user: Profile;
  stores: Store[];
  selectedStoreId: string | null;
  settings: any;
  activePage: string;
  setActivePage: (page: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  handleStoreChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleStoreSelect: (storeId: string) => void;
  handleLogout: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  user,
  stores,
  selectedStoreId,
  settings,
  activePage,
  setActivePage,
  isSidebarOpen,
  setIsSidebarOpen,
  handleStoreChange,
  handleStoreSelect,
  handleLogout,
  children
}) => {

  // Define sidebar menu options based on role (POS, Employee, Settings restricted for Super Admin)
  const menuItems = [
    // Shared Pages (Dashboard at the top)
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['super_admin', 'owner', 'kasir', 'gudang'] },

    // Super Admin Specific Pages
    { id: 'stores', label: 'Daftar Toko', icon: <StoreIcon size={18} />, roles: ['super_admin'] },
    { id: 'owners', label: 'Kelola Owner', icon: <Users size={18} />, roles: ['super_admin'] },
    
    // Store Member & Shared Pages
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
    { id: 'profil', label: 'Profil Saya', icon: <User size={18} />, roles: ['super_admin', 'owner', 'kasir', 'gudang'] },
  ];

  const activeMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const handleSidebarItemClick = (pageId: string) => {
    setActivePage(pageId);
    setIsSidebarOpen(false); // Close sidebar drawer on mobile
  };

  return (
    <div className="app-container">
      
      {/* MOBILE HEADER */}
      <header className="mobile-header">
        <button className="btn btn-icon" onClick={() => setIsSidebarOpen(true)} style={{ width: '40px', height: '40px' }}>
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--ink)' }}>
          <StoreIcon size={18} color="var(--primary)" />
          <span>{settings?.shop_name || 'AjoKasir'}</span>
        </div>
        <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '13px' }} onClick={() => handleSidebarItemClick('profil')}>
          {user.full_name ? user.full_name[0]?.toUpperCase() : 'U'}
        </div>
      </header>

      {/* DRAWER BACKDROP */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="sidebar-logo">
            <StoreIcon size={22} />
            <span>AjoKasir</span>
          </div>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {activeMenuItems.map(item => (
            <a
              key={item.id}
              className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleSidebarItemClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-card">
            <div className="user-avatar">
              {user.full_name ? user.full_name[0]?.toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user.full_name}</div>
              <div className="user-role" style={{ textTransform: 'capitalize' }}>
                {user.role === 'super_admin' ? 'Super Admin' : user.role}
              </div>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', gap: '8px' }} onClick={handleLogout}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main-content">
        {/* HYBRID CLOUD CLUSTER STATUS BANNER */}
        {isDemoMode ? (
          <div className="demo-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Database size={16} />
              <span>Running in <strong>Demo Mode (Local Storage)</strong>.</span>
            </div>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>
              Config `.env` (VITE_SUPABASE_URL & ANON_KEY) to activate cloud sync.
            </span>
          </div>
        ) : (
          <div className="demo-banner" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
            {user.role === 'super_admin' ? (
              <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>
                {activePage === 'store-detail' ? `${settings?.shop_name || 'Detail Toko'}` : 'Super Admin Corporate'}
              </strong>
            ) : (
              <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>
                {settings?.shop_name || 'AjoKasir Mart'}
              </strong>
            )}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--mute)', textAlign: 'right' }}>
            {user.role === 'super_admin' ? (
              <span className="badge badge-error" style={{ fontSize: '11px' }}>Super Admin Mode</span>
            ) : (
              settings?.shop_address || 'Jl. Khatib Sulaiman No. 12'
            )}
          </div>
        </header>

        {/* Active Page view render */}
        <div className="page-container">
          {children}
        </div>
      </main>

    </div>
  );
};
