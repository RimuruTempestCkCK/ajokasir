import React, { useState, useEffect } from 'react';
import { db, Profile, Store } from '../db';
import { Plus, Edit2, Trash2, X, Shield, Mail, User, Store as StoreIcon, Key } from 'lucide-react';
import { showAlert, showConfirm, showSuccessToast } from '../utils/swal';

interface OwnersProps {
  userRole: string;
}

export const OwnersPage: React.FC<OwnersProps> = ({ userRole }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [password, setPassword] = useState('');

  const isSuperAdmin = userRole === 'super_admin';

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await db.getUsers();
      const storeList = await db.getStores();
      setUsers(list.filter(u => u.role === 'owner'));
      setStores(storeList);
      if (storeList.length > 0) {
        setSelectedStoreId(storeList[0].id);
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [userRole]);

  if (!isSuperAdmin) {
    return (
      <div className="card-soft" style={{ textAlign: 'center', padding: '48px', margin: '24px 0' }}>
        <h2 style={{ color: 'var(--error)' }}>Akses Ditolak</h2>
        <p style={{ marginTop: '8px', color: 'var(--mute)' }}>Manajemen Owner Toko hanya dapat diakses oleh Super Admin.</p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEmail('');
    setUsername('');
    setFullName('');
    setPassword('');
    if (stores.length > 0) {
      setSelectedStoreId(stores[0].id);
    } else {
      setSelectedStoreId('');
    }
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (u: Profile) => {
    setActiveId(u.id);
    setEmail(u.email);
    setUsername(u.username);
    setFullName(u.full_name);
    setSelectedStoreId(u.store_id || '');
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !username.trim() || !fullName.trim()) return;
    if (!selectedStoreId) {
      showAlert('Toko Belum Dipilih', 'Silakan pilih toko untuk diasosiasikan dengan owner ini', 'warning');
      return;
    }

    try {
      if (isEdit && activeId) {
        await db.updateUserRole(activeId, 'owner', selectedStoreId);
        showSuccessToast('Owner berhasil diperbarui');
      } else {
        await db.createUser({
          email: email.trim(),
          username: username.trim(),
          full_name: fullName.trim(),
          role: 'owner',
          store_id: selectedStoreId
        }, password);
        showSuccessToast('Akun Owner baru berhasil ditambahkan');
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      showAlert('Gagal Menyimpan', err.message || 'Gagal menyimpan data owner', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'user-owner') {
      showAlert('Aksi Ditolak', 'Akun Owner utama tidak dapat dihapus dalam mode demo', 'warning');
      return;
    }
    const result = await showConfirm(
      'Hapus Akun Owner?',
      'Apakah Anda yakin ingin menghapus akun owner ini? Owner yang bersangkutan tidak akan bisa mengelola tokonya lagi.',
      'Ya, Hapus',
      'Batal'
    );
    if (result.isConfirmed) {
      try {
        await db.deleteUser(id);
        loadData();
        showSuccessToast('Akun Owner berhasil dihapus');
      } catch (err: any) {
        showAlert('Gagal Menghapus', err.message || 'Gagal menghapus owner', 'error');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Owner Toko</h1>
          <p className="page-subtitle">Daftar akun Owner toko beserta toko yang mereka kelola.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} disabled={stores.length === 0}>
          <Plus size={16} /> Tambah Owner
        </button>
      </div>

      {stores.length === 0 && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          color: '#b45309',
          padding: '16px',
          borderRadius: '16px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          💡 <strong>Perhatian:</strong> Silakan tambahkan Toko terlebih dahulu di menu <strong>Kelola Toko</strong> sebelum menambahkan Owner.
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat daftar owner...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>Username</th>
                <th>Email</th>
                <th>Mengelola Toko</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    Belum ada Owner terdaftar.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge badge-info" style={{ fontWeight: 600 }}>
                        <StoreIcon size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {u.store_name || '-'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn btn-icon" onClick={() => handleOpenEdit(u)} style={{ width: '32px', height: '32px' }}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-icon" onClick={() => handleDelete(u.id)} style={{ width: '32px', height: '32px', color: 'var(--error)' }} disabled={u.id === 'user-owner'}>
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

      {/* ADD/EDIT OWNER MODAL */}
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setIsOpen(false)}><X size={18} /></button>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>
              {isEdit ? 'Ubah Informasi Owner' : 'Tambah Akun Owner Baru'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {!isEdit && (
                <>
                  <div className="form-group">
                    <label className="form-label">Email Login</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                      <input 
                        type="email" 
                        className="form-input" 
                        style={{ paddingLeft: '36px' }}
                        placeholder="owner@email.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password Masuk (Min. 6 Karakter)</label>
                    <div style={{ position: 'relative' }}>
                      <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                      <input 
                        type="password" 
                        className="form-input" 
                        style={{ paddingLeft: '36px' }}
                        placeholder="******" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        minLength={6}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Nama Lengkap Owner</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '36px' }}
                    placeholder="Nama lengkap owner" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {!isEdit && (
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <div style={{ position: 'relative' }}>
                    <Shield size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '36px' }}
                      placeholder="Username unik" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Mengelola Toko</label>
                <div style={{ position: 'relative' }}>
                  <StoreIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                  <select 
                    className="form-select" 
                    style={{ paddingLeft: '36px' }}
                    value={selectedStoreId} 
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Pilih Toko...</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', height: '44px' }}>
                {isEdit ? 'Simpan Perubahan' : 'Tambah Owner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
