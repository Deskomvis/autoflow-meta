create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  ip text,
  user_agent text,
  path text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists site_visits_created_at_idx on public.site_visits (created_at);
create index if not exists site_visits_ip_idx on public.site_visits (ip);
create index if not exists site_visits_visitor_id_idx on public.site_visits (visitor_id);

alter table public.site_visits enable row level security;

create policy "site_visits_service_role_all"
  on public.site_visits
  for all
  to service_role
  using (true)
  with check (true);
