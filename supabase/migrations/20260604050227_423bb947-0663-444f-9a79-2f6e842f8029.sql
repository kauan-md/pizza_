
-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Categories
create table if not exists public.categories (
  id text primary key,
  label text not null,
  display_order int not null default 0
);

grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;

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

grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

-- Coupons (criada antes de orders por causa do FK)
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

grant select on public.coupons to anon, authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;

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
  coupon_id uuid references public.coupons(id) on delete set null,
  discount_applied numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
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

grant select, insert, update, delete on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;

create or replace function public.increment_coupon_used_count(p_coupon_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where id = p_coupon_id;
end;
$$;

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

grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;

-- RLS policies
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Profiles are viewable by the user themselves') then
    create policy "Profiles are viewable by the user themselves" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Products are viewable by everyone') then
    create policy "Products are viewable by everyone" on public.products for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Categories are viewable by everyone') then
    create policy "Categories are viewable by everyone" on public.categories for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='coupons' and policyname='Active coupons are viewable by everyone') then
    create policy "Active coupons are viewable by everyone" on public.coupons for select using (active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='Users can view their own orders') then
    create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='Users can insert their own orders') then
    create policy "Users can insert their own orders" on public.orders for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='order_items' and policyname='Users can view their own order items') then
    create policy "Users can view their own order items" on public.order_items for select using (
      exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='order_items' and policyname='Users can insert items in their own orders') then
    create policy "Users can insert items in their own orders" on public.order_items for insert with check (
      exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='Reviews are viewable by everyone') then
    create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='Authenticated users can post reviews') then
    create policy "Authenticated users can post reviews" on public.reviews for insert with check (auth.uid() = user_id);
  end if;
end $$;
