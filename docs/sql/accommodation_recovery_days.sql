-- Run this once in the Supabase SQL Editor before deploying recovery-based stays.
-- Recovery is recorded per clinic procedure and copied onto each patient
-- request as a clinic-editable starting estimate.
alter table public.clinic_procedures
  add column if not exists recovery_days integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clinic_procedures_recovery_days_check'
      and conrelid = 'public.clinic_procedures'::regclass
  ) then
    alter table public.clinic_procedures
      add constraint clinic_procedures_recovery_days_check
      check (recovery_days >= 0);
  end if;
end
$$;

-- The app uses the existing clinic-confirmed final_start_date/final_end_date
-- interval for accommodation check-in and minimum stay, then adds
-- recovery_days + 1 day.
alter table public."Patient_request"
  add column if not exists recovery_days integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'patient_request_recovery_days_check'
      and conrelid = 'public."Patient_request"'::regclass
  ) then
    alter table public."Patient_request"
      add constraint patient_request_recovery_days_check
      check (recovery_days >= 0);
  end if;
end
$$;
