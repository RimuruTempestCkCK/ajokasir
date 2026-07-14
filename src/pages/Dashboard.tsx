import React from 'react';
import { SuperAdminDashboard } from '../components/dashboard/SuperAdminDashboard';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { KasirDashboard } from '../components/dashboard/KasirDashboard';
import { GudangDashboard } from '../components/dashboard/GudangDashboard';

interface DashboardProps {
  userRole: 'super_admin' | 'owner' | 'kasir' | 'gudang';
  onNavigate: (page: string) => void;
  selectedStoreId: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole, onNavigate, selectedStoreId }) => {
  switch (userRole) {
    case 'super_admin':
      return <SuperAdminDashboard onNavigate={onNavigate} selectedStoreId={selectedStoreId} />;
    case 'owner':
      return <OwnerDashboard onNavigate={onNavigate} />;
    case 'kasir':
      return <KasirDashboard onNavigate={onNavigate} />;
    case 'gudang':
      return <GudangDashboard onNavigate={onNavigate} />;
    default:
      return (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--error)' }}>
          <h2>Akses Ditolak</h2>
          <p style={{ marginTop: '8px', color: 'var(--mute)' }}>Peran Pengguna tidak memiliki akses dashboard.</p>
        </div>
      );
  }
};
