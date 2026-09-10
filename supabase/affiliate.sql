-- Affiliate / referral schema. Run after supabase/membership_access.sql.

-- ── affiliate: one row per activated affiliator ──────────────────
create table if not exists public.affiliate (
  id uuid primary key default gen_random_uuid(),
  owner_reference text not null unique
    references public.membership_access(reference) on delete cascade,
  affiliate_code text not null unique,
  whatsapp_phone text not null,
  activated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- codes are stored uppercased; guard against case-variant duplicates anyway
create unique index if not exists affiliate_code_ci_idx
  on public.affiliate (upper(affiliate_code));

-- ── attribution columns on the buyer's own membership_access row ──
alter table public.membership_access add column if not exists affiliate_code text;
alter table public.membership_access add column if not exists affiliate_owner_reference text;
alter table public.membership_access add column if not exists original_amount integer;
alter table public.membership_access add column if not exists discount_amount integer;
alter table public.membership_access add column if not exists commission_amount integer;
alter table public.membership_access add column if not exists commission_credited_at timestamptz;
alter table public.membership_access add column if not exists affiliate_message_sent_at timestamptz;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'membership_access_affiliate_owner_fk'
  ) then
    alter table public.membership_access
      add constraint membership_access_affiliate_owner_fk
      foreign key (affiliate_owner_reference)
      references public.membership_access(reference) on delete set null;
  end if;
end $$;

alter table public.membership_access drop constraint if exists membership_access_no_self_referral;
alter table public.membership_access add constraint membership_access_no_self_referral
  check (affiliate_owner_reference is null or affiliate_owner_reference <> reference);

create index if not exists membership_access_affiliate_owner_idx
  on public.membership_access (affiliate_owner_reference)
  where affiliate_owner_reference is not null;

-- ── affiliate_withdrawal: payout requests ────────────────────────
create table if not exists public.affiliate_withdrawal (
  id uuid primary key default gen_random_uuid(),
  owner_reference text not null
    references public.affiliate(owner_reference) on delete cascade,
  amount integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'rejected')),
  note text,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliate_withdrawal_owner_status_idx
  on public.affiliate_withdrawal (owner_reference, status);

-- ── updated_at triggers (same pattern as membership_access) ──────
create or replace function public.set_affiliate_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists affiliate_updated_at on public.affiliate;
create trigger affiliate_updated_at
before update on public.affiliate
for each row
execute function public.set_affiliate_updated_at();

drop trigger if exists affiliate_withdrawal_updated_at on public.affiliate_withdrawal;
create trigger affiliate_withdrawal_updated_at
before update on public.affiliate_withdrawal
for each row
execute function public.set_affiliate_updated_at();

-- ── grants + RLS (mirror membership_access.sql — the API is service_role only) ──
grant usage on schema public to service_role;
grant all privileges on table public.affiliate to service_role;
grant all privileges on table public.affiliate_withdrawal to service_role;

alter table public.affiliate enable row level security;
alter table public.affiliate_withdrawal enable row level security;

drop policy if exists "affiliate_no_public_read" on public.affiliate;
create policy "affiliate_no_public_read"
on public.affiliate
for select
to anon, authenticated
using (false);

drop policy if exists "affiliate_withdrawal_no_public_read" on public.affiliate_withdrawal;
create policy "affiliate_withdrawal_no_public_read"
on public.affiliate_withdrawal
for select
to anon, authenticated
using (false);
