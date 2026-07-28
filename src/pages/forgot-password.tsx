import * as React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuthShell } from '@/components/auth-shell';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

/** Request a password reset email. */
export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t('auth.errors.missingEmail'));
      return;
    }

    if (!isSupabaseConfigured) {
      setError(t('auth.forgot.demoOnly'));
      return;
    }

    setSubmitting(true);
    try {
      const redirectTo = `${import.meta.env.VITE_SITE_URL ?? window.location.origin}/reset-password`;
      const { error: err } = await getSupabase().auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      );
      if (err) {
        setError(err.message);
        return;
      }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        title={t('auth.forgot.sentTitle')}
        description={t('auth.forgot.sentBody', { email })}
      >
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p>{t('auth.forgot.sentHint')}</p>
        </div>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/login">{t('auth.backToLogin')}</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('auth.forgot.title')}
      description={t('auth.forgot.description')}
      footer={
        <>
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.backToLogin')}
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

        <FormField id="forgot-email" label={t('auth.email')}>
          <Input
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {t('auth.forgot.submit')}
        </Button>
      </form>
    </AuthShell>
  );
}
