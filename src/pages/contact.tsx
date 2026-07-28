import * as React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { submitContactMessage } from '@/lib/data/contact';

/** Contact form for the Juza team. */
export default function ContactPage() {
  const { t } = useTranslation();
  const { isAuthenticated, profile, user } = useAuth();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (profile?.full_name) setName((n) => n || profile.full_name || '');
    if (user?.email) setEmail((e) => e || user.email || '');
  }, [isAuthenticated, profile?.full_name, user?.email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2 || email.trim().length < 5 || message.trim().length < 10) {
      setError(t('contact.errors.incomplete'));
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        name,
        email,
        subject,
        message,
        userId: profile?.id ?? null,
      });
      setSent(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('contact.errors.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={t('brand.name')}
        title={t('static.contact.title')}
        description={t('static.contact.description')}
      />

      <section className="container max-w-xl pb-24">
        <p className="mb-8 text-base leading-relaxed text-muted-foreground">
          {t('contact.intro')}
        </p>

        {isAuthenticated && (
          <p className="mb-6 text-sm text-muted-foreground">
            {t('contact.signedInHint')}{' '}
            <Link
              to="/dashboard/messages"
              className="font-medium text-primary hover:underline"
            >
              {t('contact.viewMyMessages')}
            </Link>
          </p>
        )}

        {sent ? (
          <div
            role="status"
            className="rounded-xl border border-primary/20 bg-primary/5 p-6"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">{t('contact.successTitle')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isAuthenticated
                    ? t('contact.successBodySignedIn')
                    : t('contact.successBody')}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {isAuthenticated && (
                    <Button asChild>
                      <Link to="/dashboard/messages">
                        {t('contact.viewMyMessages')}
                      </Link>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSent(false)}
                  >
                    {t('contact.sendAnother')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-xl border border-foreground/8 bg-background/80 p-6 sm:p-8"
            noValidate
          >
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            <FormField id="contact-name" label={t('contact.name')}>
              <Input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>

            <FormField id="contact-email" label={t('contact.email')}>
              <Input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>

            <FormField id="contact-subject" label={t('contact.subject')}>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('contact.subjectPlaceholder')}
              />
            </FormField>

            <FormField id="contact-message" label={t('contact.message')}>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex min-h-[8rem] w-full rounded-md border border-foreground/12 bg-muted/30 px-3.5 py-2.5 text-sm transition-colors placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary/40 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </FormField>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Mail className="h-4 w-4" aria-hidden="true" />
              )}
              {t('contact.submit')}
            </Button>
          </form>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          {t('contact.reportHint')}{' '}
          <Link to="/browse" className="font-medium text-primary hover:underline">
            {t('nav.browse')}
          </Link>
          .
        </p>
      </section>
    </>
  );
}
