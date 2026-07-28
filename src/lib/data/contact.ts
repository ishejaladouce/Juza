import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ContactMessageRow } from '@/types/database';

export type ContactMessage = ContactMessageRow;

export interface ContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
  userId?: string | null;
}

const DEMO_KEY = 'juza-demo-contact-messages';

/** Load demo contact messages from localStorage. */
function readDemo(): ContactMessage[] {
  try {
    return (JSON.parse(localStorage.getItem(DEMO_KEY) ?? '[]') as ContactMessage[]) ?? [];
  } catch {
    return [];
  }
}

/** Save demo contact messages to localStorage. */
function writeDemo(rows: ContactMessage[]) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(rows.slice(0, 50)));
}

/** Send a contact / help message. */
export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<void> {
  if (!isSupabaseConfigured) {
    const prev = readDemo();
    prev.unshift({
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject?.trim() || null,
      message: input.message.trim(),
      status: 'open',
      user_id: input.userId ?? null,
      admin_reply: null,
      replied_at: null,
      replied_by: null,
      created_at: new Date().toISOString(),
    });
    writeDemo(prev);
    return;
  }

  const payload = {
    name: input.name.trim(),
    email: input.email.trim(),
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
    user_id: input.userId ?? null,
  };
  const { error } = await getSupabase()
    .from('contact_messages')
    .insert(payload as never);
  if (error) throw new Error(error.message);
}

/** Contact messages for admin (filter by status). */
export async function listContactMessages(
  status: 'open' | 'closed' | 'all' = 'open',
): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured) {
    const rows = readDemo();
    if (status === 'all') return rows;
    return rows.filter((r) => r.status === status);
  }

  let query = getSupabase()
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactMessage[];
}

/** Messages sent by this signed-in user. */
export async function listMyContactMessages(
  userId: string,
): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured) {
    return readDemo().filter((r) => r.user_id === userId);
  }

  const { data, error } = await getSupabase()
    .from('contact_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactMessage[];
}

/** Open or close a contact message. */
export async function setContactMessageStatus(
  id: string,
  status: 'open' | 'closed',
): Promise<void> {
  if (!isSupabaseConfigured) {
    writeDemo(readDemo().map((r) => (r.id === id ? { ...r, status } : r)));
    return;
  }

  const { error } = await getSupabase()
    .from('contact_messages')
    .update({ status } as never)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/** Admin reply; notifies the citizen if linked. */
export async function replyToContactMessage(
  messageId: string,
  reply: string,
  adminId: string,
): Promise<ContactMessage> {
  const cleaned = reply.trim();
  if (cleaned.length < 2) throw new Error('Reply is too short.');

  if (!isSupabaseConfigured) {
    const rows = readDemo();
    const existing = rows.find((r) => r.id === messageId);
    if (!existing) throw new Error('Contact message not found.');
    const updated: ContactMessage = {
      ...existing,
      admin_reply: cleaned,
      replied_at: new Date().toISOString(),
      replied_by: adminId,
      status: 'closed',
    };
    writeDemo(rows.map((r) => (r.id === messageId ? updated : r)));

    if (updated.user_id) {
      const notifKey = 'juza-demo-notifications';
      const notifs = JSON.parse(localStorage.getItem(notifKey) ?? '[]') as unknown[];
      notifs.unshift({
        id: crypto.randomUUID(),
        user_id: updated.user_id,
        article_id: null,
        kind: 'contact_reply',
        title: 'Reply to your message',
        body: cleaned.slice(0, 180),
        link: '/dashboard/messages',
        read_at: null,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(notifKey, JSON.stringify(notifs.slice(0, 100)));
    }
    return updated;
  }

  const { data, error } = await getSupabase().rpc(
    'reply_to_contact_message' as never,
    { p_message_id: messageId, p_reply: cleaned } as never,
  );
  if (error) {
    // Fallback without RPC.
    const { data: row, error: updateError } = await getSupabase()
      .from('contact_messages')
      .update({
        admin_reply: cleaned,
        replied_at: new Date().toISOString(),
        replied_by: adminId,
        status: 'closed',
      } as never)
      .eq('id', messageId)
      .select('*')
      .single();
    if (updateError) throw new Error(error.message || updateError.message);

    const message = row as ContactMessage;
    if (message.user_id) {
      await getSupabase()
        .from('notifications')
        .insert({
          user_id: message.user_id,
          kind: 'contact_reply',
          title: 'Reply to your message',
          body: cleaned.slice(0, 180),
          link: '/dashboard/messages',
        } as never);
    }
    return message;
  }
  return data as ContactMessage;
}
