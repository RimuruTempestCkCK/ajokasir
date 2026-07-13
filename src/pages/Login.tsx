import React, { useState } from 'react';
import { db } from '../db';
import { Key, Mail, ShieldAlert } from 'lucide-react';
import logo from '../assets/logo.png';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, error: loginErr } = await db.login(email, password);
      if (loginErr) {
        const errMsg = typeof loginErr === 'string' 
          ? loginErr 
          : (loginErr.message || (typeof loginErr === 'object' ? JSON.stringify(loginErr) : String(loginErr)));
        
        setError(errMsg === '{}' ? 'Email atau password salah / Akun belum terdaftar' : errMsg);
      } else if (user) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('admin123'); // seed password length >= 6
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--surface-soft)',
      padding: '20px'
    }}>
      <div className="modal-container" style={{
        maxWidth: '440px',
        animation: 'none',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src={logo} 
            alt="Logo AjoKasir" 
            style={{
              width: '160px',
              height: 'auto',
              maxHeight: '160px',
              objectFit: 'contain',
              marginBottom: '12px',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          {/* <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>AjoKasir</h1> */}
          <p style={{ fontSize: '14px', color: 'var(--mute)', marginTop: '4px' }}>
            Sistem Point of Sale & Manajemen Inventori
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: 'var(--error)',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ash)'
              }} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ash)'
              }} />
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Masuk...' : 'Masuk ke Aplikasi'}
          </button>
        </form>

        {/* <div style={{ margin: '24px 0 16px 0', position: 'relative', textAlign: 'center' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'var(--hairline-soft)',
            zIndex: 1
          }}></div>
          <span style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'var(--canvas)',
            padding: '0 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--mute)'
          }}>
            LOGIN CEPAT (DEMO)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => handleQuickLogin('owner@ajokasir.com')}
            className="btn btn-secondary"
            style={{ justifyContent: 'space-between', padding: '10px 16px' }}
          >
            <span>Bung Ajo (Owner)</span>
            <span style={{ fontSize: '11px', color: 'var(--mute)' }}>owner@ajokasir.com</span>
          </button>
          <button
            onClick={() => handleQuickLogin('kasir@ajokasir.com')}
            className="btn btn-secondary"
            style={{ justifyContent: 'space-between', padding: '10px 16px' }}
          >
            <span>Uni Rina (Kasir)</span>
            <span style={{ fontSize: '11px', color: 'var(--mute)' }}>kasir@ajokasir.com</span>
          </button>
          <button
            onClick={() => handleQuickLogin('gudang@ajokasir.com')}
            className="btn btn-secondary"
            style={{ justifyContent: 'space-between', padding: '10px 16px' }}
          >
            <span>Uda Buyung (Gudang)</span>
            <span style={{ fontSize: '11px', color: 'var(--mute)' }}>gudang@ajokasir.com</span>
          </button>
        </div> */}
      </div>
    </div>
  );
};
