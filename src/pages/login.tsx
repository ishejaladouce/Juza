import * as React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/form-field';
import { AuthShell } from '@/components/auth-shell';
import { useAuth } from '@/hooks/use-auth';
import { DEMO_CREDENTIALS } from '@/demo/seed';
import { cn } from '@/lib/utils';

interface LocationState {
  from?: string;
}

function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

/** Sign in (Supabase or demo). */
export default function LoginPage() {
  const { t } = useTranslation();
  const { signIn, submitting, isAuthenticated, profile, mode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const nextFromQuery = safeNextPath(searchParams.get('next'));
  const nextFromState = safeNextPath((location.state as LocationState)?.from);
  const redirectTo = nextFromQuery ?? nextFromState ?? '/dashboard';
  const adminIntent = redirectTo.startsWith('/admin');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (redirectTo.startsWith('/admin')) {
      if (!profile) return;
      if (profile.role !== 'admin') {
        navigate('/dashboard', { replace: true });
        return;
      }
    }
    navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, profile, redirectTo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t('auth.errors.missingFields'));
      return;
    }

    const result = await signIn({ email, password });
    if (!result.ok) {
      setError(result.error);
    }
  }

  async function quickSignIn(email: string, password: string) {
    setError(null);
    const result = await signIn({ email, password });
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <AuthShell
      title={adminIntent ? t('auth.adminAccessTitle') : t('pages.login.title')}
      description={
        adminIntent
          ? t('auth.adminAccessHint')
          : t('pages.login.description')
      }
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary hover:underline">
            {t('nav.register')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        <FormField id="email" label={t('auth.email')}>
          <Input
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        <FormField id="password" label={t('auth.password')}>
          <Input
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {adminIntent ? t('auth.adminAccessCta') : t('auth.signIn')}
        </Button>

        <p className="text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            {t('auth.forgotPassword')}
          </Link>
        </p>

        {!adminIntent && (
          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/login?next=/admin"
              className="inline-flex items-center gap-1.5 font-medium text-foreground/75 transition-colors hover:text-primary"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t('auth.adminAccessCta')}
            </Link>
          </p>
        )}

        {mode === 'demo' && (
          <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('auth.demoTitle')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('auth.demoHint')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEMO_CREDENTIALS.map((c) => (
                <Button
                  key={c.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  className={cn(c.role === 'admin' && adminIntent && 'border-primary')}
                  onClick={() => quickSignIn(c.email, c.password)}
                >
                  {t('auth.signInAs', {
                    role: t(`auth.roles.${c.role}`),
                  })}
                </Button>
              ))}
            </div>
          </div>
        )}
      </form>
    </AuthShell>
  );
}
