import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

/** 404 page. */
export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="container flex flex-col items-start py-28 md:py-36">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-accent">
        404
      </p>
      <h1 className="mt-6 font-display text-display tracking-tight">
        {t('pages.notFound.title')}
      </h1>
      <div className="motif-rule mt-6" />
      <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
        {t('pages.notFound.description')}
      </p>
      <Button asChild className="mt-10">
        <Link to="/">{t('pages.notFound.backHome')}</Link>
      </Button>
    </div>
  );
}
