-- SQL SCRIPT FOR SUPABASE SETUP
-- Copy and paste this script into the Supabase SQL Editor to set up the database tables, triggers, and RLS rules for AjoKasir.

-- 1. PROFILES TABLE (Linked with Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text,
  full_name text,
  role text check (role in ('owner', 'kasir', 'gudang')) not null default 'kasir',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow owners to insert profiles" on public.profiles
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

create policy "Allow owners to update profiles" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

create policy "Allow owners to delete profiles" on public.profiles
  for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'kasir')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. CATEGORIES TABLE
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;
create policy "Allow authenticated users to read categories" on public.categories for select using (auth.uid() is not null);
create policy "Allow owner and warehouse to manage categories" on public.categories for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'gudang')
  )
);


-- 3. PRODUCTS TABLE (Barang)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  barcode text unique,
  name text not null,
  category_id uuid references public.categories on delete set null,
  price numeric not null default 0,
  cost_price numeric not null default 0,
  stock integer not null default 0,
  min_stock integer not null default 0,
  unit text not null default 'pcs',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Allow authenticated users to read products" on public.products for select using (auth.uid() is not null);
create policy "Allow owner and warehouse to manage products" on public.products for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'gudang')
  )
);


-- 4. SUPPLIERS TABLE
create table public.suppliers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.suppliers enable row level security;
create policy "Allow authenticated users to read suppliers" on public.suppliers for select using (auth.uid() is not null);
create policy "Allow owner and warehouse to manage suppliers" on public.suppliers for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'gudang')
  )
);


-- 5. CUSTOMERS TABLE (Pelanggan)
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.customers enable row level security;
create policy "Allow authenticated users to read customers" on public.customers for select using (auth.uid() is not null);
create policy "Allow owner and cashier to manage customers" on public.customers for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'kasir')
  )
);


-- 6. TRANSACTIONS TABLE (Penjualan)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  invoice_no text unique not null,
  cashier_id uuid references public.profiles(id) not null,
  customer_id uuid references public.customers(id) on delete set null,
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  payment_method text check (payment_method in ('cash', 'transfer', 'qris')) not null,
  cash_paid numeric not null default 0,
  cash_change numeric not null default 0,
  status text check (status in ('completed', 'cancelled', 'returned')) not null default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;
create policy "Allow authenticated users to read transactions" on public.transactions for select using (auth.uid() is not null);
create policy "Allow owner and cashier to insert transactions" on public.transactions for insert with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'kasir')
  )
);
create policy "Allow owner to manage transactions" on public.transactions for update using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  )
);


-- 7. TRANSACTION ITEMS
create table public.transaction_items (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references public.transactions(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null check (quantity > 0),
  price numeric not null,
  cost_price numeric not null,
  subtotal numeric not null
);

alter table public.transaction_items enable row level security;
create policy "Allow authenticated users to read transaction items" on public.transaction_items for select using (auth.uid() is not null);
create policy "Allow cashiers to insert transaction items" on public.transaction_items for insert with check (auth.uid() is not null);


-- 8. PURCHASES TABLE (Pembelian PO)
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  purchase_no text unique not null,
  supplier_id uuid references public.suppliers(id) not null,
  creator_id uuid references public.profiles(id) not null,
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  status text check (status in ('pending', 'approved', 'received')) not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.purchases enable row level security;
create policy "Allow authenticated users to read purchases" on public.purchases for select using (auth.uid() is not null);
create policy "Allow owner and warehouse to manage purchases" on public.purchases for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'gudang')
  )
);


-- 9. PURCHASE ITEMS
create table public.purchase_items (
  id uuid default gen_random_uuid() primary key,
  purchase_id uuid references public.purchases(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null check (quantity > 0),
  price numeric not null,
  subtotal numeric not null
);

alter table public.purchase_items enable row level security;
create policy "Allow authenticated users to read purchase items" on public.purchase_items for select using (auth.uid() is not null);
create policy "Allow owner and warehouse to manage purchase items" on public.purchase_items for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'gudang')
  )
);


-- 10. STOCK LOGS TABLE (Histori Stok)
create table public.stock_logs (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null,
  type text check (type in ('sale', 'purchase', 'opname', 'adjustment')) not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.stock_logs enable row level security;
create policy "Allow authenticated users to read stock logs" on public.stock_logs for select using (auth.uid() is not null);
create policy "Allow owner and warehouse to insert stock logs" on public.stock_logs for insert with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'gudang')
  )
);


-- 11. SETTINGS TABLE
create table public.settings (
  id text primary key default 'shop_profile',
  shop_name text not null default 'AjoKasir',
  shop_address text default '',
  shop_phone text default '',
  tax_percentage numeric not null default 11,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.settings enable row level security;
create policy "Allow authenticated users to read settings" on public.settings for select using (auth.uid() is not null);
create policy "Allow owners to manage settings" on public.settings for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  )
);


-- =========================================================================
-- DATABASE TRIGGERS & FUNCTIONS FOR AUTO INVENTORY ADJUSTMENT
-- =========================================================================

-- A. DEDUCT STOCK ON COMPLETED TRANSACTION (NEW SALE)
create or replace function public.process_transaction_items_stock()
returns trigger as $$
declare
  item_row record;
  inv_no text;
begin
  -- Get invoice number for log description
  select invoice_no into inv_no from public.transactions where id = new.transaction_id;

  -- Deduct stock
  update public.products
  set stock = stock - new.quantity
  where id = new.product_id;

  -- Create Stock Log
  insert into public.stock_logs (product_id, quantity, type, description)
  values (new.product_id, -new.quantity, 'sale', 'Penjualan ' || coalesce(inv_no, ''));

  return new;
end;
$$ language plpgsql security definer;

create trigger on_transaction_item_inserted
  after insert on public.transaction_items
  for each row execute procedure public.process_transaction_items_stock();


-- B. RESTORE STOCK ON CANCELLED OR RETURNED SALE
create or replace function public.process_transaction_status_change()
returns trigger as $$
declare
  item_row record;
begin
  -- Only trigger if status changed to cancelled or returned from completed
  if (old.status = 'completed' and (new.status = 'cancelled' or new.status = 'returned')) then
    for item_row in select * from public.transaction_items where transaction_id = new.id loop
      -- Add stock back
      update public.products
      set stock = stock + item_row.quantity
      where id = item_row.product_id;

      -- Log the stock adjustment
      insert into public.stock_logs (product_id, quantity, type, description)
      values (
        item_row.product_id, 
        item_row.quantity, 
        'adjustment', 
        case 
          when new.status = 'cancelled' then 'Pembatalan transaksi ' || new.invoice_no
          else 'Retur transaksi ' || new.invoice_no
        end
      );
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_transaction_status_changed
  after update on public.transactions
  for each row execute procedure public.process_transaction_status_change();


-- C. ADD STOCK WHEN PURCHASE IS RECEIVED (WAREHOUSE STUFF)
create or replace function public.process_purchase_received()
returns trigger as $$
declare
  item_row record;
begin
  -- Only trigger if status changed to received
  if (old.status <> 'received' and new.status = 'received') then
    for item_row in select * from public.purchase_items where purchase_id = new.id loop
      -- Add stock and update cost price dynamically
      update public.products
      set stock = stock + item_row.quantity,
          cost_price = item_row.price
      where id = item_row.product_id;

      -- Log the stock entry
      insert into public.stock_logs (product_id, quantity, type, description)
      values (
        item_row.product_id, 
        item_row.quantity, 
        'purchase', 
        'Penerimaan PO ' || new.purchase_no
      );
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_purchase_status_changed
  after update on public.purchases
  for each row execute procedure public.process_purchase_received();


-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

-- Seed Categories
INSERT INTO public.categories (id, name, description) VALUES
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 'Sembako', 'Bahan pokok makanan'),
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e002', 'Minuman', 'Minuman kemasan dan segar'),
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e003', 'Makanan Ringan', 'Camilan dan snack'),
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e004', 'Kebutuhan Rumah', 'Sabun, sampo, dan alat mandi')
ON CONFLICT (id) DO NOTHING;

-- Seed Products (Barang)
INSERT INTO public.products (id, barcode, name, category_id, price, cost_price, stock, min_stock, unit) VALUES
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f001', '8999999190520', 'Indomie Goreng Spesial', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e003', 3500, 2800, 120, 20, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f002', '8992761001004', 'Aqua Air Mineral 600ml', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e002', 4000, 2500, 80, 15, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f003', '8998866200213', 'Beras Pandan Wangi 5kg', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 78000, 68000, 25, 5, 'karung'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f004', '8999999002243', 'Minyak Goreng Bimoli 2L', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 34000, 29500, 3, 10, 'pouch'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f005', '8991002300456', 'Sabun Mandi Lifebuoy 85g', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e004', 4500, 3500, 50, 10, 'pcs')
ON CONFLICT (id) DO NOTHING;

-- Seed Suppliers
INSERT INTO public.suppliers (id, name, phone, address) VALUES
  ('c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a001', 'PT Indofood CBP Sukses Makmur', '021-5551234', 'Jl. Sudirman No. 23, Jakarta'),
  ('c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a002', 'PT Tirta Investama (Aqua)', '021-8884321', 'Jl. Pulogadung Raya No. 4, Jakarta'),
  ('c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a003', 'CV Sembako Makmur Jaya', '0812-3456-7890', 'Jl. Veteran No. 56, Padang')
ON CONFLICT (id) DO NOTHING;

-- Seed Customers (Pelanggan)
INSERT INTO public.customers (id, name, phone, email, address) VALUES
  ('d0d0d0d0-e0e0-f0f0-a0a0-b0b0b0b0b001', 'Pelanggan Umum', '-', '-', '-'),
  ('d0d0d0d0-e0e0-f0f0-a0a0-b0b0b0b0b002', 'Budi Santoso', '0811-222-333', 'budi@gmail.com', 'Jl. Merdeka No. 10'),
  ('d0d0d0d0-e0e0-f0f0-a0a0-b0b0b0b0b003', 'Siti Rahma', '0822-444-555', 'siti@yahoo.com', 'Jl. Kartini No. 4')
ON CONFLICT (id) DO NOTHING;

-- Seed Settings
INSERT INTO public.settings (id, shop_name, shop_address, shop_phone, tax_percentage) VALUES
  ('shop_profile', 'AjoKasir Mart', 'Jl. Khatib Sulaiman No. 12, Padang, Sumatera Barat', '0751-444888', 11)
ON CONFLICT (id) DO NOTHING;
