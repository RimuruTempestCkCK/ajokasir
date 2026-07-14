import React, { useState, useEffect } from 'react';
import { db, Product, Category } from '../db';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Sliders, 
  X, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { showAlert, showConfirm, showSuccessToast } from '../utils/swal';

interface BarangProps {
  userRole: 'super_admin' | 'owner' | 'kasir' | 'gudang';
}

export const Barang: React.FC<BarangProps> = ({ userRole }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOpnameOpen, setIsOpnameOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Form states
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(10);
  const [unit, setUnit] = useState('pcs');
  
  // Opname state
  const [newStockVal, setNewStockVal] = useState(0);
  const [opnameReason, setOpnameReason] = useState('');

  const canManage = userRole === 'owner' || userRole === 'gudang' || userRole === 'super_admin';

  const loadData = async () => {
    try {
      setLoading(true);
      const prods = await db.getProducts();
      const cats = await db.getCategories();
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setBarcode('');
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice(0);
    setCostPrice(0);
    setStock(0);
    setMinStock(10);
    setUnit('pcs');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setActiveProduct(p);
    setBarcode(p.barcode);
    setName(p.name);
    setCategoryId(p.category_id);
    setPrice(p.price);
    setCostPrice(p.cost_price);
    setMinStock(p.min_stock);
    setUnit(p.unit);
    setIsEditOpen(true);
  };

  const handleOpenOpname = (p: Product) => {
    setActiveProduct(p);
    setNewStockVal(p.stock);
    setOpnameReason('');
    setIsOpnameOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.createProduct({
        barcode,
        name,
        category_id: categoryId,
        price: Number(price),
        cost_price: Number(costPrice),
        stock: Number(stock),
        min_stock: Number(minStock),
        unit
      });
      setIsAddOpen(false);
      loadData();
      showSuccessToast('Barang berhasil ditambahkan');
    } catch (err: any) {
      showAlert('Gagal Menambah Barang', err.message || 'Terjadi kesalahan sistem', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    try {
      await db.updateProduct(activeProduct.id, {
        barcode,
        name,
        category_id: categoryId,
        price: Number(price),
        cost_price: Number(costPrice),
        min_stock: Number(minStock),
        unit
      });
      setIsEditOpen(false);
      loadData();
      showSuccessToast('Barang berhasil diperbarui');
    } catch (err: any) {
      showAlert('Gagal Mengubah Barang', err.message || 'Terjadi kesalahan sistem', 'error');
    }
  };

  const handleOpnameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    try {
      await db.adjustStock(
        activeProduct.id,
        activeProduct.stock,
        Number(newStockVal),
        opnameReason || 'Penyesuaian manual'
      );
      setIsOpnameOpen(false);
      loadData();
      showSuccessToast('Stock opname berhasil disimpan');
    } catch (err: any) {
      showAlert('Gagal Stock Opname', err.message || 'Terjadi kesalahan sistem', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await showConfirm(
      'Hapus Barang?',
      'Apakah Anda yakin ingin menghapus barang ini secara permanen dari sistem?',
      'Ya, Hapus',
      'Batal'
    );
    if (result.isConfirmed) {
      try {
        await db.deleteProduct(id);
        loadData();
        showSuccessToast('Barang berhasil dihapus');
      } catch (err: any) {
        showAlert('Gagal Menghapus Barang', err.message || 'Terjadi kesalahan sistem', 'error');
      }
    }
  };

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.barcode.includes(search);
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Barang</h1>
          <p className="page-subtitle">Kelola daftar produk, persediaan stok minimum, dan lakukan penyesuaian.</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Tambah Barang
          </button>
        )}
      </div>

      {/* FILTER ROW */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div className="search-input-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Cari berdasarkan nama barang atau barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
          <select 
            className="form-select" 
            style={{ height: '44px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data barang...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Harga Jual</th>
                <th>Harga Pokok</th>
                <th>Stok</th>
                <th>Stok Min</th>
                <th>Satuan</th>
                {canManage && <th style={{ textAlign: 'right' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const catName = categories.find(c => c.id === p.category_id)?.name || '-';
                const isLowStock = p.stock <= p.min_stock;
                
                return (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.barcode}</td>
                    <td style={{ fontWeight: 700 }}>{p.name}</td>
                    <td>{catName}</td>
                    <td style={{ fontWeight: 600 }}>Rp {p.price.toLocaleString('id-ID')}</td>
                    <td style={{ color: 'var(--mute)' }}>Rp {p.cost_price.toLocaleString('id-ID')}</td>
                    <td style={{ fontWeight: 700 }}>
                      <span style={{ 
                        color: p.stock === 0 ? 'var(--error)' : isLowStock ? '#d97706' : 'inherit',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {p.stock}
                        {isLowStock && <AlertTriangle size={14} color={p.stock === 0 ? 'var(--error)' : '#d97706'} />}
                      </span>
                    </td>
                    <td>{p.min_stock}</td>
                    <td style={{ textTransform: 'lowercase' }}>{p.unit}</td>
                    {canManage && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button 
                            className="btn btn-icon" 
                            title="Stock Opname"
                            onClick={() => handleOpenOpname(p)}
                            style={{ width: '32px', height: '32px' }}
                          >
                            <Sliders size={14} />
                          </button>
                          <button 
                            className="btn btn-icon" 
                            title="Edit"
                            onClick={() => handleOpenEdit(p)}
                            style={{ width: '32px', height: '32px' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-icon" 
                            title="Hapus"
                            onClick={() => handleDelete(p.id)}
                            style={{ width: '32px', height: '32px', color: 'var(--error)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 9 : 8} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    Barang tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setIsAddOpen(false)}><X size={18} /></button>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Tambah Barang Baru</h2>
            
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Barcode / SKU</label>
                <input type="text" className="form-input" placeholder="Masukkan kode barcode..." value={barcode} onChange={(e) => setBarcode(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Barang</label>
                <input type="text" className="form-input" placeholder="Nama barang..." value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Harga Pokok (Modal)</label>
                  <input type="number" className="form-input" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga Jual</label>
                  <input type="number" className="form-input" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
                </div>
              </div>
              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Stok Awal</label>
                  <input type="number" className="form-input" value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Stok</label>
                  <input type="number" className="form-input" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Satuan Barang</label>
                <input type="text" className="form-input" placeholder="pcs, pack, karung, box..." value={unit} onChange={(e) => setUnit(e.target.value)} required />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Simpan Barang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setIsEditOpen(false)}><X size={18} /></button>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Ubah Data Barang</h2>
            
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Barcode / SKU</label>
                <input type="text" className="form-input" value={barcode} onChange={(e) => setBarcode(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Barang</label>
                <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Harga Pokok (Modal)</label>
                  <input type="number" className="form-input" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga Jual</label>
                  <input type="number" className="form-input" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Stok</label>
                <input type="number" className="form-input" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Satuan Barang</label>
                <input type="text" className="form-input" value={unit} onChange={(e) => setUnit(e.target.value)} required />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STOCK OPNAME MODAL */}
      {isOpnameOpen && activeProduct && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setIsOpnameOpen(false)}><X size={18} /></button>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '10px' }}>Penyesuaian Stok (Stock Opname)</h2>
            <p style={{ fontSize: '13px', color: 'var(--mute)', marginBottom: '20px' }}>
              Melakukan pencocokan stok fisik di gudang untuk barang: <strong>{activeProduct.name}</strong>
            </p>
            
            <form onSubmit={handleOpnameSubmit}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', backgroundColor: 'var(--surface-card)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--mute)' }}>Stok di Sistem</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>{activeProduct.stock} {activeProduct.unit}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--mute)' }}>Perubahan</div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 700, 
                    color: (newStockVal - activeProduct.stock) > 0 ? 'green' : (newStockVal - activeProduct.stock) < 0 ? 'var(--error)' : 'var(--ink)'
                  }}>
                    {(newStockVal - activeProduct.stock) > 0 ? '+' : ''}{newStockVal - activeProduct.stock} {activeProduct.unit}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Stok Fisik Sebenarnya</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={newStockVal} 
                  onChange={(e) => setNewStockVal(Number(e.target.value))} 
                  required 
                  min={0}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alasan Penyesuaian</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Contoh: Barang rusak, selisih perhitungan, dll..."
                  value={opnameReason}
                  onChange={(e) => setOpnameReason(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Proses Stock Opname
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
