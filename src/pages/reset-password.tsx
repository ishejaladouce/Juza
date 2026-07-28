import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuthShell } from '@/components/auth-shell';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const MIN_PASSWORD_LEN = 8;

/** Set a new password from the reset link. */
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LEN) {
      setError(t('auth.errors.shortPassword', { min: MIN_PASSWORD_LEN }));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.reset.mismatch'));
      return;
    }
    if (!isSupabaseConfigured) {
      setError(t('auth.forgot.demoOnly'));
      return;
    }

    setSubmitting(true);
    try {
      const { error: err } = await getSupabase().auth.updateUser({ password });
      if (err) {
        setError(err.message);
        return;
      }
      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={t('auth.reset.title')}
      description={t('auth.reset.description')}
      footer={
        <Link to="/login" className="text-primary hover:underline">
          {t('auth.backToLogin')}
        </Link>
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

        <FormField id="new-password" label={t('auth.password')}>
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LEN}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <FormField id="confirm-password" label={t('auth.reset.confirm')}>
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LEN}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {t('auth.reset.submit')}
        </Button>
      </form>
    </AuthShell>
  );
}
