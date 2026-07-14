import React, { useState, useEffect } from 'react';
import { db, Store } from '../db';
import { Plus, Edit2, Trash2, X, Store as StoreIcon, Phone, MapPin } from 'lucide-react';
import { showAlert, showConfirm, showSuccessToast } from '../utils/swal';

interface StoresProps {
  userRole: string;
  onSelectStore?: (storeId: string) => void;
}

export const StoresPage: React.FC<StoresProps> = ({ userRole, onSelectStore }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const isSuperAdmin = userRole === 'super_admin';

  const loadStores = async () => {
    try {
      setLoading(true);
      const list = await db.getStores();
      setStores(list);
    } catch (err) {
      console.error('Gagal mengambil data toko:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadStores();
    }
  }, [userRole]);

  if (!isSuperAdmin) {
    return (
      <div className="card-soft" style={{ textAlign: 'center', padding: '48px', margin: '24px 0' }}>
        <h2 style={{ color: 'var(--error)' }}>Akses Ditolak</h2>
        <p style={{ marginTop: '8px', color: 'var(--mute)' }}>Manajemen Toko hanya dapat diakses oleh Super Admin.</p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setName('');
    setAddress('');
    setPhone('');
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (s: Store) => {
    setActiveId(s.id);
    setName(s.name);
    setAddress(s.address || '');
    setPhone(s.phone || '');
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (isEdit && activeId) {
        await db.updateStore(activeId, name.trim(), address.trim(), phone.trim());
        showSuccessToast('Informasi toko berhasil diperbarui');
      } else {
        await db.createStore(name.trim(), address.trim(), phone.trim());
        showSuccessToast('Toko baru berhasil ditambahkan');
      }
      setIsOpen(false);
      loadStores();
    } catch (err: any) {
      showAlert('Gagal Menyimpan', err.message || 'Gagal menyimpan data toko', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'store-1') {
      showAlert('Aksi Ditolak', 'Toko utama (AjoKasir Mart) tidak dapat dihapus dari sistem demo', 'warning');
      return;
    }
    const result = await showConfirm(
      'Hapus Toko?',
      'Menghapus toko akan menghapus SEMUA data produk, transaksi, dan akun yang terkait dengan toko ini secara permanen!',
      'Ya, Hapus Toko',
      'Batal'
    );
    if (result.isConfirmed) {
      try {
        await db.deleteStore(id);
        loadStores();
        showSuccessToast('Toko berhasil dihapus beserta seluruh datanya');
      } catch (err: any) {
        showAlert('Gagal Menghapus', err.message || 'Gagal menghapus toko', 'error');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Daftar Toko</h1>
          <p className="page-subtitle">Daftar cabang/toko yang terdaftar dalam sistem AjoKasir.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Tambah Toko
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat daftar toko...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Toko</th>
                <th>No. Telepon</th>
                <th>Alamat</th>
                <th>Tanggal Pendaftaran</th>
                <th style={{ width: '200px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    Belum ada toko terdaftar.
                  </td>
                </tr>
              ) : (
                stores.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StoreIcon size={16} color="var(--primary)" />
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td>{s.phone || '-'}</td>
                    <td>{s.address || '-'}</td>
                    <td>{new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => onSelectStore && onSelectStore(s.id)}
                          style={{ padding: '4px 8px', fontSize: '11px', height: '32px' }}
                        >
                          Masuk Toko
                        </button>
                        <button className="btn btn-icon" onClick={() => handleOpenEdit(s)} style={{ width: '32px', height: '32px' }}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-icon" onClick={() => handleDelete(s.id)} style={{ width: '32px', height: '32px', color: 'var(--error)' }} disabled={s.id === 'store-1'}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT STORE MODAL */}
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setIsOpen(false)}><X size={18} /></button>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>
              {isEdit ? 'Ubah Informasi Toko' : 'Tambah Toko Baru'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Toko</label>
                <div style={{ position: 'relative' }}>
                  <StoreIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '36px' }}
                    placeholder="Contoh: AjoKasir Cabang Padang" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">No. Telepon Toko</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '36px' }}
                    placeholder="Contoh: 0812-3456-7890" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Toko</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--ash)' }} />
                  <textarea 
                    className="form-textarea" 
                    style={{ paddingLeft: '36px' }}
                    placeholder="Masukkan alamat lengkap toko..." 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', height: '44px' }}>
                {isEdit ? 'Simpan Perubahan' : 'Tambah Toko'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
