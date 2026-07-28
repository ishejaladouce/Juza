import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category, LanguageCode } from '@/types/database';
import { categoryDescription, categoryName } from '@/lib/data/categories';

/** Card linking to one category. */
export function CategoryCard({
  category,
  language,
  articleCount,
}: {
  category: Category;
  language: LanguageCode;
  articleCount?: number;
}) {
  const { t } = useTranslation();
  const name = categoryName(category, language);
  const desc = categoryDescription(category, language);

  return (
    <Link
      to={`/browse/${category.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-lg bg-muted/35 p-6 transition-colors duration-200 hover:bg-muted/55 md:p-7"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-y-100"
      />
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
            {name}
          </h2>
          <ArrowUpRight
            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </div>
        {desc && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {desc}
          </p>
        )}
      </div>

      {typeof articleCount === 'number' && (
        <p className="mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {articleCount === 0
            ? t('browse.noArticlesYet')
            : t('browse.articleCount', { count: articleCount })}
        </p>
      )}
    </Link>
  );
}
