import React, { useState, useEffect } from 'react';
import { db, Customer } from '../db';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { showAlert, showConfirm, showSuccessToast } from '../utils/swal';

interface PelangganProps {
  userRole: 'super_admin' | 'owner' | 'kasir' | 'gudang';
}

export const PelangganPage: React.FC<PelangganProps> = ({ userRole }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // RBAC checks
  const hasAccess = userRole === 'owner' || userRole === 'kasir' || userRole === 'super_admin';

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const list = await db.getCustomers();
      setCustomers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadCustomers();
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
    setEmail('');
    setAddress('');
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address);
    setActiveId(c.id);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && activeId) {
        await db.updateCustomer(activeId, name, phone, email, address);
        showSuccessToast('Pelanggan berhasil diperbarui');
      } else {
        await db.createCustomer(name, phone, email, address);
        showSuccessToast('Pelanggan baru berhasil ditambahkan');
      }
      setIsOpen(false);
      loadCustomers();
    } catch (err: any) {
      showAlert('Gagal Menyimpan', err.message || 'Gagal menyimpan pelanggan', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'cust-general') {
      showAlert('Aksi Ditolak', 'Pelanggan Umum bawaan sistem tidak dapat dihapus', 'warning');
      return;
    }
    const result = await showConfirm(
      'Hapus Pelanggan?',
      'Apakah Anda yakin ingin menghapus data pelanggan ini?',
      'Ya, Hapus',
      'Batal'
    );
    if (result.isConfirmed) {
      try {
        await db.deleteCustomer(id);
        loadCustomers();
        showSuccessToast('Pelanggan berhasil dihapus');
      } catch (err: any) {
        showAlert('Gagal Menghapus', err.message || 'Gagal menghapus pelanggan', 'error');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Pelanggan</h1>
          <p className="page-subtitle">Kelola data pelanggan untuk program loyalitas dan pencatatan transaksi.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Tambah Pelanggan
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat pelanggan...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Pelanggan</th>
                <th>No. Telepon</th>
                <th>Email</th>
                <th>Alamat</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td style={{ fontWeight: 600 }}>{c.phone || '-'}</td>
                  <td>{c.email || '-'}</td>
                  <td>{c.address || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button className="btn btn-icon" onClick={() => handleOpenEdit(c)} style={{ width: '32px', height: '32px' }} disabled={c.id === 'cust-general'}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-icon" onClick={() => handleDelete(c.id)} style={{ width: '32px', height: '32px', color: 'var(--error)' }} disabled={c.id === 'cust-general'}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
              {isEdit ? 'Ubah Pelanggan' : 'Tambah Pelanggan Baru'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: Budi Santoso..." 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">No. Telepon</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: 0812-xxxx-xxxx" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="nama@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Pelanggan</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Alamat lengkap pelanggan..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {isEdit ? 'Simpan Perubahan' : 'Simpan Pelanggan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
