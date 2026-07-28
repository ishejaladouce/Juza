import * as React from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { LanguageCode, Profile } from '@/types/database';

export interface SignUpOptions {
  email: string;
  password: string;
  fullName?: string;
  preferredLanguage?: LanguageCode;
}

export interface SignInOptions {
  email: string;
  password: string;
}

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string };

export interface AuthContextValue {
  loading: boolean;
  submitting: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  mode: 'supabase' | 'demo';
  signIn: (opts: SignInOptions) => Promise<AuthResult>;
  signUp: (
    opts: SignUpOptions,
  ) => Promise<AuthResult & { needsConfirmation?: boolean }>;
  signOut: () => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}

const GLOBAL_KEY = '__juza_auth_context__';

type GlobalAuth = typeof globalThis & {
  [GLOBAL_KEY]?: React.Context<AuthContextValue | undefined>;
};

/** Shared auth context. */
export const AuthContext: React.Context<AuthContextValue | undefined> = (() => {
  const g = globalThis as GlobalAuth;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = React.createContext<AuthContextValue | undefined>(undefined);
  }
  return g[GLOBAL_KEY]!;
})();
