import React, { useState, useEffect } from 'react';
import { db, Transaction, Product } from '../../db';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowRight,
  ShoppingBag,
  Package,
  BarChart3,
  Layers,
  Clock
} from 'lucide-react';

interface OwnerDashboardProps {
  onNavigate: (page: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Category sales share state
  const [categorySales, setCategorySales] = useState<{ name: string; value: number; pct: number }[]>([]);
  const [peakHours, setPeakHours] = useState({ morning: 0, afternoon: 0, evening: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const txs = await db.getTransactions();
        const prods = await db.getProducts();
        const cats = await db.getCategories();
        setTransactions(txs);
        setProducts(prods);

        // Calculate Category Sales Share
        const completed = txs.filter(t => t.status === 'completed');
        
        // Sum category distributions
        const catMap: { [key: string]: number } = {};
        let totalItemsValue = 0;

        completed.forEach(t => {
          t.items?.forEach(item => {
            // Find category
            const prod = prods.find(p => p.id === item.product_id);
            const category = cats.find(c => c.id === prod?.category_id);
            const categoryName = category?.name || 'Lainnya';
            const value = Number(item.price) * item.quantity;
            catMap[categoryName] = (catMap[categoryName] || 0) + value;
            totalItemsValue += value;
          });
        });

        const categoryShares = Object.keys(catMap).map(cat => ({
          name: cat,
          value: catMap[cat],
          pct: totalItemsValue > 0 ? Math.round((catMap[cat] / totalItemsValue) * 100) : 0
        })).sort((a, b) => b.value - a.value);
        setCategorySales(categoryShares);

        // Calculate Peak Sales Hours (Morning: 06-12, Afternoon: 12-18, Evening: 18-24)
        let morning = 0, afternoon = 0, evening = 0;
        completed.forEach(t => {
          const hour = new Date(t.created_at).getHours();
          if (hour >= 6 && hour < 12) morning++;
          else if (hour >= 12 && hour < 18) afternoon++;
          else evening++;
        });
        const totalHours = morning + afternoon + evening || 1;
        setPeakHours({
          morning: Math.round((morning / totalHours) * 100),
          afternoon: Math.round((afternoon / totalHours) * 100),
          evening: Math.round((evening / totalHours) * 100)
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="loading-spinner" style={{ textAlign: 'center', padding: '48px' }}>Memuat dashboard...</div>;
  }

  // calculations
  const completedTxs = transactions.filter(t => t.status === 'completed');
  const totalOmzet = completedTxs.reduce((sum, t) => sum + Number(t.total), 0);
  
  const totalLaba = completedTxs.reduce((sum, t) => {
    const cost = t.items?.reduce((cSum, item) => cSum + (Number(item.cost_price) * item.quantity), 0) || 0;
    return sum + (Number(t.total) - cost - Number(t.tax));
  }, 0);

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock);
  const totalTransactionsCount = completedTxs.length;

  // Weekly Graph
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const weeklyData = Array(7).fill(0).map((_, i) => {
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
    const match = weeklyData.find(d => d.dateStr === txDate);
    if (match) {
      match.total += Number(tx.total);
    }
  });

  const maxVal = Math.max(...weeklyData.map(d => d.total), 1);
  const chartData = weeklyData.map(d => ({
    ...d,
    percentage: (d.total / maxVal) * 80 // Max height 80%
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">Dashboard Owner</h1>
        <p className="page-subtitle">Selamat datang kembali! Berikut ringkasan finansial dan stok toko Anda.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">Rp {totalOmzet.toLocaleString('id-ID')}</span>
              <span className="stat-label">Total Omzet</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">Rp {totalLaba.toLocaleString('id-ID')}</span>
              <span className="stat-label">Laba Bersih</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 219, 0.1)', color: '#2563eb' }}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">{totalTransactionsCount}</span>
              <span className="stat-label">Jumlah Transaksi</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('stok')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value" style={{ color: 'var(--primary)' }}>{lowStockProducts.length}</span>
              <span className="stat-label">Stok Hampir Habis</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(230, 0, 35, 0.1)', color: 'var(--primary)' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid-2" style={{ gap: '20px' }}>
        {/* CHART 1: SALES TREND 7 DAYS */}
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" /> Grafik Penjualan 7 Hari Terakhir
          </h2>
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
            {chartData.map((d, i) => (
              <div key={i} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                height: '100%',
                justifyContent: 'flex-end'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mute)', marginBottom: '4px' }}>
                  {d.total > 0 ? `Rp ${(d.total / 1000).toFixed(0)}k` : '-'}
                </div>
                <div style={{
                  width: '80%',
                  maxWidth: '44px',
                  height: `${d.percentage}%`,
                  background: 'linear-gradient(180deg, var(--primary) 0%, #ff5252 100%)',
                  borderRadius: '8px 8px 0 0',
                  transition: 'height 0.3s ease'
                }}></div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--charcoal)' }}>{d.dayName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: CATEGORY SHARES & PEAK HOURS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
            <Layers size={18} color="#7c3aed" /> Distribusi Kategori Produk Terlaris
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '140px', overflowY: 'auto' }}>
            {categorySales.slice(0, 3).map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 700 }}>{cat.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--mute)' }}>Rp {cat.value.toLocaleString('id-ID')} ({cat.pct}%)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--secondary-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${cat.pct}%`,
                    height: '100%',
                    backgroundColor: idx === 0 ? '#7c3aed' : idx === 1 ? '#0d9488' : '#2563eb',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            ))}
            {categorySales.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--mute)', fontSize: '12px', padding: '12px' }}>Belum ada data produk terjual.</p>
            )}
          </div>

          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0, marginTop: '8px' }}>
            <Clock size={18} color="#2563eb" /> Jam Penjualan Tersibuk (Peak Hours)
          </h2>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <div style={{ flex: 1, backgroundColor: 'var(--canvas)', padding: '10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--hairline-soft)' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0d9488' }}>{peakHours.morning}%</div>
              <div style={{ fontSize: '10px', color: 'var(--mute)' }}>Pagi (06:00-12:00)</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--canvas)', padding: '10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--hairline-soft)' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{peakHours.afternoon}%</div>
              <div style={{ fontSize: '10px', color: 'var(--mute)' }}>Siang (12:00-18:00)</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--canvas)', padding: '10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--hairline-soft)' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#7c3aed' }}>{peakHours.evening}%</div>
              <div style={{ fontSize: '10px', color: 'var(--mute)' }}>Malam (18:00-24:00)</div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="dashboard-details-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* RECENT SALES TABLE */}
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
                    <th>Metode</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Kasir</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: 700 }}>{tx.invoice_no}</td>
                      <td>{new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <span className={`badge ${
                          tx.payment_method === 'cash' ? 'badge-success' : tx.payment_method === 'qris' ? 'badge-error' : 'badge-info'
                        }`} style={{ textTransform: 'uppercase' }}>
                          {tx.payment_method}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>Rp {tx.total.toLocaleString('id-ID')}</td>
                      <td>
                        <span className={`badge ${
                          tx.status === 'completed' ? 'badge-success' : 'badge-error'
                        }`} style={{ textTransform: 'capitalize' }}>
                          {tx.status === 'completed' ? 'Selesai' : tx.status === 'cancelled' ? 'Batal' : 'Retur'}
                        </span>
                      </td>
                      <td>{tx.cashier_name}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
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
          {/* LOW STOCK PANEL */}
          <div className="card-soft" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
              <AlertTriangle size={18} color="var(--primary)" /> Warning Stok Rendah
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
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

          {/* QUICK ACCESS PANEL */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="card-title" style={{ marginBottom: 4 }}>Akses Cepat</h2>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('penjualan')}>
              <ShoppingBag size={18} style={{ marginRight: '8px' }} /> Kasir (POS)
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('barang')}>
              <Package size={18} style={{ marginRight: '8px' }} /> Kelola Data Barang
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('laporan')}>
              <BarChart3 size={18} style={{ marginRight: '8px' }} /> Laporan Keuangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
