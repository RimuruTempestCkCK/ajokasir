import { createClient } from '@supabase/supabase-js';

// Detect Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'owner' | 'kasir' | 'gudang';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category_id: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name?: string; // join helper
  quantity: number;
  price: number;
  cost_price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoice_no: string;
  cashier_id: string;
  cashier_name?: string; // join helper
  customer_id: string | null;
  customer_name?: string; // join helper
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'transfer' | 'qris';
  cash_paid: number;
  cash_change: number;
  status: 'completed' | 'cancelled' | 'returned';
  created_at: string;
  items?: TransactionItem[];
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  product_name?: string; // join helper
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  purchase_no: string;
  supplier_id: string;
  supplier_name?: string; // join helper
  creator_id: string;
  creator_name?: string; // join helper
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'approved' | 'received';
  created_at: string;
  items?: PurchaseItem[];
}

export interface StockLog {
  id: string;
  product_id: string;
  product_name?: string; // join helper
  quantity: number;
  type: 'sale' | 'purchase' | 'opname' | 'adjustment';
  description: string;
  created_at: string;
}

export interface Settings {
  shop_name: string;
  shop_address: string;
  shop_phone: string;
  tax_percentage: number;
}

// Default Seed Data for LocalStorage
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Sembako', description: 'Bahan pokok makanan', created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Minuman', description: 'Minuman kemasan dan segar', created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Makanan Ringan', description: 'Camilan dan snack', created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Kebutuhan Rumah', description: 'Sabun, sampo, dan alat mandi', created_at: new Date().toISOString() },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'prod-1', barcode: '8999999190520', name: 'Indomie Goreng Spesial', category_id: 'cat-3', price: 3500, cost_price: 2800, stock: 120, min_stock: 20, unit: 'pcs', created_at: new Date().toISOString() },
  { id: 'prod-2', barcode: '8992761001004', name: 'Aqua Air Mineral 600ml', category_id: 'cat-2', price: 4000, cost_price: 2500, stock: 80, min_stock: 15, unit: 'pcs', created_at: new Date().toISOString() },
  { id: 'prod-3', barcode: '8998866200213', name: 'Beras Pandan Wangi 5kg', category_id: 'cat-1', price: 78000, cost_price: 68000, stock: 25, min_stock: 5, unit: 'karung', created_at: new Date().toISOString() },
  { id: 'prod-4', barcode: '8999999002243', name: 'Minyak Goreng Bimoli 2L', category_id: 'cat-1', price: 34000, cost_price: 29500, stock: 3, min_stock: 10, unit: 'pouch', created_at: new Date().toISOString() },
  { id: 'prod-5', barcode: '8991002300456', name: 'Sabun Mandi Lifebuoy 85g', category_id: 'cat-4', price: 4500, cost_price: 3500, stock: 50, min_stock: 10, unit: 'pcs', created_at: new Date().toISOString() },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'PT Indofood CBP Sukses Makmur', phone: '021-5551234', address: 'Jl. Sudirman No. 23, Jakarta', created_at: new Date().toISOString() },
  { id: 'sup-2', name: 'PT Tirta Investama (Aqua)', phone: '021-8884321', address: 'Jl. Pulogadung Raya No. 4, Jakarta', created_at: new Date().toISOString() },
  { id: 'sup-3', name: 'CV Sembako Makmur Jaya', phone: '0812-3456-7890', address: 'Jl. Veteran No. 56, Padang', created_at: new Date().toISOString() },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'cust-general', name: 'Pelanggan Umum', phone: '-', email: '-', address: '-', created_at: new Date().toISOString() },
  { id: 'cust-1', name: 'Budi Santoso', phone: '0811-222-333', email: 'budi@gmail.com', address: 'Jl. Merdeka No. 10', created_at: new Date().toISOString() },
  { id: 'cust-2', name: 'Siti Rahma', phone: '0822-444-555', email: 'siti@yahoo.com', address: 'Jl. Kartini No. 4', created_at: new Date().toISOString() },
];

const DEFAULT_PROFILES: Profile[] = [
  { id: 'user-owner', email: 'owner@ajokasir.com', username: 'owner', full_name: 'Bung Ajo (Owner)', role: 'owner' },
  { id: 'user-kasir', email: 'kasir@ajokasir.com', username: 'kasir', full_name: 'Uni Rina (Kasir)', role: 'kasir' },
  { id: 'user-gudang', email: 'gudang@ajokasir.com', username: 'gudang', full_name: 'Uda Buyung (Gudang)', role: 'gudang' },
];

const DEFAULT_SETTINGS: Settings = {
  shop_name: 'AjoKasir Mart',
  shop_address: 'Jl. Khatib Sulaiman No. 12, Padang, Sumatera Barat',
  shop_phone: '0751-444888',
  tax_percentage: 11,
};

// Initial Seed Data Load helper
function getLocalStorageData<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
}

function setLocalStorageData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Mock DB Cache
const mockDb = {
  getProfiles: () => getLocalStorageData<Profile[]>('ajokasir_profiles', DEFAULT_PROFILES),
  setProfiles: (data: Profile[]) => setLocalStorageData('ajokasir_profiles', data),
  
  getCategories: () => getLocalStorageData<Category[]>('ajokasir_categories', DEFAULT_CATEGORIES),
  setCategories: (data: Category[]) => setLocalStorageData('ajokasir_categories', data),

  getProducts: () => getLocalStorageData<Product[]>('ajokasir_products', DEFAULT_PRODUCTS),
  setProducts: (data: Product[]) => setLocalStorageData('ajokasir_products', data),

  getSuppliers: () => getLocalStorageData<Supplier[]>('ajokasir_suppliers', DEFAULT_SUPPLIERS),
  setSuppliers: (data: Supplier[]) => setLocalStorageData('ajokasir_suppliers', data),

  getCustomers: () => getLocalStorageData<Customer[]>('ajokasir_customers', DEFAULT_CUSTOMERS),
  setCustomers: (data: Customer[]) => setLocalStorageData('ajokasir_customers', data),

  getTransactions: () => getLocalStorageData<Transaction[]>('ajokasir_transactions', []),
  setTransactions: (data: Transaction[]) => setLocalStorageData('ajokasir_transactions', data),

  getPurchases: () => getLocalStorageData<Purchase[]>('ajokasir_purchases', []),
  setPurchases: (data: Purchase[]) => setLocalStorageData('ajokasir_purchases', data),

  getStockLogs: () => getLocalStorageData<StockLog[]>('ajokasir_stock_logs', []),
  setStockLogs: (data: StockLog[]) => setLocalStorageData('ajokasir_stock_logs', data),

  getSettings: () => getLocalStorageData<Settings>('ajokasir_settings', DEFAULT_SETTINGS),
  setSettings: (data: Settings) => setLocalStorageData('ajokasir_settings', data),

  getCurrentUser: () => {
    const userStr = localStorage.getItem('ajokasir_current_user');
    return userStr ? (JSON.parse(userStr) as Profile) : null;
  },
  setCurrentUser: (user: Profile | null) => {
    if (user) {
      localStorage.setItem('ajokasir_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ajokasir_current_user');
    }
  }
};

// Seed some past transactions for mock dashboard visuals
if (isDemoMode && mockDb.getTransactions().length === 0) {
  // Seed past transactions
  const seedTransactions: Transaction[] = [
    {
      id: 'tx-1',
      invoice_no: 'TRX-20260710-001',
      cashier_id: 'user-kasir',
      customer_id: 'cust-1',
      subtotal: 11000,
      discount: 1000,
      tax: 1100,
      total: 11100,
      payment_method: 'cash',
      cash_paid: 15000,
      cash_change: 3900,
      status: 'completed',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { id: 'txi-1', transaction_id: 'tx-1', product_id: 'prod-1', quantity: 2, price: 3500, cost_price: 2800, subtotal: 7000 },
        { id: 'txi-2', transaction_id: 'tx-1', product_id: 'prod-2', quantity: 1, price: 4000, cost_price: 2500, subtotal: 4000 }
      ]
    },
    {
      id: 'tx-2',
      invoice_no: 'TRX-20260711-001',
      cashier_id: 'user-kasir',
      customer_id: 'cust-general',
      subtotal: 78000,
      discount: 0,
      tax: 8580,
      total: 86580,
      payment_method: 'qris',
      cash_paid: 86580,
      cash_change: 0,
      status: 'completed',
      created_at: new Date().toISOString(),
      items: [
        { id: 'txi-3', transaction_id: 'tx-2', product_id: 'prod-3', quantity: 1, price: 78000, cost_price: 68000, subtotal: 78000 }
      ]
    }
  ];
  mockDb.setTransactions(seedTransactions);

  // Seed past purchases
  const seedPurchases: Purchase[] = [
    {
      id: 'po-1',
      purchase_no: 'PO-20260709-001',
      supplier_id: 'sup-1',
      creator_id: 'user-gudang',
      subtotal: 280000,
      tax: 30800,
      total: 310800,
      status: 'received',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { id: 'poi-1', purchase_id: 'po-1', product_id: 'prod-1', quantity: 100, price: 2800, subtotal: 280000 }
      ]
    }
  ];
  mockDb.setPurchases(seedPurchases);

  // Seed stock logs
  const seedStockLogs: StockLog[] = [
    { id: 'log-1', product_id: 'prod-1', quantity: 100, type: 'purchase', description: 'Pembelian PO-20260709-001', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log-2', product_id: 'prod-1', quantity: -2, type: 'sale', description: 'Penjualan TRX-20260710-001', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log-3', product_id: 'prod-2', quantity: -1, type: 'sale', description: 'Penjualan TRX-20260710-001', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log-4', product_id: 'prod-3', quantity: -1, type: 'sale', description: 'Penjualan TRX-20260711-001', created_at: new Date().toISOString() },
  ];
  mockDb.setStockLogs(seedStockLogs);
}

// UNIFIED API
export const db = {
  // --- AUTH AUTHENTICATION ---
  async login(email: string, password: string): Promise<{ user: Profile | null; error: Error | null }> {
    if (isDemoMode) {
      const profiles = mockDb.getProfiles();
      const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (found && password.length >= 6) {
        mockDb.setCurrentUser(found);
        return { user: found, error: null };
      }
      return { user: null, error: new Error('Email atau password salah (Min. 6 karakter)') };
    } else {
      try {
        const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) return { user: null, error: new Error(error.message || 'Email atau password salah') };
        if (data?.user) {
          const { data: profile, error: pError } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (pError) {
            return { user: null, error: new Error(pError.message || 'Profil tidak ditemukan') };
          }
          if (!profile) {
            return { user: null, error: new Error('Profil tidak ditemukan') };
          }
          return { user: profile as Profile, error: null };
        }
        return { user: null, error: new Error('Terjadi kesalahan login') };
      } catch (err: any) {
        return { user: null, error: new Error(err.message || 'Terjadi kesalahan login') };
      }
    }
  },

  async logout(): Promise<void> {
    if (isDemoMode) {
      mockDb.setCurrentUser(null);
    } else {
      await supabase!.auth.signOut();
    }
  },

  async getCurrentUser(): Promise<Profile | null> {
    if (isDemoMode) {
      return mockDb.getCurrentUser();
    } else {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      return profile ? (profile as Profile) : null;
    }
  },

  async changePassword(password: string): Promise<boolean> {
    if (isDemoMode) {
      return true;
    } else {
      const { error } = await supabase!.auth.updateUser({ password });
      return !error;
    }
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (isDemoMode) {
      return mockDb.getCategories();
    } else {
      const { data, error } = await supabase!.from('categories').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  },

  async createCategory(name: string, description: string): Promise<Category> {
    if (isDemoMode) {
      const list = mockDb.getCategories();
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name,
        description,
        created_at: new Date().toISOString()
      };
      mockDb.setCategories([...list, newCat]);
      return newCat;
    } else {
      const { data, error } = await supabase!
        .from('categories')
        .insert([{ name, description }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateCategory(id: string, name: string, description: string): Promise<Category> {
    if (isDemoMode) {
      const list = mockDb.getCategories();
      const idx = list.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Category not found');
      list[idx] = { ...list[idx], name, description };
      mockDb.setCategories(list);
      return list[idx];
    } else {
      const { data, error } = await supabase!
        .from('categories')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getCategories();
      mockDb.setCategories(list.filter(c => c.id !== id));
    } else {
      const { error } = await supabase!.from('categories').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // --- PRODUCTS (BARANG) ---
  async getProducts(): Promise<Product[]> {
    if (isDemoMode) {
      return mockDb.getProducts();
    } else {
      const { data, error } = await supabase!.from('products').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  },

  async createProduct(prod: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    if (isDemoMode) {
      const list = mockDb.getProducts();
      const newProd: Product = {
        ...prod,
        id: `prod-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      mockDb.setProducts([...list, newProd]);
      if (newProd.stock > 0) {
        const logs = mockDb.getStockLogs();
        logs.push({
          id: `log-${Date.now()}`,
          product_id: newProd.id,
          quantity: newProd.stock,
          type: 'adjustment',
          description: 'Stok awal barang',
          created_at: new Date().toISOString()
        });
        mockDb.setStockLogs(logs);
      }
      return newProd;
    } else {
      const { data, error } = await supabase!
        .from('products')
        .insert([prod])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateProduct(id: string, prod: Omit<Product, 'id' | 'created_at' | 'stock'>): Promise<Product> {
    if (isDemoMode) {
      const list = mockDb.getProducts();
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      list[idx] = { ...list[idx], ...prod };
      mockDb.setProducts(list);
      return list[idx];
    } else {
      const { data, error } = await supabase!
        .from('products')
        .update(prod)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async adjustStock(id: string, currentStock: number, newStock: number, reason: string): Promise<void> {
    const diff = newStock - currentStock;
    if (diff === 0) return;

    if (isDemoMode) {
      const list = mockDb.getProducts();
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      list[idx].stock = newStock;
      mockDb.setProducts(list);

      const logs = mockDb.getStockLogs();
      logs.push({
        id: `log-${Date.now()}`,
        product_id: id,
        quantity: diff,
        type: 'opname',
        description: `Penyesuaian stok (Stock Opname): ${reason}`,
        created_at: new Date().toISOString()
      });
      mockDb.setStockLogs(logs);
    } else {
      const { error: pError } = await supabase!
        .from('products')
        .update({ stock: newStock })
        .eq('id', id);
      if (pError) throw pError;

      const { error: lError } = await supabase!
        .from('stock_logs')
        .insert([{
          product_id: id,
          quantity: diff,
          type: 'opname',
          description: `Penyesuaian stok (Stock Opname): ${reason}`
        }]);
      if (lError) throw lError;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getProducts();
      mockDb.setProducts(list.filter(p => p.id !== id));
    } else {
      const { error } = await supabase!.from('products').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // --- SUPPLIERS ---
  async getSuppliers(): Promise<Supplier[]> {
    if (isDemoMode) {
      return mockDb.getSuppliers();
    } else {
      const { data, error } = await supabase!.from('suppliers').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  },

  async createSupplier(name: string, phone: string, address: string): Promise<Supplier> {
    if (isDemoMode) {
      const list = mockDb.getSuppliers();
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        name,
        phone,
        address,
        created_at: new Date().toISOString()
      };
      mockDb.setSuppliers([...list, newSup]);
      return newSup;
    } else {
      const { data, error } = await supabase!
        .from('suppliers')
        .insert([{ name, phone, address }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateSupplier(id: string, name: string, phone: string, address: string): Promise<Supplier> {
    if (isDemoMode) {
      const list = mockDb.getSuppliers();
      const idx = list.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('Supplier not found');
      list[idx] = { ...list[idx], name, phone, address };
      mockDb.setSuppliers(list);
      return list[idx];
    } else {
      const { data, error } = await supabase!
        .from('suppliers')
        .update({ name, phone, address })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deleteSupplier(id: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getSuppliers();
      mockDb.setSuppliers(list.filter(s => s.id !== id));
    } else {
      const { error } = await supabase!.from('suppliers').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // --- CUSTOMERS ---
  async getCustomers(): Promise<Customer[]> {
    if (isDemoMode) {
      return mockDb.getCustomers();
    } else {
      const { data, error } = await supabase!.from('customers').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  },

  async createCustomer(name: string, phone: string, email: string, address: string): Promise<Customer> {
    if (isDemoMode) {
      const list = mockDb.getCustomers();
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name,
        phone,
        email,
        address,
        created_at: new Date().toISOString()
      };
      mockDb.setCustomers([...list, newCust]);
      return newCust;
    } else {
      const { data, error } = await supabase!
        .from('customers')
        .insert([{ name, phone, email, address }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateCustomer(id: string, name: string, phone: string, email: string, address: string): Promise<Customer> {
    if (isDemoMode) {
      const list = mockDb.getCustomers();
      const idx = list.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Customer not found');
      list[idx] = { ...list[idx], name, phone, email, address };
      mockDb.setCustomers(list);
      return list[idx];
    } else {
      const { data, error } = await supabase!
        .from('customers')
        .update({ name, phone, email, address })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getCustomers();
      mockDb.setCustomers(list.filter(c => c.id !== id));
    } else {
      const { error } = await supabase!.from('customers').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // --- TRANSACTIONS ---
  async getTransactions(): Promise<Transaction[]> {
    if (isDemoMode) {
      const list = mockDb.getTransactions();
      const cashiers = mockDb.getProfiles();
      const customers = mockDb.getCustomers();
      const products = mockDb.getProducts();

      return list.map(tx => {
        const cashier = cashiers.find(c => c.id === tx.cashier_id);
        const customer = customers.find(c => c.id === tx.customer_id);
        const items = tx.items?.map(it => {
          const prod = products.find(p => p.id === it.product_id);
          return { ...it, product_name: prod ? prod.name : 'Barang Terhapus' };
        });
        return {
          ...tx,
          cashier_name: cashier ? cashier.full_name : 'Kasir Tidak Diketahui',
          customer_name: customer ? customer.name : '-',
          items
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      const { data, error } = await supabase!
        .from('transactions')
        .select(`
          *,
          cashier:profiles!transactions_cashier_id_fkey(full_name),
          customer:customers(name),
          items:transaction_items(*, product:products(name))
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      return (data || []).map((tx: any) => ({
        ...tx,
        cashier_name: tx.cashier?.full_name,
        customer_name: tx.customer?.name || '-',
        items: tx.items?.map((it: any) => ({
          ...it,
          product_name: it.product?.name
        }))
      }));
    }
  },

  async createTransaction(tx: Omit<Transaction, 'id' | 'invoice_no' | 'created_at' | 'status'>, items: Omit<TransactionItem, 'id' | 'transaction_id'>[]): Promise<Transaction> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    if (isDemoMode) {
      const list = mockDb.getTransactions();
      const invoiceCount = list.filter(t => t.invoice_no.startsWith(`TRX-${dateStr}`)).length + 1;
      const invoiceNo = `TRX-${dateStr}-${String(invoiceCount).padStart(3, '0')}`;
      
      const newTxId = `tx-${Date.now()}`;
      const newItems: TransactionItem[] = items.map((it, idx) => ({
        ...it,
        id: `txi-${Date.now()}-${idx}`,
        transaction_id: newTxId
      }));

      const newTx: Transaction = {
        ...tx,
        id: newTxId,
        invoice_no: invoiceNo,
        status: 'completed',
        created_at: new Date().toISOString(),
        items: newItems
      };

      const products = mockDb.getProducts();
      const stockLogs = mockDb.getStockLogs();

      newItems.forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          stockLogs.push({
            id: `log-${Date.now()}-${Math.random()}`,
            product_id: item.product_id,
            quantity: -item.quantity,
            type: 'sale',
            description: `Penjualan ${invoiceNo}`,
            created_at: new Date().toISOString()
          });
        }
      });

      mockDb.setProducts(products);
      mockDb.setStockLogs(stockLogs);
      mockDb.setTransactions([...list, newTx]);

      return newTx;
    } else {
      const { count } = await supabase!
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .like('invoice_no', `TRX-${dateStr}%`);
      const invoiceNo = `TRX-${dateStr}-${String((count || 0) + 1).padStart(3, '0')}`;

      const { data: newTx, error: txError } = await supabase!
        .from('transactions')
        .insert([{
          invoice_no: invoiceNo,
          cashier_id: tx.cashier_id,
          customer_id: tx.customer_id,
          subtotal: tx.subtotal,
          discount: tx.discount,
          tax: tx.tax,
          total: tx.total,
          payment_method: tx.payment_method,
          cash_paid: tx.cash_paid,
          cash_change: tx.cash_change,
          status: 'completed'
        }])
        .select()
        .single();
      if (txError) throw txError;

      const itemsToInsert = items.map(it => ({
        transaction_id: newTx.id,
        product_id: it.product_id,
        quantity: it.quantity,
        price: it.price,
        cost_price: it.cost_price,
        subtotal: it.subtotal
      }));
      const { error: itemsError } = await supabase!.from('transaction_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
      
      return { ...newTx, items: itemsToInsert };
    }
  },

  async cancelTransaction(id: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getTransactions();
      const idx = list.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Transaction not found');
      if (list[idx].status === 'cancelled') return;

      list[idx].status = 'cancelled';
      
      const products = mockDb.getProducts();
      const stockLogs = mockDb.getStockLogs();

      list[idx].items?.forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        if (prod) {
          prod.stock += item.quantity;
          stockLogs.push({
            id: `log-${Date.now()}-${Math.random()}`,
            product_id: item.product_id,
            quantity: item.quantity,
            type: 'adjustment',
            description: `Pembatalan transaksi ${list[idx].invoice_no}`,
            created_at: new Date().toISOString()
          });
        }
      });

      mockDb.setProducts(products);
      mockDb.setStockLogs(stockLogs);
      mockDb.setTransactions(list);
    } else {
      const { error } = await supabase!
        .from('transactions')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    }
  },

  async returnTransaction(id: string, reason: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getTransactions();
      const idx = list.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Transaction not found');
      if (list[idx].status === 'returned') return;

      list[idx].status = 'returned';
      
      const products = mockDb.getProducts();
      const stockLogs = mockDb.getStockLogs();

      list[idx].items?.forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        if (prod) {
          prod.stock += item.quantity;
          stockLogs.push({
            id: `log-${Date.now()}-${Math.random()}`,
            product_id: item.product_id,
            quantity: item.quantity,
            type: 'adjustment',
            description: `Retur transaksi ${list[idx].invoice_no}: ${reason}`,
            created_at: new Date().toISOString()
          });
        }
      });

      mockDb.setProducts(products);
      mockDb.setStockLogs(stockLogs);
      mockDb.setTransactions(list);
    } else {
      const { error } = await supabase!
        .from('transactions')
        .update({ status: 'returned' })
        .eq('id', id);
      if (error) throw error;
    }
  },

  // --- PURCHASES ---
  async getPurchases(): Promise<Purchase[]> {
    if (isDemoMode) {
      const list = mockDb.getPurchases();
      const suppliers = mockDb.getSuppliers();
      const profiles = mockDb.getProfiles();
      const products = mockDb.getProducts();

      return list.map(po => {
        const supplier = suppliers.find(s => s.id === po.supplier_id);
        const creator = profiles.find(p => p.id === po.creator_id);
        const items = po.items?.map(it => {
          const prod = products.find(p => p.id === it.product_id);
          return { ...it, product_name: prod ? prod.name : 'Barang Terhapus' };
        });
        return {
          ...po,
          supplier_name: supplier ? supplier.name : 'Supplier Terhapus',
          creator_name: creator ? creator.full_name : 'Gudang',
          items
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      const { data, error } = await supabase!
        .from('purchases')
        .select(`
          *,
          supplier:suppliers(name),
          creator:profiles!purchases_creator_id_fkey(full_name),
          items:purchase_items(*, product:products(name))
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      return (data || []).map((po: any) => ({
        ...po,
        supplier_name: po.supplier?.name,
        creator_name: po.creator?.full_name,
        items: po.items?.map((it: any) => ({
          ...it,
          product_name: it.product?.name
        }))
      }));
    }
  },

  async createPurchase(purchase: Omit<Purchase, 'id' | 'purchase_no' | 'created_at' | 'status'>, items: Omit<PurchaseItem, 'id' | 'purchase_id'>[]): Promise<Purchase> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    if (isDemoMode) {
      const list = mockDb.getPurchases();
      const poCount = list.filter(p => p.purchase_no.startsWith(`PO-${dateStr}`)).length + 1;
      const poNo = `PO-${dateStr}-${String(poCount).padStart(3, '0')}`;
      
      const newPoId = `po-${Date.now()}`;
      const newItems: PurchaseItem[] = items.map((it, idx) => ({
        ...it,
        id: `poi-${Date.now()}-${idx}`,
        purchase_id: newPoId
      }));

      const newPo: Purchase = {
        ...purchase,
        id: newPoId,
        purchase_no: poNo,
        status: 'pending',
        created_at: new Date().toISOString(),
        items: newItems
      };

      mockDb.setPurchases([...list, newPo]);
      return newPo;
    } else {
      const { count } = await supabase!
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .like('purchase_no', `PO-${dateStr}%`);
      const poNo = `PO-${dateStr}-${String((count || 0) + 1).padStart(3, '0')}`;

      const { data: newPo, error: poError } = await supabase!
        .from('purchases')
        .insert([{
          purchase_no: poNo,
          supplier_id: purchase.supplier_id,
          creator_id: purchase.creator_id,
          subtotal: purchase.subtotal,
          tax: purchase.tax,
          total: purchase.total,
          status: 'pending'
        }])
        .select()
        .single();
      if (poError) throw poError;

      const itemsToInsert = items.map(it => ({
        purchase_id: newPo.id,
        product_id: it.product_id,
        quantity: it.quantity,
        price: it.price,
        subtotal: it.subtotal
      }));
      const { error: itemsError } = await supabase!.from('purchase_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      return { ...newPo, items: itemsToInsert };
    }
  },

  async approvePurchase(id: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getPurchases();
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Purchase order not found');
      if (list[idx].status !== 'pending') return;

      list[idx].status = 'approved';
      mockDb.setPurchases(list);
    } else {
      const { error } = await supabase!
        .from('purchases')
        .update({ status: 'approved' })
        .eq('id', id);
      if (error) throw error;
    }
  },

  async receivePurchase(id: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getPurchases();
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Purchase order not found');
      if (list[idx].status !== 'approved') return;

      list[idx].status = 'received';
      
      const products = mockDb.getProducts();
      const stockLogs = mockDb.getStockLogs();

      list[idx].items?.forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        if (prod) {
          prod.stock += item.quantity;
          prod.cost_price = item.price;
          
          stockLogs.push({
            id: `log-${Date.now()}-${Math.random()}`,
            product_id: item.product_id,
            quantity: item.quantity,
            type: 'purchase',
            description: `Penerimaan Barang PO ${list[idx].purchase_no}`,
            created_at: new Date().toISOString()
          });
        }
      });

      mockDb.setProducts(products);
      mockDb.setStockLogs(stockLogs);
      mockDb.setPurchases(list);
    } else {
      const { error } = await supabase!
        .from('purchases')
        .update({ status: 'received' })
        .eq('id', id);
      if (error) throw error;
    }
  },

  // --- STOCK LOGS ---
  async getStockLogs(): Promise<StockLog[]> {
    if (isDemoMode) {
      const logs = mockDb.getStockLogs();
      const products = mockDb.getProducts();
      return logs.map(l => {
        const prod = products.find(p => p.id === l.product_id);
        return {
          ...l,
          product_name: prod ? prod.name : 'Barang Terhapus'
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      const { data, error } = await supabase!
        .from('stock_logs')
        .select('*, product:products(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((l: any) => ({
        ...l,
        product_name: l.product?.name
      }));
    }
  },

  // --- USER PROFILES ---
  async getUsers(): Promise<Profile[]> {
    if (isDemoMode) {
      return mockDb.getProfiles();
    } else {
      const { data, error } = await supabase!.from('profiles').select('*').order('role');
      if (error) throw error;
      return data || [];
    }
  },

  async createUser(p: Omit<Profile, 'id'>, password?: string): Promise<Profile> {
    if (isDemoMode) {
      const list = mockDb.getProfiles();
      const newU: Profile = {
        ...p,
        id: `user-${Date.now()}`
      };
      mockDb.setProfiles([...list, newU]);
      return newU;
    } else {
      const cleanEmail = p.email.trim();
      const cleanUsername = p.username.trim();
      const cleanFullName = p.full_name.trim();

      // Try running the SQL RPC helper to create the user directly in the database.
      // This bypasses email SMTP validation and signup rate limits entirely.
      try {
        const { data: rpcData, error: rpcError } = await supabase!.rpc('create_user_admin', {
          p_email: cleanEmail,
          p_password: password || 'AjoKasir123',
          p_username: cleanUsername,
          p_full_name: cleanFullName,
          p_role: p.role
        });

        if (rpcError) {
          // If the error code/message is NOT about the function not existing, it's a real validation error (like email already exists or permission denied)
          if (rpcError.code !== 'PGRST501' && !rpcError.message.includes('does not exist')) {
            throw new Error(rpcError.message);
          }
        } else if (rpcData) {
          // RPC succeeded, fetch the created profile from public.profiles
          const { data: prof, error: pErr } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', rpcData.id || rpcData)
            .single();
          if (pErr) throw pErr;
          return prof as Profile;
        }
      } catch (err: any) {
        // If it's a real validation error (e.g. duplicate email, permission denied), bubble it up
        if (err.message && !err.message.includes('does not exist') && !err.message.includes('RPC')) {
          throw err;
        }
      }

      // Fallback: If the RPC function is not installed in the database, use client-side signUp
      const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      const { data, error } = await tempSupabase.auth.signUp({
        email: cleanEmail,
        password: password || 'AjoKasir123',
        options: {
          data: {
            username: cleanUsername,
            full_name: cleanFullName,
            role: p.role
          }
        }
      });
      if (error) throw error;
      
      if (!data.user) {
        throw new Error('Gagal mendaftarkan pengguna baru.');
      }

      // Check if the trigger successfully created the profile
      const { data: prof, error: pErr } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (pErr || !prof) {
        // Trigger didn't run or is not configured. Create the profile manually.
        const { data: manualProf, error: insErr } = await supabase!
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: cleanEmail,
            username: cleanUsername,
            full_name: cleanFullName,
            role: p.role
          }])
          .select()
          .single();
        
        if (insErr) throw insErr;
        return manualProf as Profile;
      }
      
      return prof as Profile;
    }
  },

  async updateUserRole(id: string, role: 'owner' | 'kasir' | 'gudang'): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getProfiles();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx].role = role;
        mockDb.setProfiles(list);
      }
    } else {
      const { error } = await supabase!
        .from('profiles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
    }
  },

  async deleteUser(id: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getProfiles();
      mockDb.setProfiles(list.filter(p => p.id !== id));
    } else {
      const { error } = await supabase!.from('profiles').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // --- SETTINGS ---
  async getSettings(): Promise<Settings> {
    if (isDemoMode) {
      return mockDb.getSettings();
    } else {
      const { data, error } = await supabase!
        .from('settings')
        .select('*')
        .eq('id', 'shop_profile')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        const { data: newSettings, error: iErr } = await supabase!
          .from('settings')
          .insert([{ id: 'shop_profile', ...DEFAULT_SETTINGS }])
          .select()
          .single();
        if (iErr) throw iErr;
        return {
          shop_name: newSettings.shop_name,
          shop_address: newSettings.shop_address,
          shop_phone: newSettings.shop_phone,
          tax_percentage: newSettings.tax_percentage
        };
      }
      
      return {
        shop_name: data.shop_name,
        shop_address: data.shop_address,
        shop_phone: data.shop_phone,
        tax_percentage: data.tax_percentage
      };
    }
  },

  async updateSettings(sett: Settings): Promise<void> {
    if (isDemoMode) {
      mockDb.setSettings(sett);
    } else {
      const { error } = await supabase!
        .from('settings')
        .upsert([{ id: 'shop_profile', ...sett }]);
      if (error) throw error;
    }
  }
};
