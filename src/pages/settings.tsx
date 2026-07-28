import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/form-field';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile } from '@/lib/data/users';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import type { LanguageCode } from '@/types/database';

/** Account settings (language, email alerts). */
export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { profile, refreshProfile } = useAuth();
  const [emailOn, setEmailOn] = React.useState(false);
  const [language, setLanguage] = React.useState<LanguageCode>('en');
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!profile) return;
    setEmailOn(Boolean(profile.email_notifications));
    setLanguage(profile.preferred_language ?? 'en');
  }, [profile]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile(profile.id, {
        email_notifications: emailOn,
        preferred_language: language,
      });
      void i18n.changeLanguage(language);
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={t('settings.eyebrow')}
        title={t('settings.title')}
        description={t('settings.description')}
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('nav.dashboard')}
          </Link>
        </Button>
      </PageHeader>

      <section className="container max-w-lg pb-16">
        <form onSubmit={onSave} className="space-y-6">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {saved && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm text-primary"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {t('settings.saved')}
            </p>
          )}

          <FormField
            id="preferredLanguage"
            label={t('settings.language')}
            hint={t('settings.languageHint')}
          >
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const selected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={
                      selected
                        ? 'rounded-md border border-primary bg-primary/10 px-2 py-2 text-sm font-medium'
                        : 'rounded-md border border-border px-2 py-2 text-sm text-muted-foreground'
                    }
                  >
                    {lang.nativeLabel}
                  </button>
                );
              })}
            </div>
          </FormField>

          <label className="flex items-start gap-3 rounded-md border border-foreground/10 p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={emailOn}
              onChange={(e) => setEmailOn(e.target.checked)}
            />
            <span>
              <span className="block font-medium text-foreground">
                {t('settings.emailNotifications')}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {t('settings.emailNotificationsHint')}
              </span>
            </span>
          </label>

          <Button type="submit" disabled={saving || !profile}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {t('settings.save')}
          </Button>
        </form>
      </section>
    </>
  );
}
