import { createClient } from '@supabase/supabase-js';

// Detect Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'super_admin' | 'owner' | 'kasir' | 'gudang';
  store_id?: string | null;
  store_name?: string; // Join helper
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
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
  store_id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
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
  store_id: string;
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
  store_id: string;
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
  store_id: string;
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
const DEFAULT_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'AjoKasir Mart',
    address: 'Jl. Khatib Sulaiman No. 12, Padang, Sumatera Barat',
    phone: '0751-444888',
    created_at: new Date().toISOString()
  },
  {
    id: 'store-2',
    name: 'Ajo Minang Swalayan',
    address: 'Jl. Veteran No. 34, Bukittinggi',
    phone: '0752-999333',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', store_id: 'store-1', name: 'Sembako', description: 'Bahan pokok makanan', created_at: new Date().toISOString() },
  { id: 'cat-2', store_id: 'store-1', name: 'Minuman', description: 'Minuman kemasan dan segar', created_at: new Date().toISOString() },
  { id: 'cat-3', store_id: 'store-1', name: 'Makanan Ringan', description: 'Camilan dan snack', created_at: new Date().toISOString() },
  { id: 'cat-4', store_id: 'store-1', name: 'Kebutuhan Rumah', description: 'Sabun, sampo, dan alat mandi', created_at: new Date().toISOString() },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'prod-1', store_id: 'store-1', barcode: '8999999190520', name: 'Indomie Goreng Spesial', category_id: 'cat-3', price: 3500, cost_price: 2800, stock: 120, min_stock: 20, unit: 'pcs', created_at: new Date().toISOString() },
  { id: 'prod-2', store_id: 'store-1', barcode: '8992761001004', name: 'Aqua Air Mineral 600ml', category_id: 'cat-2', price: 4000, cost_price: 2500, stock: 80, min_stock: 15, unit: 'pcs', created_at: new Date().toISOString() },
  { id: 'prod-3', store_id: 'store-1', barcode: '8998866200213', name: 'Beras Pandan Wangi 5kg', category_id: 'cat-1', price: 78000, cost_price: 68000, stock: 25, min_stock: 5, unit: 'karung', created_at: new Date().toISOString() },
  { id: 'prod-4', store_id: 'store-1', barcode: '8999999002243', name: 'Minyak Goreng Bimoli 2L', category_id: 'cat-1', price: 34000, cost_price: 29500, stock: 3, min_stock: 10, unit: 'pouch', created_at: new Date().toISOString() },
  { id: 'prod-5', store_id: 'store-1', barcode: '8991002300456', name: 'Sabun Mandi Lifebuoy 85g', category_id: 'cat-4', price: 4500, cost_price: 3500, stock: 50, min_stock: 10, unit: 'pcs', created_at: new Date().toISOString() },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', store_id: 'store-1', name: 'PT Indofood CBP Sukses Makmur', phone: '021-5551234', address: 'Jl. Sudirman No. 23, Jakarta', created_at: new Date().toISOString() },
  { id: 'sup-2', store_id: 'store-1', name: 'PT Tirta Investama (Aqua)', phone: '021-8884321', address: 'Jl. Pulogadung Raya No. 4, Jakarta', created_at: new Date().toISOString() },
  { id: 'sup-3', store_id: 'store-1', name: 'CV Sembako Makmur Jaya', phone: '0812-3456-7890', address: 'Jl. Veteran No. 56, Padang', created_at: new Date().toISOString() },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'cust-general', store_id: 'store-1', name: 'Pelanggan Umum', phone: '-', email: '-', address: '-', created_at: new Date().toISOString() },
  { id: 'cust-1', store_id: 'store-1', name: 'Budi Santoso', phone: '0811-222-333', email: 'budi@gmail.com', address: 'Jl. Merdeka No. 10', created_at: new Date().toISOString() },
  { id: 'cust-2', store_id: 'store-1', name: 'Siti Rahma', phone: '0822-444-555', email: 'siti@yahoo.com', address: 'Jl. Kartini No. 4', created_at: new Date().toISOString() },
];

const DEFAULT_PROFILES: Profile[] = [
  { id: 'user-super-admin', email: 'superadmin@ajokasir.com', username: 'admin', full_name: 'Super Admin AjoKasir', role: 'super_admin', store_id: null },
  { id: 'user-owner', email: 'owner@ajokasir.com', username: 'owner', full_name: 'Bung Ajo (Owner)', role: 'owner', store_id: 'store-1' },
  { id: 'user-kasir', email: 'kasir@ajokasir.com', username: 'kasir', full_name: 'Uni Rina (Kasir)', role: 'kasir', store_id: 'store-1' },
  { id: 'user-gudang', email: 'gudang@ajokasir.com', username: 'gudang', full_name: 'Uda Buyung (Gudang)', role: 'gudang', store_id: 'store-1' },
];

const DEFAULT_SETTINGS: Settings = {
  shop_name: 'AjoKasir Mart',
  shop_address: 'Jl. Khatib Sulaiman No. 12, Padang, Sumatera Barat',
  shop_phone: '0751-444888',
  tax_percentage: 11,
};

// Initial Seed Data Load helper with schema upgrades
function getLocalStorageData<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  
  let parsed = JSON.parse(data);

  // Schema migrations for multi-store support
  if (key === 'ajokasir_profiles') {
    const list = parsed as any[];
    const hasSuperAdmin = list.some(u => u.role === 'super_admin');
    let modified = false;
    
    if (!hasSuperAdmin) {
      list.push({ id: 'user-super-admin', email: 'superadmin@ajokasir.com', username: 'admin', full_name: 'Super Admin AjoKasir', role: 'super_admin', store_id: null });
      modified = true;
    }
    
    list.forEach(u => {
      if (u.role !== 'super_admin' && !u.store_id) {
        u.store_id = 'store-1';
        modified = true;
      }
    });

    if (modified) {
      localStorage.setItem(key, JSON.stringify(list));
      parsed = list;
    }
  }

  // Add store_id to other arrays if missing
  const multiTenantKeys = [
    'ajokasir_categories',
    'ajokasir_products',
    'ajokasir_suppliers',
    'ajokasir_customers',
    'ajokasir_transactions',
    'ajokasir_purchases',
    'ajokasir_stock_logs'
  ];

  if (multiTenantKeys.includes(key)) {
    const list = parsed as any[];
    let modified = false;
    list.forEach(item => {
      if (!item.store_id) {
        item.store_id = 'store-1';
        modified = true;
      }
    });
    if (modified) {
      localStorage.setItem(key, JSON.stringify(list));
      parsed = list;
    }
  }

  return parsed as T;
}

function setLocalStorageData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Mock DB Cache
const mockDb = {
  getStores: () => getLocalStorageData<Store[]>('ajokasir_stores', DEFAULT_STORES),
  setStores: (data: Store[]) => setLocalStorageData('ajokasir_stores', data),

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
      store_id: 'store-1',
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
      store_id: 'store-1',
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
      store_id: 'store-1',
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
    { id: 'log-1', store_id: 'store-1', product_id: 'prod-1', quantity: 100, type: 'purchase', description: 'Pembelian PO-20260709-001', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log-2', store_id: 'store-1', product_id: 'prod-1', quantity: -2, type: 'sale', description: 'Penjualan TRX-20260710-001', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log-3', store_id: 'store-1', product_id: 'prod-2', quantity: -1, type: 'sale', description: 'Penjualan TRX-20260710-001', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log-4', store_id: 'store-1', product_id: 'prod-3', quantity: -1, type: 'sale', description: 'Penjualan TRX-20260711-001', created_at: new Date().toISOString() },
  ];
  mockDb.setStockLogs(seedStockLogs);
}

// Active Store Context for Multi-Store
let activeStoreId: string | null = null;

// UNIFIED API
export const db = {
  // --- MULTI-STORE CONTEXT ---
  setStoreId(id: string | null) {
    activeStoreId = id;
    if (id) {
      localStorage.setItem('ajokasir_active_store_id', id);
    } else {
      localStorage.removeItem('ajokasir_active_store_id');
    }
  },

  getStoreId(): string | null {
    if (activeStoreId) return activeStoreId;
    const stored = localStorage.getItem('ajokasir_active_store_id');
    if (stored) {
      activeStoreId = stored;
      return stored;
    }
    const currentUser = mockDb.getCurrentUser();
    if (currentUser) {
      if (currentUser.store_id) {
        activeStoreId = currentUser.store_id;
        return currentUser.store_id;
      }
      if (currentUser.role === 'super_admin') {
        const stores = mockDb.getStores();
        if (stores.length > 0) {
          activeStoreId = stores[0].id;
          return activeStoreId;
        }
      }
    }
    return null;
  },

  // --- STORES MANAGEMENT ---
  async getStores(): Promise<Store[]> {
    if (isDemoMode) {
      return mockDb.getStores();
    } else {
      const { data, error } = await supabase!.from('stores').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  },

  async createStore(name: string, address: string, phone: string): Promise<Store> {
    if (isDemoMode) {
      const list = mockDb.getStores();
      const newStore: Store = {
        id: `store-${Date.now()}`,
        name,
        address,
        phone,
        created_at: new Date().toISOString()
      };
      mockDb.setStores([...list, newStore]);
      return newStore;
    } else {
      const { data, error } = await supabase!
        .from('stores')
        .insert([{ name, address, phone }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateStore(id: string, name: string, address: string, phone: string): Promise<Store> {
    if (isDemoMode) {
      const list = mockDb.getStores();
      const idx = list.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('Store tidak ditemukan');
      list[idx] = { ...list[idx], name, address, phone };
      mockDb.setStores(list);
      return list[idx];
    } else {
      const { data, error } = await supabase!
        .from('stores')
        .update({ name, address, phone })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deleteStore(id: string): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getStores();
      mockDb.setStores(list.filter(s => s.id !== id));
      
      // Cascade delete in mock mode
      const profiles = mockDb.getProfiles();
      mockDb.setProfiles(profiles.filter(p => p.store_id !== id));
      
      const categories = mockDb.getCategories();
      mockDb.setCategories(categories.filter(c => c.store_id !== id));
      
      const products = mockDb.getProducts();
      mockDb.setProducts(products.filter(p => p.store_id !== id));
      
      const suppliers = mockDb.getSuppliers();
      mockDb.setSuppliers(suppliers.filter(s => s.store_id !== id));
      
      const customers = mockDb.getCustomers();
      mockDb.setCustomers(customers.filter(c => c.store_id !== id));
      
      const transactions = mockDb.getTransactions();
      mockDb.setTransactions(transactions.filter(t => t.store_id !== id));
      
      const purchases = mockDb.getPurchases();
      mockDb.setPurchases(purchases.filter(p => p.store_id !== id));
      
      const stockLogs = mockDb.getStockLogs();
      mockDb.setStockLogs(stockLogs.filter(sl => sl.store_id !== id));
      
      const settingsMap = getLocalStorageData<Record<string, Settings>>('ajokasir_settings_multi', {});
      delete settingsMap[id];
      setLocalStorageData('ajokasir_settings_multi', settingsMap);
    } else {
      const { error } = await supabase!.from('stores').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // --- AUTH AUTHENTICATION ---
  async login(email: string, password: string): Promise<{ user: Profile | null; error: Error | null }> {
    if (isDemoMode) {
      const profiles = mockDb.getProfiles();
      const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (found && password.length >= 6) {
        mockDb.setCurrentUser(found);
        if (found.store_id) {
          this.setStoreId(found.store_id);
        } else if (found.role === 'super_admin') {
          const stores = mockDb.getStores();
          if (stores.length > 0) {
            this.setStoreId(stores[0].id);
          }
        }
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
          const prof = profile as Profile;
          if (prof.store_id) {
            this.setStoreId(prof.store_id);
          }
          return { user: prof, error: null };
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
      this.setStoreId(null);
    } else {
      await supabase!.auth.signOut();
      this.setStoreId(null);
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
    const storeId = this.getStoreId();
    if (!storeId) return [];
    if (isDemoMode) {
      return mockDb.getCategories().filter(c => c.store_id === storeId);
    } else {
      const { data, error } = await supabase!
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('name');
      if (error) throw error;
      return data || [];
    }
  },

  async createCategory(name: string, description: string): Promise<Category> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getCategories();
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        store_id: storeId,
        name,
        description,
        created_at: new Date().toISOString()
      };
      mockDb.setCategories([...list, newCat]);
      return newCat;
    } else {
      const { data, error } = await supabase!
        .from('categories')
        .insert([{ store_id: storeId, name, description }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateCategory(id: string, name: string, description: string): Promise<Category> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getCategories();
      const idx = list.findIndex(c => c.id === id && c.store_id === storeId);
      if (idx === -1) throw new Error('Kategori tidak ditemukan');
      list[idx] = { ...list[idx], name, description };
      mockDb.setCategories(list);
      return list[idx];
    } else {
      const { data, error } = await supabase!
        .from('categories')
        .update({ name, description })
        .eq('id', id)
        .eq('store_id', storeId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getCategories();
      mockDb.setCategories(list.filter(c => !(c.id === id && c.store_id === storeId)));
    } else {
      const { error } = await supabase!
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('store_id', storeId);
      if (error) throw error;
    }
  },

  // --- PRODUCTS (BARANG) ---
  async getProducts(): Promise<Product[]> {
    const storeId = this.getStoreId();
    if (!storeId) return [];
    if (isDemoMode) {
      return mockDb.getProducts().filter(p => p.store_id === storeId);
    } else {
      const { data, error } = await supabase!
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('name');
      if (error) throw error;
      return data || [];
    }
  },

  async createProduct(prod: Omit<Product, 'id' | 'created_at' | 'store_id'>): Promise<Product> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getProducts();
      const newProd: Product = {
        ...prod,
        id: `prod-${Date.now()}`,
        store_id: storeId,
        created_at: new Date().toISOString()
      };
      mockDb.setProducts([...list, newProd]);
      if (newProd.stock > 0) {
        const logs = mockDb.getStockLogs();
        logs.push({
          id: `log-${Date.now()}`,
          store_id: storeId,
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
        .insert([{ ...prod, store_id: storeId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateProduct(id: string, prod: Omit<Product, 'id' | 'created_at' | 'stock' | 'store_id'>): Promise<Product> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getProducts();
      const idx = list.findIndex(p => p.id === id && p.store_id === storeId);
      if (idx === -1) throw new Error('Produk tidak ditemukan');
      list[idx] = { ...list[idx], ...prod };
      mockDb.setProducts(list);
      return list[idx];
    } else {
      const { data, error } = await supabase!
        .from('products')
        .update(prod)
        .eq('id', id)
        .eq('store_id', storeId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async adjustStock(id: string, currentStock: number, newStock: number, reason: string): Promise<void> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    const diff = newStock - currentStock;
    if (diff === 0) return;

    if (isDemoMode) {
      const products = mockDb.getProducts();
      const idx = products.findIndex(p => p.id === id && p.store_id === storeId);
      if (idx !== -1) {
        products[idx].stock = newStock;
        mockDb.setProducts(products);
        
        const logs = mockDb.getStockLogs();
        logs.push({
          id: `log-${Date.now()}`,
          store_id: storeId,
          product_id: id,
          quantity: diff,
          type: 'opname',
          description: reason || 'Penyesuaian stok opname',
          created_at: new Date().toISOString()
        });
        mockDb.setStockLogs(logs);
      }
    } else {
      const { error: pErr } = await supabase!
        .from('products')
        .update({ stock: newStock })
        .eq('id', id)
        .eq('store_id', storeId);
      if (pErr) throw pErr;

      const { error: lErr } = await supabase!
        .from('stock_logs')
        .insert([{
          store_id: storeId,
          product_id: id,
          quantity: diff,
          type: 'opname',
          description: reason || 'Penyesuaian stok opname'
        }]);
      if (lErr) throw lErr;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getProducts();
      mockDb.setProducts(list.filter(p => !(p.id === id && p.store_id === storeId)));
    } else {
      const { error } = await supabase!
        .from('products')
        .delete()
        .eq('id', id)
        .eq('store_id', storeId);
      if (error) throw error;
    }
  },

  // --- SUPPLIERS ---
  async getSuppliers(): Promise<Supplier[]> {
    const storeId = this.getStoreId();
    if (!storeId) return [];
    if (isDemoMode) {
      return mockDb.getSuppliers().filter(s => s.store_id === storeId);
    } else {
      const { data, error } = await supabase!
        .from('suppliers')
        .select('*')
        .eq('store_id', storeId)
        .order('name');
      if (error) throw error;
      return data || [];
    }
  },

  async createSupplier(name: string, phone: string, address: string): Promise<Supplier> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getSuppliers();
      const newS: Supplier = {
        id: `sup-${Date.now()}`,
        store_id: storeId,
        name,
        phone,
        address,
        created_at: new Date().toISOString()
      };
      mockDb.setSuppliers([...list, newS]);
      return newS;
    } else {
      const { data, error } = await supabase!
        .from('suppliers')
        .insert([{ store_id: storeId, name, phone, address }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateSupplier(id: string, name: string, phone: string, address: string): Promise<Supplier> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getSuppliers();
      const idx = list.findIndex(s => s.id === id && s.store_id === storeId);
      if (idx === -1) throw new Error('Supplier tidak ditemukan');
      list[idx] = { ...list[idx], name, phone, address };
      mockDb.setSuppliers(list);
      return list[idx];
    } else {
      const { data, error } = await supabase!
        .from('suppliers')
        .update({ name, phone, address })
        .eq('id', id)
        .eq('store_id', storeId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deleteSupplier(id: string): Promise<void> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getSuppliers();
      mockDb.setSuppliers(list.filter(s => !(s.id === id && s.store_id === storeId)));
    } else {
      const { error } = await supabase!
        .from('suppliers')
        .delete()
        .eq('id', id)
        .eq('store_id', storeId);
      if (error) throw error;
    }
  },

  // --- CUSTOMERS (PELANGGAN) ---
  async getCustomers(): Promise<Customer[]> {
    const storeId = this.getStoreId();
    if (!storeId) return [];
    if (isDemoMode) {
      return mockDb.getCustomers().filter(c => c.store_id === storeId);
    } else {
      const { data, error } = await supabase!
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .order('name');
      if (error) throw error;
      return data || [];
    }
  },

  async createCustomer(name: string, phone: string, email: string, address: string): Promise<Customer> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getCustomers();
      const newC: Customer = {
        id: `cust-${Date.now()}`,
        store_id: storeId,
        name,
        phone,
        email,
        address,
        created_at: new Date().toISOString()
      };
      mockDb.setCustomers([...list, newC]);
      return newC;
    } else {
      const { data, error } = await supabase!
        .from('customers')
        .insert([{ store_id: storeId, name, phone, email, address }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateCustomer(id: string, name: string, phone: string, email: string, address: string): Promise<Customer> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getCustomers();
      const idx = list.findIndex(c => c.id === id && c.store_id === storeId);
      if (idx === -1) throw new Error('Pelanggan tidak ditemukan');
      list[idx] = { ...list[idx], name, phone, email, address };
      mockDb.setCustomers(list);
      return list[idx];
    } else {
      const { data, error } = await supabase!
        .from('customers')
        .update({ name, phone, email, address })
        .eq('id', id)
        .eq('store_id', storeId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getCustomers();
      mockDb.setCustomers(list.filter(c => !(c.id === id && c.store_id === storeId)));
    } else {
      const { error } = await supabase!
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('store_id', storeId);
      if (error) throw error;
    }
  },

  // --- TRANSACTIONS (PENJUALAN) ---
  async getTransactions(): Promise<Transaction[]> {
    const storeId = this.getStoreId();
    if (!storeId) return [];
    if (isDemoMode) {
      const list = mockDb.getTransactions().filter(t => t.store_id === storeId);
      const profiles = mockDb.getProfiles();
      const customers = mockDb.getCustomers();
      return list.map(tx => {
        const cashier = profiles.find(p => p.id === tx.cashier_id);
        const cust = customers.find(c => c.id === tx.customer_id);
        return {
          ...tx,
          cashier_name: cashier?.full_name || 'Tidak Diketahui',
          customer_name: cust?.name || 'Pelanggan Umum'
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      const { data, error } = await supabase!
        .from('transactions')
        .select('*, cashier:profiles!transactions_cashier_id_fkey(full_name), customer:customers(name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        cashier_name: t.cashier?.full_name,
        customer_name: t.customer?.name
      }));
    }
  },

  async getTransactionsGlobal(): Promise<Transaction[]> {
    if (isDemoMode) {
      const list = mockDb.getTransactions();
      const profiles = mockDb.getProfiles();
      const customers = mockDb.getCustomers();
      return list.map(tx => {
        const cashier = profiles.find(p => p.id === tx.cashier_id);
        const cust = customers.find(c => c.id === tx.customer_id);
        return {
          ...tx,
          cashier_name: cashier?.full_name || 'Tidak Diketahui',
          customer_name: cust?.name || 'Pelanggan Umum'
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      const { data, error } = await supabase!
        .from('transactions')
        .select('*, cashier:profiles!transactions_cashier_id_fkey(full_name), customer:customers(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        cashier_name: t.cashier?.full_name,
        customer_name: t.customer?.name
      }));
    }
  },

  async createTransaction(tx: Omit<Transaction, 'id' | 'invoice_no' | 'created_at' | 'status' | 'store_id'>, items: Omit<TransactionItem, 'id' | 'transaction_id'>[]): Promise<Transaction> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    if (isDemoMode) {
      const list = mockDb.getTransactions();
      const invoiceCount = list.filter(t => t.invoice_no.startsWith(`TRX-${dateStr}`) && t.store_id === storeId).length + 1;
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
        store_id: storeId,
        invoice_no: invoiceNo,
        status: 'completed',
        created_at: new Date().toISOString(),
        items: newItems
      };

      const products = mockDb.getProducts();
      const stockLogs = mockDb.getStockLogs();

      newItems.forEach(item => {
        const prod = products.find(p => p.id === item.product_id && p.store_id === storeId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          stockLogs.push({
            id: `log-${Date.now()}-${Math.random()}`,
            store_id: storeId,
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
        .eq('store_id', storeId)
        .like('invoice_no', `TRX-${dateStr}%`);
      const invoiceNo = `TRX-${dateStr}-${String((count || 0) + 1).padStart(3, '0')}`;

      const { data: newTx, error: txError } = await supabase!
        .from('transactions')
        .insert([{
          store_id: storeId,
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
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getTransactions();
      const idx = list.findIndex(t => t.id === id && t.store_id === storeId);
      if (idx !== -1 && list[idx].status === 'completed') {
        list[idx].status = 'cancelled';
        
        // Restore stocks
        const products = mockDb.getProducts();
        const logs = mockDb.getStockLogs();
        list[idx].items?.forEach(item => {
          const prod = products.find(p => p.id === item.product_id && p.store_id === storeId);
          if (prod) {
            prod.stock += item.quantity;
            logs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              store_id: storeId,
              product_id: item.product_id,
              quantity: item.quantity,
              type: 'adjustment',
              description: `Pembatalan transaksi ${list[idx].invoice_no}`,
              created_at: new Date().toISOString()
            });
          }
        });
        mockDb.setProducts(products);
        mockDb.setStockLogs(logs);
        mockDb.setTransactions(list);
      }
    } else {
      const { error } = await supabase!
        .from('transactions')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('store_id', storeId);
      if (error) throw error;
    }
  },

  async returnTransaction(id: string, reason: string): Promise<void> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getTransactions();
      const idx = list.findIndex(t => t.id === id && t.store_id === storeId);
      if (idx !== -1 && list[idx].status === 'completed') {
        list[idx].status = 'returned';
        
        // Restore stocks
        const products = mockDb.getProducts();
        const logs = mockDb.getStockLogs();
        list[idx].items?.forEach(item => {
          const prod = products.find(p => p.id === item.product_id && p.store_id === storeId);
          if (prod) {
            prod.stock += item.quantity;
            logs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              store_id: storeId,
              product_id: item.product_id,
              quantity: item.quantity,
              type: 'adjustment',
              description: `Retur transaksi ${list[idx].invoice_no}: ${reason || ''}`,
              created_at: new Date().toISOString()
            });
          }
        });
        mockDb.setProducts(products);
        mockDb.setStockLogs(logs);
        mockDb.setTransactions(list);
      }
    } else {
      const { error } = await supabase!
        .from('transactions')
        .update({ status: 'returned' })
        .eq('id', id)
        .eq('store_id', storeId);
      if (error) throw error;
      
      // Stock logs details trigger in Postgres will handle stock updates automatically
    }
  },

  // --- PURCHASES (PEMBELIAN PO) ---
  async getPurchases(): Promise<Purchase[]> {
    const storeId = this.getStoreId();
    if (!storeId) return [];
    if (isDemoMode) {
      const list = mockDb.getPurchases().filter(po => po.store_id === storeId);
      const suppliers = mockDb.getSuppliers();
      const profiles = mockDb.getProfiles();
      return list.map(po => {
        const sup = suppliers.find(s => s.id === po.supplier_id);
        const creator = profiles.find(p => p.id === po.creator_id);
        return {
          ...po,
          supplier_name: sup?.name || 'Tidak Diketahui',
          creator_name: creator?.full_name || 'Tidak Diketahui'
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      const { data, error } = await supabase!
        .from('purchases')
        .select('*, supplier:suppliers(name), creator:profiles!purchases_creator_id_fkey(full_name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        supplier_name: p.supplier?.name,
        creator_name: p.creator?.full_name
      }));
    }
  },

  async createPurchase(purchase: Omit<Purchase, 'id' | 'purchase_no' | 'created_at' | 'status' | 'store_id'>, items: Omit<PurchaseItem, 'id' | 'purchase_id'>[]): Promise<Purchase> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    if (isDemoMode) {
      const list = mockDb.getPurchases();
      const poCount = list.filter(p => p.purchase_no.startsWith(`PO-${dateStr}`) && p.store_id === storeId).length + 1;
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
        store_id: storeId,
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
        .eq('store_id', storeId)
        .like('purchase_no', `PO-${dateStr}%`);
      const poNo = `PO-${dateStr}-${String((count || 0) + 1).padStart(3, '0')}`;

      const { data: newPo, error: poError } = await supabase!
        .from('purchases')
        .insert([{
          store_id: storeId,
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
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getPurchases();
      const idx = list.findIndex(p => p.id === id && p.store_id === storeId);
      if (idx !== -1 && list[idx].status === 'pending') {
        list[idx].status = 'approved';
        mockDb.setPurchases(list);
      }
    } else {
      const { error } = await supabase!
        .from('purchases')
        .update({ status: 'approved' })
        .eq('id', id)
        .eq('store_id', storeId);
      if (error) throw error;
    }
  },

  async receivePurchase(id: string): Promise<void> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');
    if (isDemoMode) {
      const list = mockDb.getPurchases();
      const idx = list.findIndex(p => p.id === id && p.store_id === storeId);
      if (idx !== -1 && list[idx].status === 'approved') {
        list[idx].status = 'received';
        
        // Add stocks
        const products = mockDb.getProducts();
        const logs = mockDb.getStockLogs();
        list[idx].items?.forEach(item => {
          const prod = products.find(p => p.id === item.product_id && p.store_id === storeId);
          if (prod) {
            prod.stock += item.quantity;
            prod.cost_price = item.price; // Update cost price to latest PO price
            logs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              store_id: storeId,
              product_id: item.product_id,
              quantity: item.quantity,
              type: 'purchase',
              description: `Penerimaan PO ${list[idx].purchase_no}`,
              created_at: new Date().toISOString()
            });
          }
        });
        mockDb.setProducts(products);
        mockDb.setStockLogs(logs);
        mockDb.setPurchases(list);
      }
    } else {
      const { error } = await supabase!
        .from('purchases')
        .update({ status: 'received' })
        .eq('id', id)
        .eq('store_id', storeId);
      if (error) throw error;
      
      // Stock updates are handled by Postgres trigger automatically
    }
  },

  // --- STOCK LOGS ---
  async getStockLogs(): Promise<StockLog[]> {
    const storeId = this.getStoreId();
    if (!storeId) return [];
    if (isDemoMode) {
      const list = mockDb.getStockLogs().filter(sl => sl.store_id === storeId);
      const products = mockDb.getProducts();
      return list.map(l => {
        const prod = products.find(p => p.id === l.product_id);
        return {
          ...l,
          product_name: prod?.name || 'Barang Dihapus'
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      const { data, error } = await supabase!
        .from('stock_logs')
        .select('*, product:products(name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((sl: any) => ({
        ...sl,
        product_name: sl.product?.name
      }));
    }
  },

  // --- USER PROFILES ---
  async getUsers(): Promise<Profile[]> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return [];

    if (isDemoMode) {
      const list = mockDb.getProfiles();
      const stores = mockDb.getStores();
      const mapped = list.map(u => {
        const st = stores.find(s => s.id === u.store_id);
        return {
          ...u,
          store_name: st ? st.name : '-'
        };
      });

      if (currentUser.role === 'super_admin') {
        return mapped;
      } else {
        return mapped.filter(u => u.store_id === currentUser.store_id);
      }
    } else {
      if (currentUser.role === 'super_admin') {
        // Fetch all profiles along with store names (if possible via joins, or we just map later)
        const { data: profiles, error: pErr } = await supabase!
          .from('profiles')
          .select('*')
          .order('role');
        if (pErr) throw pErr;

        const { data: stores } = await supabase!.from('stores').select('*');
        return (profiles || []).map((u: any) => {
          const st = stores?.find(s => s.id === u.store_id);
          return {
            ...u,
            store_name: st ? st.name : '-'
          };
        });
      } else {
        const { data, error } = await supabase!
          .from('profiles')
          .select('*')
          .eq('store_id', currentUser.store_id)
          .order('role');
        if (error) throw error;
        return data || [];
      }
    }
  },

  async createUser(p: Omit<Profile, 'id'>, password?: string): Promise<Profile> {
    const currentUser = await this.getCurrentUser();
    // Super admins can assign store_id when creating owner. Otherwise, default to current context.
    const store_id = p.store_id || (currentUser?.role === 'super_admin' ? this.getStoreId() : currentUser?.store_id) || null;
    
    if (isDemoMode) {
      const list = mockDb.getProfiles();
      const newU: Profile = {
        ...p,
        store_id,
        id: `user-${Date.now()}`
      };
      mockDb.setProfiles([...list, newU]);
      return newU;
    } else {
      const cleanEmail = p.email.trim();
      const cleanUsername = p.username.trim();
      const cleanFullName = p.full_name.trim();

      // RPC or manual insertion
      try {
        const { data: rpcData, error: rpcError } = await supabase!.rpc('create_user_admin_v2', {
          p_email: cleanEmail,
          p_password: password || 'AjoKasir123',
          p_username: cleanUsername,
          p_full_name: cleanFullName,
          p_role: p.role,
          p_store_id: store_id
        });

        if (rpcError) {
          if (rpcError.code !== 'PGRST501' && !rpcError.message.includes('does not exist')) {
            throw new Error(rpcError.message);
          }
        } else if (rpcData) {
          const { data: prof, error: pErr } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', rpcData.id || rpcData)
            .single();
          if (pErr) throw pErr;
          return prof as Profile;
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('does not exist') && !err.message.includes('RPC')) {
          throw err;
        }
      }

      // Fallback signUp
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
            role: p.role,
            store_id: store_id
          }
        }
      });
      if (error) throw error;
      
      if (!data.user) {
        throw new Error('Gagal mendaftarkan pengguna baru.');
      }

      const { data: prof, error: pErr } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (pErr || !prof) {
        const { data: manualProf, error: insErr } = await supabase!
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: cleanEmail,
            username: cleanUsername,
            full_name: cleanFullName,
            role: p.role,
            store_id: store_id
          }])
          .select()
          .single();
        
        if (insErr) throw insErr;
        return manualProf as Profile;
      }
      
      return prof as Profile;
    }
  },

  async updateUserRole(id: string, role: 'super_admin' | 'owner' | 'kasir' | 'gudang', store_id?: string | null): Promise<void> {
    if (isDemoMode) {
      const list = mockDb.getProfiles();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx].role = role;
        if (store_id !== undefined) {
          list[idx].store_id = store_id;
        }
        mockDb.setProfiles(list);
      }
    } else {
      const updateData: any = { role };
      if (store_id !== undefined) {
        updateData.store_id = store_id;
      }
      const { error } = await supabase!
        .from('profiles')
        .update(updateData)
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
    const storeId = this.getStoreId();
    if (!storeId) return DEFAULT_SETTINGS;
    
    if (isDemoMode) {
      const settingsMap = getLocalStorageData<Record<string, Settings>>('ajokasir_settings_multi', {});
      if (settingsMap[storeId]) return settingsMap[storeId];
      
      const stores = mockDb.getStores();
      const currentStore = stores.find(s => s.id === storeId);
      const defaults = {
        shop_name: currentStore?.name || 'AjoKasir Mart',
        shop_address: currentStore?.address || 'Jl. Khatib Sulaiman No. 12',
        shop_phone: currentStore?.phone || '0751-444888',
        tax_percentage: 11
      };
      settingsMap[storeId] = defaults;
      setLocalStorageData('ajokasir_settings_multi', settingsMap);
      return defaults;
    } else {
      const { data, error } = await supabase!
        .from('settings')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle();
      if (error) throw error;

      if (data) {
        return {
          shop_name: data.shop_name,
          shop_address: data.shop_address,
          shop_phone: data.shop_phone,
          tax_percentage: Number(data.tax_percentage)
        };
      }
      
      // If it doesn't exist, create it from store details
      const { data: store } = await supabase!
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();
      const defaults = {
        store_id: storeId,
        shop_name: store?.name || 'AjoKasir Mart',
        shop_address: store?.address || 'Jl. Khatib Sulaiman No. 12',
        shop_phone: store?.phone || '0751-444888',
        tax_percentage: 11
      };
      const { data: inserted, error: insErr } = await supabase!
        .from('settings')
        .insert([defaults])
        .select()
        .single();
      if (insErr) throw insErr;
      return {
        shop_name: inserted.shop_name,
        shop_address: inserted.shop_address,
        shop_phone: inserted.shop_phone,
        tax_percentage: Number(inserted.tax_percentage)
      };
    }
  },

  async updateSettings(sett: Settings): Promise<void> {
    const storeId = this.getStoreId();
    if (!storeId) throw new Error('Konteks toko belum ditentukan');

    if (isDemoMode) {
      const settingsMap = getLocalStorageData<Record<string, Settings>>('ajokasir_settings_multi', {});
      settingsMap[storeId] = sett;
      setLocalStorageData('ajokasir_settings_multi', settingsMap);
    } else {
      const { error } = await supabase!
        .from('settings')
        .upsert([{
          store_id: storeId,
          shop_name: sett.shop_name,
          shop_address: sett.shop_address,
          shop_phone: sett.shop_phone,
          tax_percentage: sett.tax_percentage
        }]);
      if (error) throw error;
    }
  }
};
