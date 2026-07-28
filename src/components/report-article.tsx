import * as React from 'react';
import { AlertCircle, CheckCircle2, Flag, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { createArticleReport } from '@/lib/data/reports';
import type { ArticleReportReason } from '@/types/database';

const REASONS: ArticleReportReason[] = [
  'wrong_info',
  'unsafe',
  'spam',
  'other',
];

/** Form to flag a problem on an article. */
export function ReportArticle({ articleId }: { articleId: string }) {
  const { t } = useTranslation();
  const { profile, isAuthenticated } = useAuth();

  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<ArticleReportReason>('wrong_info');
  const [note, setNote] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createArticleReport({
        article_id: articleId,
        reason,
        note: note.trim() || null,
        reporter_user_id: profile?.id ?? null,
        reporter_email: isAuthenticated
          ? null
          : email.trim() || null,
      });
      setDone(true);
      setNote('');
      setEmail('');
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
        className="mt-10 flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">{t('report.thanksTitle')}</p>
          <p className="mt-1 text-muted-foreground">{t('report.thanksBody')}</p>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-10 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="text-muted-foreground"
        >
          <Flag className="h-4 w-4" aria-hidden="true" />
          {t('report.open')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-lg border border-border bg-card p-5 shadow-soft">
      <h2 className="flex items-center gap-2 font-serif text-h3 text-foreground">
        <Flag className="h-4 w-4 text-primary" aria-hidden="true" />
        {t('report.title')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('report.description')}</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <fieldset>
          <legend className="text-sm font-medium text-foreground">
            {t('report.reasonLabel')}
          </legend>
          <div className="mt-2 space-y-2">
            {REASONS.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-start gap-2 text-sm text-foreground"
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="mt-1"
                />
                <span>{t(`report.reasons.${r}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="report-note"
            className="block text-sm font-medium text-foreground"
          >
            {t('report.noteLabel')}
          </label>
          <textarea
            id="report-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            placeholder={t('report.notePlaceholder')}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {!isAuthenticated && (
          <div>
            <label
              htmlFor="report-email"
              className="block text-sm font-medium text-foreground"
            >
              {t('report.emailLabel')}
            </label>
            <Input
              id="report-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('report.emailPlaceholder')}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('report.emailHint')}
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {t('report.submit')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
            disabled={submitting}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
