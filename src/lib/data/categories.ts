import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  demoArticleCountsByCategory,
  demoCategoryBySlug,
  demoDeleteCategory,
  demoListCategories,
  demoUpsertCategory,
} from '@/demo/store';
import type { Category, LanguageCode } from '@/types/database';

/** Category name in the chosen language. */
export function categoryName(category: Category, lang: LanguageCode): string {
  const key = `name_${lang}` as const;
  return (category[key] ?? category.name_en) as string;
}

/** Category description in the chosen language. */
export function categoryDescription(
  category: Category,
  lang: LanguageCode,
): string | null {
  const key = `description_${lang}` as const;
  return (category[key] ?? category.description_en) as string | null;
}

/** All categories, sorted. */
export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return demoListCategories();
  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Find one category by its URL slug. */
export async function fetchCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  if (!isSupabaseConfigured) return demoCategoryBySlug(slug);
  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Published article counts per category for one language. */
export async function fetchArticleCountsByCategory(
  language: LanguageCode,
): Promise<Record<string, number>> {
  if (!isSupabaseConfigured) return demoArticleCountsByCategory(language);

  const { data, error } = await getSupabase()
    .from('articles')
    .select('category_id')
    .eq('language', language)
    .eq('status', 'published')
    .not('category_id', 'is', null);
  if (error) throw error;

  const counts: Record<string, number> = {};
  const rows = (data ?? []) as Array<{ category_id: string | null }>;
  for (const row of rows) {
    if (row.category_id) {
      counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
    }
  }
  return counts;
}

/** Create or update a category by slug. */
export async function upsertCategory(input: {
  slug: string;
  name_en: string;
  name_fr: string;
  name_rw: string;
  description_en?: string | null;
  description_fr?: string | null;
  description_rw?: string | null;
  icon?: string | null;
  sort_order?: number;
}): Promise<Category> {
  if (!isSupabaseConfigured) return demoUpsertCategory(input);
  const { data, error } = await getSupabase()
    .from('categories')
    .upsert(input as never, { onConflict: 'slug' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Delete a category by id. */
export async function deleteCategory(id: string): Promise<void> {
  if (!isSupabaseConfigured) return demoDeleteCategory(id);
  const { error } = await getSupabase().from('categories').delete().eq('id', id);
  if (error) throw error;
}
