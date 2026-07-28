import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Trash2, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/hooks/use-async';
import {
  approveArticle,
  deleteArticle,
  fetchAllArticlesForAdmin,
  sendBackArticle,
  updateArticle,
} from '@/lib/data/articles';
import { fetchCategories, categoryName } from '@/lib/data/categories';
import { fetchProfiles } from '@/lib/data/users';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { formatDate } from '@/lib/formatting';
import type {
  ArticleStatus,
  LanguageCode,
  Profile,
} from '@/types/database';
import { cn } from '@/lib/utils';

/** Review and manage articles. */
export default function AdminArticlesPage() {
  const { t, i18n } = useTranslation();
  const uiLanguage = (i18n.resolvedLanguage ?? 'en') as LanguageCode;
  const [reloadKey, setReloadKey] = React.useState(0);
  const [statusFilter, setStatusFilter] = React.useState<'all' | ArticleStatus>('all');

  const articlesState = useAsync(() => fetchAllArticlesForAdmin(), [reloadKey]);
  const categoriesState = useAsync(() => fetchCategories(), []);
  const profilesState = useAsync(() => fetchProfiles(), []);

  const catMap = new Map(
    (categoriesState.data ?? []).map((c) => [c.id, c]),
  );
  const profileMap = new Map<string, Profile>(
    (profilesState.data ?? []).map((p) => [p.id, p]),
  );

  const rows = (articlesState.data ?? []).filter((a) =>
    statusFilter === 'all' ? true : a.status === statusFilter,
  );

  function reload() {
    setReloadKey((k) => k + 1);
  }

  async function onSetStatus(id: string, status: ArticleStatus) {
    await updateArticle(id, { status });
    reload();
  }

  async function onDelete(id: string) {
    if (!window.confirm(t('admin.confirmDeleteArticle'))) return;
    await deleteArticle(id);
    reload();
  }

  return (
    <div className="container max-w-5xl py-10 animate-fade-in">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('admin.backToOverview')}
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-h1">{t('admin.articlesTitle')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('admin.articlesDescription')}
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-md border border-border p-1 text-xs">
          {(['all', 'in_review', 'draft', 'published', 'archived'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={cn(
                'rounded px-2.5 py-1 font-medium transition-colors',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`admin.filter.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-8">
        {articlesState.status === 'loading' && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {articlesState.status === 'success' && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('admin.noArticlesForFilter')}
          </p>
        )}

        {rows.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {rows.map((a) => {
              const cat = a.category_id ? catMap.get(a.category_id) : null;
              const author = a.author_id ? profileMap.get(a.author_id) : null;
              const langMeta = SUPPORTED_LANGUAGES.find(
                (l) => l.code === a.language,
              );
              return (
                <ArticleRow
                  key={a.id}
                  article={a}
                  categoryLabel={cat ? categoryName(cat, uiLanguage) : null}
                  authorLabel={author?.full_name || t('article.unknownAuthor')}
                  langLabel={langMeta?.nativeLabel ?? a.language}
                  uiLanguage={uiLanguage}
                  onDelete={() => onDelete(a.id)}
                  onSetStatus={(s) => onSetStatus(a.id, s)}
                  onReloaded={reload}
                />
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ArticleRow({
  article: a,
  categoryLabel,
  authorLabel,
  langLabel,
  uiLanguage,
  onDelete,
  onSetStatus,
  onReloaded,
}: {
  article: {
    id: string;
    slug: string;
    title: string;
    status: ArticleStatus;
    updated_at: string;
  };
  categoryLabel: string | null;
  authorLabel: string;
  langLabel: string;
  uiLanguage: LanguageCode;
  onDelete: () => void;
  onSetStatus: (s: ArticleStatus) => void;
  onReloaded: () => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = React.useState<'approve' | 'sendback' | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showSendBack, setShowSendBack] = React.useState(false);
  const [note, setNote] = React.useState('');

  async function doApprove() {
    setError(null);
    setBusy('approve');
    try {
      await approveArticle(a.id);
      onReloaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setBusy(null);
    }
  }

  async function doSendBack(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy('sendback');
    try {
      await sendBackArticle(a.id, note);
      setNote('');
      setShowSendBack(false);
      onReloaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('data.errorTitle'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <StatusBadge status={a.status} />
            <span aria-hidden="true">·</span>
            <span>{langLabel}</span>
            {categoryLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span>{categoryLabel}</span>
              </>
            )}
          </div>
          <Link
            to={`/dashboard/articles/${a.id}`}
            className="mt-1 block truncate font-serif text-lg text-foreground hover:text-primary"
          >
            {a.title || '—'}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {authorLabel} · {formatDate(a.updated_at, uiLanguage)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {a.status === 'in_review' && (
            <>
              <Button size="sm" onClick={doApprove} disabled={busy !== null}>
                {busy === 'approve' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="h-4 w-4" aria-hidden="true" />
                )}
                {t('admin.approve')}
              </Button>
              {!showSendBack && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSendBack(true)}
                  disabled={busy !== null}
                >
                  <Undo2 className="h-4 w-4" aria-hidden="true" />
                  {t('admin.sendBack')}
                </Button>
              )}
            </>
          )}
          <select
            value={a.status}
            onChange={(e) => onSetStatus(e.target.value as ArticleStatus)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            aria-label={t('admin.role')}
          >
            <option value="draft">{t('editor.status.draft')}</option>
            <option value="in_review">{t('editor.status.in_review')}</option>
            <option value="published">{t('editor.status.published')}</option>
            <option value="archived">{t('editor.status.archived')}</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {showSendBack && (
        <form onSubmit={doSendBack} className="mt-3 space-y-2">
          <label
            htmlFor={`sendback-${a.id}`}
            className="block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {t('admin.sendBackNoteLabel')}
          </label>
          <textarea
            id={`sendback-${a.id}`}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('admin.sendBackNotePlaceholder')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy !== null || note.trim().length < 5}>
              {busy === 'sendback' && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {t('admin.confirmSendBack')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowSendBack(false);
                setNote('');
              }}
              disabled={busy !== null}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider',
        status === 'published' && 'bg-primary/15 text-primary',
        status === 'draft' && 'bg-muted text-muted-foreground',
        status === 'in_review' &&
          'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        status === 'archived' && 'bg-muted text-muted-foreground line-through',
      )}
    >
      {t(`editor.status.${status}`)}
    </span>
  );
}
