import React, { useState, useEffect } from 'react';
import { db, StockLog } from '../db';
import { Search } from 'lucide-react';

interface StokProps {
  userRole: 'super_admin' | 'owner' | 'kasir' | 'gudang';
}

export const Stok: React.FC<StokProps> = ({ userRole }) => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'sale' | 'purchase' | 'opname' | 'adjustment'>('all');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await db.getStockLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.product_name?.toLowerCase().includes(search.toLowerCase()) || 
                          l.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilter === 'all' || l.type === activeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Histori Persediaan Stok</h1>
          <p className="page-subtitle">Catatan keluar-masuk stok barang akibat penjualan, pembelian, dan penyesuaian opname.</p>
        </div>
      </div>

      {/* FILTER BUTTONS & SEARCH */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Chip filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={`chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Semua Aliran
          </button>
          <button 
            className={`chip ${activeFilter === 'sale' ? 'active' : ''}`}
            onClick={() => setActiveFilter('sale')}
          >
            🛒 Penjualan Kasir
          </button>
          <button 
            className={`chip ${activeFilter === 'purchase' ? 'active' : ''}`}
            onClick={() => setActiveFilter('purchase')}
          >
            🚚 Pembelian PO
          </button>
          <button 
            className={`chip ${activeFilter === 'opname' ? 'active' : ''}`}
            onClick={() => setActiveFilter('opname')}
          >
            📋 Stock Opname
          </button>
          <button 
            className={`chip ${activeFilter === 'adjustment' ? 'active' : ''}`}
            onClick={() => setActiveFilter('adjustment')}
          >
            ⚙️ Penyesuaian Lainnya
          </button>
        </div>

        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Cari berdasarkan nama barang atau deskripsi aliran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      {/* LOGS TABLE */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat riwayat stok...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal / Waktu</th>
                <th>Nama Barang</th>
                <th>Tipe Aliran</th>
                <th>Perubahan Kuantitas</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const isNegative = log.quantity < 0;
                
                return (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString('id-ID')}</td>
                    <td style={{ fontWeight: 700 }}>{log.product_name}</td>
                    <td>
                      <span className={`badge ${
                        log.type === 'sale' ? 'badge-info' : 
                        log.type === 'purchase' ? 'badge-success' : 
                        log.type === 'opname' ? 'badge-warning' : 'badge-secondary'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {log.type === 'sale' ? 'Penjualan' : 
                         log.type === 'purchase' ? 'Pembelian' : 
                         log.type === 'opname' ? 'Opname' : 'Adjustment'}
                      </span>
                    </td>
                    <td style={{ 
                      fontWeight: 700, 
                      fontSize: '15px', 
                      color: isNegative ? 'var(--error)' : 'green' 
                    }}>
                      {isNegative ? '' : '+'}{log.quantity}
                    </td>
                    <td style={{ color: 'var(--mute)' }}>{log.description}</td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    Tidak ada riwayat pergerakan stok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
