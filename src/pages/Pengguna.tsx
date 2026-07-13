import React, { useState, useEffect } from 'react';
import { db, Profile } from '../db';
import { Plus, Edit2, Trash2, X, Shield, Mail, User } from 'lucide-react';

interface PenggunaProps {
  userRole: 'owner' | 'kasir' | 'gudang';
}

export const Pengguna: React.FC<PenggunaProps> = ({ userRole }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'owner' | 'kasir' | 'gudang'>('kasir');
  const [password, setPassword] = useState('');

  // RBAC check
  const isOwner = userRole === 'owner';

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await db.getUsers();
      setUsers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      loadUsers();
    }
  }, [userRole]);

  if (!isOwner) {
    return (
      <div className="card-soft" style={{ textAlign: 'center', padding: '48px', margin: '24px 0' }}>
        <h2 style={{ color: 'var(--error)' }}>Akses Ditolak</h2>
        <p style={{ marginTop: '8px', color: 'var(--mute)' }}>Manajemen Pengguna hanya dapat diakses oleh Owner toko.</p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEmail('');
    setUsername('');
    setFullName('');
    setRole('kasir');
    setPassword('');
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (u: Profile) => {
    setActiveId(u.id);
    setEmail(u.email);
    setUsername(u.username);
    setFullName(u.full_name);
    setRole(u.role);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && activeId) {
        await db.updateUserRole(activeId, role);
      } else {
        await db.createUser({
          email: email.trim(),
          username: username.trim(),
          full_name: fullName.trim(),
          role
        }, password);
      }
      setIsOpen(false);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data pengguna');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'user-owner') {
      alert('Owner utama tidak dapat dihapus');
      return;
    }
    if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;
    try {
      await db.deleteUser(id);
      loadUsers();
    } catch (err) {
      alert('Gagal menghapus pengguna');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="page-subtitle">Kelola akun kasir, staff gudang, dan hak akses karyawan Anda.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat daftar pengguna...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role / Peran</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                  <td style={{ fontFamily: 'monospace' }}>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${
                      u.role === 'owner' ? 'badge-error' : u.role === 'gudang' ? 'badge-info' : 'badge-success'
                    }`} style={{ textTransform: 'capitalize' }}>
                      {u.role === 'owner' ? 'Owner' : u.role === 'gudang' ? 'Gudang' : 'Kasir'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button className="btn btn-icon" onClick={() => handleOpenEdit(u)} style={{ width: '32px', height: '32px' }} disabled={u.id === 'user-owner'}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-icon" onClick={() => handleDelete(u.id)} style={{ width: '32px', height: '32px', color: 'var(--error)' }} disabled={u.id === 'user-owner'}>
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
              {isEdit ? 'Ubah Peran Pengguna' : 'Tambah Akun Pengguna Baru'}
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
                        placeholder="karyawan@ajokasir.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--mute)', display: 'block', marginTop: '6px', lineHeight: '1.4' }}>
                      * Jika menggunakan email dummy (misal: <code>@ajokasir.com</code>), pastikan <strong>"Confirm email"</strong> dinonaktifkan di Dashboard Supabase (Authentication &gt; Providers &gt; Email), atau gunakan email asli.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ paddingLeft: '36px' }}
                        placeholder="Contoh: kasir1" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Karyawan</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Nama asli karyawan..." 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password Awal (Min. 6 Karakter)</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="******" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      minLength={6}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Role / Hak Akses</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                  <select 
                    className="form-select" 
                    style={{ paddingLeft: '36px' }}
                    value={role} 
                    onChange={(e) => setRole(e.target.value as any)} 
                    required
                  >
                    <option value="kasir">Kasir (Transaksi Penjualan)</option>
                    <option value="gudang">Gudang (Kelola Stok & Supplier)</option>
                    <option value="owner">Owner (Semua Akses & Laporan)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', height: '44px' }}>
                {isEdit ? 'Simpan Perubahan Peran' : 'Daftarkan Pengguna'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
