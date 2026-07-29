import * as React from 'react';
import type { User, AuthError } from '@supabase/supabase-js';
import { getDataMode, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  demoCurrentUserId,
  demoProfileById,
  demoSignIn,
  demoSignOut,
  demoSignUp,
} from '@/demo/store';
import type { Profile, LanguageCode } from '@/types/database';
import {
  AuthContext,
  type AuthContextValue,
  type AuthResult,
  type SignInOptions,
  type SignUpOptions,
} from '@/hooks/auth-context';

export type { AuthResult, SignInOptions, SignUpOptions };

/** Turn auth errors into a short message. */
function formatAuthError(err: AuthError | Error | null): string {
  if (!err) return 'Something went wrong. Please try again.';
  return err.message || 'Something went wrong. Please try again.';
}

/** Load the profile row for a signed-in user. */
async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) {
    const p = await demoProfileById(userId);
    if (!p) return null;
    return {
      ...p,
      account_status: p.account_status ?? 'active',
      email_notifications: Boolean(p.email_notifications),
      onboarding_completed_at: p.onboarding_completed_at ?? null,
    };
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[auth] failed to load profile', error);
    return null;
  }
  if (!data) return null;
  const p = data as Profile;
  return {
    ...p,
    account_status: p.account_status ?? 'active',
    email_notifications: Boolean(p.email_notifications),
    onboarding_completed_at: p.onboarding_completed_at ?? null,
  };
}

/** Message when account is suspended or removed. */
function accountBlockedMessage(status: string | undefined): string | null {
  if (status === 'suspended') {
    return 'Your account has been suspended. Contact Juza support.';
  }
  if (status === 'removed') {
    return 'This account is no longer available.';
  }
  return null;
}

/** Holds session, profile, and sign-in helpers. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const mode: 'supabase' | 'demo' =
    getDataMode() === 'demo' ? 'demo' : 'supabase';

  const [session, setSession] = React.useState<
    AuthContextValue['session']
  >(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [demoUserId, setDemoUserId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    if (mode === 'demo') {
      (async () => {
        const uid = await demoCurrentUserId();
        if (cancelled) return;
        setDemoUserId(uid);
        if (uid) {
          const p = await fetchProfile(uid);
          if (!cancelled) setProfile(p);
        }
        if (!cancelled) setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }

    const supabase = getSupabase();
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      if (data.session?.user) {
        const p = await fetchProfile(data.session.user.id);
        const blocked = accountBlockedMessage(p?.account_status);
        if (blocked) {
          await supabase.auth.signOut();
          if (!cancelled) {
            setSession(null);
            setProfile(null);
          }
        } else if (!cancelled) {
          setProfile(p);
        }
      }
      if (!cancelled) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user) {
        fetchProfile(next.user.id).then(async (p) => {
          const blocked = accountBlockedMessage(p?.account_status);
          if (blocked) {
            await getSupabase().auth.signOut();
            setProfile(null);
            setSession(null);
            return;
          }
          setProfile(p);
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [mode]);

  const signIn = React.useCallback<AuthContextValue['signIn']>(
    async ({ email, password }) => {
      setSubmitting(true);
      try {
        if (mode === 'demo') {
          try {
            const p = await demoSignIn(email, password);
            setDemoUserId(p.id);
            setProfile(p);
            return { ok: true };
          } catch (err) {
            return { ok: false, error: formatAuthError(err as Error) };
          }
        }
        const { error } = await getSupabase().auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { ok: false, error: formatAuthError(error) };

        const { data } = await getSupabase().auth.getSession();
        const uid = data.session?.user?.id;
        if (uid) {
          const p = await fetchProfile(uid);
          const blocked = accountBlockedMessage(p?.account_status);
          if (blocked) {
            await getSupabase().auth.signOut();
            setSession(null);
            setProfile(null);
            return { ok: false, error: blocked };
          }
          setProfile(p);
        }
        return { ok: true };
      } finally {
        setSubmitting(false);
      }
    },
    [mode],
  );

  const signUp = React.useCallback<AuthContextValue['signUp']>(
    async ({ email, password, fullName, preferredLanguage }) => {
      setSubmitting(true);
      try {
        const lang: LanguageCode =
          preferredLanguage === 'fr' || preferredLanguage === 'rw'
            ? preferredLanguage
            : 'en';
        if (mode === 'demo') {
          try {
            const p = await demoSignUp(email, password, fullName ?? '', lang);
            setDemoUserId(p.id);
            setProfile(p);
            return { ok: true, needsConfirmation: false };
          } catch (err) {
            return { ok: false, error: formatAuthError(err as Error) };
          }
        }
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              ...(fullName ? { full_name: fullName } : {}),
              preferred_language: lang,
            },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) return { ok: false, error: formatAuthError(error) };
        return { ok: true, needsConfirmation: !data.session };
      } finally {
        setSubmitting(false);
      }
    },
    [mode],
  );

  const signOut = React.useCallback<AuthContextValue['signOut']>(async () => {
    setSubmitting(true);
    try {
      if (mode === 'demo') {
        await demoSignOut();
        setDemoUserId(null);
        setProfile(null);
        return { ok: true };
      }
      const { error } = await getSupabase().auth.signOut();
      if (error) return { ok: false, error: formatAuthError(error) };
      return { ok: true };
    } finally {
      setSubmitting(false);
    }
  }, [mode]);

  const refreshProfile = React.useCallback(async () => {
    const id = mode === 'demo' ? demoUserId : session?.user?.id ?? null;
    if (!id) return;
    const p = await fetchProfile(id);
    setProfile(p);
  }, [mode, demoUserId, session]);

  const userId = mode === 'demo' ? demoUserId : session?.user?.id ?? null;

  const value = React.useMemo<AuthContextValue>(
    () => ({
      loading,
      submitting,
      mode,
      session,
      user:
        mode === 'demo' && profile
          ? ({
              id: profile.id,
              email: undefined,
              app_metadata: {},
              user_metadata: { full_name: profile.full_name },
              aud: 'demo',
              created_at: profile.created_at,
            } as unknown as User)
          : session?.user ?? null,
      profile,
      isAuthenticated: Boolean(userId),
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [
      loading,
      submitting,
      mode,
      session,
      profile,
      userId,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the current auth context. */
export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
