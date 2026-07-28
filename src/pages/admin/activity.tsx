import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Flag,
  Mail,
  Newspaper,
  UserRoundCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useAsync } from '@/hooks/use-async';
import { fetchAllArticlesForAdmin } from '@/lib/data/articles';
import { listContactMessages } from '@/lib/data/contact';
import { listContributorRequests } from '@/lib/data/contributor-requests';
import { listArticleReports } from '@/lib/data/reports';

type ActivityItem = {
  id: string;
  kind: 'article' | 'report' | 'request' | 'message';
  title: string;
  when: string;
  href: string;
};

/** Recent admin activity overview. */
export default function AdminActivityPage() {
  const { t } = useTranslation();
  const state = useAsync(async () => {
    const [articles, reports, requests, messages] = await Promise.all([
      fetchAllArticlesForAdmin().catch(() => []),
      listArticleReports('open').catch(() => []),
      listContributorRequests('pending').catch(() => []),
      listContactMessages('open').catch(() => []),
    ]);

    const inReview = articles.filter((a) => a.status === 'in_review');

    const items: ActivityItem[] = [
      ...inReview.slice(0, 8).map((a) => ({
        id: `a-${a.id}`,
        kind: 'article' as const,
        title: a.title,
        when: a.updated_at,
        href: '/admin/articles',
      })),
      ...reports.slice(0, 8).map((r) => ({
        id: `r-${r.id}`,
        kind: 'report' as const,
        title: r.article?.title ?? t('admin.unknownArticle'),
        when: r.created_at,
        href: '/admin/reports',
      })),
      ...requests.slice(0, 8).map((r) => ({
        id: `q-${r.id}`,
        kind: 'request' as const,
        title: r.applicant?.full_name ?? t('admin.unknownApplicant'),
        when: r.created_at,
        href: '/admin/requests',
      })),
      ...messages.slice(0, 8).map((m) => ({
        id: `m-${m.id}`,
        kind: 'message' as const,
        title: m.subject || m.name,
        when: m.created_at,
        href: '/admin/messages',
      })),
    ];

    items.sort((a, b) => b.when.localeCompare(a.when));
    return items.slice(0, 30);
  }, []);

  const items = state.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow={t('admin.eyebrow')}
        title={t('admin.activityTitle')}
        description={t('admin.activityDescription')}
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('admin.backToOverview')}
          </Link>
        </Button>
      </PageHeader>

      <section className="container max-w-3xl pb-16">
        {state.status === 'loading' && (
          <p className="text-sm text-muted-foreground">{t('data.loading')}</p>
        )}
        {state.status === 'error' && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state.status === 'success' && items.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('admin.activityEmpty')}</p>
        )}

        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <span className="mt-0.5 text-primary">
                  {item.kind === 'article' && (
                    <Newspaper className="h-4 w-4" aria-hidden="true" />
                  )}
                  {item.kind === 'report' && (
                    <Flag className="h-4 w-4" aria-hidden="true" />
                  )}
                  {item.kind === 'request' && (
                    <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
                  )}
                  {item.kind === 'message' && (
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t(`admin.activityKind.${item.kind}`)}
                  </span>
                  <span className="block truncate font-medium text-foreground">
                    {item.title}
                  </span>
                </span>
                <time
                  dateTime={item.when}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {new Date(item.when).toLocaleString()}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
