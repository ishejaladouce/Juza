import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';

type FaqItem = { q: string; a: string };

/** Help and FAQ. */
export default function HelpPage() {
  const { t } = useTranslation();
  const faqs = t('help.faqs', { returnObjects: true }) as FaqItem[];
  const items = Array.isArray(faqs) ? faqs : [];

  return (
    <>
      <PageHeader
        eyebrow={t('brand.name')}
        title={t('help.title')}
        description={t('help.description')}
      />
      <section className="container max-w-2xl pb-24">
        <div className="space-y-2">
          {items.map((item, index) => (
            <details
              key={index}
              className="group border-b border-foreground/10 py-4"
            >
              <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-12 border-t border-foreground/10 pt-10">
          <h2 className="font-display text-2xl font-normal tracking-tight">
            {t('help.stillNeedHelp')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('help.contactPrompt')}
          </p>
          <Button asChild className="mt-5">
            <Link to="/contact">{t('help.contactCta')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
