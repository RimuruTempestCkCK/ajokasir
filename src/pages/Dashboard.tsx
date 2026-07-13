import React, { useState, useEffect } from 'react';
import { db, Transaction, Product } from '../db';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  ShoppingBag, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface DashboardProps {
  userRole: 'owner' | 'kasir' | 'gudang';
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole, onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const txs = await db.getTransactions();
        const prods = await db.getProducts();
        setTransactions(txs);
        setProducts(prods);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Memuat Dashboard...</div>;
  }

  // --- Calculations based on user role ---

  // 1. Owner Metrics (All time/Period)
  const completedTxs = transactions.filter(t => t.status === 'completed');
  const totalOmzet = completedTxs.reduce((sum, t) => sum + t.total, 0);
  
  // Laba = Total - Cost of goods sold (COGS)
  const totalLaba = completedTxs.reduce((sum, t) => {
    const cost = t.items?.reduce((cSum, item) => cSum + (item.cost_price * item.quantity), 0) || 0;
    return sum + (t.total - cost - t.tax); // Laba bersih sebelum pajak/setelah COGS
  }, 0);

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock);
  const totalTransactionsCount = completedTxs.length;

  // 2. Kasir Metrics (Today)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTxs = transactions.filter(t => t.status === 'completed' && t.created_at.startsWith(todayStr));
  const todayRevenue = todayTxs.reduce((sum, t) => sum + t.total, 0);
  const todayCount = todayTxs.length;

  // 3. Gudang Metrics
  const totalItemsCount = products.length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Weekly Graph Data Calculation (Owner only)
  const getWeeklyData = () => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const data = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().slice(0, 10),
        dayName: days[d.getDay()],
        total: 0
      };
    });

    completedTxs.forEach(tx => {
      const txDate = tx.created_at.slice(0, 10);
      const match = data.find(d => d.dateStr === txDate);
      if (match) {
        match.total += tx.total;
      }
    });

    const maxVal = Math.max(...data.map(d => d.total), 1);
    return data.map(d => ({
      ...d,
      percentage: (d.total / maxVal) * 80 // Max height 80%
    }));
  };

  const weeklyData = getWeeklyData();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Selamat datang kembali! Berikut ringkasan performa toko hari ini.</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--canvas)',
          padding: '8px 16px',
          borderRadius: '12px',
          border: '1px solid var(--hairline-soft)',
          fontSize: '14px',
          fontWeight: 600
        }}>
          <UserCheck size={16} color="var(--primary)" />
          <span>Akses Anda: <strong style={{ textTransform: 'capitalize' }}>{userRole}</strong></span>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="stat-grid">
        {userRole === 'owner' && (
          <>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#e6fffa', color: '#0d9488' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">Rp {totalOmzet.toLocaleString('id-ID')}</span>
                <span className="stat-label">Total Omzet</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">Rp {totalLaba.toLocaleString('id-ID')}</span>
                <span className="stat-label">Laba Bersih</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <ShoppingCart size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{totalTransactionsCount}</span>
                <span className="stat-label">Jumlah Transaksi</span>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('stok')}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#fff1f2', color: 'var(--primary)' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{lowStockProducts.length}</span>
                <span className="stat-label">Stok Hampir Habis</span>
              </div>
            </div>
          </>
        )}

        {userRole === 'kasir' && (
          <>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#e6fffa', color: '#0d9488' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">Rp {todayRevenue.toLocaleString('id-ID')}</span>
                <span className="stat-label">Pendapatan Hari Ini</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <ShoppingCart size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{todayCount}</span>
                <span className="stat-label">Transaksi Hari Ini</span>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('penjualan')}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <ShoppingBag size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">POS</span>
                <span className="stat-label">Buka Menu Kasir</span>
              </div>
            </div>
          </>
        )}

        {userRole === 'gudang' && (
          <>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <ShoppingBag size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{totalItemsCount}</span>
                <span className="stat-label">Total Jenis Barang</span>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('barang')}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#fff1f2', color: 'var(--primary)' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{lowStockProducts.length}</span>
                <span className="stat-label">Barang Hampir Habis</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: 'var(--error)' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{outOfStockCount}</span>
                <span className="stat-label">Barang Habis (Stok 0)</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DASHBOARD DETAILS GRID */}
      <div className="dashboard-details-grid">
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Chart Section (Owner Only) */}
          {userRole === 'owner' && (
            <div className="card">
              <h2 className="card-title">Grafik Penjualan 7 Hari Terakhir</h2>
              
              <div style={{
                height: '240px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                paddingTop: '20px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--hairline-soft)',
                gap: '8px'
              }}>
                {weeklyData.map((d, i) => (
                  <div key={i} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}>
                    {/* Tooltip on hover */}
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--mute)',
                      marginBottom: '4px'
                    }}>
                      {d.total > 0 ? `Rp ${(d.total / 1000).toFixed(0)}k` : '-'}
                    </div>
                    {/* The bar */}
                    <div style={{
                      width: '80%',
                      maxWidth: '44px',
                      height: `${d.percentage}%`,
                      backgroundColor: d.total > 0 ? 'var(--primary)' : 'var(--secondary-bg)',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.3s ease'
                    }}></div>
                    {/* Day label */}
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--charcoal)' }}>
                      {d.dayName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Warning or Recent Sales list */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>Transaksi Penjualan Terbaru</h2>
              <button className="btn btn-tertiary" onClick={() => onNavigate('riwayat')}>
                Semua Transaksi <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Waktu</th>
                    {userRole === 'owner' && <th>Kasir</th>}
                    <th>Metode</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: 700 }}>{tx.invoice_no}</td>
                      <td>{new Date(tx.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</td>
                      {userRole === 'owner' && <td>{tx.cashier_name}</td>}
                      <td style={{ textTransform: 'uppercase' }}>{tx.payment_method}</td>
                      <td style={{ fontWeight: 700 }}>Rp {tx.total.toLocaleString('id-ID')}</td>
                      <td>
                        <span className={`badge ${
                          tx.status === 'completed' ? 'badge-success' : tx.status === 'cancelled' ? 'badge-error' : 'badge-warning'
                        }`}>
                          {tx.status === 'completed' ? 'Selesai' : tx.status === 'cancelled' ? 'Batal' : 'Retur'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={userRole === 'owner' ? 6 : 5} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                        Belum ada transaksi penjualan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Low Stock Panel */}
          <div className="card-soft" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
              <AlertTriangle size={18} color="var(--primary)" /> Warning Stok Rendah
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {lowStockProducts.map(p => (
                <div key={p.id} style={{
                  backgroundColor: 'var(--canvas)',
                  borderRadius: '12px',
                  padding: '12px',
                  borderLeft: '4px solid var(--primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Barcode: {p.barcode}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '16px',
                      color: p.stock === 0 ? 'var(--error)' : '#d97706'
                    }}>
                      {p.stock} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--mute)' }}>{p.unit}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--mute)' }}>Min: {p.min_stock}</div>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--mute)', fontSize: '13px' }}>
                  Semua stok barang aman!
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (Owner or Cashier or Warehouse) */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="card-title" style={{ marginBottom: 4 }}>Akses Cepat</h2>
            {userRole === 'owner' && (
              <>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('penjualan')}>
                  🎯 Buka Kasir (POS)
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('barang')}>
                  📦 Kelola Data Barang
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('laporan')}>
                  📊 Lihat Laporan Keuangan
                </button>
              </>
            )}
            {userRole === 'kasir' && (
              <>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('penjualan')}>
                  🎯 Buka Kasir (POS)
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('riwayat')}>
                  📜 Lihat Riwayat Penjualan
                </button>
              </>
            )}
            {userRole === 'gudang' && (
              <>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('barang')}>
                  📦 Input Stok Opname
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('pembelian')}>
                  🚚 Buat Purchase Order (PO)
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
