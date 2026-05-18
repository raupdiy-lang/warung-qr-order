create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'kitchen')),
  created_at timestamptz default now()
);

create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  table_number int unique not null,
  qr_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null check (category in ('makanan', 'minuman', 'dessert')),
  price numeric(12,2) not null,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references tables(id),
  status text not null default 'menunggu' check (status in ('menunggu', 'diproses', 'dimasak', 'selesai')),
  estimated_minutes int default 20,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_id uuid references menu_items(id),
  quantity int not null,
  note text,
  price numeric(12,2) not null
);

create table if not exists call_waiter_logs (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references tables(id),
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_orders_table_status on orders(table_id, status);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_order_items_order_id on order_items(order_id);

-- Aktifkan tabel berikut di Supabase Realtime (bisa juga melalui Dashboard > Database > Replication).
-- alter publication supabase_realtime add table orders, order_items, call_waiter_logs;
