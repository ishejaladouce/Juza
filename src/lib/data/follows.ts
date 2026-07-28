import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  demoIsFollowing,
  demoToggleFollow,
} from '@/demo/store';

/** Check if this user follows the article. */
export async function isFollowing(
  userId: string,
  articleId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) return demoIsFollowing(userId, articleId);
  const { data, error } = await getSupabase()
    .from('article_follows')
    .select('user_id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();
  if (error) {
    console.warn('[follows] unavailable:', error.message);
    return false;
  }
  return Boolean(data);
}

/** Follow or unfollow. Returns true if now following. */
export async function toggleFollow(
  userId: string,
  articleId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) return demoToggleFollow(userId, articleId);
  const supabase = getSupabase();
  const following = await isFollowing(userId, articleId);
  if (following) {
    const { error } = await supabase
      .from('article_follows')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from('article_follows').insert({
    user_id: userId,
    article_id: articleId,
  } as never);
  if (error) throw error;
  return true;
}
