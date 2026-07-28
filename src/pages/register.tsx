import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/form-field';
import { AuthShell } from '@/components/auth-shell';
import { RoleNotice } from '@/components/role-notice';
import { useAuth } from '@/hooks/use-auth';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import type { LanguageCode } from '@/types/database';

const MIN_PASSWORD_LEN = 8;

type FieldErrors = Partial<
  Record<'fullName' | 'email' | 'password' | 'language', string>
>;

/** Create a citizen account. */
export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { signUp, submitting, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [preferredLanguage, setPreferredLanguage] = React.useState<LanguageCode>(
    () => {
      const current = (i18n.resolvedLanguage ?? 'en') as LanguageCode;
      return current === 'fr' || current === 'rw' ? current : 'en';
    },
  );
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [confirmationSentTo, setConfirmationSentTo] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!fullName.trim()) errs.fullName = t('auth.errors.missingName');
    if (!email.trim()) errs.email = t('auth.errors.missingEmail');
    else if (!/^\S+@\S+\.\S+$/.test(email))
      errs.email = t('auth.errors.badEmail');
    if (password.length < MIN_PASSWORD_LEN)
      errs.password = t('auth.errors.shortPassword', { min: MIN_PASSWORD_LEN });
    if (!['en', 'fr', 'rw'].includes(preferredLanguage))
      errs.language = t('auth.errors.missingLanguage');
    return errs;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = await signUp({
      email,
      password,
      fullName,
      preferredLanguage,
    });
    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    void i18n.changeLanguage(preferredLanguage);

    if (result.needsConfirmation) {
      setConfirmationSentTo(email);
    } else {
      navigate('/dashboard', { replace: true });
    }
  }

  if (confirmationSentTo) {
    return (
      <AuthShell
        title={t('auth.checkEmailTitle')}
        description={t('auth.checkEmailBody', { email: confirmationSentTo })}
      >
        <div
          className="flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-foreground">
            {t('auth.checkEmailHint')}
          </p>
        </div>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/login">{t('auth.backToLogin')}</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('pages.register.title')}
      description={t('pages.register.description')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">
            {t('nav.login')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{formError}</p>
          </div>
        )}

        <FormField
          id="fullName"
          label={t('auth.fullName')}
          error={fieldErrors.fullName}
        >
          <Input
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </FormField>

        <FormField
          id="email"
          label={t('auth.email')}
          error={fieldErrors.email}
        >
          <Input
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        <FormField
          id="password"
          label={t('auth.password')}
          hint={t('auth.passwordHint', { min: MIN_PASSWORD_LEN })}
          error={fieldErrors.password}
        >
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LEN}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <FormField
          id="preferredLanguage"
          label={t('auth.preferredLanguage')}
          hint={t('auth.preferredLanguageHint')}
          error={fieldErrors.language}
        >
          <div
            role="radiogroup"
            aria-label={t('auth.preferredLanguage')}
            className="grid grid-cols-3 gap-2"
          >
            {SUPPORTED_LANGUAGES.map((lang) => {
              const selected = preferredLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPreferredLanguage(lang.code)}
                  className={
                    selected
                      ? 'rounded-md border border-primary bg-primary/10 px-2 py-2 text-sm font-medium text-foreground'
                      : 'rounded-md border border-border px-2 py-2 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }
                >
                  {lang.nativeLabel}
                </button>
              );
            })}
          </div>
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {t('auth.createAccount')}
        </Button>

        <RoleNotice variant="signup" />

        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('auth.termsNotice')}{' '}
          <Link to="/terms" className="font-medium text-primary hover:underline">
            {t('footer.terms')}
          </Link>
          {' · '}
          <Link to="/privacy" className="font-medium text-primary hover:underline">
            {t('footer.privacy')}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
