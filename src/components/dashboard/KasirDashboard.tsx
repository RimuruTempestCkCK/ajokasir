import React, { useState, useEffect } from 'react';
import { db, Transaction, Profile } from '../../db';
import { ShoppingBag, TrendingUp, ShoppingCart, ArrowRight, Target, CreditCard } from 'lucide-react';

interface KasirDashboardProps {
  onNavigate: (page: string) => void;
}

export const KasirDashboard: React.FC<KasirDashboardProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment distribution stats
  const [paymentStats, setPaymentStats] = useState({ cash: 0, qris: 0, transfer: 0 });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const user = await db.getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          const txs = await db.getTransactions();
          const myTxs = txs.filter(t => t.cashier_id === user.id);
          setTransactions(myTxs);

          // Calculate payment splits
          const completedMyTxs = myTxs.filter(t => t.status === 'completed');
          const totalCount = completedMyTxs.length || 1;
          
          const cashCount = completedMyTxs.filter(t => t.payment_method === 'cash').length;
          const qrisCount = completedMyTxs.filter(t => t.payment_method === 'qris').length;
          const transferCount = completedMyTxs.filter(t => t.payment_method === 'transfer').length;

          setPaymentStats({
            cash: Math.round((cashCount / totalCount) * 100),
            qris: Math.round((qrisCount / totalCount) * 100),
            transfer: Math.round((transferCount / totalCount) * 100),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="loading-spinner" style={{ textAlign: 'center', padding: '48px' }}>Memuat dashboard...</div>;
  }

  // Today's calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const completedTxs = transactions.filter(t => t.status === 'completed');
  const todayTxs = completedTxs.filter(t => t.created_at.startsWith(todayStr));
  
  const todayRevenue = todayTxs.reduce((sum, t) => sum + Number(t.total), 0);
  const todayCount = todayTxs.length;
  const allTimeCount = completedTxs.length;

  // Daily target configuration
  const DAILY_TARGET = 2500000; // Rp 2.500.000 target
  const targetPercentage = Math.min(Math.round((todayRevenue / DAILY_TARGET) * 100), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">Dashboard Kasir</h1>
        <p className="page-subtitle">Selamat bertugas, {currentUser?.full_name || 'Kasir'}! Berikut ringkasan penjualan Anda hari ini.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">Rp {todayRevenue.toLocaleString('id-ID')}</span>
              <span className="stat-label">Pendapatan Hari Ini</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">{todayCount}</span>
              <span className="stat-label">Transaksi Hari Ini</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">{allTimeCount}</span>
              <span className="stat-label">Total Transaksi Saya</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(54, 162, 235, 0.1)', color: '#36a2eb' }}>
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid-2" style={{ gap: '20px' }}>
        {/* CHART 1: DAILY SALES TARGET PROGRESS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
            <Target size={18} color="var(--primary)" /> Pencapaian Target Harian Kasir
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Target Hari Ini: <strong>Rp {DAILY_TARGET.toLocaleString('id-ID')}</strong></span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{targetPercentage}% Terpenuhi</span>
            </div>
            {/* Progress Bar */}
            <div style={{ height: '14px', backgroundColor: 'var(--secondary-bg)', borderRadius: '7px', overflow: 'hidden' }}>
              <div style={{
                width: `${targetPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary) 0%, #ff6b6b 100%)',
                borderRadius: '7px',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--mute)', marginTop: '4px' }}>
              {targetPercentage === 100 
                ? 'Luar biasa! Target penjualan harian Anda telah tercapai.' 
                : `Rp ${(DAILY_TARGET - todayRevenue).toLocaleString('id-ID')} lagi untuk mencapai target.`}
            </span>
          </div>
        </div>

        {/* CHART 2: PAYMENT METHOD RATIO */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
            <CreditCard size={18} color="#2563eb" /> Metode Pembayaran Dipilih Pelanggan
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Tunai (Cash)</span>
              <strong>{paymentStats.cash}%</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--secondary-bg)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${paymentStats.cash}%`, height: '100%', backgroundColor: '#0d9488', borderRadius: '3px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
              <span>QRIS Digital</span>
              <strong>{paymentStats.qris}%</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--secondary-bg)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${paymentStats.qris}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '3px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid-2" style={{ gap: '20px' }}>
        {/* FAST POS LAUNCHER */}
        <div className="card-soft" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', minHeight: '180px' }}>
          <div>
            <h2 className="card-title" style={{ color: 'var(--primary)', marginBottom: '8px' }}>Siap Melayani Pelanggan?</h2>
            <p style={{ color: 'var(--mute)', fontSize: '14px', lineHeight: 1.5 }}>Buka modul Cashier POS untuk memindai barcode barang, memproses pembayaran, dan mencetak struk transaksi penjualan.</p>
          </div>
          <button 
            onClick={() => onNavigate('penjualan')} 
            className="btn btn-primary"
            style={{ width: 'fit-content', gap: '8px' }}
          >
            <ShoppingCart size={18} /> Buka POS Kasir Sekarang <ArrowRight size={16} />
          </button>
        </div>

        {/* MY RECENT TRANSACTIONS TABLE */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Transaksi Terakhir Saya</h2>
            <button className="btn btn-tertiary" onClick={() => onNavigate('riwayat')}>
              Semua Riwayat <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="table-container">
            <table className="table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Waktu</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 700 }}>{tx.invoice_no}</td>
                    <td>{new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ fontWeight: 700 }}>Rp {tx.total.toLocaleString('id-ID')}</td>
                    <td>
                      <span className={`badge ${
                        tx.status === 'completed' ? 'badge-success' : 'badge-error'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {tx.status === 'completed' ? 'Selesai' : tx.status === 'cancelled' ? 'Batal' : 'Retur'}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                      Anda belum memproses transaksi penjualan hari ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
