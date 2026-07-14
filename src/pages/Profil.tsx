import React, { useState } from 'react';
import { db, Profile } from '../db';
import { User, Shield, Key, Save } from 'lucide-react';

interface ProfilProps {
  currentUser: Profile | null;
}

export const Profil: React.FC<ProfilProps> = ({ currentUser }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return <div style={{ padding: '24px' }}>Belum masuk log</div>;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 6) {
      setError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      const ok = await db.changePassword(password);
      if (ok) {
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
      } else {
        setError('Gagal memperbarui password di Supabase Auth.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="page-subtitle">Lihat informasi detail akun Anda dan perbarui password masuk Anda.</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        
        {/* Profile Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
            <User size={18} color="var(--primary)" /> Informasi Pengguna
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid var(--hairline-soft)' }}>
            <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
              {currentUser.full_name[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>{currentUser.full_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{currentUser.role}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mute)' }}>Username:</span>
              <span style={{ fontWeight: 600 }}>{currentUser.username}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mute)' }}>Email:</span>
              <span style={{ fontWeight: 600 }}>{currentUser.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mute)' }}>Hak Akses Peran:</span>
              <span style={{ 
                fontWeight: 700, 
                color: currentUser.role === 'owner' ? 'var(--primary)' : currentUser.role === 'gudang' ? '#2563eb' : '#0d9488',
                textTransform: 'capitalize'
              }}>
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
            <Shield size={18} color="var(--primary)" /> Ganti Password Masuk
          </h2>

          {success && (
            <div style={{
              backgroundColor: 'var(--success-pale)',
              color: 'var(--success-deep)',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              ✓ Password berhasil diperbarui!
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: 'var(--error)',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              ✗ {error}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Password Baru (Min. 6 Karakter)</label>
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
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Konfirmasi Password Baru</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '36px' }}
                  placeholder="******" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '40px', marginTop: '10px', gap: '6px' }}>
              <Save size={14} /> Perbarui Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
