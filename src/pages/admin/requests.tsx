import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Loader2,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import {
  approveContributorRequest,
  listContributorRequests,
  rejectContributorRequest,
} from '@/lib/data/contributor-requests';
import { formatDate } from '@/lib/formatting';
import type {
  ContributorRequestStatus,
  ContributorRequestWithProfile,
  LanguageCode,
} from '@/types/database';

type Tab = ContributorRequestStatus;

const TABS: Tab[] = ['pending', 'approved', 'rejected'];

/** Review contributor applications. */
export default function AdminRequestsPage() {
  const { t, i18n } = useTranslation();
  const uiLanguage = (i18n.resolvedLanguage ?? 'en') as LanguageCode;
  const { profile } = useAuth();

  const [tab, setTab] = React.useState<Tab>('pending');
  const [reloadKey, setReloadKey] = React.useState(0);
  const state = useAsync(() => listContributorRequests(tab), [tab, reloadKey]);

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

      <h1 className="mt-6 font-serif text-h1">{t('admin.requestsTitle')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('admin.requestsDescription')}
      </p>

      <div
        role="tablist"
        aria-label={t('admin.requestsTitle')}
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
              {t(`admin.requestTabs.${option}`)}
            </button>
          );
        })}
      </div>

      <section className="mt-6">
        {state.status === 'loading' && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}

        {state.status === 'success' && rows.length === 0 && (
          <p className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
            {t(`admin.requestsEmpty.${tab}`)}
          </p>
        )}

        {state.status === 'success' && rows.length > 0 && (
          <ul className="space-y-3">
            {rows.map((req) => (
              <RequestRow
                key={req.id}
                request={req}
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

function RequestRow({
  request,
  uiLanguage,
  reviewerId,
  onChanged,
}: {
  request: ContributorRequestWithProfile;
  uiLanguage: LanguageCode;
  reviewerId: string | null;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const [pending, setPending] = React.useState<'approve' | 'reject' | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [rejectNote, setRejectNote] = React.useState('');

  const applicantName =
    request.applicant?.full_name ||
    request.applicant?.username ||
    t('admin.unknownApplicant');

  async function onApprove() {
    if (!reviewerId) return;
    setError(null);
    setPending('approve');
    try {
      await approveContributorRequest(request.id, reviewerId);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setPending(null);
    }
  }

  async function onReject(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewerId) return;
    setError(null);
    setPending('reject');
    try {
      await rejectContributorRequest(request.id, reviewerId, rejectNote);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setPending(null);
    }
  }

  return (
    <li className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{applicantName}</p>
          <p className="text-xs text-muted-foreground">
            {request.applicant?.username && `@${request.applicant.username} · `}
            {t('admin.requestSubmitted', {
              date: formatDate(request.created_at, uiLanguage),
            })}
          </p>
        </div>
        <StatusPill status={request.status} />
      </div>

      <blockquote className="mt-3 border-l-2 border-border pl-3 text-sm text-foreground">
        {request.reason}
      </blockquote>

      {request.status === 'rejected' && request.admin_note && (
        <div className="mt-3 rounded-md border border-border bg-muted/40 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('contribute.adminNote')}
          </p>
          <p className="mt-1 text-sm text-foreground">{request.admin_note}</p>
        </div>
      )}

      {request.status === 'pending' && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={onApprove} disabled={pending !== null}>
            {pending === 'approve' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            {t('admin.approve')}
          </Button>
          {!showRejectForm && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectForm(true)}
              disabled={pending !== null}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {t('admin.reject')}
            </Button>
          )}
        </div>
      )}

      {showRejectForm && (
        <form onSubmit={onReject} className="mt-3 space-y-2">
          <label
            htmlFor={`note-${request.id}`}
            className="block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {t('admin.rejectNoteLabel')}
          </label>
          <textarea
            id={`note-${request.id}`}
            rows={2}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder={t('admin.rejectNotePlaceholder')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={pending !== null || rejectNote.trim().length === 0}
            >
              {pending === 'reject' && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {t('admin.confirmReject')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowRejectForm(false);
                setRejectNote('');
              }}
              disabled={pending !== null}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}

function StatusPill({ status }: { status: ContributorRequestStatus }) {
  const { t } = useTranslation();
  const styles: Record<ContributorRequestStatus, string> = {
    pending:
      'border-primary/40 bg-primary/10 text-primary',
    approved:
      'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    rejected:
      'border-destructive/40 bg-destructive/10 text-destructive',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      <UserRoundCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {t(`admin.requestTabs.${status}`)}
    </span>
  );
}
