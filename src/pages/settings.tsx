import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/form-field';
import { useAuth } from '@/hooks/use-auth';
import {
  removeProfileAvatar,
  uploadProfileAvatar,
} from '@/lib/data/avatar';
import { updateProfile } from '@/lib/data/users';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import type { LanguageCode } from '@/types/database';

function initialsFrom(name: string | null | undefined): string {
  const source = (name && name.trim()) || '';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Account settings (avatar, language, email alerts). */
export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { profile, refreshProfile } = useAuth();
  const [emailOn, setEmailOn] = React.useState(false);
  const [language, setLanguage] = React.useState<LanguageCode>('en');
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!profile) return;
    setEmailOn(Boolean(profile.email_notifications));
    setLanguage(profile.preferred_language ?? 'en');
    setPreviewUrl(profile.avatar_url);
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

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !profile) return;

    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await uploadProfileAvatar(profile.id, file);
      setPreviewUrl(updated.avatar_url);
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.avatarError'));
    } finally {
      setUploading(false);
    }
  }

  async function onRemoveAvatar() {
    if (!profile?.avatar_url) return;
    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      await removeProfileAvatar(profile.id);
      setPreviewUrl(null);
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.avatarError'));
    } finally {
      setUploading(false);
    }
  }

  const initials = initialsFrom(profile?.full_name);

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

          <div className="rounded-md border border-foreground/10 p-4">
            <p className="text-sm font-medium text-foreground">
              {t('settings.avatar')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('settings.avatarHint')}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-semibold text-primary"
                aria-hidden="true"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => void onPickFile(e)}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading || !profile}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="h-4 w-4" aria-hidden="true" />
                  )}
                  {t('settings.avatarUpload')}
                </Button>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={uploading || !profile}
                    onClick={() => void onRemoveAvatar()}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {t('settings.avatarRemove')}
                  </Button>
                )}
              </div>
            </div>
          </div>

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
