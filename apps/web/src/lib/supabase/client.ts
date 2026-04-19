import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseBrowser() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  browserClient = createClient<Database>(url, key);
  return browserClient;
}
