import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PenSquare,
  Settings,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';

function initialsFrom(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name && name.trim()) || (email && email.split('@')[0]) || '';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Account dropdown in the header. */
export function UserMenu() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const display = profile?.full_name || user.email || '';
  const initials = initialsFrom(profile?.full_name, user.email);
  const roleLabel = profile?.role ? t(`auth.roles.${profile.role}`) : null;

  async function onLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={display || t('auth.account')}
          className="relative rounded-full"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          >
            {initials}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium text-foreground normal-case tracking-normal">
              {display}
            </span>
            {roleLabel && (
              <span className="mt-0.5 text-xs text-muted-foreground normal-case tracking-normal">
                {roleLabel}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/dashboard')}>
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          {t('nav.dashboard')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/dashboard/feedback')}>
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          {t('feedback.title')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/dashboard/settings')}>
          <Settings className="h-4 w-4" aria-hidden="true" />
          {t('settings.title')}
        </DropdownMenuItem>
        {(profile?.role === 'contributor' || profile?.role === 'admin') && (
          <DropdownMenuItem onSelect={() => navigate('/dashboard/articles')}>
            <PenSquare className="h-4 w-4" aria-hidden="true" />
            {t('myArticles.title')}
          </DropdownMenuItem>
        )}
        {profile?.role === 'admin' && (
          <DropdownMenuItem onSelect={() => navigate('/admin')}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {t('admin.title')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => navigate('/dashboard')}>
          <UserIcon className="h-4 w-4" aria-hidden="true" />
          {t('auth.profile')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t('auth.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
