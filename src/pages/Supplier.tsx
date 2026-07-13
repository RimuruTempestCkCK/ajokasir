import React, { useState, useEffect } from 'react';
import { db, Supplier } from '../db';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface SupplierProps {
  userRole: 'owner' | 'kasir' | 'gudang';
}

export const SupplierPage: React.FC<SupplierProps> = ({ userRole }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // RBAC checks
  const hasAccess = userRole === 'owner' || userRole === 'gudang';

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const list = await db.getSuppliers();
      setSuppliers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadSuppliers();
    }
  }, [userRole]);

  if (!hasAccess) {
    return (
      <div className="card-soft" style={{ textAlign: 'center', padding: '48px', margin: '24px 0' }}>
        <h2 style={{ color: 'var(--error)' }}>Akses Ditolak</h2>
        <p style={{ marginTop: '8px', color: 'var(--mute)' }}>Anda tidak memiliki hak akses untuk membuka halaman ini.</p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setName('');
    setPhone('');
    setAddress('');
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setName(s.name);
    setPhone(s.phone);
    setAddress(s.address);
    setActiveId(s.id);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && activeId) {
        await db.updateSupplier(activeId, name, phone, address);
      } else {
        await db.createSupplier(name, phone, address);
      }
      setIsOpen(false);
      loadSuppliers();
    } catch (err) {
      alert('Gagal menyimpan supplier');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus supplier ini?')) return;
    try {
      await db.deleteSupplier(id);
      loadSuppliers();
    } catch (err) {
      alert('Gagal menghapus supplier');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Supplier</h1>
          <p className="page-subtitle">Kelola daftar supplier/pemasok barang untuk toko Anda.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Tambah Supplier
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat supplier...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Supplier</th>
                <th>No. Telepon</th>
                <th>Alamat</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>{s.name}</td>
                  <td style={{ fontWeight: 600 }}>{s.phone || '-'}</td>
                  <td>{s.address || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button className="btn btn-icon" onClick={() => handleOpenEdit(s)} style={{ width: '32px', height: '32px' }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-icon" onClick={() => handleDelete(s.id)} style={{ width: '32px', height: '32px', color: 'var(--error)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    Supplier masih kosong.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setIsOpen(false)}><X size={18} /></button>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>
              {isEdit ? 'Ubah Supplier' : 'Tambah Supplier Baru'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Supplier</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: PT Indofood CBP..." 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">No. Telepon / HP</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: 0812-xxxx-xxxx" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Pemasok</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Alamat lengkap supplier..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {isEdit ? 'Simpan Perubahan' : 'Simpan Supplier'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
