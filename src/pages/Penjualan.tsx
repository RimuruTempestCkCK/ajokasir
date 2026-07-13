import React, { useState, useEffect, useRef } from 'react';
import { db, Product, Customer, Category, Settings } from '../db';
import { Search, ShoppingCart, Trash2, Printer, Plus, Minus, Check, X, CreditCard, ScanBarcode } from 'lucide-react';

interface PenjualanProps {
  userRole: 'owner' | 'kasir' | 'gudang';
  currentUser: any;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const Penjualan: React.FC<PenjualanProps> = ({ userRole, currentUser }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<Settings>({ shop_name: 'AjoKasir', shop_address: '', shop_phone: '', tax_percentage: 11 });
  const [loading, setLoading] = useState(true);

  // Mobile navigation tab
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');

  // Search and Filter
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('cust-general');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qris'>('cash');
  const [cashPaid, setCashPaid] = useState(0);

  // Checkout Success / Receipt
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedTx, setCompletedTx] = useState<any>(null);

  // --- Math ---
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const taxAmount = Math.round((subtotal - discount) * (settings.tax_percentage / 100));
  const total = Math.max(0, subtotal - discount + taxAmount);
  const change = Math.max(0, cashPaid - total);

  const barcodeRef = useRef<HTMLInputElement>(null);

  // RBAC check: Gudang cannot sell
  const hasAccess = userRole === 'owner' || userRole === 'kasir';

  const loadData = async () => {
    try {
      setLoading(true);
      const prods = await db.getProducts();
      const cats = await db.getCategories();
      const custs = await db.getCustomers();
      const sett = await db.getSettings();
      
      setProducts(prods);
      setCategories(cats);
      setCustomers(custs);
      setSettings(sett);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [userRole]);

  // Focus barcode input on mount
  useEffect(() => {
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, [loading]);

  // Auto set cash paid when pas or payment change
  useEffect(() => {
    if (paymentMethod !== 'cash') {
      setCashPaid(total);
    }
  }, [total, paymentMethod]);

  if (!hasAccess) {
    return (
      <div className="card-soft" style={{ textAlign: 'center', padding: '48px', margin: '24px 0' }}>
        <h2 style={{ color: 'var(--error)' }}>Akses Ditolak</h2>
        <p style={{ marginTop: '8px', color: 'var(--mute)' }}>Kasir/Owner saja yang dapat melayani transaksi penjualan.</p>
      </div>
    );
  }

  // --- Barcode Scanner Logic ---
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedProd = products.find(p => p.barcode === barcodeInput.trim());
    if (matchedProd) {
      if (matchedProd.stock === 0) {
        alert(`Stok barang "${matchedProd.name}" habis!`);
      } else {
        addToCart(matchedProd);
      }
    } else {
      alert(`Barang dengan barcode "${barcodeInput}" tidak ditemukan`);
    }
    setBarcodeInput('');
  };

  // --- Cart operations ---
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`Jumlah pembelian melebihi stok yang tersedia (${product.stock} ${product.unit})`);
        return;
      }
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock <= 0) {
        alert('Stok barang habis!');
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQty = (productId: string, val: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    const newQty = item.quantity + val;
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > item.product.stock) {
      alert(`Stok tidak mencukupi. Maksimal stok: ${item.product.stock}`);
      return;
    }

    setCart(cart.map(i => i.product.id === productId ? { ...i, quantity: newQty } : i));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCashPaid(0);
  };



  const handlePas = () => setCashPaid(total);
  const handleQuickCash = (amt: number) => setCashPaid(amt);

  // --- Checkout ---
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && cashPaid < total) {
      alert('Uang pembayaran kurang!');
      return;
    }

    try {
      const itemsToInsert = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        cost_price: item.product.cost_price,
        subtotal: item.product.price * item.quantity
      }));

      const newTx = await db.createTransaction({
        cashier_id: currentUser?.id || 'user-kasir',
        customer_id: selectedCustomer === 'cust-general' ? null : selectedCustomer,
        subtotal,
        discount,
        tax: taxAmount,
        total,
        payment_method: paymentMethod,
        cash_paid: Number(cashPaid),
        cash_change: Number(change)
      }, itemsToInsert);

      // Reload products to get latest stock levels
      const updatedProds = await db.getProducts();
      setProducts(updatedProds);

      setCompletedTx(newTx);
      setIsReceiptOpen(true);
      clearCart();
    } catch (err: any) {
      alert(err.message || 'Gagal memproses transaksi');
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchesCat = selectedCat === 'all' || p.category_id === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ height: 'calc(100vh - 170px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* BARCODE SCANNER BANNER ROW */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleBarcodeSubmit} style={{ flex: 1, minWidth: '280px' }}>
          <div className="search-input-wrapper">
            <ScanBarcode size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            <input
              ref={barcodeRef}
              type="text"
              className="search-input"
              style={{ backgroundColor: '#fff', border: '1px solid var(--hairline-soft)' }}
              placeholder="Scan Barcode / Tulis Barcode langsung lalu tekan ENTER..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
          </div>
        </form>

        <div style={{ flex: '1 1 200px', minWidth: '160px' }}>
          <div className="search-input-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ash)' }} />
            <input
              type="text"
              className="search-input"
              style={{ backgroundColor: '#fff', border: '1px solid var(--hairline-soft)' }}
              placeholder="Cari barang biasa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
          <select 
            className="form-select" 
            style={{ height: '44px' }}
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MOBILE TAB SWITCHER FOR POS */}
      <div className="pos-mobile-tabs">
        <button 
          className={`chip ${mobileTab === 'products' ? 'active' : ''}`}
          onClick={() => setMobileTab('products')}
        >
          📦 Barang ({filteredProducts.length})
        </button>
        <button 
          className={`chip ${mobileTab === 'cart' ? 'active' : ''}`}
          onClick={() => setMobileTab('cart')}
          style={{ position: 'relative' }}
        >
          🛒 Keranjang ({cart.reduce((s, i) => s + i.quantity, 0)})
          {cart.length > 0 && (
            <span style={{
              marginLeft: '6px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              Rp {total.toLocaleString('id-ID')}
            </span>
          )}
        </button>
      </div>

      {/* CORE POS LAYOUT */}
      <div className={`pos-layout ${mobileTab === 'products' ? 'show-products' : 'show-cart'}`}>
        
        {/* Left Side: Product Picker */}
        <div className="pos-products-side">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Memuat barang dagangan...</div>
          ) : (
            <div className="pos-products-grid">
              {filteredProducts.map(p => {
                const inCart = cart.find(item => item.product.id === p.id);
                const isOutOfStock = p.stock === 0;
                
                return (
                  <div 
                    key={p.id} 
                    className={`pos-product-card ${inCart ? 'selected' : ''}`}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    style={{ 
                      opacity: isOutOfStock ? 0.6 : 1
                    }}
                  >
                    {inCart && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}>
                        {inCart.quantity}
                      </div>
                    )}
                    <div>
                      <div className="pos-product-name">{p.name}</div>
                      <div className="pos-product-barcode">{p.barcode}</div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="pos-product-stock" style={{ 
                          color: isOutOfStock ? 'var(--error)' : p.stock <= p.min_stock ? '#d97706' : 'var(--mute)'
                        }}>
                          Stok: {p.stock}
                        </span>
                        <span style={{ fontSize: '11px', textTransform: 'lowercase', color: 'var(--mute)' }}>{p.unit}</span>
                      </div>
                      <div className="pos-product-price">Rp {p.price.toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--mute)' }}>
                  Barang tidak ditemukan.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Active Cart */}
        <div className="pos-cart-side">
          <div className="pos-cart-header">
            <h2 className="card-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} /> Keranjang Belanja ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>
            {cart.length > 0 && (
              <button className="btn btn-tertiary" onClick={clearCart} style={{ color: 'var(--error)', height: '32px', padding: '0 8px' }}>
                Hapus Semua
              </button>
            )}
          </div>

          <div className="pos-cart-items">
            {cart.map(item => (
              <div key={item.product.id} className="pos-cart-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pos-cart-item-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product.name}
                  </div>
                  <div className="pos-cart-item-price">
                    Rp {item.product.price.toLocaleString('id-ID')} / {item.product.unit}
                  </div>
                </div>
                
                <div className="pos-cart-qty-ctrl">
                  <button className="pos-cart-qty-btn" onClick={() => updateQty(item.product.id, -1)}><Minus size={12} /></button>
                  <span className="pos-cart-qty-val">{item.quantity}</span>
                  <button className="pos-cart-qty-btn" onClick={() => updateQty(item.product.id, 1)}><Plus size={12} /></button>
                </div>

                <div style={{ minWidth: '70px', textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>
                  Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                </div>

                <button 
                  className="btn btn-icon" 
                  onClick={() => removeFromCart(item.product.id)}
                  style={{ width: '28px', height: '28px', color: 'var(--error)', backgroundColor: 'transparent' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            
            {cart.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ash)', gap: '8px' }}>
                <ShoppingCart size={40} strokeWidth={1.5} />
                <span style={{ fontSize: '14px' }}>Keranjang belanja kosong</span>
              </div>
            )}
          </div>

          {/* Cart checkout details */}
          <div className="pos-cart-summary">
            {/* Customer Dropdown */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)', width: '80px' }}>Pelanggan:</span>
              <select 
                className="form-select" 
                style={{ height: '34px', padding: '4px 8px', borderRadius: '10px', fontSize: '13px' }}
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Discount input */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)', width: '80px' }}>Diskon (Rp):</span>
              <input 
                type="number"
                className="form-input" 
                style={{ height: '34px', padding: '4px 8px', borderRadius: '10px', fontSize: '13px' }}
                value={discount === 0 ? '' : discount}
                placeholder="0"
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              />
            </div>

            {/* Payment Method */}
            <div style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
              <button 
                className={`btn btn-secondary ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
                style={{ flex: 1, height: '32px', fontSize: '12px', backgroundColor: paymentMethod === 'cash' ? 'var(--ink)' : 'var(--secondary-bg)', color: paymentMethod === 'cash' ? '#fff' : '#000' }}
              >
                💵 TUNAI
              </button>
              <button 
                className={`btn btn-secondary ${paymentMethod === 'qris' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('qris')}
                style={{ flex: 1, height: '32px', fontSize: '12px', backgroundColor: paymentMethod === 'qris' ? 'var(--ink)' : 'var(--secondary-bg)', color: paymentMethod === 'qris' ? '#fff' : '#000' }}
              >
                📱 QRIS
              </button>
              <button 
                className={`btn btn-secondary ${paymentMethod === 'transfer' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('transfer')}
                style={{ flex: 1, height: '32px', fontSize: '12px', backgroundColor: paymentMethod === 'transfer' ? 'var(--ink)' : 'var(--secondary-bg)', color: paymentMethod === 'transfer' ? '#fff' : '#000' }}
              >
                💳 TRF BANK
              </button>
            </div>

            {/* Cash Paid input (Only for Cash payments) */}
            {paymentMethod === 'cash' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mute)', width: '80px' }}>Bayar (Rp):</span>
                  <input 
                    type="number"
                    className="form-input" 
                    style={{ height: '34px', padding: '4px 8px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}
                    value={cashPaid === 0 ? '' : cashPaid}
                    placeholder="0"
                    onChange={(e) => setCashPaid(Math.max(0, Number(e.target.value)))}
                  />
                  <button className="btn btn-secondary" onClick={handlePas} style={{ height: '34px', fontSize: '11px', padding: '0 10px', borderRadius: '10px' }}>PAS</button>
                </div>
                {/* Quick cash suggestions */}
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {[10000, 20000, 50000, 100000].map(amt => (
                    <button 
                      key={amt} 
                      className="btn btn-secondary" 
                      onClick={() => handleQuickCash(amt)}
                      style={{ height: '24px', fontSize: '10px', padding: '0 6px', borderRadius: '6px' }}
                      disabled={amt < total}
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pos-summary-row">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            
            {discount > 0 && (
              <div className="pos-summary-row" style={{ color: 'var(--error)' }}>
                <span>Diskon</span>
                <span>-Rp {discount.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="pos-summary-row">
              <span>Pajak ({settings.tax_percentage}%)</span>
              <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
            </div>

            <div className="pos-summary-row-bold">
              <span>Total Tagihan</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>

            {paymentMethod === 'cash' && cashPaid > total && (
              <div className="pos-summary-row" style={{ color: '#0d9488', fontWeight: 600, fontSize: '13px', borderTop: '1px dotted var(--hairline)', paddingTop: '4px' }}>
                <span>Kembalian</span>
                <span>Rp {change.toLocaleString('id-ID')}</span>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', height: '48px', fontSize: '16px', marginTop: '4px' }}
              disabled={cart.length === 0 || (paymentMethod === 'cash' && cashPaid < total)}
              onClick={handleCheckout}
            >
              Proses Transaksi (Bayar)
            </button>
          </div>
        </div>

      </div>

      {/* RECEIPT PRINTING MODAL */}
      {isReceiptOpen && completedTx && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '340px', padding: '16px' }}>
            <button className="modal-close" onClick={() => setIsReceiptOpen(false)}><X size={18} /></button>
            
            {/* Printable Receipt layout */}
            <div id="print-receipt" style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{settings.shop_name}</div>
                <div>{settings.shop_address}</div>
                <div>Telp: {settings.shop_phone}</div>
                <div>================================</div>
              </div>
              
              <div>
                <div>Invoice : {completedTx.invoice_no}</div>
                <div>Tanggal : {new Date(completedTx.created_at).toLocaleString('id-ID')}</div>
                <div>Kasir   : {currentUser?.full_name || 'Kasir'}</div>
                <div>Pelanggan: {customers.find(c => c.id === completedTx.customer_id)?.name || 'Pelanggan Umum'}</div>
                <div>--------------------------------</div>
              </div>

              <div style={{ margin: '10px 0' }}>
                {completedTx.items?.map((item: any, i: number) => (
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
                  <span>Rp {completedTx.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {completedTx.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Diskon:</span>
                    <span>-Rp {completedTx.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pajak ({settings.tax_percentage}%):</span>
                  <span>Rp {completedTx.tax.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total Tagihan:</span>
                  <span>Rp {completedTx.total.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pembayaran ({completedTx.payment_method.toUpperCase()}):</span>
                  <span>Rp {completedTx.cash_paid.toLocaleString('id-ID')}</span>
                </div>
                {completedTx.payment_method === 'cash' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Kembalian:</span>
                    <span>Rp {completedTx.cash_change.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div>================================</div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <div>Terima Kasih atas Kunjungan Anda</div>
                <div>Layanan Konsumen: {settings.shop_phone}</div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsReceiptOpen(false)}>Selesai</button>
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
