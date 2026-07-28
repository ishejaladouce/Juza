import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { useAsync } from '@/hooks/use-async';
import { listMyArticleReports } from '@/lib/data/reports';

/** User’s reports and questions status. */
export default function MyFeedbackPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const state = useAsync(async () => {
    if (!profile) return [];
    return listMyArticleReports(profile.id);
  }, [profile?.id]);

  const rows = state.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow={t('feedback.eyebrow')}
        title={t('feedback.title')}
        description={t('feedback.description')}
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('nav.dashboard')}
          </Link>
        </Button>
      </PageHeader>

      <section className="container max-w-2xl pb-16">
        {state.status === 'loading' && (
          <p className="text-sm text-muted-foreground">{t('data.loading')}</p>
        )}
        {state.status === 'error' && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state.status === 'success' && rows.length === 0 && (
          <EmptyState
            icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
            title={t('feedback.emptyTitle')}
            description={t('feedback.emptyDescription')}
            action={
              <Button asChild>
                <Link to="/browse">{t('nav.browse')}</Link>
              </Button>
            }
          />
        )}

        <ul className="space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-foreground/8 bg-background/80 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    {row.article?.title ?? t('feedback.unknownArticle')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.reason === 'question'
                      ? t('feedback.kindQuestion')
                      : t('feedback.kindFlag')}
                    {' · '}
                    {t(`feedback.status.${row.status}`)}
                  </p>
                </div>
                <time
                  dateTime={row.created_at}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(row.created_at).toLocaleString()}
                </time>
              </div>
              {row.note && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {row.note}
                </p>
              )}
              {row.replies && row.replies.length > 0 ? (
                <div className="mt-4 space-y-2 border-l-2 border-primary/40 pl-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {t('feedback.replies')}
                  </p>
                  {row.replies.map((reply) => (
                    <p
                      key={reply.id}
                      className="whitespace-pre-wrap text-sm text-foreground"
                    >
                      {reply.body}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t('feedback.waiting')}
                </p>
              )}
              {row.article?.slug && (
                <Button asChild variant="link" className="mt-2 h-auto p-0">
                  <Link to={`/article/${row.article.slug}`}>
                    {t('feedback.viewArticle')}
                  </Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
