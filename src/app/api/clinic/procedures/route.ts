import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getClinicId(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (profileError || !profile) return null;

  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle();
  if (clinicError || !clinic) return null;
  return clinic.id;
}

async function authorizeClinic() {
  const supabase = createClient(await cookies());
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { response: NextResponse.json({ error: 'You must be signed in.' }, { status: 401 }) } as const;
  }

  const clinicId = await getClinicId(supabase, user.id);
  if (!clinicId) {
    return { response: NextResponse.json({ error: 'Your clinic profile could not be found.' }, { status: 403 }) } as const;
  }

  return { supabase, clinicId } as const;
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorizeClinic();
  if ('response' in authorization) return authorization.response;

  const body = await readBody(request);
  const clinicProcedureId = typeof body?.clinicProcedureId === 'string' ? body.clinicProcedureId.trim() : '';
  if (!UUID_PATTERN.test(clinicProcedureId)) {
    return NextResponse.json({ error: 'A valid clinic procedure is required.' }, { status: 400 });
  }

  const startingPrice = body?.startingPrice;
  const price = typeof startingPrice === 'number' ? startingPrice : Number.NaN;
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: 'Starting price must be a valid non-negative number.' }, { status: 400 });
  }

  const { data: procedure, error } = await authorization.supabase
    .from('clinic_procedures')
    .update({ starting_price: price })
    .eq('id', clinicProcedureId)
    .eq('clinic_id', authorization.clinicId)
    .select('id, procedure_id, starting_price')
    .maybeSingle();

  if (error) {
    console.error('Failed to update clinic procedure:', error);
    return NextResponse.json({ error: 'The procedure could not be updated.' }, { status: 500 });
  }
  if (!procedure) return NextResponse.json({ error: 'Clinic procedure not found.' }, { status: 404 });

  return NextResponse.json({ procedure }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function DELETE(request: Request) {
  const authorization = await authorizeClinic();
  if ('response' in authorization) return authorization.response;

  const body = await readBody(request);
  const clinicProcedureId = typeof body?.clinicProcedureId === 'string' ? body.clinicProcedureId.trim() : '';
  if (!UUID_PATTERN.test(clinicProcedureId)) {
    return NextResponse.json({ error: 'A valid clinic procedure is required.' }, { status: 400 });
  }

  const { data: deletedProcedure, error } = await authorization.supabase
    .from('clinic_procedures')
    .delete()
    .eq('id', clinicProcedureId)
    .eq('clinic_id', authorization.clinicId)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to remove clinic procedure:', error);
    return NextResponse.json({ error: 'The procedure could not be removed.' }, { status: 500 });
  }
  if (!deletedProcedure) return NextResponse.json({ error: 'Clinic procedure not found.' }, { status: 404 });

  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
