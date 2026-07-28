import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { ArticleCard } from '@/components/article-card';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAsync } from '@/hooks/use-async';
import {
  categoryDescription,
  categoryName,
  fetchCategoryBySlug,
} from '@/lib/data/categories';
import { fetchPublishedArticles } from '@/lib/data/articles';
import type { LanguageCode } from '@/types/database';

/** Articles inside one category. */
export default function BrowseCategoryPage() {
  const { t, i18n } = useTranslation();
  const { categorySlug } = useParams();
  const language = (i18n.resolvedLanguage ?? 'en') as LanguageCode;

  const categoryState = useAsync(async () => {
    if (!categorySlug) return null;
    return fetchCategoryBySlug(categorySlug);
  }, [categorySlug]);

  const category = categoryState.data ?? null;

  const articlesState = useAsync(async () => {
    if (!category?.id) return [];
    return fetchPublishedArticles({
      language,
      categoryId: category.id,
    });
  }, [category?.id, language]);

  if (categoryState.status === 'success' && !category) {
    return (
      <PageHeader
        eyebrow="404"
        title={t('browse.categoryNotFoundTitle')}
        description={t('browse.categoryNotFoundDescription')}
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

  const catName = category ? categoryName(category, language) : '';
  const catDesc = category ? categoryDescription(category, language) : null;

  return (
    <>
      <div className="container pt-8">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('browse.backToAll')}
        </Link>
      </div>

      <PageHeader
        eyebrow={t('browse.categoryEyebrow')}
        title={catName || t('pages.browse.title')}
        description={catDesc ?? undefined}
        className="pt-6"
      />

      <section className="container pb-16">
        {articlesState.status === 'loading' && <ArticleListSkeleton />}

        {articlesState.status === 'error' && (
          <p role="alert" className="text-sm text-destructive">
            {articlesState.error}
          </p>
        )}

        {articlesState.status === 'success' &&
          articlesState.data.length === 0 && (
            <EmptyState
              icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
              title={t('browse.emptyCategoryTitle')}
              description={t('browse.emptyCategoryDescription')}
            />
          )}

        {articlesState.status === 'success' &&
          articlesState.data.length > 0 && (
            <div className="mx-auto max-w-3xl">
              {articlesState.data.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  language={language}
                  categoryName={catName}
                />
              ))}
            </div>
          )}
      </section>
    </>
  );
}

function ArticleListSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto max-w-3xl space-y-2"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg px-4 py-6 sm:px-5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-7 w-4/5" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-2/3" />
        </div>
      ))}
      <span className="sr-only">{t('data.loadingArticles')}</span>
    </div>
  );
}
