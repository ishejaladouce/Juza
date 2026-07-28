import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  FileText,
  Loader2,
  Save,
  Send,
  Trash2,
  UserRoundCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/form-field';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import {
  createArticle,
  deleteArticle,
  fetchArticleForEditing,
  submitArticleForReview,
  updateArticle,
} from '@/lib/data/articles';
import { fetchCategories, categoryName } from '@/lib/data/categories';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { formatDate, readingTimeMinutes } from '@/lib/formatting';
import type {
  ArticleStatus,
  Category,
  LanguageCode,
} from '@/types/database';
import { cn } from '@/lib/utils';

/** Make a URL slug from a title. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

interface Draft {
  language: LanguageCode;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category_id: string | null;
  status: ArticleStatus;
  translation_group_id: string | null;
  review_note: string | null;
}

const EMPTY_DRAFT: Draft = {
  language: 'en',
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  category_id: null,
  status: 'draft',
  translation_group_id: null,
  review_note: null,
};

/** Create or edit an article draft. */
export default function EditorPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [draft, setDraft] = React.useState<Draft>({
    ...EMPTY_DRAFT,
    language: (i18n.resolvedLanguage ?? 'en') as LanguageCode,
  });
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [saving, setSaving] = React.useState<null | 'draft' | 'submit' | 'publish'>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<'write' | 'preview'>('write');

  const isAdmin = profile?.role === 'admin';

  const categoriesState = useAsync(() => fetchCategories(), []);
  const categories = categoriesState.data ?? [];

  const existingState = useAsync(async () => {
    if (!isEdit || !id) return null;
    return fetchArticleForEditing(id);
  }, [id, isEdit]);

  React.useEffect(() => {
    if (existingState.status === 'success' && existingState.data) {
      const a = existingState.data;
      setDraft({
        language: a.language,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt ?? '',
        body: a.body,
        category_id: a.category_id,
        status: a.status,
        translation_group_id: a.translation_group_id,
        review_note: a.review_note,
      });
      setSlugTouched(true);
    }
  }, [existingState.status, existingState.data]);

  React.useEffect(() => {
    if (slugTouched) return;
    setDraft((d) => ({ ...d, slug: slugify(d.title) }));
  }, [draft.title, slugTouched]);

  function validate(intent: 'draft' | 'submit' | 'publish'): string | null {
    if (!draft.title.trim()) return t('editor.errors.missingTitle');
    if (!draft.slug.trim()) return t('editor.errors.missingSlug');
    if (intent !== 'draft' && !draft.body.trim())
      return t('editor.errors.missingBody');
    if (intent !== 'draft' && !draft.category_id)
      return t('editor.errors.missingCategory');
    return null;
  }

  async function onSave(nextStatus: ArticleStatus) {
    setError(null);
    const intent = nextStatus === 'published' ? 'publish' : 'draft';
    const err = validate(intent);
    if (err) {
      setError(err);
      return;
    }

    setSaving(intent);
    try {
      if (isEdit && id) {
        const updated = await updateArticle(id, {
          language: draft.language,
          slug: draft.slug,
          title: draft.title,
          excerpt: draft.excerpt || null,
          body: draft.body,
          category_id: draft.category_id,
          status: nextStatus,
        });
        setDraft((d) => ({ ...d, status: updated.status, review_note: updated.review_note }));
      } else {
        const created = await createArticle({
          language: draft.language,
          slug: draft.slug,
          title: draft.title,
          excerpt: draft.excerpt || null,
          body: draft.body,
          category_id: draft.category_id,
          author_id: profile?.id ?? null,
          status: nextStatus,
          translation_group_id: draft.translation_group_id ?? undefined,
        });
        navigate(`/dashboard/articles/${created.id}`, { replace: true });
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('data.errorTitle'));
    } finally {
      setSaving(null);
    }
  }

  async function onSubmitForReview() {
    if (!profile) return;
    setError(null);
    const err = validate('submit');
    if (err) {
      setError(err);
      return;
    }
    setSaving('submit');
    try {
      let articleId = id;
      if (!isEdit || !articleId) {
        const created = await createArticle({
          language: draft.language,
          slug: draft.slug,
          title: draft.title,
          excerpt: draft.excerpt || null,
          body: draft.body,
          category_id: draft.category_id,
          author_id: profile.id,
          status: 'draft',
          translation_group_id: draft.translation_group_id ?? undefined,
        });
        articleId = created.id;
      } else {
        await updateArticle(articleId, {
          language: draft.language,
          slug: draft.slug,
          title: draft.title,
          excerpt: draft.excerpt || null,
          body: draft.body,
          category_id: draft.category_id,
        });
      }
      const submitted = await submitArticleForReview(articleId, profile.id);
      setDraft((d) => ({ ...d, status: submitted.status, review_note: submitted.review_note }));
      navigate(`/dashboard/articles/${articleId}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('data.errorTitle'));
    } finally {
      setSaving(null);
    }
  }

  async function onDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteArticle(id);
      navigate('/dashboard/articles', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('data.errorTitle'));
    } finally {
      setDeleting(false);
    }
  }

  if (existingState.status === 'loading' && isEdit) {
    return (
      <div className="container max-w-3xl py-10">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-6 h-10 w-3/4" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    );
  }

  if (isEdit && existingState.status === 'success' && !existingState.data) {
    return (
      <PageHeader
        eyebrow="404"
        title={t('article.notFoundTitle')}
        description={t('article.notFoundDescription')}
      >
        <Button asChild variant="outline">
          <Link to="/dashboard/articles">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('editor.backToMyArticles')}
          </Link>
        </Button>
      </PageHeader>
    );
  }

  return (
    <div className="container max-w-3xl py-8 md:py-12 animate-fade-in">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          to="/dashboard/articles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('editor.backToMyArticles')}
        </Link>

        <div className="flex items-center rounded-md border border-border p-1 text-xs">
          <ModeToggle
            active={mode === 'write'}
            onClick={() => setMode('write')}
            label={t('editor.tabWrite')}
            icon={<FileText className="h-3.5 w-3.5" aria-hidden="true" />}
          />
          <ModeToggle
            active={mode === 'preview'}
            onClick={() => setMode('preview')}
            label={t('editor.tabPreview')}
            icon={<Eye className="h-3.5 w-3.5" aria-hidden="true" />}
          />
        </div>
      </div>

      <h1 className="font-serif text-h1">
        {isEdit ? t('editor.editTitle') : t('editor.newTitle')}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('editor.helpText')}
      </p>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {draft.status === 'in_review' && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm"
        >
          <UserRoundCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">
              {t('editor.reviewSubmittedTitle')}
            </p>
            <p className="mt-1 text-muted-foreground">
              {t('editor.reviewSubmittedBody')}
            </p>
          </div>
        </div>
      )}

      {draft.status === 'draft' && draft.review_note && (
        <div
          role="status"
          className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <p className="font-medium text-destructive">
            {t('editor.sentBackTitle')}
          </p>
          <p className="mt-1 text-muted-foreground">
            {t('editor.sentBackBody')}
          </p>
          <blockquote className="mt-3 border-l-2 border-destructive/40 pl-3 text-foreground">
            {draft.review_note}
          </blockquote>
        </div>
      )}

      {mode === 'write' ? (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="lang" label={t('editor.language')}>
              <select
                value={draft.language}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    language: e.target.value as LanguageCode,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="category" label={t('editor.category')}>
              <select
                value={draft.category_id ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    category_id: e.target.value || null,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft"
              >
                <option value="">{t('editor.chooseCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {categoryName(c, draft.language)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField id="title" label={t('editor.titleLabel')}>
            <Input
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              placeholder={t('editor.titlePlaceholder')}
            />
          </FormField>

          <FormField
            id="slug"
            label={t('editor.slugLabel')}
            hint={t('editor.slugHint')}
          >
            <Input
              value={draft.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setDraft((d) => ({ ...d, slug: slugify(e.target.value) }));
              }}
              placeholder="how-to-get-a-national-id"
            />
          </FormField>

          <FormField
            id="excerpt"
            label={t('editor.excerptLabel')}
            hint={t('editor.excerptHint')}
          >
            <textarea
              value={draft.excerpt}
              onChange={(e) =>
                setDraft((d) => ({ ...d, excerpt: e.target.value }))
              }
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft"
              placeholder={t('editor.excerptPlaceholder')}
            />
          </FormField>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">{t('editor.bodyLabel')}</Label>
              <span className="text-xs text-muted-foreground">
                {t('article.readingTime', {
                  minutes: readingTimeMinutes(draft.body || ' '),
                })}
              </span>
            </div>
            <textarea
              id="body"
              value={draft.body}
              onChange={(e) =>
                setDraft((d) => ({ ...d, body: e.target.value }))
              }
              rows={14}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={t('editor.bodyPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('editor.bodyHint')}
            </p>
          </div>
        </div>
      ) : (
        <ArticlePreview draft={draft} categories={categories} />
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <div className="text-xs text-muted-foreground">
          {t(`editor.status.${draft.status}`)}
        </div>

        <div className="flex items-center gap-2">
          {isEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={deleting || saving !== null}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              )}
              {t('editor.delete')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onSave('draft')}
            disabled={saving !== null || draft.status === 'in_review'}
          >
            {saving === 'draft' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {t('editor.saveDraft')}
          </Button>

          {isAdmin ? (
            <Button
              onClick={() => onSave('published')}
              disabled={saving !== null}
            >
              {saving === 'publish' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {draft.status === 'published'
                ? t('editor.update')
                : t('editor.publish')}
            </Button>
          ) : (
            <Button
              onClick={onSubmitForReview}
              disabled={saving !== null || draft.status === 'in_review'}
            >
              {saving === 'submit' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
              )}
              {t('editor.submitForReview')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Switch between edit and preview. */
function ModeToggle({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/** Read-only preview of the draft. */
function ArticlePreview({
  draft,
  categories,
}: {
  draft: Draft;
  categories: Category[];
}) {
  const category = categories.find((c) => c.id === draft.category_id) ?? null;
  const catName = category ? categoryName(category, draft.language) : null;
  const paragraphs = draft.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article
      lang={draft.language}
      className="mt-8 rounded-lg border border-border bg-card p-6 md:p-8"
    >
      {catName && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          {catName}
        </p>
      )}
      <h2 className="font-serif text-h1">
        {draft.title || <span className="text-muted-foreground">Untitled</span>}
      </h2>
      {draft.excerpt && (
        <p className="mt-3 text-base text-muted-foreground">{draft.excerpt}</p>
      )}
      <div className="mt-4 text-xs text-muted-foreground">
        {formatDate(new Date(), draft.language)}
      </div>
      <div className="mt-6 h-px w-full bg-border" />
      <div className="mt-6 space-y-4 text-base leading-relaxed">
        {paragraphs.length === 0 && (
          <p className="text-muted-foreground">Nothing to preview yet.</p>
        )}
        {paragraphs.map((p, i) => (
          <p key={i}>
            {p.split('\n').map((line, j, arr) => (
              <React.Fragment key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        ))}
      </div>
    </article>
  );
}
