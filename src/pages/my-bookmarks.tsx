import { Link } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { ArticleCard } from '@/components/article-card';
import { PageHeader } from '@/components/page-header';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { fetchMyBookmarks } from '@/lib/data/articles';
import { fetchCategories, categoryName } from '@/lib/data/categories';
import type { LanguageCode } from '@/types/database';

/** Saved articles. */
export default function MyBookmarksPage() {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ?? 'en') as LanguageCode;
  const { profile } = useAuth();

  const bookmarksState = useAsync(async () => {
    if (!profile) return [];
    return fetchMyBookmarks(profile.id);
  }, [profile?.id]);

  const categoriesState = useAsync(() => fetchCategories(), []);
  const catMap = new Map((categoriesState.data ?? []).map((c) => [c.id, c]));

  const bookmarks = bookmarksState.data ?? [];

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
        title={t('bookmarks.title')}
        description={t('bookmarks.description')}
      />

      <section className="container max-w-3xl pb-16">
        {bookmarksState.status === 'loading' && (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {bookmarksState.status === 'success' && bookmarks.length === 0 && (
          <EmptyState
            icon={<Bookmark className="h-5 w-5" aria-hidden="true" />}
            title={t('bookmarks.emptyTitle')}
            description={t('bookmarks.emptyDescription')}
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/browse">{t('nav.browse')}</Link>
              </Button>
            }
          />
        )}

        {bookmarks.length > 0 && (
          <div className="border-t border-foreground/10">
            {bookmarks.map((a) => {
              const cat = a.category_id ? catMap.get(a.category_id) : null;
              return (
                <ArticleCard
                  key={a.id}
                  article={a}
                  language={language}
                  categoryName={cat ? categoryName(cat, language) : undefined}
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
