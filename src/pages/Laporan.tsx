import React, { useState, useEffect } from 'react';
import { db, Transaction, Product, Category, StockLog, Purchase } from '../db';
import { BarChart, FileText, ShoppingBag, DollarSign, Activity } from 'lucide-react';

interface LaporanProps {
  userRole: 'super_admin' | 'owner' | 'kasir' | 'gudang';
}

export const Laporan: React.FC<LaporanProps> = ({ userRole }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab Selection
  // Owner can select: 'penjualan' | 'labarugi' | 'terlaris' | 'stok'
  // Kasir can only select: 'penjualan'
  // Gudang can only select: 'stok'
  const defaultTab = userRole === 'kasir' ? 'penjualan' : userRole === 'gudang' ? 'stok' : 'penjualan';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const txs = await db.getTransactions();
        const prods = await db.getProducts();
        const cats = await db.getCategories();
        const logs = await db.getStockLogs();
        const pos = await db.getPurchases();

        setTransactions(txs);
        setProducts(prods);
        setCategories(cats);
        setStockLogs(logs);
        setPurchases(pos);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat laporan...</div>;
  }

  // --- REPORT GENERATIONS ---
  const completedTxs = transactions.filter(t => t.status === 'completed');

  // A. Laporan Penjualan (Daily, Monthly, Yearly)
  const getSalesSummary = () => {
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisYear = new Date().toISOString().slice(0, 4);

    const dailyTxs = completedTxs.filter(t => t.created_at.startsWith(today));
    const monthlyTxs = completedTxs.filter(t => t.created_at.startsWith(thisMonth));
    const yearlyTxs = completedTxs.filter(t => t.created_at.startsWith(thisYear));

    return {
      daily: {
        omzet: dailyTxs.reduce((s, t) => s + t.total, 0),
        count: dailyTxs.length
      },
      monthly: {
        omzet: monthlyTxs.reduce((s, t) => s + t.total, 0),
        count: monthlyTxs.length
      },
      yearly: {
        omzet: yearlyTxs.reduce((s, t) => s + t.total, 0),
        count: yearlyTxs.length
      }
    };
  };

  const salesSummary = getSalesSummary();

  // B. Laba Rugi Report (Owner only)
  const getProfitLoss = () => {
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalTax = 0;

    completedTxs.forEach(t => {
      totalRevenue += t.total;
      totalTax += t.tax;
      t.items?.forEach(item => {
        totalCOGS += (item.cost_price * item.quantity);
      });
    });

    const netProfit = totalRevenue - totalCOGS - totalTax;

    return {
      revenue: totalRevenue,
      cogs: totalCOGS,
      tax: totalTax,
      netProfit
    };
  };

  const pl = getProfitLoss();

  // C. Best Selling Products (Owner / Kasir)
  const getBestSellers = () => {
    const salesMap: Record<string, { name: string; qty: number; revenue: number }> = {};

    completedTxs.forEach(t => {
      t.items?.forEach(item => {
        if (!salesMap[item.product_id]) {
          salesMap[item.product_id] = {
            name: item.product_name || 'Barang Terhapus',
            qty: 0,
            revenue: 0
          };
        }
        salesMap[item.product_id].qty += item.quantity;
        salesMap[item.product_id].revenue += item.subtotal;
      });
    });

    return Object.values(salesMap).sort((a, b) => b.qty - a.qty).slice(0, 10);
  };

  const bestSellers = getBestSellers();

  // D. Inventory Value Report (Owner / Gudang)
  const getInventoryReport = () => {
    let totalStockQty = 0;
    let totalCostVal = 0;
    let totalSellingVal = 0;

    products.forEach(p => {
      totalStockQty += p.stock;
      totalCostVal += (p.cost_price * p.stock);
      totalSellingVal += (p.price * p.stock);
    });

    const potentialProfit = totalSellingVal - totalCostVal;

    return {
      totalStockQty,
      totalCostVal,
      totalSellingVal,
      potentialProfit
    };
  };

  const inventorySummary = getInventoryReport();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Analitik Bisnis</h1>
          <p className="page-subtitle">Analisis keuangan toko, kinerja barang terlaris, persediaan aset gudang, dan laba rugi.</p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--hairline-soft)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {(userRole === 'owner' || userRole === 'kasir' || userRole === 'super_admin') && (
          <button 
            className={`chip ${activeTab === 'penjualan' ? 'active' : ''}`}
            onClick={() => setActiveTab('penjualan')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={16} /> Penjualan Toko
          </button>
        )}
        
        {(userRole === 'owner' || userRole === 'super_admin') && (
          <button 
            className={`chip ${activeTab === 'labarugi' ? 'active' : ''}`}
            onClick={() => setActiveTab('labarugi')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <DollarSign size={16} /> Laba Rugi Bersih
          </button>
        )}

        {(userRole === 'owner' || userRole === 'kasir' || userRole === 'super_admin') && (
          <button 
            className={`chip ${activeTab === 'terlaris' ? 'active' : ''}`}
            onClick={() => setActiveTab('terlaris')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShoppingBag size={16} /> Barang Terlaris (Top 10)
          </button>
        )}

        {(userRole === 'owner' || userRole === 'gudang' || userRole === 'super_admin') && (
          <button 
            className={`chip ${activeTab === 'stok' ? 'active' : ''}`}
            onClick={() => setActiveTab('stok')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Activity size={16} /> Aset Stok & Nilai Inventori
          </button>
        )}
      </div>

      {/* TAB CONTENT */}

      {/* 1. SALES REPORT TAB */}
      {activeTab === 'penjualan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-value">Rp {salesSummary.daily.omzet.toLocaleString('id-ID')}</span>
                <span className="stat-label">Omzet Hari Ini ({salesSummary.daily.count} Trx)</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-value">Rp {salesSummary.monthly.omzet.toLocaleString('id-ID')}</span>
                <span className="stat-label">Omzet Bulan Ini ({salesSummary.monthly.count} Trx)</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-value">Rp {salesSummary.yearly.omzet.toLocaleString('id-ID')}</span>
                <span className="stat-label">Omzet Tahun Ini ({salesSummary.yearly.count} Trx)</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Daftar Transaksi Penyumbang Omzet Terbesar</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Tanggal</th>
                    <th>Staff Kasir</th>
                    <th>Subtotal</th>
                    <th>Diskon</th>
                    <th>Total Pembayaran</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTxs.slice(0, 10).map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700 }}>{t.invoice_no}</td>
                      <td>{new Date(t.created_at).toLocaleString('id-ID')}</td>
                      <td>{t.cashier_name}</td>
                      <td>Rp {t.subtotal.toLocaleString('id-ID')}</td>
                      <td style={{ color: 'var(--error)' }}>-Rp {t.discount.toLocaleString('id-ID')}</td>
                      <td style={{ fontWeight: 700 }}>Rp {t.total.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  {completedTxs.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                        Belum ada penjualan tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFIT & LOSS TAB */}
      {activeTab === 'labarugi' && (userRole === 'owner' || userRole === 'super_admin') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-value">Rp {pl.revenue.toLocaleString('id-ID')}</span>
                <span className="stat-label">Penerimaan Kotor (Omzet)</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-value" style={{ color: 'var(--error)' }}>Rp {pl.cogs.toLocaleString('id-ID')}</span>
                <span className="stat-label">Harga Pokok Pembelian (COGS)</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-value" style={{ color: 'var(--mute)' }}>Rp {pl.tax.toLocaleString('id-ID')}</span>
                <span className="stat-label">Pajak Penjualan (PPN)</span>
              </div>
            </div>
            <div className="stat-card" style={{ backgroundColor: 'var(--success-pale)' }}>
              <div className="stat-info">
                <span className="stat-value" style={{ color: 'green' }}>Rp {pl.netProfit.toLocaleString('id-ID')}</span>
                <span className="stat-label">Laba Bersih Toko</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Metode Perhitungan Laba Rugi</h2>
            <p style={{ fontSize: '14px', color: 'var(--charcoal)', lineHeight: '1.6' }}>
              Perhitungan Laba Bersih dihitung dengan rumus berikut:<br />
              <strong style={{ color: 'var(--primary)' }}>Laba Bersih = Total Penerimaan (Omzet) - Harga Pokok Penjualan (COGS) - Pajak PPN</strong>
            </p>
            <div className="grid-2" style={{ marginTop: '16px', gap: '20px' }}>
              <div className="card-soft">
                <strong style={{ fontSize: '15px' }}>Total Pemasukan Kotor:</strong>
                <p style={{ fontSize: '20px', fontWeight: 700, marginTop: '8px', color: 'var(--ink)' }}>Rp {pl.revenue.toLocaleString('id-ID')}</p>
              </div>
              <div className="card-soft" style={{ borderLeft: '4px solid green' }}>
                <strong style={{ fontSize: '15px' }}>Total Laba Bersih:</strong>
                <p style={{ fontSize: '20px', fontWeight: 700, marginTop: '8px', color: 'green' }}>Rp {pl.netProfit.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BEST SELLER TAB */}
      {activeTab === 'terlaris' && (
        <div className="card">
          <h2 className="card-title">10 Produk Terlaris Berdasarkan Kuantitas Terjual</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Peringkat</th>
                  <th>Nama Barang</th>
                  <th>Kuantitas Terjual</th>
                  <th>Kontribusi Omzet</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, textAlign: 'center' }}>#{idx + 1}</td>
                    <td style={{ fontWeight: 700 }}>{item.name}</td>
                    <td style={{ fontWeight: 600 }}>{item.qty} item</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>Rp {item.revenue.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {bestSellers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                      Belum ada penjualan barang.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. INVENTORY ASSET VALUE TAB */}
      {activeTab === 'stok' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-value">{inventorySummary.totalStockQty} unit</span>
                <span className="stat-label">Total Volume Fisik Stok</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-value">Rp {inventorySummary.totalCostVal.toLocaleString('id-ID')}</span>
                <span className="stat-label">Nilai Aset (Harga Pokok)</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-value">Rp {inventorySummary.totalSellingVal.toLocaleString('id-ID')}</span>
                <span className="stat-label">Nilai Aset (Harga Jual)</span>
              </div>
            </div>
            {(userRole === 'owner' || userRole === 'super_admin') && (
              <div className="stat-card" style={{ backgroundColor: 'var(--success-pale)' }}>
                <div className="stat-info">
                  <span className="stat-value" style={{ color: 'green' }}>Rp {inventorySummary.potentialProfit.toLocaleString('id-ID')}</span>
                  <span className="stat-label">Potensi Laba Kotor Aset</span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Estimasi Nilai Aset Inventori per Produk</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Stok Saat Ini</th>
                    <th>Harga Pokok</th>
                    <th>Nilai Aset (Pokok)</th>
                    <th>Harga Jual</th>
                    <th>Nilai Aset (Jual)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{p.name}</td>
                      <td>{p.stock} {p.unit}</td>
                      <td>Rp {p.cost_price.toLocaleString('id-ID')}</td>
                      <td style={{ fontWeight: 600 }}>Rp {(p.cost_price * p.stock).toLocaleString('id-ID')}</td>
                      <td>Rp {p.price.toLocaleString('id-ID')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>Rp {(p.price * p.stock).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                        Persediaan barang kosong.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
