import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrandLockup } from '@/components/brand-mark';
import { SectionBreak } from '@/components/section';

/** Site footer links. */
export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      <SectionBreak to="soft" />
      <div className="bg-muted/40">
        <div className="container pb-14 pt-10 md:pt-14">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="space-y-4">
              <BrandLockup />
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t('brand.tagline')}
              </p>
            </div>

            <nav
              className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm md:col-span-2 md:justify-end"
              aria-label="Footer"
            >
              <FooterLink to="/browse">{t('nav.browse')}</FooterLink>
              <FooterLink to="/search">{t('nav.search')}</FooterLink>
              <FooterLink to="/help">{t('nav.help')}</FooterLink>
              <FooterLink to="/about">{t('footer.about')}</FooterLink>
              <FooterLink to="/contact">{t('footer.contact')}</FooterLink>
              <FooterLink to="/privacy">{t('footer.privacy')}</FooterLink>
              <FooterLink to="/terms">{t('footer.terms')}</FooterLink>
            </nav>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground md:flex-row md:items-center">
            <p>
              © {year} Juza. {t('footer.rights')}
            </p>
            <p>{t('footer.builtWith')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="text-muted-foreground transition-colors duration-200 hover:text-primary"
    >
      {children}
    </Link>
  );
}
