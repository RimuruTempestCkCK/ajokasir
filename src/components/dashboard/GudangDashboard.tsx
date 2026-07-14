import React, { useState, useEffect } from 'react';
import { db, Product, Purchase } from '../../db';
import { Package, AlertTriangle, ShoppingBag, ArrowRight, Truck, CheckCircle } from 'lucide-react';

interface GudangDashboardProps {
  onNavigate: (page: string) => void;
}

export const GudangDashboard: React.FC<GudangDashboardProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock health allocations state
  const [stockHealth, setStockHealth] = useState({ healthy: 0, low: 0, empty: 0 });
  const [poStats, setPoStats] = useState({ pending: 0, received: 0, total: 0 });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const prods = await db.getProducts();
        const pos = await db.getPurchases();
        setProducts(prods);
        setPurchases(pos);

        // Calculate stock health allocations
        const totalProds = prods.length || 1;
        const emptyCount = prods.filter(p => p.stock === 0).length;
        const lowCount = prods.filter(p => p.stock <= p.min_stock && p.stock > 0).length;
        const healthyCount = prods.filter(p => p.stock > p.min_stock).length;

        setStockHealth({
          healthy: Math.round((healthyCount / totalProds) * 100),
          low: Math.round((lowCount / totalProds) * 100),
          empty: Math.round((emptyCount / totalProds) * 100)
        });

        // Calculate PO statistics
        const totalPos = pos.length || 1;
        const pendingCount = pos.filter(po => po.status === 'pending').length;
        const receivedCount = pos.filter(po => po.status === 'received').length;

        setPoStats({
          pending: pendingCount,
          received: receivedCount,
          total: pos.length
        });
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

  // calculations
  const totalItemsCount = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.min_stock && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const pendingPos = purchases.filter(po => po.status === 'pending');
  
  // Total Asset Valuation
  const totalAssetValuation = products.reduce((sum, p) => sum + (Number(p.cost_price) * p.stock), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">Dashboard Gudang & Inventori</h1>
        <p className="page-subtitle">Ringkasan ketersediaan aset produk, barang kritis, dan Purchase Order (PO) masuk.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">{totalAssetValuation.toLocaleString('id-ID')}</span>
              <span className="stat-label">Nilai Aset Modal (Rp)</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(54, 162, 235, 0.1)', color: '#36a2eb' }}>
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">{totalItemsCount}</span>
              <span className="stat-label">Jenis Barang Terdaftar</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(75, 192, 192, 0.1)', color: '#4bc0c0' }}>
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value" style={{ color: 'var(--primary)' }}>{lowStockProducts.length}</span>
              <span className="stat-label">Barang Hampir Habis</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(230, 0, 35, 0.1)', color: 'var(--primary)' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value" style={{ color: 'var(--error)' }}>{outOfStockProducts.length}</span>
              <span className="stat-label">Stok Habis (Kosong)</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid-2" style={{ gap: '20px' }}>
        {/* CHART 1: STOCK HEALTH ALLOCATION */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
            <Package size={18} color="var(--primary)" /> Alokasi Kesehatan Stok Barang
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#0d9488', fontWeight: 700 }}>Aman ({stockHealth.healthy}%)</span>
              <span style={{ color: '#d97706', fontWeight: 700 }}>Kritis ({stockHealth.low}%)</span>
              <span style={{ color: 'var(--error)', fontWeight: 700 }}>Habis ({stockHealth.empty}%)</span>
            </div>
            {/* Stacked health bar */}
            <div style={{ height: '16px', display: 'flex', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--secondary-bg)' }}>
              <div style={{ width: `${stockHealth.healthy}%`, backgroundColor: '#0d9488', height: '100%' }} title="Stok Aman"></div>
              <div style={{ width: `${stockHealth.low}%`, backgroundColor: '#d97706', height: '100%' }} title="Stok Kritis"></div>
              <div style={{ width: `${stockHealth.empty}%`, backgroundColor: 'var(--error)', height: '100%' }} title="Stok Habis"></div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--mute)' }}>
              Pantau secara berkala alokasi kesehatan stok untuk menghindari barang kosong.
            </div>
          </div>
        </div>

        {/* CHART 2: PURCHASE ORDER PROGRESS RATIO */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
            <Truck size={18} color="#2563eb" /> Status Pengiriman Purchase Order (PO)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={14} color="#d97706" /> PO Pending (Dalam Pengiriman)</span>
              <strong>{poStats.pending} PO ({poStats.total > 0 ? Math.round((poStats.pending / poStats.total) * 100) : 0}%)</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--secondary-bg)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${poStats.total > 0 ? (poStats.pending / poStats.total) * 100 : 0}%`, height: '100%', backgroundColor: '#d97706' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} color="#0d9488" /> PO Diterima (Selesai)</span>
              <strong>{poStats.received} PO ({poStats.total > 0 ? Math.round((poStats.received / poStats.total) * 100) : 0}%)</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--secondary-bg)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${poStats.total > 0 ? (poStats.received / poStats.total) * 100 : 0}%`, height: '100%', backgroundColor: '#0d9488' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="dashboard-details-grid">
        {/* LEFT COLUMN: CRITICAL STOCK LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>Daftar Barang Kritis & Kosong</h2>
              <button className="btn btn-tertiary" onClick={() => onNavigate('barang')}>
                Kelola Barang <ArrowRight size={16} />
              </button>
            </div>

            <div className="table-container">
              <table className="table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Barcode</th>
                    <th>Stok Saat Ini</th>
                    <th>Min. Stok</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...outOfStockProducts, ...lowStockProducts].slice(0, 6).map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.barcode}</td>
                      <td style={{ fontWeight: 700, color: p.stock === 0 ? 'var(--error)' : '#d97706' }}>
                        {p.stock} {p.unit}
                      </td>
                      <td>{p.min_stock} {p.unit}</td>
                      <td>
                        <span className={`badge ${p.stock === 0 ? 'badge-error' : 'badge-info'}`}>
                          {p.stock === 0 ? 'Habis' : 'Kritis'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                        Semua stok barang mencukupi (aman)!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PENDING POS & ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* PENDING PURCHASE ORDERS TALLY */}
          <div className="card-soft" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
              <Truck size={18} color="var(--primary)" /> Purchase Order Pending
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingPos.slice(0, 3).map(po => (
                <div key={po.id} style={{
                  backgroundColor: 'var(--canvas)',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid var(--hairline-soft)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{po.purchase_no}</div>
                    <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Supplier ID: {po.supplier_id.slice(0, 8)}...</div>
                  </div>
                  <button 
                    onClick={() => onNavigate('pembelian')}
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    Detail PO
                  </button>
                </div>
              ))}
              {pendingPos.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--mute)', textAlign: 'center', padding: '16px 0' }}>Tidak ada PO pending.</p>
              ) : (
                <button 
                  onClick={() => onNavigate('pembelian')}
                  className="btn btn-tertiary"
                  style={{ width: '100%', fontSize: '12px', justifyContent: 'center' }}
                >
                  Lihat Semua {pendingPos.length} PO Pending <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* QUICK WAREHOUSE ACTIONS */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="card-title" style={{ marginBottom: 4 }}>Menu Gudang</h2>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('barang')}>
              📦 Input Stok Opname
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => onNavigate('pembelian')}>
              🚚 Buat PO Barang Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
