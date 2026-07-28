import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  demoApproveArticle,
  demoArticleBySlug,
  demoArticleTranslations,
  demoCountArticlesByStatus,
  demoDeleteArticle,
  demoInsertArticle,
  demoIsBookmarked,
  demoListArticles,
  demoListBookmarks,
  demoSearchArticles,
  demoSendBackArticle,
  demoSubmitArticleForReview,
  demoToggleBookmark,
  demoUpdateArticle,
} from '@/demo/store';
import type {
  Article,
  ArticleInsert,
  ArticleStatus,
  ArticleUpdate,
  LanguageCode,
} from '@/types/database';

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  language: LanguageCode;
  status: ArticleStatus;
  category_id: string | null;
  published_at: string | null;
  author_id: string | null;
  translation_group_id: string;
  updated_at: string;
  review_note: string | null;
}

const LIST_COLUMNS =
  'id, slug, title, excerpt, language, status, category_id, published_at, author_id, translation_group_id, updated_at, review_note';

/** Drop body fields for list views. */
function toListItem(a: Article): ArticleListItem {
  const { body: _body, created_at: _c, ...rest } = a;
  return rest;
}

/** Published articles for browse/home. */
export async function fetchPublishedArticles(opts: {
  language: LanguageCode;
  categoryId?: string | null;
  limit?: number;
}): Promise<ArticleListItem[]> {
  if (!isSupabaseConfigured) {
    const rows = await demoListArticles({
      language: opts.language,
      categoryId: opts.categoryId ?? undefined,
      status: 'published',
      limit: opts.limit,
    });
    return rows.map(toListItem);
  }
  let q = getSupabase()
    .from('articles')
    .select(LIST_COLUMNS)
    .eq('language', opts.language)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (opts.categoryId) q = q.eq('category_id', opts.categoryId);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ArticleListItem[];
}

/** All articles by one author. */
export async function fetchArticlesByAuthor(
  authorId: string,
): Promise<ArticleListItem[]> {
  if (!isSupabaseConfigured) {
    const rows = await demoListArticles({ authorId });
    return rows.map(toListItem);
  }
  const { data, error } = await getSupabase()
    .from('articles')
    .select(LIST_COLUMNS)
    .eq('author_id', authorId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ArticleListItem[];
}

/** Every article for the admin list. */
export async function fetchAllArticlesForAdmin(): Promise<ArticleListItem[]> {
  if (!isSupabaseConfigured) {
    const rows = await demoListArticles({});
    return rows.map(toListItem);
  }
  const { data, error } = await getSupabase()
    .from('articles')
    .select(LIST_COLUMNS)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ArticleListItem[];
}

/** One published article by URL slug. */
export async function fetchPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  if (!isSupabaseConfigured) {
    const a = await demoArticleBySlug(slug);
    return a && a.status === 'published' ? a : null;
  }
  const { data, error } = await getSupabase()
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Full article for the editor. */
export async function fetchArticleForEditing(
  id: string,
): Promise<Article | null> {
  if (!isSupabaseConfigured) {
    const rows = await demoListArticles({});
    return rows.find((a) => a.id === id) ?? null;
  }
  const { data, error } = await getSupabase()
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Other language versions of the same article. */
export async function fetchArticleTranslations(
  translationGroupId: string,
  excludeArticleId?: string,
): Promise<Pick<Article, 'id' | 'language' | 'slug' | 'title'>[]> {
  if (!isSupabaseConfigured) {
    return demoArticleTranslations(translationGroupId, excludeArticleId);
  }
  let q = getSupabase()
    .from('articles')
    .select('id, language, slug, title')
    .eq('translation_group_id', translationGroupId)
    .eq('status', 'published');
  if (excludeArticleId) q = q.neq('id', excludeArticleId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

/** Create a new article draft. */
export async function createArticle(input: ArticleInsert): Promise<Article> {
  if (!isSupabaseConfigured) return demoInsertArticle(input);
  const { data, error } = await getSupabase()
    .from('articles')
    .insert(input as never)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Update article fields. */
export async function updateArticle(
  id: string,
  patch: ArticleUpdate,
): Promise<Article> {
  if (!isSupabaseConfigured) return demoUpdateArticle(id, patch);
  const { data, error } = await getSupabase()
    .from('articles')
    .update(patch as never)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Delete an article. */
export async function deleteArticle(id: string): Promise<void> {
  if (!isSupabaseConfigured) return demoDeleteArticle(id);
  const { error } = await getSupabase().from('articles').delete().eq('id', id);
  if (error) throw error;
}

/** Send a draft to admin review. */
export async function submitArticleForReview(
  id: string,
  authorId: string,
): Promise<Article> {
  if (!isSupabaseConfigured) {
    return demoSubmitArticleForReview(id, authorId);
  }
  const { data, error } = await getSupabase()
    .from('articles')
    .update({ status: 'in_review', review_note: null } as never)
    .eq('id', id)
    .eq('author_id', authorId)
    .eq('status', 'draft')
    .select('*')
    .single();
  if (error) throw error;
  return data as Article;
}

/** Publish an article from review. */
export async function approveArticle(id: string): Promise<Article> {
  if (!isSupabaseConfigured) return demoApproveArticle(id);
  const { data, error } = await getSupabase().rpc('approve_article', {
    article_id: id,
  } as never);
  if (error) throw error;
  return data as unknown as Article;
}

/** Return an article to draft with a note. */
export async function sendBackArticle(
  id: string,
  note: string,
): Promise<Article> {
  const trimmed = note.trim();
  if (trimmed.length < 5) {
    throw new Error('Please write a short note so the author knows what to fix.');
  }
  if (!isSupabaseConfigured) return demoSendBackArticle(id, trimmed);
  const { data, error } = await getSupabase()
    .from('articles')
    .update({ status: 'draft', review_note: trimmed } as never)
    .eq('id', id)
    .eq('status', 'in_review')
    .select('*')
    .single();
  if (error) throw error;
  return data as Article;
}

/** Count articles with a given status. */
export async function countArticlesByStatus(
  status: ArticleStatus,
): Promise<number> {
  if (!isSupabaseConfigured) return demoCountArticlesByStatus(status);
  const { count, error } = await getSupabase()
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', status);
  if (error) throw error;
  return count ?? 0;
}

export interface ArticleSearchResult {
  article: ArticleListItem;
  score: number;
}

/** Keep only letters/numbers for search tokens. */
function searchTokens(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}]+/gu, ''))
    .filter((t) => t.length >= 2);
}

/** Score how well an article matches the search tokens. */
function relevanceScore(
  article: ArticleListItem,
  tokens: string[],
  preferredLanguage?: LanguageCode,
  categoryBoost = false,
): number {
  const title = article.title.toLowerCase();
  const excerpt = (article.excerpt ?? '').toLowerCase();
  let score = categoryBoost ? 4 : 0;

  for (const token of tokens) {
    if (title === token) score += 12;
    else if (title.startsWith(token)) score += 8;
    else if (title.includes(token)) score += 6;
    if (excerpt.includes(token)) score += 3;
  }

  if (preferredLanguage && article.language === preferredLanguage) {
    score += 2;
  }

  return score;
}

/** Search published articles in all languages. */
export async function searchArticles(
  query: string,
  preferredLanguage?: LanguageCode,
): Promise<ArticleSearchResult[]> {
  if (!isSupabaseConfigured) {
    const hits = await demoSearchArticles(query);
    return hits
      .map((h) => ({
        article: toListItem(h.article),
        score:
          h.score +
          (preferredLanguage && h.article.language === preferredLanguage ? 2 : 0),
      }))
      .sort((a, b) => b.score - a.score);
  }

  const tokens = searchTokens(query);
  if (tokens.length === 0) return [];

  const supabase = getSupabase();
  const byId = new Map<string, ArticleListItem>();
  const categoryBoostIds = new Set<string>();

  // 1) Full-text search (title + excerpt + body index)
  const tsquery = tokens.map((t) => `${t}:*`).join(' | ');
  const { data: ftsRows, error: ftsError } = await supabase
    .from('articles')
    .select(LIST_COLUMNS)
    .eq('status', 'published')
    .textSearch('search_tsv', tsquery, { config: 'simple' })
    .limit(40);
  if (ftsError) throw ftsError;
  for (const row of (ftsRows ?? []) as ArticleListItem[]) {
    byId.set(row.id, row);
  }

  // 2) Partial match on title / excerpt / body (works with words after apostrophes)
  for (const token of tokens) {
    const pattern = `%${token}%`;
    const [titleHit, excerptHit, bodyHit] = await Promise.all([
      supabase
        .from('articles')
        .select(LIST_COLUMNS)
        .eq('status', 'published')
        .ilike('title', pattern)
        .limit(30),
      supabase
        .from('articles')
        .select(LIST_COLUMNS)
        .eq('status', 'published')
        .ilike('excerpt', pattern)
        .limit(30),
      supabase
        .from('articles')
        .select(LIST_COLUMNS)
        .eq('status', 'published')
        .ilike('body', pattern)
        .limit(30),
    ]);
    if (titleHit.error) throw titleHit.error;
    if (excerptHit.error) throw excerptHit.error;
    if (bodyHit.error) throw bodyHit.error;
    for (const row of [
      ...((titleHit.data ?? []) as ArticleListItem[]),
      ...((excerptHit.data ?? []) as ArticleListItem[]),
      ...((bodyHit.data ?? []) as ArticleListItem[]),
    ]) {
      byId.set(row.id, row);
    }
  }

  // 3) Match category names (e.g. "ubutaka" → Land & Housing)
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name_en, name_fr, name_rw, description_en, description_fr, description_rw');
  if (catError) throw catError;

  const matchedCategoryIds = (categories ?? [])
    .filter((cat) => {
      const blob = [
        cat.name_en,
        cat.name_fr,
        cat.name_rw,
        cat.description_en,
        cat.description_fr,
        cat.description_rw,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return tokens.some((t) => blob.includes(t));
    })
    .map((cat) => cat.id as string);

  if (matchedCategoryIds.length > 0) {
    const { data: catArticles, error: catArtError } = await supabase
      .from('articles')
      .select(LIST_COLUMNS)
      .eq('status', 'published')
      .in('category_id', matchedCategoryIds)
      .limit(40);
    if (catArtError) throw catArtError;
    for (const row of (catArticles ?? []) as ArticleListItem[]) {
      byId.set(row.id, row);
      categoryBoostIds.add(row.id);
    }
  }

  return Array.from(byId.values())
    .map((article) => ({
      article,
      score: Math.max(
        1,
        relevanceScore(
          article,
          tokens,
          preferredLanguage,
          categoryBoostIds.has(article.id),
        ),
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}

/** Articles this user saved. */
export async function fetchMyBookmarks(userId: string): Promise<ArticleListItem[]> {
  if (!isSupabaseConfigured) {
    const rows = await demoListBookmarks(userId);
    return rows.map(toListItem);
  }
  const { data, error } = await getSupabase()
    .from('saved_articles')
    .select(`article:articles(${LIST_COLUMNS})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as unknown as Array<{
    article: ArticleListItem | null;
  }>;
  return rows.flatMap((row) => (row.article ? [row.article] : []));
}

/** Check if the user saved this article. */
export async function isBookmarked(
  userId: string,
  articleId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) return demoIsBookmarked(userId, articleId);
  const { data, error } = await getSupabase()
    .from('saved_articles')
    .select('user_id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

/** Save or unsave. Returns true if saved. */
export async function toggleBookmark(
  userId: string,
  articleId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) return demoToggleBookmark(userId, articleId);
  const supabase = getSupabase();
  const bookmarked = await isBookmarked(userId, articleId);
  if (bookmarked) {
    const { error } = await supabase
      .from('saved_articles')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase
    .from('saved_articles')
    .insert({
      user_id: userId,
      article_id: articleId,
      created_at: new Date().toISOString(),
    } as never);
  if (error) throw error;
  return true;
}
