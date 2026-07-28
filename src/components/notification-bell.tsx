import * as React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount,
} from '@/lib/data/notifications';
import { formatDate } from '@/lib/formatting';
import type { LanguageCode, Notification } from '@/types/database';

/** Header bell for in-app notifications. */
export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const { profile, isAuthenticated } = useAuth();
  const [items, setItems] = React.useState<Notification[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const lang = (i18n.resolvedLanguage ?? 'en') as LanguageCode;

  const reload = React.useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [list, count] = await Promise.all([
        listNotifications(profile.id),
        unreadNotificationCount(profile.id),
      ]);
      setItems(list);
      setUnread(count);
    } catch {
      setItems([]);
      setUnread(0);
    }
  }, [profile?.id]);

  React.useEffect(() => {
    if (!isAuthenticated || !profile?.id) {
      setItems([]);
      setUnread(0);
      return;
    }
    void reload();
    const id = window.setInterval(() => void reload(), 45_000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, profile?.id, reload]);

  React.useEffect(() => {
    if (open) void reload();
  }, [open, reload]);

  if (!isAuthenticated || !profile) return null;

  async function onSelect(n: Notification) {
    if (!n.read_at) {
      try {
        await markNotificationRead(profile!.id, n.id);
        setUnread((c) => Math.max(0, c - 1));
        setItems((prev) =>
          prev.map((row) =>
            row.id === n.id
              ? { ...row, read_at: new Date().toISOString() }
              : row,
          ),
        );
      } catch {
        // ignore
      }
    }
    setOpen(false);
  }

  async function onMarkAll() {
    try {
      await markAllNotificationsRead(profile!.id);
      setUnread(0);
      setItems((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at ?? new Date().toISOString(),
        })),
      );
    } catch {
      // ignore
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unread > 0
              ? t('notifications.unreadLabel', { count: unread })
              : t('notifications.label')
          }
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <DropdownMenuLabel className="p-0">
            {t('notifications.title')}
          </DropdownMenuLabel>
          {unread > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => void onMarkAll()}
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {t('notifications.empty')}
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {items.map((n) => (
              <li key={n.id}>
                <DropdownMenuItem asChild className="cursor-pointer p-0">
                  <Link
                    to={n.link || '/browse'}
                    onClick={() => void onSelect(n)}
                    className="flex flex-col items-start gap-0.5 px-3 py-2.5"
                  >
                    <span
                      className={
                        n.read_at
                          ? 'text-sm text-muted-foreground'
                          : 'text-sm font-medium text-foreground'
                      }
                    >
                      {n.title}
                    </span>
                    {n.body && (
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </span>
                    )}
                    <span className="text-[0.65rem] text-muted-foreground/80">
                      {formatDate(n.created_at, lang, {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </Link>
                </DropdownMenuItem>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
