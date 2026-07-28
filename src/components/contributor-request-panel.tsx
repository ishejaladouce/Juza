import * as React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RoleNotice } from '@/components/role-notice';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import {
  createContributorRequest,
  fetchMyContributorRequest,
} from '@/lib/data/contributor-requests';
import { formatDate } from '@/lib/formatting';
import type { LanguageCode } from '@/types/database';

const MIN_REASON_LEN = 20;
const MAX_REASON_LEN = 600;

/** Apply or view contributor request status. */
export function ContributorRequestPanel() {
  const { t, i18n } = useTranslation();
  const uiLanguage = (i18n.resolvedLanguage ?? 'en') as LanguageCode;
  const { profile } = useAuth();

  const [reloadKey, setReloadKey] = React.useState(0);
  const state = useAsync(async () => {
    if (!profile) return null;
    return fetchMyContributorRequest(profile.id);
  }, [profile?.id, reloadKey]);

  const [reason, setReason] = React.useState('');
  const [reapply, setReapply] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const request = state.data ?? null;
  const showForm =
    !request || request.status === 'rejected' && reapply;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LEN) {
      setError(t('contribute.errors.tooShort', { min: MIN_REASON_LEN }));
      return;
    }
    setSubmitting(true);
    try {
      await createContributorRequest(profile.id, trimmed);
      setReason('');
      setReapply(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
      <div className="max-w-2xl">
        <h2 className="flex items-center gap-2 font-serif text-h3 text-foreground">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          {t('contribute.title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('contribute.description')}
        </p>
      </div>

      {state.status === 'loading' && (
        <p className="mt-6 text-sm text-muted-foreground">
          {t('contribute.checking')}
        </p>
      )}

      {state.status === 'success' && request?.status === 'pending' && (
        <PendingCard
          submittedAt={formatDate(request.created_at, uiLanguage)}
          reason={request.reason}
        />
      )}

      {state.status === 'success' &&
        request?.status === 'rejected' &&
        !reapply && (
          <RejectedCard
            decidedAt={formatDate(
              request.reviewed_at ?? request.updated_at,
              uiLanguage,
            )}
            note={request.admin_note}
            onReapply={() => {
              setReapply(true);
              setReason(request.reason);
            }}
          />
        )}

      {state.status === 'success' && showForm && (
        <form onSubmit={onSubmit} className="mt-6 space-y-3" noValidate>
          <label
            htmlFor="contribute-reason"
            className="block text-sm font-medium text-foreground"
          >
            {t('contribute.reasonLabel')}
          </label>
          <textarea
            id="contribute-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LEN))}
            rows={4}
            maxLength={MAX_REASON_LEN}
            placeholder={t('contribute.reasonPlaceholder')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('contribute.reasonHint', { min: MIN_REASON_LEN })}</span>
            <span aria-live="polite">
              {reason.length}/{MAX_REASON_LEN}
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="submit"
              disabled={submitting || reason.trim().length < MIN_REASON_LEN}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {t('contribute.submit')}
            </Button>
            {reapply && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setReapply(false);
                  setReason('');
                  setError(null);
                }}
              >
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="mt-6">
        <RoleNotice variant="citizen" />
      </div>
    </div>
  );
}

function PendingCard({
  submittedAt,
  reason,
}: {
  submittedAt: string;
  reason: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-6 space-y-3 rounded-md border border-primary/30 bg-primary/5 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
        {t('contribute.pendingTitle')}
      </p>
      <p className="text-sm text-muted-foreground">
        {t('contribute.pendingBody', { date: submittedAt })}
      </p>
      <blockquote className="border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
        {reason}
      </blockquote>
    </div>
  );
}

function RejectedCard({
  decidedAt,
  note,
  onReapply,
}: {
  decidedAt: string;
  note: string | null;
  onReapply: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-6 space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
        {t('contribute.rejectedTitle')}
      </p>
      <p className="text-sm text-muted-foreground">
        {t('contribute.rejectedBody', { date: decidedAt })}
      </p>
      {note && (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('contribute.adminNote')}
          </p>
          <p className="mt-1 text-sm text-foreground">{note}</p>
        </div>
      )}
      <div>
        <Button size="sm" variant="outline" onClick={onReapply}>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {t('contribute.reapply')}
        </Button>
      </div>
    </div>
  );
}
