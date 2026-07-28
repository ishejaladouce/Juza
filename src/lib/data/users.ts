import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  demoListProfiles,
  demoProfileById,
  demoSetAccountStatus,
  demoSetUserRole,
  demoUpdateProfile,
} from '@/demo/store';
import type { AccountStatus, Profile, UserRole } from '@/types/database';

/** Fill missing profile fields with safe defaults. */
function normalizeProfile(p: Profile): Profile {
  return {
    ...p,
    account_status: p.account_status ?? 'active',
    email_notifications: Boolean(p.email_notifications),
    onboarding_completed_at: p.onboarding_completed_at ?? null,
  };
}

/** All user profiles (admin list). */
export async function fetchProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured) {
    return (await demoListProfiles()).map(normalizeProfile);
  }
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalizeProfile(row as Profile));
}

/** One profile by user id. */
export async function fetchProfileById(id: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) {
    const p = await demoProfileById(id);
    return p ? normalizeProfile(p) : null;
  }
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeProfile(data as Profile) : null;
}

/** Update profile fields (name, settings, etc.). */
export async function updateProfile(
  id: string,
  patch: Partial<Profile>,
): Promise<Profile> {
  if (!isSupabaseConfigured) {
    return normalizeProfile(await demoUpdateProfile(id, patch));
  }
  const { data, error } = await getSupabase()
    .from('profiles')
    .update(patch as never)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return normalizeProfile(data as Profile);
}

/** Change a user’s role (citizen / contributor / admin). */
export async function setUserRole(
  id: string,
  role: UserRole,
): Promise<Profile> {
  if (!isSupabaseConfigured) return normalizeProfile(await demoSetUserRole(id, role));
  return updateProfile(id, { role });
}

/** Suspend, restore, or soft-remove an account. */
export async function setAccountStatus(
  id: string,
  status: AccountStatus,
): Promise<Profile> {
  if (!isSupabaseConfigured) {
    return normalizeProfile(await demoSetAccountStatus(id, status));
  }
  const { data, error } = await getSupabase().rpc(
    'set_account_status' as never,
    { p_user_id: id, p_status: status } as never,
  );
  if (error) {
    return updateProfile(id, { account_status: status });
  }
  return normalizeProfile(data as Profile);
}
