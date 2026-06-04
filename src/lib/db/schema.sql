-- Profiles (extends Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Categories
create table if not exists public.categories (
  id text primary key,
  label text not null
);

alter table public.categories enable row level security;

-- Adiciona colunas que podem estar faltando em execuções anteriores
alter table public.categories add column if not exists display_order int not null default 0;

insert into public.categories (id, label, display_order) values
  ('ofertas', 'Ofertas Exclusivas', 1),
  ('tradicionais', 'Tradicionais', 2),
  ('bebidas', 'Bebidas', 3),
  ('doces', 'Sobremesas', 4)
on conflict (id) do nothing;

-- Products
create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null,
  price numeric(10,2) not null,
  old_price numeric(10,2),
  category_id text not null references public.categories(id),
  tag text,
  image text not null,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'preparing', 'delivering', 'delivered', 'cancelled')),
  total numeric(10,2) not null,
  payment_method text,
  payment_status text check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  delivery_address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null default 1,
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

-- Coupons
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  min_order_value numeric(10,2),
  max_uses int,
  used_count int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

alter table public.orders add column if not exists coupon_id uuid references public.coupons(id) on delete set null;
alter table public.orders add column if not exists discount_applied numeric(10,2) not null default 0;

create or replace function public.increment_coupon_used_count(p_coupon_id uuid)
returns void as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where id = p_coupon_id;
end;
$$ language plpgsql security definer;

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  author_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- RLS policies
create policy if not exists "Profiles are viewable by the user themselves"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "Products are viewable by everyone"
  on public.products for select
  using (true);

create policy if not exists "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy if not exists "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy if not exists "Users can insert items in their own orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
