import * as React from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrandLockup } from '@/components/brand-mark';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { NotificationBell } from '@/components/notification-bell';
import { useAuth } from '@/hooks/use-auth';

/** Main nav links (browse, search, help). */
function usePrimaryNavItems() {
  const { t } = useTranslation();
  return [
    { to: '/browse', label: t('nav.browse') },
    { to: '/search', label: t('nav.search') },
    { to: '/help', label: t('nav.help') },
  ];
}

/** One header nav link. */
function NavItem({
  to,
  label,
  onNavigate,
  large,
}: {
  to: string;
  label: string;
  onNavigate?: () => void;
  large?: boolean;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'transition-colors duration-150',
          large
            ? 'block py-1 text-3xl font-medium tracking-tight'
            : 'text-sm font-medium',
          isActive
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      {label}
    </NavLink>
  );
}

/** Full-screen mobile menu. */
function MobileNav({
  open,
  onClose,
  navItems,
  isAuthenticated,
  isAdmin,
  prefersReducedMotion,
}: {
  open: boolean;
  onClose: () => void;
  navItems: ReturnType<typeof usePrimaryNavItems>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  prefersReducedMotion: boolean | null;
}) {
  const { t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.openMenu')}
          className="fixed inset-0 z-[100] flex flex-col bg-background md:hidden"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="container flex h-16 shrink-0 items-center justify-between border-b border-foreground/10">
            <Link to="/" onClick={onClose} aria-label={t('brand.name')}>
              <BrandLockup className="h-7" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('nav.closeMenu')}
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="container flex flex-1 flex-col overflow-y-auto py-8">
            <nav className="flex flex-col gap-5" aria-label="Mobile primary">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  large
                  onNavigate={onClose}
                />
              ))}
            </nav>

            <div className="mt-10 space-y-6 border-t border-foreground/10 pt-8">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('language.label')}
                </p>
                <LanguageSwitcher />
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  {isAdmin && (
                    <Button asChild size="lg">
                      <Link to="/admin" onClick={onClose}>
                        {t('nav.admin')}
                      </Link>
                    </Button>
                  )}
                  <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="flex-1">
                      <Link to="/dashboard" onClick={onClose}>
                        {t('nav.dashboard')}
                      </Link>
                    </Button>
                    <UserMenu />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild size="lg">
                    <Link to="/register" onClick={onClose}>
                      {t('nav.register')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/login" onClick={onClose}>
                      {t('nav.login')}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <Link to="/login?next=/admin" onClick={onClose}>
                      {t('auth.adminAccessCta')}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Site header: logo, nav, language, account. */
export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, profile } = useAuth();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navItems = usePrimaryNavItems();
  const isAdmin = profile?.role === 'admin';

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/95 backdrop-blur-md">
        <a
          href="#main-content"
          className="sr-only-focusable absolute left-4 top-2 z-50 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          {t('nav.skipToContent')}
        </a>

        <div className="container relative grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Link
            to="/"
            className="justify-self-start rounded-sm outline-offset-4"
            aria-label={t('brand.name')}
          >
            <BrandLockup className="h-7" />
          </Link>

          <nav
            className="hidden items-center justify-center gap-10 md:flex"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          <div className="flex items-center justify-self-end gap-2">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <ThemeToggle />

            {isAuthenticated && <NotificationBell />}

            <div className="hidden items-center gap-2 md:flex">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/admin" className="gap-1.5">
                        <span className="text-primary">{t('nav.admin')}</span>
                      </Link>
                    </Button>
                  )}
                  <UserMenu />
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/login">{t('nav.login')}</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/register">{t('nav.register')}</Link>
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        prefersReducedMotion={prefersReducedMotion}
      />
    </>
  );
}
