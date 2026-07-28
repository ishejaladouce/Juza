import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { ArticleCard } from '@/components/article-card';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAsync } from '@/hooks/use-async';
import { searchArticles } from '@/lib/data/articles';
import { fetchCategories, categoryName } from '@/lib/data/categories';
import type { LanguageCode } from '@/types/database';

const DEBOUNCE_MS = 200;

/** Search published articles. */
export default function SearchPage() {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ?? 'en') as LanguageCode;

  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') ?? '';

  const [input, setInput] = React.useState(urlQuery);
  const [debounced, setDebounced] = React.useState(urlQuery);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(input);
      const next = new URLSearchParams(params);
      if (input) next.set('q', input);
      else next.delete('q');
      setParams(next, { replace: true });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const categoriesState = useAsync(() => fetchCategories(), []);
  const categoryMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of categoriesState.data ?? []) {
      m[c.id] = categoryName(c, language);
    }
    return m;
  }, [categoriesState.data, language]);

  const resultsState = useAsync(async () => {
    const q = debounced.trim();
    if (!q) return [];
    return searchArticles(q, language);
  }, [debounced, language]);

  const results = resultsState.data ?? [];
  const trimmed = debounced.trim();

  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <PageHeader
        eyebrow={t('brand.name')}
        title={t('pages.search.title')}
        description={t('pages.search.description')}
      />

      <section className="container pb-16">
        <div className="mx-auto max-w-2xl">
          <label htmlFor="search-input" className="sr-only">
            {t('search.inputLabel')}
          </label>
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="search-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('search.placeholder')}
              className="h-12 border-foreground/15 pl-11 pr-10 text-base"
              autoComplete="off"
              inputMode="search"
              enterKeyHint="search"
              type="search"
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t('search.clear')}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div
            role="status"
            aria-live="polite"
            className="mt-8"
          >
            {!trimmed && (
              <p className="text-sm text-muted-foreground">
                {t('search.startTyping')}
              </p>
            )}

            {trimmed && resultsState.status === 'loading' && (
              <SearchSkeleton />
            )}

            {trimmed && resultsState.status === 'error' && (
              <p role="alert" className="text-sm text-destructive">
                {resultsState.error}
              </p>
            )}

            {trimmed &&
              resultsState.status === 'success' &&
              results.length === 0 && (
                <EmptyState
                  icon={<SearchIcon className="h-5 w-5" aria-hidden="true" />}
                  title={t('search.noResultsTitle', { query: trimmed })}
                  description={t('search.noResultsDescription')}
                  action={
                    <Button
                      variant="outline"
                      onClick={() => setInput('')}
                    >
                      {t('search.clear')}
                    </Button>
                  }
                />
              )}

            {trimmed &&
              resultsState.status === 'success' &&
              results.length > 0 && (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {t('search.resultsFor', {
                      count: results.length,
                      query: trimmed,
                    })}
                  </p>
                  <div>
                    {results.map((hit) => (
                      <ArticleCard
                        key={hit.article.id}
                        article={hit.article}
                        language={language}
                        showLanguage
                        categoryName={
                          hit.article.category_id
                            ? categoryMap[hit.article.category_id]
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </>
              )}
          </div>
        </div>
      </section>
    </>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-7 w-4/5" />
          <Skeleton className="mt-3 h-3 w-full" />
        </div>
      ))}
    </div>
  );
}
