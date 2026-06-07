import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

type Profile = {
  id: string;
  email: string;
  fullName: string | null;
};

type AuthenticatedProfileResult =
  | { profile: Profile; response?: never }
  | { profile?: never; response: NextResponse };

export async function requireCurrentProfile(db: SupabaseClient<Database>): Promise<AuthenticatedProfileResult> {
  const session = await getSession();
  const email = typeof session?.user?.email === 'string' ? session.user.email : null;

  if (!email) {
    return { response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  const { data, error } = await db
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (error) {
    return { response: NextResponse.json({ error: 'Unable to resolve user profile' }, { status: 500 }) };
  }

  if (!data) {
    return { response: NextResponse.json({ error: 'User profile not found' }, { status: 403 }) };
  }

  return {
    profile: {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
    },
  };
}
