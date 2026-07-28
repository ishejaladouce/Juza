import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flag,
  FolderTree,
  Mail,
  Newspaper,
  Activity,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { useAsync } from '@/hooks/use-async';
import { countArticlesByStatus } from '@/lib/data/articles';
import { countPendingContributorRequests } from '@/lib/data/contributor-requests';
import { countOpenArticleReports } from '@/lib/data/reports';
import { cn } from '@/lib/utils';

/** Admin home with quick links. */
export default function AdminIndexPage() {
  const { t } = useTranslation();
  const pendingRequests = useAsync(() => countPendingContributorRequests(), []);
  const openReports = useAsync(() => countOpenArticleReports(), []);
  const inReview = useAsync(() => countArticlesByStatus('in_review'), []);

  const pending = pendingRequests.data ?? 0;
  const reports = openReports.data ?? 0;
  const reviewCount = inReview.data ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={t('admin.eyebrow')}
        title={t('admin.title')}
        description={t('admin.description')}
      />
      <section className="container grid gap-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
        <AdminCard
          to="/admin/categories"
          icon={<FolderTree className="h-5 w-5" aria-hidden="true" />}
          title={t('admin.categoriesTitle')}
          description={t('admin.categoriesDescription')}
        />
        <AdminCard
          to="/admin/articles"
          icon={<Newspaper className="h-5 w-5" aria-hidden="true" />}
          title={t('admin.articlesTitle')}
          description={t('admin.articlesDescription')}
          badge={reviewCount > 0 ? reviewCount : undefined}
          highlight={reviewCount > 0}
        />
        <AdminCard
          to="/admin/users"
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          title={t('admin.usersTitle')}
          description={t('admin.usersDescription')}
        />
        <AdminCard
          to="/admin/requests"
          icon={<UserRoundCheck className="h-5 w-5" aria-hidden="true" />}
          title={t('admin.requestsTitle')}
          description={t('admin.requestsDescription')}
          badge={pending > 0 ? pending : undefined}
          highlight={pending > 0}
        />
        <AdminCard
          to="/admin/reports"
          icon={<Flag className="h-5 w-5" aria-hidden="true" />}
          title={t('admin.reportsTitle')}
          description={t('admin.reportsDescription')}
          badge={reports > 0 ? reports : undefined}
          highlight={reports > 0}
        />
        <AdminCard
          to="/admin/messages"
          icon={<Mail className="h-5 w-5" aria-hidden="true" />}
          title={t('admin.messagesTitle')}
          description={t('admin.messagesDescription')}
        />
        <AdminCard
          to="/admin/activity"
          icon={<Activity className="h-5 w-5" aria-hidden="true" />}
          title={t('admin.activityTitle')}
          description={t('admin.activityDescription')}
        />
      </section>
    </>
  );
}

function AdminCard({
  to,
  icon,
  title,
  description,
  badge,
  highlight,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: number;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex h-full flex-col justify-between rounded-lg border bg-card p-5 shadow-soft transition-colors',
        'hover:border-primary/50 hover:shadow-card',
        highlight ? 'border-primary/50' : 'border-border',
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 text-primary">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-h3 font-serif text-foreground">{title}</h2>
          </div>
          {typeof badge === 'number' && (
            <span
              aria-label={`${badge} pending`}
              className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground"
            >
              {badge}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        {title}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
