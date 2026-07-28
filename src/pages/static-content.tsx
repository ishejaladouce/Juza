import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';

const PAGE_KEYS = ['about', 'contact', 'privacy', 'terms'] as const;
export type StaticPageKey = (typeof PAGE_KEYS)[number];

/** About / privacy / terms pages. */
export function StaticContentPage({ page }: { page: StaticPageKey }) {
  const { t } = useTranslation();
  const paragraphs = t(`static.${page}.body`, {
    returnObjects: true,
  }) as string[];

  return (
    <>
      <PageHeader
        eyebrow={t('brand.name')}
        title={t(`static.${page}.title`)}
        description={t(`static.${page}.description`)}
      />
      <section className="container max-w-2xl pb-24">
        <div className="space-y-6 text-base leading-relaxed text-foreground/85">
          {(Array.isArray(paragraphs) ? paragraphs : [String(paragraphs)]).map(
            (paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ),
          )}
        </div>
      </section>
    </>
  );
}
