create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text unique not null,
  trophies integer not null default 1000,
  coins integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('player', 'admin', 'moderator')),
  badge text,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.user_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  item_code text not null,
  item_type text not null check (item_type in ('frame', 'font', 'color', 'badge')),
  acquired_at timestamptz not null default now(),
  unique (user_id, item_code)
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id),
  target_user_id uuid references public.users(id),
  action_type text not null check (action_type in ('coin_transfer', 'password_reset')),
  amount integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.users (email, username, trophies, coins)
values ('ercanulger@pisti.game', 'ercanulger', 1200, 500)
on conflict (username) do nothing;

insert into public.user_roles (user_id, role, badge)
select id, 'admin', 'Kurucu'
from public.users
where username = 'ercanulger'
on conflict (user_id, role) do nothing;
