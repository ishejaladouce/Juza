import * as React from 'react';
import { HelpCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { createArticleReport } from '@/lib/data/reports';

/** Form to ask a question on an article. */
export function AskArticleQuestion({ articleId }: { articleId: string }) {
  const { t } = useTranslation();
  const { profile, isAuthenticated } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [body, setBody] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (body.trim().length < 10) {
      setError(t('ask.tooShort'));
      return;
    }
    setSubmitting(true);
    try {
      await createArticleReport({
        article_id: articleId,
        reason: 'question',
        note: body.trim(),
        reporter_user_id: profile?.id ?? null,
        reporter_email: isAuthenticated ? null : email.trim() || null,
      });
      setDone(true);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className="mt-6 flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">{t('ask.thanksTitle')}</p>
          <p className="mt-1 text-muted-foreground">{t('ask.thanksBody')}</p>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="text-muted-foreground"
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          {t('ask.open')}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 space-y-4 border-t border-border pt-6"
      noValidate
    >
      <h2 className="font-medium text-foreground">{t('ask.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('ask.hint')}</p>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {!isAuthenticated && (
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">{t('ask.email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-10 w-full rounded-md border border-foreground/12 bg-muted/30 px-3 text-sm"
            required
          />
        </label>
      )}

      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">{t('ask.question')}</span>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex min-h-[6rem] w-full rounded-md border border-foreground/12 bg-muted/30 px-3.5 py-2.5 text-sm"
          required
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {t('ask.submit')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          {t('ask.cancel')}
        </Button>
      </div>
    </form>
  );
}
