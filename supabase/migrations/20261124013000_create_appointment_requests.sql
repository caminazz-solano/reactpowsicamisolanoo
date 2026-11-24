create table public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owner_accounts (id) on delete cascade,
  pet_profile_id uuid references public.pet_profiles (id) on delete set null,
  pet_name text not null check (char_length(btrim(pet_name)) between 1 and 40),
  service text not null check (char_length(btrim(service)) between 1 and 100),
  appointment_date date not null,
  appointment_time time not null,
  contact_phone text,
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

create index appointment_requests_owner_schedule_idx
  on public.appointment_requests (owner_id, appointment_date, appointment_time);

alter table public.appointment_requests enable row level security;

revoke all on public.appointment_requests from anon, authenticated;
grant select, insert on public.appointment_requests to authenticated;

create policy "Owners can read their own appointment requests"
  on public.appointment_requests
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "Owners can create their own appointment requests"
  on public.appointment_requests
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and (
      pet_profile_id is null
      or exists (
        select 1
        from public.pet_profiles profile
        where profile.id = pet_profile_id
          and profile.owner_id = (select auth.uid())
      )
    )
  );
