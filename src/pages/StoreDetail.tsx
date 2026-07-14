import React, { useState } from 'react';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { Barang } from './Barang';
import { Kategori } from './Kategori';
import { SupplierPage } from './Supplier';
import { PelangganPage } from './Pelanggan';
import { Riwayat } from './Riwayat';
import { Pembelian } from './Pembelian';
import { Stok } from './Stok';
import { Laporan } from './Laporan';
import { Pengguna } from './Pengguna';
import { SettingsPage } from './Settings';

import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Truck, 
  Users, 
  History, 
  ClipboardList, 
  BarChart3, 
  UserCog, 
  Settings as SettingsIcon 
} from 'lucide-react';

interface StoreDetailPageProps {
  userRole: 'super_admin' | 'owner' | 'kasir' | 'gudang';
  selectedStoreId: string | null;
}

export const StoreDetailPage: React.FC<StoreDetailPageProps> = ({ userRole, selectedStoreId }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'barang' | 'kategori' | 'supplier' | 'pelanggan' | 'riwayat' | 'pembelian' | 'stok' | 'laporan' | 'pengguna' | 'settings'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'barang', label: 'Barang', icon: <Package size={16} /> },
    { id: 'kategori', label: 'Kategori', icon: <Layers size={16} /> },
    { id: 'supplier', label: 'Supplier', icon: <Truck size={16} /> },
    { id: 'pelanggan', label: 'Pelanggan', icon: <Users size={16} /> },
    { id: 'riwayat', label: 'Transaksi', icon: <History size={16} /> },
    { id: 'pembelian', label: 'Pembelian PO', icon: <Truck size={16} /> },
    { id: 'stok', label: 'Stok Log', icon: <ClipboardList size={16} /> },
    { id: 'laporan', label: 'Laporan', icon: <BarChart3 size={16} /> },
    { id: 'pengguna', label: 'Karyawan', icon: <UserCog size={16} /> },
    { id: 'settings', label: 'Setelan', icon: <SettingsIcon size={16} /> },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OwnerDashboard onNavigate={(page) => {
          // If dashboard triggers navigation to pages, map them to tabs
          if (page === 'stok') setActiveTab('stok');
          else if (page === 'penjualan') alert('Super Admin tidak memiliki akses POS Kasir.');
          else if (page === 'barang') setActiveTab('barang');
          else if (page === 'laporan') setActiveTab('laporan');
          else if (page === 'riwayat') setActiveTab('riwayat');
        }} />;
      case 'barang':
        return <Barang userRole={userRole} />;
      case 'kategori':
        return <Kategori userRole={userRole} />;
      case 'supplier':
        return <SupplierPage userRole={userRole} />;
      case 'pelanggan':
        return <PelangganPage userRole={userRole} />;
      case 'riwayat':
        return <Riwayat userRole={userRole} />;
      case 'pembelian':
        // For PO creation/reception, we can pass null for currentUser since Super Admin is not a store employee
        return <Pembelian userRole={userRole} currentUser={null} />;
      case 'stok':
        return <Stok userRole={userRole} />;
      case 'laporan':
        return <Laporan userRole={userRole} />;
      case 'pengguna':
        return <Pengguna userRole={userRole} />;
      case 'settings':
        // Pass 'owner' to settings page to allow Super Admin editing store settings context
        return <SettingsPage userRole="owner" />;
      default:
        return <OwnerDashboard onNavigate={() => {}} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TABS NAVIGATION */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        overflowX: 'auto', 
        borderBottom: '1px solid var(--hairline-soft)', 
        paddingBottom: '10px',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none' // Firefox
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`chip ${activeTab === tab.id ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 12px' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TAB */}
      <div style={{ marginTop: '10px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};
