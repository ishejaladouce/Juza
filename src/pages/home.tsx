import { Link } from 'react-router-dom';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Section, SectionBreak, SectionMark } from '@/components/section';
import { useAsync } from '@/hooks/use-async';
import { fetchPublishedArticles } from '@/lib/data/articles';
import { fetchCategories, categoryName } from '@/lib/data/categories';
import { formatDate } from '@/lib/formatting';
import type { LanguageCode } from '@/types/database';

/** Home: hero + latest articles. */
export default function HomePage() {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ?? 'en') as LanguageCode;

  const featuredState = useAsync(
    () => fetchPublishedArticles({ language, limit: 3 }),
    [language],
  );
  const categoriesState = useAsync(() => fetchCategories(), []);
  const categoryById = new Map(
    (categoriesState.data ?? []).map((category) => [category.id, category]),
  );

  const featuredArticles = featuredState.data ?? [];

  return (
    <div>
      {/* Hero */}
      <Section>
        <div className="container relative grid items-end gap-8 px-4 pb-6 pt-10 md:grid-cols-12 md:gap-6 md:pb-0 md:pt-12">
          <div className="relative z-10 flex flex-col items-start text-left md:col-span-6 md:pb-16 lg:col-span-5 lg:pb-20">
            <p className="animate-rise-in text-xs font-semibold uppercase tracking-[0.22em] text-primary md:text-sm">
              {t('home.eyebrow')}
            </p>

            <h1 className="animate-rise-in mt-4 font-display text-[clamp(3.25rem,8vw,5.5rem)] font-normal leading-[0.92] tracking-[-0.02em] text-foreground [animation-delay:50ms]">
              {t('brand.name')}
            </h1>

            <SectionMark className="animate-rise-in [animation-delay:90ms]" />

            <p className="animate-rise-in mt-6 max-w-md text-xl font-medium leading-snug text-foreground md:text-2xl [animation-delay:120ms]">
              {t('home.title')}
            </p>
            <p className="animate-rise-in mt-3 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg [animation-delay:160ms]">
              {t('home.subtitle')}
            </p>

            <div className="animate-rise-in mt-8 flex flex-wrap items-center gap-3 [animation-delay:200ms]">
              <Button asChild size="lg">
                <Link to="/browse">
                  {t('home.ctaBrowse')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/search">
                  <SearchIcon className="h-4 w-4" aria-hidden="true" />
                  {t('home.ctaSearch')}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative isolate md:col-span-6 lg:col-span-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 top-[12%] z-0 flex items-end justify-center md:justify-end"
            >
              <div className="relative h-full w-[min(100%,26rem)] lg:w-[min(100%,32rem)]">
                <span className="absolute left-1/2 top-[6%] h-[94%] w-[82%] -translate-x-1/2 rounded-[50%] bg-primary/15" />
                <span className="absolute left-1/2 top-[12%] h-[82%] w-[68%] -translate-x-1/2 rounded-[50%] bg-primary/10" />
                <span className="absolute -right-2 top-[8%] h-[72%] w-[48%] rotate-[12deg] rounded-[50%] border border-primary/40" />
                <span className="absolute -left-3 top-[28%] h-[55%] w-[40%] -rotate-[18deg] rounded-[50%] border border-foreground/12" />
                <span className="absolute right-[8%] top-[2%] h-14 w-9 rotate-[24deg] rounded-[50%] bg-primary/25" />
                <span className="absolute left-[4%] bottom-[22%] h-7 w-12 -rotate-[16deg] rounded-[50%] bg-primary/20" />
                <span className="absolute bottom-[4%] left-1/2 h-8 w-[65%] -translate-x-1/2 rounded-[50%] bg-primary/25 blur-2xl" />
              </div>
            </div>

            <img
              src="/hero-guide.png"
              alt=""
              width={900}
              height={1100}
              decoding="async"
              className="animate-rise-in relative z-10 mx-auto max-h-[min(70vh,38rem)] w-auto object-contain object-bottom [animation-delay:120ms] md:ml-auto md:max-h-[min(78vh,44rem)] md:-mb-1"
            />
          </div>
        </div>
      </Section>

      <SectionBreak to="soft" />

      {/* Latest articles */}
      <Section tone="soft">
        <div className="container pb-20 pt-6 md:pb-28 md:pt-10">
          <div className="mb-12 flex items-end justify-between gap-4 md:mb-16">
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-primary">
                {t('home.latestEyebrow')}
              </p>
              <h2 className="mt-3 font-display text-h1">
                {t('home.latestTitle')}
              </h2>
              <SectionMark />
            </div>
            <Link
              to="/browse"
              className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-primary md:inline"
            >
              {t('home.viewAll')}
              <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {featuredState.status === 'loading' && (
            <div className="grid gap-6 md:grid-cols-3 md:gap-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-background/70 p-6 space-y-3"
                >
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          )}

          {featuredArticles.length > 0 && (
            <ul className="grid gap-5 md:grid-cols-3">
              {featuredArticles.map((article, index) => {
                const category = article.category_id
                  ? categoryById.get(article.category_id)
                  : null;
                const categoryLabel = category
                  ? categoryName(category, language)
                  : null;
                return (
                  <li
                    key={article.id}
                    className="animate-rise-in"
                    style={{ animationDelay: `${100 + index * 70}ms` }}
                  >
                    <Link
                      to={`/article/${article.slug}`}
                      className="group flex h-full flex-col rounded-lg bg-background/80 p-6 transition-colors duration-200 hover:bg-background md:p-7"
                    >
                      <div className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {categoryLabel && (
                          <span className="text-primary">{categoryLabel}</span>
                        )}
                        {categoryLabel && article.published_at && (
                          <span aria-hidden="true"> · </span>
                        )}
                        {article.published_at && (
                          <time dateTime={article.published_at}>
                            {formatDate(article.published_at, language)}
                          </time>
                        )}
                      </div>
                      <h3 className="mt-3 font-display text-2xl leading-snug text-foreground transition-colors group-hover:text-primary">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="mt-3 flex-1 font-serif text-sm leading-relaxed text-muted-foreground line-clamp-3 md:text-base">
                          {article.excerpt}
                        </p>
                      )}
                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                        {t('article.readMore')}
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Section>
    </div>
  );
}
