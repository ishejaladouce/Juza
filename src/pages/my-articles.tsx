import { Link } from 'react-router-dom';
import { FileEdit, Plus, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { fetchArticlesByAuthor } from '@/lib/data/articles';
import { fetchCategories, categoryName } from '@/lib/data/categories';
import { formatDate } from '@/lib/formatting';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import type { LanguageCode } from '@/types/database';
import { cn } from '@/lib/utils';

/** Contributor’s own articles. */
export default function MyArticlesPage() {
  const { t, i18n } = useTranslation();
  const uiLanguage = (i18n.resolvedLanguage ?? 'en') as LanguageCode;
  const { profile } = useAuth();

  const articlesState = useAsync(async () => {
    if (!profile) return [];
    return fetchArticlesByAuthor(profile.id);
  }, [profile?.id]);

  const categoriesState = useAsync(() => fetchCategories(), []);
  const categoryMap = new Map(
    (categoriesState.data ?? []).map((c) => [c.id, c]),
  );

  const articles = articlesState.data ?? [];

  return (
    <>
      <div className="container pt-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('nav.dashboard')}
        </Link>
      </div>

      <PageHeader
        className="pt-4"
        title={t('myArticles.title')}
        description={t('myArticles.description')}
        actions={
          <Button asChild className="rounded-full">
            <Link to="/dashboard/articles/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('myArticles.newArticle')}
            </Link>
          </Button>
        }
      />

      <section className="container max-w-4xl pb-16">
        {articlesState.status === 'loading' && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {articlesState.status === 'success' && articles.length === 0 && (
          <EmptyState
            icon={<FileEdit className="h-5 w-5" aria-hidden="true" />}
            title={t('myArticles.emptyTitle')}
            description={t('myArticles.emptyDescription')}
            action={
              <Button asChild className="rounded-full">
                <Link to="/dashboard/articles/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t('myArticles.newArticle')}
                </Link>
              </Button>
            }
          />
        )}

        {articles.length > 0 && (
          <ul className="space-y-3">
            {articles.map((article) => {
              const cat = article.category_id
                ? categoryMap.get(article.category_id)
                : null;
              const langMeta = SUPPORTED_LANGUAGES.find(
                (l) => l.code === article.language,
              );
              return (
                <li key={article.id}>
                  <Link
                    to={`/dashboard/articles/${article.id}`}
                    className="group flex flex-col gap-2 border-t border-foreground/12 py-5 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                        {article.title || t('myArticles.untitled')}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {cat ? categoryName(cat, uiLanguage) : '—'}
                        {' · '}
                        {langMeta?.nativeLabel ?? article.language}
                        {article.updated_at && (
                          <>
                            {' · '}
                            {formatDate(article.updated_at, uiLanguage)}
                          </>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={article.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
        status === 'published' && 'bg-primary/10 text-primary',
        status === 'draft' && 'bg-muted text-muted-foreground',
        status === 'in_review' && 'bg-gold/15 text-accent',
      )}
    >
      {t(`editor.status.${status}`, { defaultValue: status })}
    </span>
  );
}
