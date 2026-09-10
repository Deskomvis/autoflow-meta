create table if not exists public.membership_access (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  amount integer,
  payment_url text,
  singapay_transaction_id text,
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_membership_access_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists membership_access_updated_at on public.membership_access;
create trigger membership_access_updated_at
before update on public.membership_access
for each row
execute function public.set_membership_access_updated_at();

alter table public.membership_access enable row level security;

drop policy if exists "membership_access_no_public_read" on public.membership_access;
create policy "membership_access_no_public_read"
on public.membership_access
for select
to anon, authenticated
using (false);
