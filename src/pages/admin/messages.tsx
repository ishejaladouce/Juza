import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import {
  listContactMessages,
  replyToContactMessage,
  setContactMessageStatus,
  type ContactMessage,
} from '@/lib/data/contact';

/** Reply to contact messages. */
export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [filter, setFilter] = React.useState<'open' | 'closed' | 'all'>('open');
  const [tick, setTick] = React.useState(0);
  const state = useAsync(() => listContactMessages(filter), [filter, tick]);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function sendReply(row: ContactMessage) {
    if (!profile) return;
    const reply = (drafts[row.id] ?? '').trim();
    if (reply.length < 2) {
      setErrors((e) => ({
        ...e,
        [row.id]: t('admin.messagesReplyTooShort'),
      }));
      return;
    }
    setBusyId(row.id);
    setErrors((e) => {
      const next = { ...e };
      delete next[row.id];
      return next;
    });
    try {
      await replyToContactMessage(row.id, reply, profile.id);
      setDrafts((d) => {
        const next = { ...d };
        delete next[row.id];
        return next;
      });
      setTick((n) => n + 1);
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [row.id]:
          err instanceof Error ? err.message : t('admin.messagesReplyFailed'),
      }));
    } finally {
      setBusyId(null);
    }
  }

  async function archiveWithoutReply(id: string) {
    setBusyId(id);
    try {
      await setContactMessageStatus(id, 'closed');
      setTick((n) => n + 1);
    } finally {
      setBusyId(null);
    }
  }

  async function reopen(id: string) {
    setBusyId(id);
    try {
      await setContactMessageStatus(id, 'open');
      setTick((n) => n + 1);
    } finally {
      setBusyId(null);
    }
  }

  const rows = state.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow={t('admin.eyebrow')}
        title={t('admin.messagesTitle')}
        description={t('admin.messagesDescription')}
      />

      <section className="container max-w-3xl pb-16">
        <div className="mb-6 flex flex-wrap gap-2">
          {(['open', 'closed', 'all'] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? 'default' : 'outline'}
              onClick={() => setFilter(value)}
            >
              {t(`admin.messagesFilter.${value}`)}
            </Button>
          ))}
        </div>

        {state.status === 'loading' && (
          <p className="text-sm text-muted-foreground">{t('data.loading')}</p>
        )}

        {state.status === 'error' && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        {state.status === 'success' && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('admin.messagesEmpty')}</p>
        )}

        <ul className="space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-foreground/8 bg-background/80 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{row.name}</p>
                  <a
                    href={`mailto:${row.email}?subject=${encodeURIComponent(
                      row.subject
                        ? `Re: ${row.subject}`
                        : t('admin.messagesEmailSubject'),
                    )}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {row.email}
                  </a>
                  {row.user_id ? (
                    <p className="mt-1 text-xs text-primary/80">
                      {t('admin.messagesLinkedAccount')}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('admin.messagesGuestHint')}
                    </p>
                  )}
                  {row.subject && (
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {row.subject}
                    </p>
                  )}
                </div>
                <time
                  dateTime={row.created_at}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(row.created_at).toLocaleString()}
                </time>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {row.message}
              </p>

              {row.admin_reply && (
                <div className="mt-4 border-l-2 border-primary/40 pl-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {t('admin.messagesYourReply')}
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
              )}

              {row.status === 'open' && !row.admin_reply && (
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    {t('admin.messagesReplyLabel')}
                    <textarea
                      rows={3}
                      value={drafts[row.id] ?? ''}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [row.id]: e.target.value }))
                      }
                      placeholder={t('admin.messagesReplyPlaceholder')}
                      className="mt-1.5 flex min-h-[5rem] w-full rounded-md border border-foreground/12 bg-muted/30 px-3.5 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </label>
                  {errors[row.id] && (
                    <p role="alert" className="text-sm text-destructive">
                      {errors[row.id]}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => void sendReply(row)}
                    >
                      {row.user_id
                        ? t('admin.messagesSendReplyNotify')
                        : t('admin.messagesSendReply')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => void archiveWithoutReply(row.id)}
                    >
                      {t('admin.messagesArchive')}
                    </Button>
                  </div>
                </div>
              )}

              {row.status === 'closed' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  disabled={busyId === row.id}
                  onClick={() => void reopen(row.id)}
                >
                  {t('admin.messagesReopen')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
