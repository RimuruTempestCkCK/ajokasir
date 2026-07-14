-- SQL SCRIPT FOR SUPABASE SETUP (MULTI-TENANT & SUPER ADMIN VERSION)
-- Copy and paste this script into the Supabase SQL Editor to set up your tables, triggers, and RLS rules.

-- DROP EXISTING TABLES AND TRIGGERS TO PREVENT CONFLICTS
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_profile_updated on public.profiles;
drop trigger if exists on_transaction_item_inserted on public.transaction_items;
drop trigger if exists on_transaction_status_changed on public.transactions;
drop trigger if exists on_purchase_status_changed on public.purchases;

drop table if exists public.stock_logs cascade;
drop table if exists public.purchase_items cascade;
drop table if exists public.purchases cascade;
drop table if exists public.transaction_items cascade;
drop table if exists public.transactions cascade;
drop table if exists public.customers cascade;
drop table if exists public.suppliers cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.settings cascade;
drop table if exists public.profiles cascade;
drop table if exists public.stores cascade;

-- 0. ENABLE ENCRYPTION EXTENSION FOR PASSWORD HASHING
create extension if not exists pgcrypto;

-- 1. STORES TABLE
create table public.stores (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.stores enable row level security;

-- 2. PROFILES TABLE (Linked with Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text,
  full_name text,
  role text check (role in ('super_admin', 'owner', 'kasir', 'gudang')) not null default 'kasir',
  store_id uuid references public.stores on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Helper security functions (Recursion-Free: Queries auth.users directly)
create or replace function public.is_super_admin(user_id uuid)
returns boolean as $$
  select exists (
    select 1 from auth.users
    where id = user_id and (
      raw_user_meta_data->>'role' = 'super_admin' or
      raw_app_meta_data->>'role' = 'super_admin'
    )
  );
$$ language sql security definer;

create or replace function public.get_user_role(user_id uuid)
returns text as $$
  select raw_user_meta_data->>'role' from auth.users where id = user_id;
$$ language sql security definer;

create or replace function public.get_user_store(user_id uuid)
returns uuid as $$
  select case
    when (select raw_user_meta_data->>'store_id' from auth.users where id = user_id) is not null 
    then (select raw_user_meta_data->>'store_id' from auth.users where id = user_id)::uuid
    else null
  end;
$$ language sql security definer;


-- Profiles Policies
create policy "Allow read access to profiles" on public.profiles
  for select using (
    is_super_admin(auth.uid()) or 
    auth.uid() = id or
    store_id = get_user_store(auth.uid())
  );

create policy "Allow update to own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow owners and super admins to manage profiles" on public.profiles
  for all using (
    is_super_admin(auth.uid()) or 
    (
      -- Recursion-Free Owner Check: Queries auth.users via security definer function
      public.get_user_role(auth.uid()) = 'owner' and 
      store_id = get_user_store(auth.uid())
    )
  );

-- Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, full_name, role, store_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'kasir'),
    case 
      when new.raw_user_meta_data->>'store_id' is not null then (new.raw_user_meta_data->>'store_id')::uuid
      else null
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to sync profiles changes back to auth.users raw_user_meta_data
create or replace function public.sync_profile_to_auth_users()
returns trigger as $$
begin
  update auth.users
  set raw_user_meta_data = 
    coalesce(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'role', new.role,
      'store_id', new.store_id,
      'username', new.username,
      'full_name', new.full_name
    )
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_profile_updated
  after insert or update on public.profiles
  for each row execute procedure public.sync_profile_to_auth_users();


-- Stores Policies
create policy "Allow super admins full control on stores" on public.stores
  for all using (is_super_admin(auth.uid()));

create policy "Allow store members to read their store" on public.stores
  for select using (id = get_user_store(auth.uid()));


-- 3. CATEGORIES TABLE
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;
create policy "Allow store members to read categories" on public.categories 
  for select using (is_super_admin(auth.uid()) or store_id = get_user_store(auth.uid()));
create policy "Allow owners and warehouse to manage categories" on public.categories 
  for all using (
    is_super_admin(auth.uid()) or 
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('owner', 'gudang')
      ) and 
      store_id = get_user_store(auth.uid())
    )
  );


-- 4. PRODUCTS TABLE (Barang)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores on delete cascade not null,
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
create policy "Allow store members to read products" on public.products 
  for select using (is_super_admin(auth.uid()) or store_id = get_user_store(auth.uid()));
create policy "Allow owners and warehouse to manage products" on public.products 
  for all using (
    is_super_admin(auth.uid()) or 
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('owner', 'gudang')
      ) and 
      store_id = get_user_store(auth.uid())
    )
  );


-- 5. SUPPLIERS TABLE
create table public.suppliers (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores on delete cascade not null,
  name text not null,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.suppliers enable row level security;
create policy "Allow store members to read suppliers" on public.suppliers 
  for select using (is_super_admin(auth.uid()) or store_id = get_user_store(auth.uid()));
create policy "Allow owners and warehouse to manage suppliers" on public.suppliers 
  for all using (
    is_super_admin(auth.uid()) or 
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('owner', 'gudang')
      ) and 
      store_id = get_user_store(auth.uid())
    )
  );


-- 6. CUSTOMERS TABLE (Pelanggan)
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores on delete cascade not null,
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.customers enable row level security;
create policy "Allow store members to read customers" on public.customers 
  for select using (is_super_admin(auth.uid()) or store_id = get_user_store(auth.uid()));
create policy "Allow owners and cashiers to manage customers" on public.customers 
  for all using (
    is_super_admin(auth.uid()) or 
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('owner', 'kasir')
      ) and 
      store_id = get_user_store(auth.uid())
    )
  );


-- 7. TRANSACTIONS TABLE (Penjualan)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores on delete cascade not null,
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
create policy "Allow store members to read transactions" on public.transactions 
  for select using (is_super_admin(auth.uid()) or store_id = get_user_store(auth.uid()));
create policy "Allow owners and cashiers to insert transactions" on public.transactions 
  for insert with check (
    is_super_admin(auth.uid()) or 
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('owner', 'kasir')
      ) and 
      store_id = get_user_store(auth.uid())
    )
  );
create policy "Allow owners to manage transactions" on public.transactions 
  for update using (
    is_super_admin(auth.uid()) or 
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'owner'
      ) and 
      store_id = get_user_store(auth.uid())
    )
  );


-- 8. TRANSACTION ITEMS
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
create policy "Allow authenticated users to read transaction items" on public.transaction_items 
  for select using (auth.uid() is not null);
create policy "Allow cashiers to insert transaction items" on public.transaction_items 
  for insert with check (auth.uid() is not null);


-- 9. PURCHASES TABLE (Pembelian PO)
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores on delete cascade not null,
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
create policy "Allow store members to read purchases" on public.purchases 
  for select using (is_super_admin(auth.uid()) or store_id = get_user_store(auth.uid()));
create policy "Allow owners and warehouse to manage purchases" on public.purchases 
  for all using (
    is_super_admin(auth.uid()) or 
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('owner', 'gudang')
      ) and 
      store_id = get_user_store(auth.uid())
    )
  );


-- 10. PURCHASE ITEMS
create table public.purchase_items (
  id uuid default gen_random_uuid() primary key,
  purchase_id uuid references public.purchases(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null check (quantity > 0),
  price numeric not null,
  subtotal numeric not null
);

alter table public.purchase_items enable row level security;
create policy "Allow authenticated users to read purchase items" on public.purchase_items 
  for select using (auth.uid() is not null);
create policy "Allow owners and warehouse to manage purchase items" on public.purchase_items 
  for all using (auth.uid() is not null);


-- 11. STOCK LOGS TABLE (Histori Stok)
create table public.stock_logs (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null,
  type text check (type in ('sale', 'purchase', 'opname', 'adjustment')) not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.stock_logs enable row level security;
create policy "Allow store members to read stock logs" on public.stock_logs 
  for select using (is_super_admin(auth.uid()) or store_id = get_user_store(auth.uid()));
create policy "Allow owners and warehouse to insert stock logs" on public.stock_logs 
  for insert with check (
    is_super_admin(auth.uid()) or 
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('owner', 'gudang')
      ) and 
      store_id = get_user_store(auth.uid())
    )
  );


-- 12. SETTINGS TABLE (Store Specific Settings)
create table public.settings (
  store_id uuid references public.stores on delete cascade primary key,
  shop_name text not null default 'AjoKasir',
  shop_address text default '',
  shop_phone text default '',
  tax_percentage numeric not null default 11,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.settings enable row level security;
create policy "Allow store members to read settings" on public.settings 
  for select using (is_super_admin(auth.uid()) or store_id = get_user_store(auth.uid()));
create policy "Allow owners to manage settings" on public.settings 
  for all using (
    is_super_admin(auth.uid()) or 
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'owner'
      ) and 
      store_id = get_user_store(auth.uid())
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
  s_id uuid;
begin
  -- Get invoice number and store_id for log description
  select invoice_no, store_id into inv_no, s_id from public.transactions where id = new.transaction_id;

  -- Deduct stock
  update public.products
  set stock = stock - new.quantity
  where id = new.product_id;

  -- Create Stock Log
  insert into public.stock_logs (store_id, product_id, quantity, type, description)
  values (s_id, new.product_id, -new.quantity, 'sale', 'Penjualan ' || coalesce(inv_no, ''));

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_transaction_item_inserted
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
      insert into public.stock_logs (store_id, product_id, quantity, type, description)
      values (
        new.store_id,
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

create or replace trigger on_transaction_status_changed
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
      insert into public.stock_logs (store_id, product_id, quantity, type, description)
      values (
        new.store_id,
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

create or replace trigger on_purchase_status_changed
  after update on public.purchases
  for each row execute procedure public.process_purchase_received();


-- =========================================================================
-- USER CREATION RPC FOR SYSTEM
-- =========================================================================
create or replace function public.create_user_admin_v2(
  p_email text,
  p_password text,
  p_username text,
  p_full_name text,
  p_role text,
  p_store_id uuid
)
returns uuid as $$
declare
  v_user_id uuid;
begin
  -- Insert user into auth.users programmatically
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('username', p_username, 'full_name', p_full_name, 'role', p_role, 'store_id', p_store_id),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  returning id into v_user_id;

  -- The handle_new_user trigger on auth.users will automatically 
  -- insert the record into public.profiles with the store_id.
  
  return v_user_id;
end;
$$ language plpgsql security definer;


-- -- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

-- 1. Seed Stores (Dua Toko Cabang)
INSERT INTO public.stores (id, name, address, phone) VALUES
  ('a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'AjoKasir Mart', 'Jl. Khatib Sulaiman No. 12, Padang, Sumatera Barat', '0751-444888'),
  ('a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Ajo Minang Swalayan', 'Jl. Jenderal Sudirman No. 45, Bukittinggi, Sumatera Barat', '0752-999111')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Settings (Konfigurasi per Toko)
INSERT INTO public.settings (store_id, shop_name, shop_address, shop_phone, tax_percentage) VALUES
  ('a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'AjoKasir Mart', 'Jl. Khatib Sulaiman No. 12, Padang, Sumatera Barat', '0751-444888', 11),
  ('a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Ajo Minang Swalayan', 'Jl. Jenderal Sudirman No. 45, Bukittinggi, Sumatera Barat', '0752-999111', 12)
ON CONFLICT (store_id) DO NOTHING;

-- 3. Seed Categories (Kategori Toko 1 dan Toko 2)
INSERT INTO public.categories (id, store_id, name, description) VALUES
  -- Toko 1 (AjoKasir Mart)
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'Sembako', 'Bahan pokok makanan harian'),
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e002', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'Minuman', 'Minuman botol, kaleng, dan jus kemasan'),
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e003', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'Makanan Ringan', 'Aneka camilan, cokelat, dan snack'),
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e004', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'Kebutuhan Rumah', 'Pembersih, sabun, sampo, dan odol'),
  
  -- Toko 2 (Ajo Minang Swalayan)
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e201', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Bumbu Masak & Dapur', 'Bumbu instan basah & kering khas Minang'),
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e202', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Minuman Tradisional', 'Minuman khas teh talua dan wedang rempah'),
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e203', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Oleh-Oleh & Keripik', 'Keripik sanjai, karak kaliang, dan camilan lokal'),
  ('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e204', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Perlengkapan Mandi Herbal', 'Sabun sereh, sabun kelapa lokal')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Products (Barang Toko 1 dan Toko 2)
INSERT INTO public.products (id, store_id, barcode, name, category_id, price, cost_price, stock, min_stock, unit) VALUES
  -- Produk Toko 1 (AjoKasir Mart)
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f001', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8999999190520', 'Indomie Goreng Spesial', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e003', 3500, 2800, 150, 20, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f002', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8992761001004', 'Aqua Air Mineral 600ml', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e002', 4000, 2500, 85, 15, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f003', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8998866200213', 'Beras Pandan Wangi 5kg', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 78000, 68000, 30, 5, 'karung'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f004', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8999999002243', 'Minyak Goreng Bimoli 2L', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 34000, 29500, 12, 10, 'pouch'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f005', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8991002300456', 'Sabun Mandi Lifebuoy 85g', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e004', 4500, 3500, 55, 10, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f006', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8998866200777', 'Kopi Kapal Api 165g', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 15000, 12500, 40, 8, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f007', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8999999120121', 'Gula Pasir Gulaku 1kg', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 16500, 14000, 60, 12, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f008', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8992761002131', 'Teh Celup Sariwangi 25s', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e002', 7500, 6000, 50, 10, 'box'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f009', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8992761005521', 'Susu Kental Manis Frisian Flag', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 12000, 10200, 28, 6, 'kaleng'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f010', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8999999710339', 'Kecap Manis Bango 550ml', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e001', 22000, 18500, 18, 5, 'pouch'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f011', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8991002100889', 'Pasta Gigi Pepsodent 190g', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e004', 14000, 11500, 45, 8, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f012', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', '8999999008221', 'Sunlight Pencuci Piring 750ml', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e004', 13500, 11200, 32, 8, 'pouch'),

  -- Produk Toko 2 (Ajo Minang Swalayan)
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f201', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', '8998822001001', 'Keripik Sanjai Balado 250g', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e203', 25000, 18000, 60, 10, 'bungkus'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f202', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', '8998822001002', 'Bumbu Rendang Instan Uni Kelok', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e201', 15000, 11000, 40, 8, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f203', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', '8998822001003', 'Teh Talua Instan Ajo (5 sachet)', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e202', 18000, 13000, 35, 5, 'box'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f204', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', '8998822001004', 'Air Mineral Minang 600ml', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e202', 3000, 1800, 120, 20, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f205', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', '8998822001005', 'Sabun Sereh Wangi Ranah', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e204', 8500, 6000, 50, 10, 'pcs'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f206', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', '8998822001006', 'Beras Solok Premium Anak Daro 10kg', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e201', 160000, 145000, 15, 3, 'karung'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f207', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', '8998822001007', 'Krupuk Kulit Jangek Gurih 200g', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e203', 35000, 28000, 25, 5, 'bungkus'),
  ('b0b0b0b0-c0c0-d0d0-e0e0-f0f0f0f0f208', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', '8998822001008', 'Kopi Bukittinggi Kapal Layar 250g', 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e201', 45000, 38000, 20, 4, 'bungkus')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Suppliers (Distributor per Toko)
INSERT INTO public.suppliers (id, store_id, name, phone, address) VALUES
  -- Toko 1 Suppliers
  ('c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a001', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'PT Indofood CBP Sukses Makmur', '021-5551234', 'Jl. Sudirman No. 23, Jakarta'),
  ('c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a002', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'PT Tirta Investama (Aqua)', '021-8884321', 'Jl. Pulogadung Raya No. 4, Jakarta'),
  ('c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a003', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'CV Sembako Makmur Jaya', '0812-3456-7890', 'Jl. Veteran No. 56, Padang'),
  
  -- Toko 2 Suppliers
  ('c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a201', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Koperasi Sanjai Ranah Minang', '0752-12001', 'Jl. Panorama No. 12, Bukittinggi'),
  ('c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a202', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Distributor Beras Solok Raya', '0811-999-888', 'Kompleks Pasar Raya, Solok'),
  ('c0c0c0c0-d0d0-e0e0-f0f0-a0a0a0a0a203', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'UD Bumbu Dapur Tradisional Minang', '0812-888-777', 'Pasar Aur Kuning, Bukittinggi')
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Customers (Pelanggan per Toko)
INSERT INTO public.customers (id, store_id, name, phone, email, address) VALUES
  -- Toko 1 Customers
  ('d0d0d0d0-e0e0-f0f0-a0a0-b0b0b0b0b001', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'Pelanggan Umum Toko 1', '-', '-', '-'),
  ('d0d0d0d0-e0e0-f0f0-a0a0-b0b0b0b0b002', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'Budi Santoso', '0811-222-333', 'budi@gmail.com', 'Jl. Merdeka No. 10, Padang'),
  ('d0d0d0d0-e0e0-f0f0-a0a0-b0b0b0b0b003', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000', 'Siti Rahma', '0822-444-555', 'siti@yahoo.com', 'Jl. Kartini No. 4, Padang'),
  
  -- Toko 2 Customers
  ('d0d0d0d0-e0e0-f0f0-a0a0-b0b0b0b0b201', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Pelanggan Umum Toko 2', '-', '-', '-'),
  ('d0d0d0d0-e0e0-f0f0-a0a0-b0b0b0b0b202', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Uda Hendra', '0813-777-666', 'hendra@gmail.com', 'Jl. Jam Gadang No. 2, Bukittinggi'),
  ('d0d0d0d0-e0e0-f0f0-a0a0-b0b0b0b0b203', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009', 'Uni Desi', '0821-666-555', 'desi@yahoo.com', 'Jl. Ngarai Sianok No. 8, Bukittinggi')
ON CONFLICT (id) DO NOTHING;


-- =========================================================================
-- ONE-TIME RESTORATION AND SEEDING FOR AUTH USERS
-- =========================================================================

-- A. Helper function to programmatically create or update seeded auth users
create or replace function public.seed_user(
  p_id uuid,
  p_email text,
  p_username text,
  p_full_name text,
  p_role text,
  p_store_id uuid
)
returns void as $$
begin
  -- Insert into auth.users if email doesn't exist
  if not exists (select 1 from auth.users where email = p_email) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      p_id,
      'authenticated',
      'authenticated',
      p_email,
      -- Set password identical to email address
      extensions.crypt(p_email, extensions.gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('username', p_username, 'full_name', p_full_name, 'role', p_role, 'store_id', p_store_id),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  else
    -- If user exists, make sure password is set to email and metadata is updated
    update auth.users
    set encrypted_password = extensions.crypt(p_email, extensions.gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object('username', p_username, 'full_name', p_full_name, 'role', p_role, 'store_id', p_store_id)
    where email = p_email;
  end if;

  -- Ensure profile exists in profiles table
  insert into public.profiles (id, email, username, full_name, role, store_id)
  values (
    (select id from auth.users where email = p_email),
    p_email,
    p_username,
    p_full_name,
    p_role,
    p_store_id
  )
  on conflict (id) do update set
    role = p_role,
    store_id = p_store_id,
    username = p_username,
    full_name = p_full_name;
end;
$$ language plpgsql security definer;

-- B. Execute User Seeding (Seeded passwords are identical to their emails)
-- 1. Super Admin
select public.seed_user('d0d0d0d0-e0e0-f0f0-a0a0-000000000001', 'superadmin@ajokasir.com', 'superadmin', 'Super Admin AjoKasir', 'super_admin', null);

-- 2. Toko 1 Users (AjoKasir Mart)
select public.seed_user('d0d0d0d0-e0e0-f0f0-a0a0-000000000002', 'owner@ajokasir.com', 'owner', 'Bung Ajo (Owner T1)', 'owner', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000');
select public.seed_user('d0d0d0d0-e0e0-f0f0-a0a0-000000000003', 'kasir@ajokasir.com', 'kasir', 'Uni Rina (Kasir T1)', 'kasir', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000');
select public.seed_user('d0d0d0d0-e0e0-f0f0-a0a0-000000000004', 'gudang@ajokasir.com', 'gudang', 'Uda Buyung (Gudang T1)', 'gudang', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e000');

-- 3. Toko 2 Users (Ajo Minang Swalayan)
select public.seed_user('d0d0d0d0-e0e0-f0f0-a0a0-000000000202', 'owner2@ajokasir.com', 'owner2', 'Mak Tuo (Owner T2)', 'owner', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009');
select public.seed_user('d0d0d0d0-e0e0-f0f0-a0a0-000000000203', 'kasir2@ajokasir.com', 'kasir2', 'Adiak Riri (Kasir T2)', 'kasir', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009');
select public.seed_user('d0d0d0d0-e0e0-f0f0-a0a0-000000000204', 'gudang2@ajokasir.com', 'gudang2', 'Uda Ian (Gudang T2)', 'gudang', 'a0a0a0a0-0000-0000-0000-e0e0e0e0e009');

-- C. Restore any other pre-existing auth users not created by the seeding
insert into public.profiles (id, email, username, full_name, role, store_id)
select 
  id,
  email,
  coalesce(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'role', 'kasir'),
  case 
    when raw_user_meta_data->>'store_id' is not null then (raw_user_meta_data->>'store_id')::uuid
    else null
  end
from auth.users
on conflict (id) do nothing;

-- D. Clean up helper functions
drop function if exists public.seed_user(uuid, text, text, text, text, uuid);

