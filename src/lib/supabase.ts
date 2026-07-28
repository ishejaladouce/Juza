import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type JuzaSupabaseClient = SupabaseClient<Database>;

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
const allowDemo = import.meta.env.VITE_ALLOW_DEMO === 'true';

const GLOBAL_KEY = '__juza_supabase_client__';

type GlobalSupabase = typeof globalThis & {
  [GLOBAL_KEY]?: JuzaSupabaseClient;
};

export const isSupabaseConfigured = Boolean(url && anonKey);

export type DataMode = 'supabase' | 'demo' | 'missing';

/** Active backend: supabase, demo, or missing. */
export function getDataMode(): DataMode {
  if (isSupabaseConfigured) return 'supabase';
  if (allowDemo) return 'demo';
  return 'missing';
}

/** Shared Supabase client. */
export function getSupabase(): JuzaSupabaseClient {
  const g = globalThis as GlobalSupabase;
  if (g[GLOBAL_KEY]) return g[GLOBAL_KEY]!;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
    );
  }

  g[GLOBAL_KEY] = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'juza-auth',
    },
    global: {
      headers: { 'x-application-name': 'juza-web' },
    },
  });

  return g[GLOBAL_KEY]!;
}

/** Clear demo data saved in the browser. */
export function clearDemoLocalData(): void {
  if (typeof localStorage === 'undefined') return;
  const keys = [
    'juza-demo-articles',
    'juza-demo-categories',
    'juza-demo-profiles',
    'juza-demo-bookmarks',
    'juza-demo-follows',
    'juza-demo-notifications',
    'juza-demo-session',
    'juza-demo-users',
    'juza-demo-contributor-requests',
    'juza-demo-article-reports',
    'juza-demo-article-report-replies',
  ];
  for (const key of keys) localStorage.removeItem(key);
}
