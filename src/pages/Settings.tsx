import React, { useState, useEffect } from 'react';
import { db, Settings } from '../db';
import { Store, Percent, Phone, MapPin, Save, ShieldAlert } from 'lucide-react';

interface SettingsProps {
  userRole: 'owner' | 'kasir' | 'gudang';
}

export const SettingsPage: React.FC<SettingsProps> = ({ userRole }) => {
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [taxPercentage, setTaxPercentage] = useState(11);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // RBAC check: Only Owner can manage Settings
  const isOwner = userRole === 'owner';

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        if (isOwner) {
          const data = await db.getSettings();
          setShopName(data.shop_name);
          setShopAddress(data.shop_address);
          setShopPhone(data.shop_phone);
          setTaxPercentage(data.tax_percentage);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [userRole]);

  if (!isOwner) {
    return (
      <div className="card-soft" style={{ textAlign: 'center', padding: '48px', margin: '24px 0' }}>
        <h2 style={{ color: 'var(--error)' }}>Akses Ditolak</h2>
        <p style={{ marginTop: '8px', color: 'var(--mute)' }}>Pengaturan Toko hanya dapat diubah oleh Owner.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    try {
      await db.updateSettings({
        shop_name: shopName,
        shop_address: shopAddress,
        shop_phone: shopPhone,
        tax_percentage: Number(taxPercentage)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan pengaturan');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan Toko</h1>
          <p className="page-subtitle">Atur profil toko Anda, alamat cetak struk, dan persentase Pajak Pertambahan Nilai (PPN).</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat pengaturan...</div>
      ) : (
        <div className="card" style={{ maxWidth: '600px' }}>
          {success && (
            <div style={{
              backgroundColor: 'var(--success-pale)',
              color: 'var(--success-deep)',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '20px',
              border: '1px solid #a7f3d0'
            }}>
              ✓ Pengaturan toko berhasil disimpan!
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Nama Toko / Bisnis</label>
              <div style={{ position: 'relative' }}>
                <Store size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '38px' }}
                  value={shopName} 
                  onChange={(e) => setShopName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">No. Telepon Toko</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '38px' }}
                  value={shopPhone} 
                  onChange={(e) => setShopPhone(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Lengkap Toko (Muncul di Struk)</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--ash)' }} />
                <textarea 
                  className="form-textarea" 
                  style={{ paddingLeft: '38px' }}
                  value={shopAddress} 
                  onChange={(e) => setShopAddress(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pajak Penjualan PPN (%)</label>
              <div style={{ position: 'relative' }}>
                <Percent size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: '38px' }}
                  value={taxPercentage} 
                  onChange={(e) => setTaxPercentage(Number(e.target.value))} 
                  required 
                  min={0}
                  max={100}
                />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--mute)', marginTop: '2px' }}>
                Pajak ini akan otomatis ditambahkan ke total transaksi belanja kasir.
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '16px', gap: '8px' }}>
              <Save size={16} /> Simpan Pengaturan Toko
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
