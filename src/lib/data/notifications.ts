import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  demoListNotifications,
  demoMarkAllNotificationsRead,
  demoMarkNotificationRead,
  demoUnreadNotificationCount,
} from '@/demo/store';
import type { Notification } from '@/types/database';

let notificationsUnavailable = false;

/** Mark notifications table as unavailable. */
function markUnavailable(message: string) {
  if (!notificationsUnavailable) {
    notificationsUnavailable = true;
    console.warn('[notifications] missing table — run migration 0009:', message);
  }
}

/** Recent notifications for one user. */
export async function listNotifications(
  userId: string,
  limit = 20,
): Promise<Notification[]> {
  if (!isSupabaseConfigured) return demoListNotifications(userId, limit);
  if (notificationsUnavailable) return [];
  const { data, error } = await getSupabase()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    markUnavailable(error.message);
    return [];
  }
  return (data ?? []) as Notification[];
}

/** How many unread alerts this user has. */
export async function unreadNotificationCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured) return demoUnreadNotificationCount(userId);
  if (notificationsUnavailable) return 0;
  const { count, error } = await getSupabase()
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) {
    markUnavailable(error.message);
    return 0;
  }
  return count ?? 0;
}

/** Mark one notification as read. */
export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  if (!isSupabaseConfigured) {
    return demoMarkNotificationRead(userId, notificationId);
  }
  if (notificationsUnavailable) return;
  const { error } = await getSupabase()
    .from('notifications')
    .update({ read_at: new Date().toISOString() } as never)
    .eq('id', notificationId)
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) markUnavailable(error.message);
}

/** Mark all of this user’s notifications as read. */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return demoMarkAllNotificationsRead(userId);
  if (notificationsUnavailable) return;
  const { error } = await getSupabase()
    .from('notifications')
    .update({ read_at: new Date().toISOString() } as never)
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) markUnavailable(error.message);
}
