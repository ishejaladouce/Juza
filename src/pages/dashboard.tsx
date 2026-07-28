import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  Mail,
  MessageSquare,
  PenSquare,
  Plus,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ContributorRequestPanel } from '@/components/contributor-request-panel';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { useAsync } from '@/hooks/use-async';
import { fetchArticlesByAuthor, fetchMyBookmarks } from '@/lib/data/articles';
import { listMyContactMessages } from '@/lib/data/contact';
import { cn } from '@/lib/utils';

/** User dashboard home. */
export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const greetingName =
    profile?.full_name || user?.email?.split('@')[0] || t('auth.friend');
  const role = profile?.role ?? 'citizen';
  const canContribute = role === 'contributor' || role === 'admin';
  const isAdmin = role === 'admin';
  const isCitizen = role === 'citizen';

  const bookmarksState = useAsync(async () => {
    if (!profile) return [];
    return fetchMyBookmarks(profile.id);
  }, [profile?.id]);

  const myArticlesState = useAsync(async () => {
    if (!profile) return [];
    return fetchArticlesByAuthor(profile.id);
  }, [profile?.id]);

  const messagesState = useAsync(async () => {
    if (!profile) return [];
    return listMyContactMessages(profile.id);
  }, [profile?.id]);

  const bookmarkCount = bookmarksState.data?.length ?? 0;
  const articlesCount = myArticlesState.data?.length ?? 0;
  const draftsCount =
    myArticlesState.data?.filter((a) => a.status === 'draft').length ?? 0;
  const messageCount = messagesState.data?.length ?? 0;
  const repliedCount =
    messagesState.data?.filter((m) => Boolean(m.admin_reply)).length ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={t(`auth.roles.${role}`)}
        title={t('dashboard.greeting', { name: greetingName })}
        description={t('pages.dashboard.description')}
      />

      <section className="container grid gap-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          to="/dashboard/bookmarks"
          icon={<Bookmark className="h-5 w-5" aria-hidden="true" />}
          title={t('dashboard.savedTitle')}
          description={
            bookmarkCount === 0
              ? t('dashboard.savedEmpty')
              : t('dashboard.savedCount', { count: bookmarkCount })
          }
          cta={t('dashboard.viewSaved')}
        />

        <DashboardCard
          to="/dashboard/messages"
          icon={<Mail className="h-5 w-5" aria-hidden="true" />}
          title={t('dashboard.messagesTitle')}
          description={
            messageCount === 0
              ? t('dashboard.messagesCardEmpty')
              : t('dashboard.messagesCardCount', {
                  total: messageCount,
                  replied: repliedCount,
                })
          }
          cta={t('dashboard.viewMessages')}
          highlight={repliedCount > 0}
        />

        <DashboardCard
          to="/dashboard/feedback"
          icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
          title={t('dashboard.feedbackCardTitle')}
          description={t('dashboard.feedbackCardHint')}
          cta={t('dashboard.viewFeedback')}
        />

        <DashboardCard
          to="/dashboard/settings"
          icon={<Settings className="h-5 w-5" aria-hidden="true" />}
          title={t('settings.title')}
          description={t('settings.description')}
          cta={t('settings.save')}
        />

        {canContribute && (
          <DashboardCard
            to="/dashboard/articles"
            icon={<PenSquare className="h-5 w-5" aria-hidden="true" />}
            title={t('dashboard.draftsTitle')}
            description={
              articlesCount === 0
                ? t('dashboard.draftsEmpty')
                : t('dashboard.articlesCount', {
                    total: articlesCount,
                    drafts: draftsCount,
                  })
            }
            cta={t('dashboard.manageArticles')}
            highlight={draftsCount > 0}
          />
        )}

        {canContribute && (
          <DashboardCard
            to="/dashboard/articles/new"
            icon={<Plus className="h-5 w-5" aria-hidden="true" />}
            title={t('dashboard.newTitle')}
            description={t('dashboard.newDescription')}
            cta={t('myArticles.newArticle')}
          />
        )}

        {isAdmin && (
          <DashboardCard
            to="/admin"
            icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            title={t('dashboard.adminTitle')}
            description={t('dashboard.adminHint')}
            cta={t('dashboard.openAdmin')}
            highlight
          />
        )}
      </section>

      {isCitizen && (
        <section className="container pb-16">
          <ContributorRequestPanel />
        </section>
      )}
    </>
  );
}

function DashboardCard({
  to,
  icon,
  title,
  description,
  cta,
  highlight,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex h-full flex-col justify-between border-t border-foreground/15 pt-5 transition-colors',
        highlight && 'border-accent/40',
      )}
    >
      <div>
        <div className="flex items-center gap-2.5 text-accent">
          {icon}
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-accent">
        {cta}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
