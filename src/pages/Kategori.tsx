import React, { useState, useEffect } from 'react';
import { db, Category } from '../db';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface KategoriProps {
  userRole: 'owner' | 'kasir' | 'gudang';
}

export const Kategori: React.FC<KategoriProps> = ({ userRole }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // RBAC checks
  const hasAccess = userRole === 'owner' || userRole === 'gudang';
  const canManage = userRole === 'owner'; // Only Owner can CRUD Kategori, Gudang can only view (👁️)

  const loadCategories = async () => {
    try {
      setLoading(true);
      const list = await db.getCategories();
      setCategories(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadCategories();
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
    setDescription('');
    isEdit ? setIsEdit(false) : null;
    setIsOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setName(c.name);
    setDescription(c.description);
    setActiveId(c.id);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && activeId) {
        await db.updateCategory(activeId, name, description);
      } else {
        await db.createCategory(name, description);
      }
      setIsOpen(false);
      loadCategories();
    } catch (err) {
      alert('Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini? Produk dalam kategori ini akan kehilangan relasinya.')) return;
    try {
      await db.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert('Gagal menghapus kategori');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Kategori</h1>
          <p className="page-subtitle">Kelola pengelompokan produk/barang dagangan Anda.</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Tambah Kategori
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat kategori...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '250px' }}>Nama Kategori</th>
                <th>Deskripsi</th>
                <th style={{ width: '150px' }}>Tanggal Dibuat</th>
                {canManage && <th style={{ width: '120px', textAlign: 'right' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td style={{ color: 'var(--charcoal)' }}>{c.description || '-'}</td>
                  <td>{new Date(c.created_at).toLocaleDateString('id-ID')}</td>
                  {canManage && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn btn-icon" onClick={() => handleOpenEdit(c)} style={{ width: '32px', height: '32px' }}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-icon" onClick={() => handleDelete(c.id)} style={{ width: '32px', height: '32px', color: 'var(--error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 4 : 3} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    Kategori masih kosong.
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
              {isEdit ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Kategori</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: Sembako, Minuman..." 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Penjelasan singkat kategori..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {isEdit ? 'Simpan Perubahan' : 'Simpan Kategori'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
