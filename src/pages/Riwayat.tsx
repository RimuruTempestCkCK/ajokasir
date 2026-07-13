import React, { useState, useEffect } from 'react';
import { db, Transaction, Customer, Profile } from '../db';
import { Search, Eye, XCircle, RefreshCw, Printer, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { showAlert, showConfirm, showSuccessToast } from '../utils/swal';

interface RiwayatProps {
  userRole: 'owner' | 'kasir' | 'gudang';
}

export const Riwayat: React.FC<RiwayatProps> = ({ userRole }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cashiers, setCashiers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchInvoice, setSearchInvoice] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Detail Modal / Receipt Modal
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const canCancelOrReturn = userRole === 'owner';

  const loadData = async () => {
    try {
      setLoading(true);
      const txs = await db.getTransactions();
      const custs = await db.getCustomers();
      const users = await db.getUsers();
      setTransactions(txs);
      setCustomers(custs);
      setCashiers(users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = (tx: Transaction) => {
    setActiveTx(tx);
    setIsDetailOpen(true);
  };

  const handleOpenReceipt = (tx: Transaction) => {
    setActiveTx(tx);
    setIsReceiptOpen(true);
  };

  const handleCancelTx = async (id: string) => {
    const result = await showConfirm(
      'Batalkan Transaksi?',
      'Apakah Anda yakin ingin membatalkan transaksi ini? Semua stok barang yang dibeli akan dikembalikan.',
      'Ya, Batalkan',
      'Kembali'
    );
    if (result.isConfirmed) {
      try {
        await db.cancelTransaction(id);
        loadData();
        setIsDetailOpen(false);
        showSuccessToast('Transaksi berhasil dibatalkan');
      } catch (err: any) {
        showAlert('Gagal Batal', err.message || 'Gagal membatalkan transaksi', 'error');
      }
    }
  };

  const handleReturnTx = async (id: string) => {
    const { value: reason } = await Swal.fire({
      title: 'Alasan Retur Barang',
      input: 'text',
      inputLabel: 'Masukkan alasan retur produk ini:',
      inputPlaceholder: 'Contoh: Barang rusak / Salah beli...',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e', // Rose
      cancelButtonColor: '#64748b',  // Slate
      confirmButtonText: 'Proses Retur',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      color: '#0f172a',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Alasan retur harus diisi!';
        }
      }
    });

    if (reason) {
      try {
        await db.returnTransaction(id, reason);
        loadData();
        setIsDetailOpen(false);
        showSuccessToast('Transaksi berhasil diretur');
      } catch (err: any) {
        showAlert('Gagal Retur', err.message || 'Gagal meretur transaksi', 'error');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter Logic
  const filteredTxs = transactions.filter(t => {
    const matchesInvoice = t.invoice_no.toLowerCase().includes(searchInvoice.toLowerCase());
    const matchesCustomer = filterCustomer === 'all' || t.customer_id === filterCustomer;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesInvoice && matchesCustomer && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Riwayat Penjualan</h1>
          <p className="page-subtitle">Daftar semua transaksi penjualan kasir, pembatalan, dan retur pelanggan.</p>
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div className="search-input-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Cari berdasarkan No. Invoice..."
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: '1 1 150px', minWidth: '130px' }}>
          <select 
            className="form-select" 
            style={{ height: '44px' }}
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
          >
            <option value="all">Semua Pelanggan</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 130px', minWidth: '110px' }}>
          <select 
            className="form-select" 
            style={{ height: '44px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="returned">Retur</option>
          </select>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat riwayat transaksi...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No. Invoice</th>
                <th>Tanggal / Waktu</th>
                <th>Kasir</th>
                <th>Pelanggan</th>
                <th>Metode</th>
                <th>Subtotal</th>
                <th>Total Tagihan</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 700 }}>{tx.invoice_no}</td>
                  <td>{new Date(tx.created_at).toLocaleString('id-ID')}</td>
                  <td>{tx.cashier_name}</td>
                  <td>{tx.customer_name}</td>
                  <td style={{ textTransform: 'uppercase' }}>{tx.payment_method}</td>
                  <td>Rp {tx.subtotal.toLocaleString('id-ID')}</td>
                  <td style={{ fontWeight: 700 }}>Rp {tx.total.toLocaleString('id-ID')}</td>
                  <td>
                    <span className={`badge ${
                      tx.status === 'completed' ? 'badge-success' : tx.status === 'cancelled' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {tx.status === 'completed' ? 'Selesai' : tx.status === 'cancelled' ? 'Batal' : 'Retur'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button 
                        className="btn btn-icon" 
                        title="Lihat Rincian"
                        onClick={() => handleOpenDetail(tx)}
                        style={{ width: '32px', height: '32px' }}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn btn-icon" 
                        title="Cetak Ulang Struk"
                        onClick={() => handleOpenReceipt(tx)}
                        style={{ width: '32px', height: '32px' }}
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    Transaksi tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailOpen && activeTx && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <button className="modal-close" onClick={() => setIsDetailOpen(false)}><X size={18} /></button>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '4px' }}>Rincian Transaksi</h2>
            <p style={{ fontSize: '13px', color: 'var(--mute)', marginBottom: '20px' }}>
              Invoice: <strong>{activeTx.invoice_no}</strong> | Status:{' '}
              <strong style={{ textTransform: 'capitalize' }}>{activeTx.status}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '13px', backgroundColor: 'var(--surface-card)', padding: '14px', borderRadius: '12px' }}>
              <div>
                <div style={{ color: 'var(--mute)' }}>Kasir</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{activeTx.cashier_name}</div>
                <div style={{ color: 'var(--mute)', marginTop: '8px' }}>Waktu Transaksi</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{new Date(activeTx.created_at).toLocaleString('id-ID')}</div>
              </div>
              <div>
                <div style={{ color: 'var(--mute)' }}>Pelanggan</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{activeTx.customer_name}</div>
                <div style={{ color: 'var(--mute)', marginTop: '8px' }}>Metode Pembayaran</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase' }}>{activeTx.payment_method}</div>
              </div>
            </div>

            <div className="table-container" style={{ marginBottom: '20px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Harga</th>
                    <th style={{ width: '80px' }}>Jumlah</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTx.items?.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 700 }}>{item.product_name}</td>
                      <td>Rp {item.price.toLocaleString('id-ID')}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>Rp {item.subtotal.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '220px', marginLeft: 'auto', fontSize: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--mute)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>Rp {activeTx.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {activeTx.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--error)' }}>
                  <span>Diskon:</span>
                  <span>-Rp {activeTx.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--mute)' }}>Pajak:</span>
                <span>Rp {activeTx.tax.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, borderTop: '1px solid var(--hairline)', paddingTop: '8px' }}>
                <span>Total:</span>
                <span>Rp {activeTx.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* ACTION BUTTONS (Owner Only - Cancel / Return) */}
            {canCancelOrReturn && activeTx.status === 'completed' && (
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--hairline-soft)', paddingTop: '20px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleReturnTx(activeTx.id)}
                  style={{ flex: 1, gap: '6px', color: '#d97706' }}
                >
                  <RefreshCw size={16} /> Retur Transaksi
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleCancelTx(activeTx.id)}
                  style={{ flex: 1, gap: '6px', color: 'var(--error)' }}
                >
                  <XCircle size={16} /> Batalkan Transaksi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRINT STRUCT MODAL */}
      {isReceiptOpen && activeTx && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '340px', padding: '16px' }}>
            <button className="modal-close" onClick={() => setIsReceiptOpen(false)}><X size={18} /></button>
            
            <div id="print-receipt" style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>AjoKasir Mart</div>
                <div>Padang, Sumatera Barat</div>
                <div>================================</div>
              </div>
              
              <div>
                <div>Invoice : {activeTx.invoice_no}</div>
                <div>Tanggal : {new Date(activeTx.created_at).toLocaleString('id-ID')}</div>
                <div>Kasir   : {activeTx.cashier_name}</div>
                <div>Pelanggan: {activeTx.customer_name}</div>
                <div>--------------------------------</div>
              </div>

              <div style={{ margin: '10px 0' }}>
                {activeTx.items?.map((item: any, i: number) => (
                  <div key={i} style={{ marginBottom: '6px' }}>
                    <div>{item.product_name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>  {item.quantity} x Rp {item.price.toLocaleString('id-ID')}</span>
                      <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
                <div>--------------------------------</div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>Rp {activeTx.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {activeTx.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Diskon:</span>
                    <span>-Rp {activeTx.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pajak:</span>
                  <span>Rp {activeTx.tax.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total Tagihan:</span>
                  <span>Rp {activeTx.total.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pembayaran:</span>
                  <span>Rp {activeTx.cash_paid.toLocaleString('id-ID')}</span>
                </div>
                {activeTx.payment_method === 'cash' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Kembalian:</span>
                    <span>Rp {activeTx.cash_change.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div>================================</div>
              </div>
              
              {activeTx.status !== 'completed' && (
                <div style={{ textAlign: 'center', margin: '10px 0', border: '1px dashed red', padding: '4px', fontWeight: 'bold', color: 'red' }}>
                  STATUS TRANSAKSI: {activeTx.status.toUpperCase()}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsReceiptOpen(false)}>Tutup</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrint}>
                <Printer size={16} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
