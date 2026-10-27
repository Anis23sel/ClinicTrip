-- Run this in the Supabase SQL Editor after creating public.favorites.
-- Each patient may read, add, or remove only their own clinic favorites.

alter table public.favorites enable row level security;

revoke all on table public.favorites from public, anon, authenticated;
grant select, insert, delete on table public.favorites to authenticated;

drop policy if exists "Patients can manage their own favorites" on public.favorites;
drop policy if exists "Patients can read their own favorites" on public.favorites;
drop policy if exists "Patients can add their own favorites" on public.favorites;
drop policy if exists "Patients can remove their own favorites" on public.favorites;

create policy "Patients can read their own favorites"
on public.favorites
for select
to authenticated
using (
  exists (
    select 1
    from public.patients as patient
    join public.profiles as profile on profile.id = patient.profile_id
    where patient.id = favorites.patient_id
      and profile.user_id = (select auth.uid())
  )
);

create policy "Patients can add their own favorites"
on public.favorites
for insert
to authenticated
with check (
  exists (
    select 1
    from public.patients as patient
    join public.profiles as profile on profile.id = patient.profile_id
    where patient.id = favorites.patient_id
      and profile.user_id = (select auth.uid())
  )
);

create policy "Patients can remove their own favorites"
on public.favorites
for delete
to authenticated
using (
  exists (
    select 1
    from public.patients as patient
    join public.profiles as profile on profile.id = patient.profile_id
    where patient.id = favorites.patient_id
      and profile.user_id = (select auth.uid())
  )
);
