import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LanguageCode } from '@/types/database';
import type { ArticleListItem } from '@/lib/data/articles';
import { formatDate } from '@/lib/formatting';

/** Card linking to one article. */
export function ArticleCard({
  article,
  language,
  categoryName,
  showLanguage,
}: {
  article: ArticleListItem;
  language: LanguageCode;
  categoryName?: string;
  showLanguage?: boolean;
  variant?: 'row' | 'tile';
}) {
  const { t } = useTranslation();
  const showDot = Boolean(categoryName || showLanguage);

  return (
    <article className="group rounded-lg px-4 py-6 transition-colors duration-200 hover:bg-muted/40 sm:px-5">
      <Link to={`/article/${article.slug}`} className="block">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {showLanguage && (
            <span className="text-foreground/70">{article.language}</span>
          )}
          {categoryName && <span className="text-primary">{categoryName}</span>}
          {publishedMeta(showDot, article.published_at, language)}
        </div>

        <h3 className="mt-3 font-display text-2xl leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary md:text-[1.75rem]">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        <span className="mt-5 inline-block text-sm font-semibold text-foreground underline-offset-4 transition-colors group-hover:text-primary group-hover:underline">
          {t('article.readMore')}
        </span>
      </Link>
    </article>
  );
}

function publishedMeta(
  showDot: boolean,
  publishedAt: string | null | undefined,
  language: LanguageCode,
) {
  if (!publishedAt) return null;
  return (
    <>
      {showDot && <span aria-hidden="true">·</span>}
      <time dateTime={publishedAt}>{formatDate(publishedAt, language)}</time>
    </>
  );
}
