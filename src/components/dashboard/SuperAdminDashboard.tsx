import React, { useState, useEffect } from 'react';
import { db, Store, Profile, Product, Transaction, Supplier, Customer, Settings } from '../../db';
import { 
  Store as StoreIcon, 
  Users, 
  DollarSign, 
  Plus, 
  ArrowRight, 
  Package, 
  History, 
  UserCog, 
  Phone, 
  MapPin, 
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onNavigate: (page: string) => void;
  selectedStoreId: string | null;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate, selectedStoreId }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Profile[]>([]);
  const [stats, setStats] = useState({ totalStores: 0, totalOwners: 0, globalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  
  // Selected store data
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<Profile[]>([]);
  const [activeSuppliers, setActiveSuppliers] = useState<Supplier[]>([]);
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [activeSettings, setActiveSettings] = useState<Settings | null>(null);
  const [activeStoreName, setActiveStoreName] = useState<string>('');

  // Global store revenues for chart
  const [storeRevenues, setStoreRevenues] = useState<{ name: string; revenue: number; pct: number }[]>([]);
  
  // Tab control
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'products' | 'transactions' | 'employees' | 'contacts' | 'settings'>('summary');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const storeList = await db.getStores();
        const userList = await db.getUsers();
        const ownerList = userList.filter(u => u.role === 'owner');
        
        // Sum total revenue from all transactions across all stores
        const allTransactions = await db.getTransactionsGlobal();
        const completedTxs = allTransactions.filter((t: Transaction) => t.status === 'completed');
        const totalRev = completedTxs.reduce((sum: number, t: Transaction) => sum + Number(t.total), 0);

        setStores(storeList);
        setOwners(ownerList);
        setStats({
          totalStores: storeList.length,
          totalOwners: ownerList.length,
          globalRevenue: totalRev
        });

        // Calculate store revenue shares
        const revenues = storeList.map(st => {
          const storeTxSum = completedTxs
            .filter((t: Transaction) => t.store_id === st.id)
            .reduce((sum: number, t: Transaction) => sum + Number(t.total), 0);
          return {
            name: st.name,
            revenue: storeTxSum,
            pct: totalRev > 0 ? Math.round((storeTxSum / totalRev) * 100) : 0
          };
        }).sort((a, b) => b.revenue - a.revenue);
        setStoreRevenues(revenues);

        // Load store-specific context
        const storeId = selectedStoreId || db.getStoreId();
        if (storeId) {
          const currentStore = storeList.find(s => s.id === storeId);
          setActiveStoreName(currentStore ? currentStore.name : 'Toko Terpilih');
          
          const prods = await db.getProducts();
          const txs = await db.getTransactions();
          const employees = await db.getUsers();
          const suppliers = await db.getSuppliers();
          const customers = await db.getCustomers();
          const settingsData = await db.getSettings();

          setActiveProducts(prods);
          setActiveTransactions(txs);
          setActiveEmployees(employees.filter(u => u.role !== 'super_admin'));
          setActiveSuppliers(suppliers);
          setActiveCustomers(customers);
          setActiveSettings(settingsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedStoreId]);

  if (loading) {
    return <div className="loading-spinner" style={{ textAlign: 'center', padding: '48px' }}>Memuat analitik global...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">Dashboard Super Admin</h1>
        <p className="page-subtitle">Panel pusat untuk mengelola toko cabang, akun owner, serta memantau data operasional global.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">{stats.totalStores}</span>
              <span className="stat-label">Total Toko Cabang</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(230, 0, 35, 0.1)', color: 'var(--primary)' }}>
              <StoreIcon size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">{stats.totalOwners}</span>
              <span className="stat-label">Mitra Owner Terdaftar</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(54, 162, 235, 0.1)', color: '#36a2eb' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <span className="stat-value">Rp {stats.globalRevenue.toLocaleString('id-ID')}</span>
              <span className="stat-label">Total Omzet Global (Semua Toko)</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(75, 192, 192, 0.1)', color: '#4bc0c0' }}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--hairline-soft)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`chip ${activeSubTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('summary')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <StoreIcon size={16} /> Ringkasan Toko & Mitra
        </button>
        <button 
          className={`chip ${activeSubTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('products')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Package size={16} /> Aset Barang ({activeStoreName})
        </button>
        <button 
          className={`chip ${activeSubTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('transactions')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <History size={16} /> Transaksi ({activeStoreName})
        </button>
        <button 
          className={`chip ${activeSubTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('employees')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <UserCog size={16} /> Karyawan ({activeStoreName})
        </button>
        <button 
          className={`chip ${activeSubTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('contacts')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={16} /> Supplier & Pelanggan
        </button>
        <button 
          className={`chip ${activeSubTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('settings')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <StoreIcon size={16} /> Detail Setelan Toko
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: SUMMARY */}
      {activeSubTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* VISUAL CHARTS SECTION */}
          <div className="grid-2" style={{ gap: '20px' }}>
            {/* CHART 1: REVENUE CONTRIBUTION */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                <TrendingUp size={18} color="var(--primary)" /> Kontribusi Omzet Cabang Toko
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
                {storeRevenues.map((st, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{st.name}</span>
                      <span style={{ fontWeight: 600, color: 'var(--mute)' }}>
                        Rp {st.revenue.toLocaleString('id-ID')} ({st.pct}%)
                      </span>
                    </div>
                    {/* Progress split bar */}
                    <div style={{ height: '10px', backgroundColor: 'var(--secondary-bg)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${st.pct}%`,
                        height: '100%',
                        background: idx === 0 
                          ? 'linear-gradient(90deg, var(--primary) 0%, #ff5252 100%)' 
                          : 'linear-gradient(90deg, #36a2eb 0%, #a0c4ff 100%)',
                        borderRadius: '5px'
                      }}></div>
                    </div>
                  </div>
                ))}
                {storeRevenues.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--mute)', padding: '24px' }}>Belum ada data transaksi penjualan global.</p>
                )}
              </div>
            </div>

            {/* CHART 2: SYSTEM GROWTH STATS */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                <Award size={18} color="#36a2eb" /> Metrik Pertumbuhan Korporat
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '10px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--canvas)', borderRadius: '16px', border: '1px solid var(--hairline-soft)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalStores}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)', marginTop: '4px' }}>Toko Terintegrasi</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'var(--canvas)', borderRadius: '16px', border: '1px solid var(--hairline-soft)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#36a2eb' }}>{stats.totalOwners}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)', marginTop: '4px' }}>Pemilik Aktif</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--mute)', textAlign: 'center', padding: '4px' }}>
                Sistem aktif terhubung ke Cloud Cluster Supabase Real-time.
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '20px' }}>
            {/* QUICK ACTIONS & OWNER LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 className="card-title">Tindakan Cepat</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={() => onNavigate('stores')}
                    className="btn btn-primary"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Plus size={18} /> Tambah Cabang Toko Baru
                    </span>
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => onNavigate('owners')}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Plus size={18} /> Daftarkan Akun Owner Baru
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 className="card-title">Daftar Akun Owner</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Nama Owner</th>
                        <th>Email</th>
                        <th>Asosiasi Toko</th>
                      </tr>
                    </thead>
                    <tbody>
                      {owners.map(ow => {
                        const associatedStore = stores.find(s => s.id === ow.store_id);
                        return (
                          <tr key={ow.id}>
                            <td style={{ fontWeight: 600 }}>{ow.full_name}</td>
                            <td>{ow.email}</td>
                            <td>{associatedStore ? associatedStore.name : 'Tanpa Toko'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* STORES OVERVIEW */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="card-title">Ikhtisar Toko Cabang</h2>
              <div style={{ overflowX: 'auto' }}>
                {stores.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--mute)', padding: '24px 0' }}>Belum ada toko terdaftar.</p>
                ) : (
                  <table className="table" style={{ fontSize: '14px' }}>
                    <thead>
                      <tr>
                        <th>Nama Toko</th>
                        <th>Alamat</th>
                        <th>Telepon</th>
                        <th>Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map(st => {
                        const storeOwner = owners.find(o => o.store_id === st.id);
                        return (
                          <tr key={st.id}>
                            <td style={{ fontWeight: 700 }}>{st.name}</td>
                            <td style={{ fontSize: '12px' }}>{st.address || '-'}</td>
                            <td>{st.phone || '-'}</td>
                            <td style={{ fontWeight: 600 }}>
                              {storeOwner ? storeOwner.full_name : <span style={{ color: 'var(--error)', fontSize: '12px' }}>Belum Dikaitkan</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MONITORING */}
      {activeSubTab === 'products' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h2 className="card-title" style={{ marginBottom: '4px' }}>Aset Barang: {activeStoreName}</h2>
            <p style={{ color: 'var(--mute)', fontSize: '13px' }}>Menampilkan daftar produk aktif di cabang toko terpilih.</p>
          </div>
          
          <div className="table-container">
            <table className="table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th>Barcode</th>
                  <th>Harga Modal</th>
                  <th>Harga Jual</th>
                  <th>Stok Aktif</th>
                  <th>Nilai Aset Modal</th>
                </tr>
              </thead>
              <tbody>
                {activeProducts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.barcode}</td>
                    <td>Rp {Number(p.cost_price).toLocaleString('id-ID')}</td>
                    <td>Rp {Number(p.price).toLocaleString('id-ID')}</td>
                    <td style={{ fontWeight: 700, color: p.stock <= p.min_stock ? 'var(--primary)' : 'var(--ink)' }}>
                      {p.stock} {p.unit}
                    </td>
                    <td style={{ fontWeight: 700 }}>Rp {(Number(p.cost_price) * p.stock).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {activeProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                      Tidak ada produk ditemukan di toko ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTIONS MONITORING */}
      {activeSubTab === 'transactions' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h2 className="card-title" style={{ marginBottom: '4px' }}>Riwayat Transaksi: {activeStoreName}</h2>
            <p style={{ color: 'var(--mute)', fontSize: '13px' }}>Menampilkan daftar penjualan di cabang toko terpilih.</p>
          </div>

          <div className="table-container">
            <table className="table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>No Invoice</th>
                  <th>Waktu Transaksi</th>
                  <th>Metode</th>
                  <th>Pajak</th>
                  <th>Total Belanja</th>
                  <th>Kasir</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 700 }}>{tx.invoice_no}</td>
                    <td>{new Date(tx.created_at).toLocaleString('id-ID')}</td>
                    <td>
                      <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
                        {tx.payment_method}
                      </span>
                    </td>
                    <td>Rp {Number(tx.tax).toLocaleString('id-ID')}</td>
                    <td style={{ fontWeight: 700 }}>Rp {Number(tx.total).toLocaleString('id-ID')}</td>
                    <td>{tx.cashier_name}</td>
                    <td>
                      <span className={`badge ${tx.status === 'completed' ? 'badge-success' : 'badge-error'}`}>
                        {tx.status === 'completed' ? 'Selesai' : tx.status === 'cancelled' ? 'Batal' : 'Retur'}
                      </span>
                    </td>
                  </tr>
                ))}
                {activeTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                      Belum ada transaksi penjualan di toko ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EMPLOYEES MONITORING */}
      {activeSubTab === 'employees' && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h2 className="card-title" style={{ marginBottom: '4px' }}>Daftar Staf Karyawan: {activeStoreName}</h2>
            <p style={{ color: 'var(--mute)', fontSize: '13px' }}>Daftar pemilik (owner), kasir, dan staf gudang di cabang ini.</p>
          </div>

          <div className="table-container">
            <table className="table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Nama Lengkap</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Peran (Role)</th>
                  <th>Status Akun</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 600 }}>{emp.full_name}</td>
                    <td>{emp.username || '-'}</td>
                    <td>{emp.email}</td>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                      <span className={`badge ${
                        emp.role === 'owner' ? 'badge-info' : emp.role === 'kasir' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                        <ShieldCheck size={14} /> Aktif (Verified)
                      </span>
                    </td>
                  </tr>
                ))}
                {activeEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                      Belum ada staf terdaftar di toko ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPLIERS & CUSTOMERS */}
      {activeSubTab === 'contacts' && (
        <div className="grid-2" style={{ gap: '20px' }}>
          {/* SUPPLIERS CARD */}
          <div className="card">
            <h2 className="card-title">Jaringan Supplier ({activeStoreName})</h2>
            <div className="table-container">
              <table className="table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Nama Supplier</th>
                    <th>Telepon</th>
                    <th>Alamat</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSuppliers.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.phone || '-'}</td>
                      <td>{s.address || '-'}</td>
                    </tr>
                  ))}
                  {activeSuppliers.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                        Belum ada supplier terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CUSTOMERS CARD */}
          <div className="card">
            <h2 className="card-title">Daftar Pelanggan ({activeStoreName})</h2>
            <div className="table-container">
              <table className="table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Nama Pelanggan</th>
                    <th>Telepon</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCustomers.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>{c.phone || '-'}</td>
                      <td>{c.email || '-'}</td>
                    </tr>
                  ))}
                  {activeCustomers.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                        Belum ada pelanggan terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STORE DETAILS & SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--hairline-soft)', paddingBottom: '12px' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <StoreIcon size={20} color="var(--primary)" /> Profil & Detail Setelan Cabang
            </h2>
            <p style={{ color: 'var(--mute)', fontSize: '13px' }}>Konfigurasi operasional toko terpilih.</p>
          </div>

          {activeSettings ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--canvas)', borderRadius: '12px' }}>
                <StoreIcon size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Nama Toko / Swalayan</div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{activeSettings.shop_name}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--canvas)', borderRadius: '12px' }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Alamat Lengkap Toko</div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{activeSettings.shop_address || '-'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--canvas)', borderRadius: '12px' }}>
                <Phone size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--mute)' }}>No. Telepon Toko</div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{activeSettings.shop_phone || '-'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--canvas)', borderRadius: '12px' }}>
                <DollarSign size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--mute)' }}>Persentase Pajak Pembelian (%)</div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{activeSettings.tax_percentage} %</div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--mute)', padding: '24px 0' }}>Data setelan tidak ditemukan untuk toko ini.</p>
          )}
        </div>
      )}

    </div>
  );
};
