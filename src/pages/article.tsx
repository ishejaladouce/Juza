import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BellRing,
  Bookmark,
  BookmarkCheck,
  Clock,
  FileText,
  Languages,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ReportArticle } from '@/components/report-article';
import { AskArticleQuestion } from '@/components/ask-article-question';
import { ArticleReportsPanel } from '@/components/article-reports-panel';
import { useAsync } from '@/hooks/use-async';
import {
  fetchArticleTranslations,
  fetchPublishedArticleBySlug,
  isBookmarked,
  toggleBookmark,
} from '@/lib/data/articles';
import { isFollowing, toggleFollow } from '@/lib/data/follows';
import { fetchCategories, categoryName } from '@/lib/data/categories';
import { fetchProfileById } from '@/lib/data/users';
import { useAuth } from '@/hooks/use-auth';
import { formatDate, readingTimeMinutes } from '@/lib/formatting';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import type {
  Article,
  Category,
  LanguageCode,
  Profile,
} from '@/types/database';

type ArticleBundle = {
  article: Article;
  category: Category | null;
  author: Pick<Profile, 'id' | 'full_name' | 'username'> | null;
  translations: Awaited<ReturnType<typeof fetchArticleTranslations>>;
};

/** Load article plus category, author, translations. */
async function loadArticleBundle(slug: string): Promise<ArticleBundle | null> {
  const article = await fetchPublishedArticleBySlug(slug);
  if (!article) return null;

  const [categories, author, translations] = await Promise.all([
    article.category_id ? fetchCategories() : Promise.resolve([]),
    article.author_id
      ? fetchProfileById(article.author_id)
      : Promise.resolve(null),
    fetchArticleTranslations(article.translation_group_id, article.id),
  ]);

  const category =
    (article.category_id
      ? categories.find((c) => c.id === article.category_id)
      : null) ?? null;

  return {
    article,
    category,
    author: author
      ? { id: author.id, full_name: author.full_name, username: author.username }
      : null,
    translations,
  };
}

/** Public article detail (read, save, follow, report). */
export default function ArticlePage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const uiLanguage = (i18n.resolvedLanguage ?? 'en') as LanguageCode;
  const { isAuthenticated, profile } = useAuth();

  const state = useAsync(async () => {
    if (!slug) return null;
    return loadArticleBundle(slug);
  }, [slug]);

  if (state.status === 'loading') return <ArticleSkeleton />;

  if (state.status === 'error') {
    return (
      <div className="container py-12">
        <EmptyState
          icon={<FileText className="h-5 w-5" aria-hidden="true" />}
          title={t('data.errorTitle')}
          description={state.error}
          action={
            <Button asChild variant="outline">
              <Link to="/browse">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('browse.backToAll')}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const bundle = state.data;
  if (!bundle) {
    return (
      <PageHeader
        eyebrow="404"
        title={t('article.notFoundTitle')}
        description={t('article.notFoundDescription')}
      >
        <Button asChild variant="outline">
          <Link to="/browse">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('browse.backToAll')}
          </Link>
        </Button>
      </PageHeader>
    );
  }

  const { article, category, author, translations } = bundle;
  const catName = category ? categoryName(category, article.language) : null;
  const readingMinutes = readingTimeMinutes(article.body);
  const authorName =
    author?.full_name || author?.username || t('article.unknownAuthor');

  return (
    <article
      lang={article.language}
      className="container max-w-2xl py-12 md:py-20 animate-fade-in"
    >
      <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={category ? `/browse/${category.slug}` : '/browse'}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {catName ? catName : t('browse.backToAll')}
        </Link>

        {isAuthenticated && profile && (
          <div className="flex flex-wrap items-center gap-2">
            <FollowButton userId={profile.id} articleId={article.id} />
            <BookmarkButton userId={profile.id} articleId={article.id} />
          </div>
        )}
      </div>

      {article.language !== uiLanguage && (
        <LanguageMismatchNotice
          articleLanguage={article.language}
          uiLanguage={uiLanguage}
          translations={translations}
        />
      )}

      {catName && (
        <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
          {catName}
        </p>
      )}

      <h1 className="font-display text-[clamp(2.4rem,5vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="mt-6 font-serif text-xl italic leading-relaxed text-muted-foreground md:text-[1.35rem]">
          {article.excerpt}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-foreground/10 py-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground/80">
          {t('article.byAuthor', { name: authorName })}
        </span>
        {article.published_at && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={article.published_at}>
              {formatDate(article.published_at, article.language)}
            </time>
          </>
        )}
        {article.updated_at &&
          article.published_at &&
          article.updated_at.slice(0, 10) !== article.published_at.slice(0, 10) && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {t('article.updated', {
                  date: formatDate(article.updated_at, article.language),
                })}
              </span>
            </>
          )}
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {t('article.readingTime', { minutes: readingMinutes })}
        </span>
      </div>

      <ArticleBody body={article.body} />

      {translations.length > 0 && (
        <aside className="mt-16 rounded-lg bg-muted/40 p-6 md:p-8">
          <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
            <Languages className="h-3.5 w-3.5" aria-hidden="true" />
            {t('article.availableInOther')}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {translations.map((tr) => {
              const langMeta = SUPPORTED_LANGUAGES.find(
                (l) => l.code === tr.language,
              );
              return (
                <li key={tr.id}>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/article/${tr.slug}`} lang={tr.language}>
                      {langMeta?.nativeLabel ?? tr.language}
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      <AskArticleQuestion articleId={article.id} />
      <ReportArticle articleId={article.id} />
      <ArticleReportsPanel articleId={article.id} language={uiLanguage} />
    </article>
  );
}

/** Follow / unfollow this article. */
function FollowButton({
  userId,
  articleId,
}: {
  userId: string;
  articleId: string;
}) {
  const { t } = useTranslation();
  const [following, setFollowing] = React.useState<boolean | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    isFollowing(userId, articleId).then((v) => {
      if (!cancelled) setFollowing(v);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, articleId]);

  async function onClick() {
    if (following === null) return;
    setBusy(true);
    const optimistic = !following;
    setFollowing(optimistic);
    try {
      const actual = await toggleFollow(userId, articleId);
      setFollowing(actual);
    } catch {
      setFollowing(!optimistic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={following ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={following === null || busy}
      aria-pressed={following ?? undefined}
    >
      <BellRing className="h-4 w-4" aria-hidden="true" />
      {following ? t('article.following') : t('article.follow')}
    </Button>
  );
}

/** Save / unsave this article. */
function BookmarkButton({
  userId,
  articleId,
}: {
  userId: string;
  articleId: string;
}) {
  const { t } = useTranslation();
  const [saved, setSaved] = React.useState<boolean | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    isBookmarked(userId, articleId).then((v) => {
      if (!cancelled) setSaved(v);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, articleId]);

  async function onClick() {
    if (saved === null) return;
    setBusy(true);
    const optimistic = !saved;
    setSaved(optimistic);
    try {
      const actual = await toggleBookmark(userId, articleId);
      setSaved(actual);
    } catch {
      setSaved(!optimistic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={saved ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={saved === null || busy}
      aria-pressed={saved ?? undefined}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden="true" />
      )}
      {saved ? t('article.saved') : t('article.save')}
    </Button>
  );
}

/** Render article body as paragraphs. */
function ArticleBody({ body }: { body: string }) {
  const paragraphs = React.useMemo(
    () => body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    [body],
  );
  return (
    <div className="article-body">
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
  );
}

/** Note when article language differs from site language. */
function LanguageMismatchNotice({
  articleLanguage,
  uiLanguage,
  translations,
}: {
  articleLanguage: LanguageCode;
  uiLanguage: LanguageCode;
  translations: Awaited<ReturnType<typeof fetchArticleTranslations>>;
}) {
  const { t } = useTranslation();
  const inUiLang = translations.find((tr) => tr.language === uiLanguage);
  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === articleLanguage);

  return (
    <div
      role="status"
      className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-primary/20 bg-primary/[0.04] px-4 py-3 text-sm"
    >
      <span className="text-foreground">
        {t('article.readingInLanguage', {
          language: langMeta?.nativeLabel ?? articleLanguage,
        })}
      </span>
      {inUiLang && (
        <Button asChild size="sm" variant="ghost">
          <Link to={`/article/${inUiLang.slug}`}>
            {t('article.readInMyLanguage')}
          </Link>
        </Button>
      )}
    </div>
  );
}

/** Loading placeholder for the article page. */
function ArticleSkeleton() {
  const { t } = useTranslation();
  const loadingLabel = t('data.loadingArticle');
  return (
    <article
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={loadingLabel}
      className="container max-w-3xl py-10 md:py-16"
    >
      <Skeleton className="mb-8 h-4 w-32" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-10 w-3/4" />
      <Skeleton className="mt-3 h-10 w-1/2" />
      <Skeleton className="mt-6 h-4 w-64" />
      <div className="mt-10 h-px w-full bg-border" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-9/12" />
      </div>
      <span className="sr-only">{loadingLabel}</span>
    </article>
  );
}
