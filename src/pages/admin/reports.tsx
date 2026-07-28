import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  EyeOff,
  Flag,
  Loader2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportThread } from '@/components/report-thread';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import {
  listArticleReports,
  resolveArticleReport,
} from '@/lib/data/reports';
import { formatDate } from '@/lib/formatting';
import type {
  ArticleReportStatus,
  ArticleReportWithArticle,
  LanguageCode,
} from '@/types/database';

type Tab = ArticleReportStatus;

const TABS: Tab[] = ['open', 'resolved', 'dismissed'];

/** Review article reports. */
export default function AdminReportsPage() {
  const { t, i18n } = useTranslation();
  const uiLanguage = (i18n.resolvedLanguage ?? 'en') as LanguageCode;
  const { profile } = useAuth();

  const [tab, setTab] = React.useState<Tab>('open');
  const [reloadKey, setReloadKey] = React.useState(0);
  const state = useAsync(() => listArticleReports(tab), [tab, reloadKey]);
  const rows = state.data ?? [];

  function reload() {
    setReloadKey((k) => k + 1);
  }

  return (
    <div className="container max-w-4xl py-10 animate-fade-in">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('admin.backToOverview')}
      </Link>

      <h1 className="mt-6 font-serif text-h1">{t('admin.reportsTitle')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('admin.reportsDescription')}
      </p>

      <div
        role="tablist"
        aria-label={t('admin.reportsTitle')}
        className="mt-6 flex flex-wrap gap-2"
      >
        {TABS.map((option) => {
          const active = option === tab;
          return (
            <button
              key={option}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(option)}
              className={
                active
                  ? 'rounded-full border border-primary bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                  : 'rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }
            >
              {t(`admin.reportTabs.${option}`)}
            </button>
          );
        })}
      </div>

      <section className="mt-6">
        {state.status === 'loading' && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        )}

        {state.status === 'error' && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {state.error}
          </p>
        )}

        {state.status === 'success' && rows.length === 0 && (
          <p className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
            {t(`admin.reportsEmpty.${tab}`)}
          </p>
        )}

        {state.status === 'success' && rows.length > 0 && (
          <ul className="space-y-3">
            {rows.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                uiLanguage={uiLanguage}
                reviewerId={profile?.id ?? null}
                onChanged={reload}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReportRow({
  report,
  uiLanguage,
  reviewerId,
  onChanged,
}: {
  report: ArticleReportWithArticle;
  uiLanguage: LanguageCode;
  reviewerId: string | null;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = React.useState<'dismiss' | 'unpublish' | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function act(action: 'dismiss' | 'unpublish') {
    if (!reviewerId) return;
    setError(null);
    setBusy(action);
    try {
      await resolveArticleReport(
        report.id,
        reviewerId,
        action,
        action === 'unpublish'
          ? t('admin.unpublishDefaultReason')
          : undefined,
      );
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {report.article ? (
            <Link
              to={`/article/${report.article.slug}`}
              className="font-medium text-foreground hover:text-primary"
            >
              {report.article.title}
            </Link>
          ) : (
            <p className="font-medium text-muted-foreground">
              {t('admin.unknownArticle')}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('admin.reportFiled', {
              date: formatDate(report.created_at, uiLanguage),
            })}
            {report.reporter_email && ` · ${report.reporter_email}`}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
          <Flag className="h-3.5 w-3.5" aria-hidden="true" />
          {t(`report.reasons.${report.reason}`)}
        </span>
      </div>

      {report.note && (
        <blockquote className="mt-3 border-l-2 border-border pl-3 text-sm text-foreground">
          {report.note}
        </blockquote>
      )}

      {reviewerId && (
        <ReportThread
          reportId={report.id}
          articleId={report.article_id}
          replies={report.replies ?? []}
          authorId={reviewerId}
          authorKind="admin"
          language={uiLanguage}
          onReplied={onChanged}
        />
      )}

      {report.status === 'open' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => act('dismiss')}
            disabled={busy !== null}
          >
            {busy === 'dismiss' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <X className="h-4 w-4" aria-hidden="true" />
            )}
            {t('admin.dismissReport')}
          </Button>
          <Button
            size="sm"
            onClick={() => act('unpublish')}
            disabled={busy !== null}
          >
            {busy === 'unpublish' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            )}
            {t('admin.unpublishArticle')}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}
