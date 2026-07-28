import * as React from 'react';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { addReportReply } from '@/lib/data/reports';
import { formatDate } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import type {
  ArticleReportReply,
  LanguageCode,
  ReportReplyAuthorKind,
} from '@/types/database';

/** Reply thread for one report. */
export function ReportThread({
  reportId,
  articleId,
  replies,
  authorId,
  authorKind,
  language,
  onReplied,
  compact,
}: {
  reportId: string;
  articleId: string;
  replies: ArticleReportReply[];
  authorId: string;
  authorKind: ReportReplyAuthorKind;
  language: LanguageCode;
  onReplied: () => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const [body, setBody] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setBusy(true);
    try {
      await addReportReply({
        reportId,
        articleId,
        authorId,
        authorKind,
        body,
      });
      setBody('');
      onReplied();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn(compact ? 'mt-3' : 'mt-4')}>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
        {t('report.threadTitle')}
      </p>

      {replies.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('report.threadEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {replies.map((reply) => (
            <li
              key={reply.id}
              className={cn(
                'rounded-lg px-3 py-2 text-sm',
                reply.author_kind === 'admin'
                  ? 'bg-primary/8 text-foreground'
                  : 'bg-muted/60 text-foreground',
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {reply.author_kind === 'admin'
                    ? t('report.threadAdmin')
                    : t('report.threadReporter')}
                </span>
                <time
                  dateTime={reply.created_at}
                  className="text-[0.7rem] text-muted-foreground"
                >
                  {formatDate(reply.created_at, language)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                {reply.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="mt-3 space-y-2">
        <label htmlFor={`reply-${reportId}`} className="sr-only">
          {t('report.replyLabel')}
        </label>
        <textarea
          id={`reply-${reportId}`}
          rows={compact ? 2 : 3}
          value={body}
          maxLength={2000}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            authorKind === 'admin'
              ? t('report.replyAdminPlaceholder')
              : t('report.replyReporterPlaceholder')
          }
          className="w-full rounded-md border border-foreground/12 bg-muted/30 px-3 py-2 text-sm transition-colors focus-visible:border-primary/40 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="sm" disabled={busy || !body.trim()}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
          {t('report.replySubmit')}
        </Button>
      </form>
    </div>
  );
}
