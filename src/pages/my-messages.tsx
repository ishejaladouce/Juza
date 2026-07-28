import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { useAsync } from '@/hooks/use-async';
import { listMyContactMessages } from '@/lib/data/contact';

/** Contact replies for the signed-in user. */
export default function MyMessagesPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const state = useAsync(async () => {
    if (!profile) return [];
    return listMyContactMessages(profile.id);
  }, [profile?.id]);

  const rows = state.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow={t('dashboard.messagesEyebrow')}
        title={t('dashboard.messagesTitle')}
        description={t('dashboard.messagesDescription')}
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
            icon={<Mail className="h-5 w-5" aria-hidden="true" />}
            title={t('dashboard.messagesEmptyTitle')}
            description={t('dashboard.messagesEmptyDescription')}
            action={
              <Button asChild>
                <Link to="/contact">{t('dashboard.messagesContactCta')}</Link>
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
                  {row.subject ? (
                    <p className="font-medium text-foreground">{row.subject}</p>
                  ) : (
                    <p className="font-medium text-foreground">
                      {t('dashboard.messagesNoSubject')}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.admin_reply
                      ? t('dashboard.messagesStatusReplied')
                      : row.status === 'closed'
                        ? t('dashboard.messagesStatusClosed')
                        : t('dashboard.messagesStatusOpen')}
                  </p>
                </div>
                <time
                  dateTime={row.created_at}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(row.created_at).toLocaleString()}
                </time>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {row.message}
              </p>

              {row.admin_reply ? (
                <div className="mt-4 border-l-2 border-primary/40 bg-primary/[0.04] py-2 pl-3 pr-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {t('dashboard.messagesAdminReply')}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                    {row.admin_reply}
                  </p>
                  {row.replied_at && (
                    <time
                      dateTime={row.replied_at}
                      className="mt-1 block text-xs text-muted-foreground"
                    >
                      {new Date(row.replied_at).toLocaleString()}
                    </time>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t('dashboard.messagesWaiting')}
                </p>
              )}
            </li>
          ))}
        </ul>

        {rows.length > 0 && (
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/contact">{t('dashboard.messagesContactCta')}</Link>
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
