import { useTranslation } from 'react-i18next';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { CategoryCard } from '@/components/category-card';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/hooks/use-async';
import {
  fetchArticleCountsByCategory,
  fetchCategories,
} from '@/lib/data/categories';
import type { LanguageCode } from '@/types/database';

/** Browse all topic categories. */
export default function BrowsePage() {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ?? 'en') as LanguageCode;

  const categoriesState = useAsync(() => fetchCategories(), []);
  const countsState = useAsync(
    () => fetchArticleCountsByCategory(language),
    [language],
  );

  const loading = categoriesState.status === 'loading';
  const error =
    categoriesState.status === 'error' ? categoriesState.error : null;
  const categories = categoriesState.data ?? [];
  const counts = countsState.data ?? {};

  return (
    <>
      <PageHeader
        eyebrow={t('brand.name')}
        title={t('pages.browse.title')}
        description={t('pages.browse.description')}
      />

      <section className="container pb-20 md:pb-24">
        {error && <ErrorNotice message={error} />}

        {loading && <BrowseSkeleton />}

        {!loading && !error && categories.length === 0 && (
          <EmptyState
            icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
            title={t('browse.noCategoriesTitle')}
            description={t('browse.noCategoriesDescription')}
          />
        )}

        {!loading && !error && categories.length > 0 && (
          <div
            role="list"
            aria-busy={countsState.status === 'loading'}
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-14"
          >
            {categories.map((cat) => (
              <div role="listitem" key={cat.id}>
                <CategoryCard
                  category={cat}
                  language={language}
                  articleCount={counts[cat.id] ?? 0}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function BrowseSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-14"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg bg-muted/35 p-6">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-5/6" />
          <Skeleton className="mt-8 h-3 w-24" />
        </div>
      ))}
      <span className="sr-only">{t('data.loadingCategories')}</span>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm"
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div>
        <p className="font-medium text-destructive">{t('data.errorTitle')}</p>
        <p className="mt-1 text-destructive/90">{message}</p>
      </div>
    </div>
  );
}
