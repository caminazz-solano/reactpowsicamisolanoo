create table public.owner_accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default ''
);

create table public.veterinarian_accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null
);

create table public.pet_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owner_accounts (id) on delete restrict,
  veterinarian_id uuid references public.veterinarian_accounts (id) on delete set null,
  name text not null default '',
  species text not null default '',
  age numeric(5, 2) check (age between 0 and 40),
  weight numeric(6, 2) check (weight between 0 and 200),
  breed text,
  image text
);

create table public.pet_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.pet_profiles (id) on delete restrict,
  text text not null check (char_length(text) between 1 and 500)
);

create index pet_profiles_owner_id_idx on public.pet_profiles (owner_id);
create index pet_profiles_veterinarian_id_idx on public.pet_profiles (veterinarian_id);
create index pet_notes_profile_id_idx on public.pet_notes (profile_id);

create function public.create_owner_account_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'account_type' = 'owner' then
    insert into public.owner_accounts (id, name)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), '')
    );
  end if;
  return new;
end;
$$;

revoke all on function public.create_owner_account_for_new_user() from public, anon, authenticated;

create trigger on_auth_user_created_create_owner_account
  after insert on auth.users
  for each row execute function public.create_owner_account_for_new_user();

alter table public.owner_accounts enable row level security;
alter table public.veterinarian_accounts enable row level security;
alter table public.pet_profiles enable row level security;
alter table public.pet_notes enable row level security;

create policy "Owners can read their own account"
  on public.owner_accounts
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Owners and veterinarians can read eligible accounts"
  on public.veterinarian_accounts
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.owner_accounts owner_account
      where owner_account.id = (select auth.uid())
    )
  );

create policy "Owners and assigned veterinarians can read profiles"
  on public.pet_profiles
  for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or veterinarian_id = (select auth.uid())
  );

create policy "Owners can create their own profiles"
  on public.pet_profiles
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Owners can update their own profiles"
  on public.pet_profiles
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Owners can delete their own profiles"
  on public.pet_profiles
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "Owners and assigned veterinarians can read notes"
  on public.pet_notes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.pet_profiles profile
      where profile.id = profile_id
        and (
          profile.owner_id = (select auth.uid())
          or profile.veterinarian_id = (select auth.uid())
        )
    )
  );

create policy "Owners and assigned veterinarians can create notes"
  on public.pet_notes
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.pet_profiles profile
      where profile.id = profile_id
        and (
          profile.owner_id = (select auth.uid())
          or profile.veterinarian_id = (select auth.uid())
        )
    )
  );

create policy "Owners and assigned veterinarians can update notes"
  on public.pet_notes
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.pet_profiles profile
      where profile.id = profile_id
        and (
          profile.owner_id = (select auth.uid())
          or profile.veterinarian_id = (select auth.uid())
        )
    )
  )
  with check (
    exists (
      select 1
      from public.pet_profiles profile
      where profile.id = profile_id
        and (
          profile.owner_id = (select auth.uid())
          or profile.veterinarian_id = (select auth.uid())
        )
    )
  );

create policy "Owners can delete notes for their own profiles"
  on public.pet_notes
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.pet_profiles profile
      where profile.id = profile_id
        and profile.owner_id = (select auth.uid())
    )
  );

revoke all on public.owner_accounts from anon, authenticated;
revoke all on public.veterinarian_accounts from anon, authenticated;
revoke all on public.pet_profiles from anon, authenticated;
revoke all on public.pet_notes from anon, authenticated;

grant select on public.owner_accounts to authenticated;
grant select on public.veterinarian_accounts to authenticated;
grant select, delete on public.pet_profiles to authenticated;
grant insert (owner_id, veterinarian_id, name, species, age, weight, breed, image)
  on public.pet_profiles to authenticated;
grant update (veterinarian_id, name, species, age, weight, breed, image)
  on public.pet_profiles to authenticated;
grant select, insert, delete on public.pet_notes to authenticated;
grant update (text) on public.pet_notes to authenticated;
