import React, { useState, useEffect } from 'react';
import { db, Purchase, Supplier, Product, Profile } from '../db';
import { Plus, Check, Truck, X, Eye } from 'lucide-react';
import { showAlert, showConfirm, showSuccessToast } from '../utils/swal';

interface PembelianProps {
  userRole: 'owner' | 'kasir' | 'gudang';
  currentUser: Profile | null;
}

interface POItemInput {
  productId: string;
  quantity: number;
  price: number;
}

export const Pembelian: React.FC<PembelianProps> = ({ userRole, currentUser }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activePo, setActivePo] = useState<Purchase | null>(null);

  // Form states (Creating PO)
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [poItems, setPoItems] = useState<POItemInput[]>([{ productId: '', quantity: 1, price: 0 }]);

  // RBAC checks
  const hasAccess = userRole === 'owner' || userRole === 'gudang';
  const canApprove = userRole === 'owner';
  const canReceive = userRole === 'owner' || userRole === 'gudang';

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await db.getPurchases();
      const sups = await db.getSuppliers();
      const prods = await db.getProducts();
      setPurchases(list);
      setSuppliers(sups);
      setProducts(prods);
      if (sups.length > 0) setSelectedSupplier(sups[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [userRole]);

  if (!hasAccess) {
    return (
      <div className="card-soft" style={{ textAlign: 'center', padding: '48px', margin: '24px 0' }}>
        <h2 style={{ color: 'var(--error)' }}>Akses Ditolak</h2>
        <p style={{ marginTop: '8px', color: 'var(--mute)' }}>Gudang/Owner saja yang dapat mengelola data pembelian.</p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setPoItems([{ productId: products[0]?.id || '', quantity: 1, price: products[0]?.cost_price || 0 }]);
    setIsAddOpen(true);
  };

  const handleAddRow = () => {
    setPoItems([...poItems, { productId: products[0]?.id || '', quantity: 1, price: products[0]?.cost_price || 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: keyof POItemInput, val: any) => {
    const updated = [...poItems];
    if (field === 'productId') {
      const prod = products.find(p => p.id === val);
      updated[index] = {
        productId: val,
        quantity: updated[index].quantity,
        price: prod ? prod.cost_price : 0
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: val
      };
    }
    setPoItems(updated);
  };

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    // Validate
    const invalid = poItems.some(item => !item.productId || item.quantity <= 0 || item.price < 0);
    if (invalid) {
      showAlert('Input Tidak Valid', 'Mohon lengkapi semua item barang, kuantitas, dan harga pembelian.', 'warning');
      return;
    }

    try {
      const subtotal = poItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const tax = Math.round(subtotal * 0.11); // 11% standard tax
      const total = subtotal + tax;

      const items = poItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      }));

      await db.createPurchase({
        supplier_id: selectedSupplier,
        creator_id: currentUser?.id || 'user-gudang',
        subtotal,
        tax,
        total
      }, items);

      setIsAddOpen(false);
      loadData();
      showSuccessToast('Purchase Order berhasil dibuat');
    } catch (err: any) {
      showAlert('Gagal Membuat PO', err.message || 'Gagal membuat purchase order', 'error');
    }
  };

  const handleApprove = async (id: string) => {
    const result = await showConfirm(
      'Setujui PO?',
      'Apakah Anda yakin ingin menyetujui Purchase Order ini untuk masuk ke tahap pengadaan?',
      'Ya, Setujui',
      'Kembali'
    );
    if (result.isConfirmed) {
      try {
        await db.approvePurchase(id);
        loadData();
        setIsDetailOpen(false);
        showSuccessToast('Purchase Order disetujui');
      } catch (err: any) {
        showAlert('Gagal Approval', err.message || 'Gagal menyetujui PO', 'error');
      }
    }
  };

  const handleReceive = async (id: string) => {
    const result = await showConfirm(
      'Konfirmasi Penerimaan?',
      'Konfirmasi penerimaan barang? Stok produk bersangkutan di gudang akan otomatis bertambah dan harga pokok terupdate.',
      'Ya, Terima',
      'Kembali'
    );
    if (result.isConfirmed) {
      try {
        await db.receivePurchase(id);
        loadData();
        setIsDetailOpen(false);
        showSuccessToast('Barang berhasil diterima & stok terupdate');
      } catch (err: any) {
        showAlert('Gagal Terima', err.message || 'Gagal memproses penerimaan barang', 'error');
      }
    }
  };

  const handleOpenDetail = (po: Purchase) => {
    setActivePo(po);
    setIsDetailOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pembelian (PO)</h1>
          <p className="page-subtitle">Buat Purchase Order ke supplier, approve pengadaan, dan terima stok masuk.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Buat PO Baru
        </button>
      </div>

      {/* PO LIST TABLE */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat riwayat pembelian...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No. Purchase Order</th>
                <th>Supplier</th>
                <th>Tanggal Dibuat</th>
                <th>Pembuat</th>
                <th>Total Belanja</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(po => (
                <tr key={po.id}>
                  <td style={{ fontWeight: 700 }}>{po.purchase_no}</td>
                  <td>{po.supplier_name}</td>
                  <td>{new Date(po.created_at).toLocaleDateString('id-ID')}</td>
                  <td>{po.creator_name}</td>
                  <td style={{ fontWeight: 700 }}>Rp {po.total.toLocaleString('id-ID')}</td>
                  <td>
                    <span className={`badge ${
                      po.status === 'received' ? 'badge-success' : po.status === 'approved' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {po.status === 'received' ? 'Diterima' : po.status === 'approved' ? 'Disetujui' : 'Menunggu Approval'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-icon" onClick={() => handleOpenDetail(po)} style={{ width: '32px', height: '32px' }}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    Belum ada data pembelian PO.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-container modal-container-lg">
            <button className="modal-close" onClick={() => setIsAddOpen(false)}><X size={18} /></button>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Buat Purchase Order Baru</h2>
            
            <form onSubmit={handleSubmitPO}>
              <div className="form-group" style={{ maxWidth: '300px' }}>
                <label className="form-label">Pilih Supplier</label>
                <select className="form-select" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} required>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ margin: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--charcoal)' }}>Daftar Barang Belanja</h3>
                  <button type="button" className="btn btn-secondary" onClick={handleAddRow} style={{ height: '32px', fontSize: '12px' }}>
                    + Tambah Baris
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                  {poItems.map((row, idx) => (
                    <div key={idx} className="po-item-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 2 }}>
                        <select className="form-select" value={row.productId} onChange={(e) => handleRowChange(idx, 'productId', e.target.value)} required>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: '90px' }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Qty" 
                          value={row.quantity} 
                          onChange={(e) => handleRowChange(idx, 'quantity', Number(e.target.value))} 
                          required 
                          min={1} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Harga Beli" 
                          value={row.price} 
                          onChange={(e) => handleRowChange(idx, 'price', Number(e.target.value))} 
                          required 
                          min={0}
                        />
                      </div>
                      <div style={{ width: '100px', textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>
                        Rp {(row.quantity * row.price).toLocaleString('id-ID')}
                      </div>
                      <button type="button" className="btn btn-icon" onClick={() => handleRemoveRow(idx)} style={{ width: '32px', height: '32px', color: 'var(--error)', backgroundColor: 'transparent' }} disabled={poItems.length === 1}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--hairline-soft)', paddingTop: '16px' }}>
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--mute)' }}>Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>
                      Rp {poItems.reduce((s, i) => s + (i.quantity * i.price), 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--mute)' }}>Pajak PO (11%):</span>
                    <span>
                      Rp {Math.round(poItems.reduce((s, i) => s + (i.quantity * i.price), 0) * 0.11).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', borderTop: '1px solid var(--hairline)', paddingTop: '6px' }}>
                    <span>Total Estimasi:</span>
                    <span>
                      Rp {Math.round(poItems.reduce((s, i) => s + (i.quantity * i.price), 0) * 1.11).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', height: '44px' }}>
                Kirim Purchase Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailOpen && activePo && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '650px' }}>
            <button className="modal-close" onClick={() => setIsDetailOpen(false)}><X size={18} /></button>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '4px' }}>Rincian Purchase Order</h2>
            <p style={{ fontSize: '13px', color: 'var(--mute)', marginBottom: '20px' }}>
              No. PO: <strong>{activePo.purchase_no}</strong> | Status:{' '}
              <strong style={{ textTransform: 'capitalize' }}>{activePo.status}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '13px', backgroundColor: 'var(--surface-card)', padding: '14px', borderRadius: '12px' }}>
              <div>
                <div style={{ color: 'var(--mute)' }}>Pemasok / Supplier</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{activePo.supplier_name}</div>
                <div style={{ color: 'var(--mute)', marginTop: '8px' }}>Tanggal Pembuatan</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{new Date(activePo.created_at).toLocaleDateString('id-ID')}</div>
              </div>
              <div>
                <div style={{ color: 'var(--mute)' }}>Staff Gudang</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{activePo.creator_name}</div>
                <div style={{ color: 'var(--mute)', marginTop: '8px' }}>Status Logistik</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase' }}>{activePo.status}</div>
              </div>
            </div>

            <div className="table-container" style={{ marginBottom: '20px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Harga PO</th>
                    <th style={{ width: '80px' }}>Kuantitas</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {activePo.items?.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 700 }}>{item.product_name}</td>
                      <td>Rp {item.price.toLocaleString('id-ID')}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>Rp {item.subtotal.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '220px', marginLeft: 'auto', fontSize: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--mute)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>Rp {activePo.subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--mute)' }}>Pajak PO:</span>
                <span>Rp {activePo.tax.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, borderTop: '1px solid var(--hairline)', paddingTop: '8px' }}>
                <span>Total Belanja:</span>
                <span>Rp {activePo.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* ACTION TRIGGERS DEPENDING ON ROLE AND STATUS */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--hairline-soft)', paddingTop: '20px' }}>
              {activePo.status === 'pending' && canApprove && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleApprove(activePo.id)}
                  style={{ flex: 1, gap: '6px' }}
                >
                  <Check size={16} /> Setujui Purchase Order (Approve)
                </button>
              )}
              {activePo.status === 'approved' && canReceive && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleReceive(activePo.id)}
                  style={{ flex: 1, gap: '6px', backgroundColor: '#0d9488' }}
                >
                  <Truck size={16} /> Konfirmasi Terima Barang Masuk
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
