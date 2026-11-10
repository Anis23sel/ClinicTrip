-- Run this once in the Supabase SQL Editor before deploying cancellation.
-- The payment column lets the cancellation API reject cancellation after
-- ClinicTrip payment has been recorded by the payment flow.
alter table public."Patient_request"
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by text,
  add column if not exists clinictrip_paid_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'patient_request_cancelled_by_check'
      and conrelid = 'public."Patient_request"'::regclass
  ) then
    alter table public."Patient_request"
      add constraint patient_request_cancelled_by_check
      check (cancelled_by is null or cancelled_by in ('patient', 'clinic'));
  end if;
end
$$;
