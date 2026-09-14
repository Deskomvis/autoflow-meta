create table if not exists public.course_votes (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  voter_reference text not null
    references public.membership_access(reference) on delete cascade,
  created_at timestamptz not null default now(),
  unique (course_id, voter_reference)
);

create index if not exists course_votes_course_id_idx
  on public.course_votes (course_id);

create index if not exists course_votes_voter_reference_idx
  on public.course_votes (voter_reference);

grant usage on schema public to service_role;
grant all privileges on table public.course_votes to service_role;

alter table public.course_votes enable row level security;

drop policy if exists "course_votes_no_public_read" on public.course_votes;
create policy "course_votes_no_public_read"
on public.course_votes
for select
to anon, authenticated
using (false);
