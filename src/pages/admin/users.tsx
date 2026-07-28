import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAsync } from '@/hooks/use-async';
import {
  fetchProfiles,
  setAccountStatus,
  setUserRole,
} from '@/lib/data/users';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/formatting';
import type { AccountStatus, LanguageCode, UserRole } from '@/types/database';

/** Manage roles and account status. */
export default function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const uiLanguage = (i18n.resolvedLanguage ?? 'en') as LanguageCode;
  const { profile } = useAuth();
  const [reloadKey, setReloadKey] = React.useState(0);
  const state = useAsync(() => fetchProfiles(), [reloadKey]);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onChangeRole(id: string, role: UserRole) {
    setBusyId(id);
    setError(null);
    try {
      await setUserRole(id, role);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setBusyId(null);
    }
  }

  async function onStatus(id: string, status: AccountStatus) {
    setBusyId(id);
    setError(null);
    try {
      await setAccountStatus(id, status);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setBusyId(null);
    }
  }

  const rows = (state.data ?? []).filter(
    (p) => (p.account_status ?? 'active') !== 'removed',
  );

  return (
    <div className="container max-w-4xl py-10 animate-fade-in">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('admin.backToOverview')}
      </Link>

      <h1 className="mt-6 font-serif text-h1">{t('admin.usersTitle')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('admin.usersDescription')}
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="mt-8">
        {state.status === 'loading' && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {state.status === 'success' && rows.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {rows.map((p) => {
              const isSelf = profile?.id === p.id;
              const status = p.account_status ?? 'active';
              const suspended = status === 'suspended';
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {p.full_name || p.username || '—'}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({t('admin.you')})
                        </span>
                      )}
                      {suspended && (
                        <span className="ml-2 text-xs font-medium text-destructive">
                          {t('admin.accountSuspended')}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.username && `@${p.username} · `}
                      {t('admin.joined', {
                        date: formatDate(p.created_at, uiLanguage),
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor={`role-${p.id}`}
                      className="text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      {t('admin.role')}
                    </label>
                    <select
                      id={`role-${p.id}`}
                      value={p.role}
                      disabled={isSelf || busyId === p.id || suspended}
                      onChange={(e) =>
                        void onChangeRole(p.id, e.target.value as UserRole)
                      }
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                    >
                      <option value="citizen">
                        {t('auth.roles.citizen')}
                      </option>
                      <option value="contributor">
                        {t('auth.roles.contributor')}
                      </option>
                      <option value="admin">{t('auth.roles.admin')}</option>
                    </select>

                    {!isSelf && (
                      <>
                        {suspended ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busyId === p.id}
                            onClick={() => void onStatus(p.id, 'active')}
                          >
                            {t('admin.restoreAccount')}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busyId === p.id}
                            onClick={() => void onStatus(p.id, 'suspended')}
                          >
                            {t('admin.suspendAccount')}
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          disabled={busyId === p.id}
                          onClick={() => {
                            if (
                              window.confirm(t('admin.confirmRemoveAccount'))
                            ) {
                              void onStatus(p.id, 'removed');
                            }
                          }}
                        >
                          {t('admin.removeAccount')}
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
