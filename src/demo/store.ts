import type {
  Article,
  ArticleInsert,
  ArticleReport,
  ArticleReportInsert,
  ArticleReportReply,
  ArticleReportReplyInsert,
  ArticleReportStatus,
  ArticleReportWithArticle,
  ArticleStatus,
  ArticleUpdate,
  Category,
  ContributorRequest,
  ContributorRequestStatus,
  ContributorRequestWithProfile,
  LanguageCode,
  Notification,
  Profile,
  UserRole,
} from '@/types/database';
import {
  DEMO_ARTICLES,
  DEMO_CATEGORIES,
  DEMO_CREDENTIALS,
  DEMO_PROFILES,
} from '@/demo/seed';

/** Demo data in localStorage. */

const KEYS = {
  articles: 'juza-demo-articles',
  categories: 'juza-demo-categories',
  profiles: 'juza-demo-profiles',
  bookmarks: 'juza-demo-bookmarks',
  follows: 'juza-demo-follows',
  notifications: 'juza-demo-notifications',
  session: 'juza-demo-session',
  users: 'juza-demo-users',
  requests: 'juza-demo-contributor-requests',
  reports: 'juza-demo-article-reports',
  reportReplies: 'juza-demo-article-report-replies',
} as const;

/** Read a JSON list from localStorage. */
function readList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

/** Write a JSON list to localStorage. */
function writeList<T>(key: string, value: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export interface DemoUser {
  id: string;
  email: string;
  password: string; // demo only
  full_name: string | null;
  created_at: string;
}

export interface DemoSession {
  userId: string;
}

export interface DemoBookmark {
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface DemoFollow {
  user_id: string;
  article_id: string;
  created_at: string;
}

let initialized = false;

function ensureInit() {
  if (initialized) return;
  initialized = true;
  if (typeof window === 'undefined') return;

  if (!window.localStorage.getItem(KEYS.categories)) {
    writeList(KEYS.categories, DEMO_CATEGORIES);
  }
  if (!window.localStorage.getItem(KEYS.articles)) {
    writeList(KEYS.articles, DEMO_ARTICLES);
  } else {
    const existing = readList<Article>(KEYS.articles, []);
    const have = new Set(existing.map((a) => `${a.slug}:${a.language}`));
    const missing = DEMO_ARTICLES.filter(
      (a) => !have.has(`${a.slug}:${a.language}`),
    );
    if (missing.length > 0) {
      writeList(KEYS.articles, [...existing, ...missing]);
    }
  }
  if (!window.localStorage.getItem(KEYS.profiles)) {
    writeList(KEYS.profiles, DEMO_PROFILES);
  }
  if (!window.localStorage.getItem(KEYS.users)) {
    const seedUsers: DemoUser[] = DEMO_CREDENTIALS.map((c) => ({
      id: c.profileId,
      email: c.email,
      password: c.password,
      full_name:
        DEMO_PROFILES.find((p) => p.id === c.profileId)?.full_name ?? null,
      created_at: new Date().toISOString(),
    }));
    writeList(KEYS.users, seedUsers);
  }
  if (!window.localStorage.getItem(KEYS.bookmarks)) {
    writeList(KEYS.bookmarks, []);
  }
  if (!window.localStorage.getItem(KEYS.requests)) {
    writeList(KEYS.requests, []);
  }
  if (!window.localStorage.getItem(KEYS.reports)) {
    writeList(KEYS.reports, []);
  }
  if (!window.localStorage.getItem(KEYS.reportReplies)) {
    writeList(KEYS.reportReplies, []);
  }
  if (!window.localStorage.getItem(KEYS.follows)) {
    writeList(KEYS.follows, []);
  }
  if (!window.localStorage.getItem(KEYS.notifications)) {
    writeList(KEYS.notifications, []);
  }
}

function nowISO() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

// --- Categories (demo) ---
export async function demoListCategories(): Promise<Category[]> {
  ensureInit();
  await Promise.resolve();
  const rows = readList<Category>(KEYS.categories, DEMO_CATEGORIES);
  return [...rows].sort((a, b) => a.sort_order - b.sort_order);
}

export async function demoCategoryBySlug(slug: string): Promise<Category | null> {
  ensureInit();
  await Promise.resolve();
  const rows = readList<Category>(KEYS.categories, DEMO_CATEGORIES);
  return rows.find((c) => c.slug === slug) ?? null;
}

export async function demoUpsertCategory(cat: Partial<Category> & { slug: string; name_en: string; name_fr: string; name_rw: string }): Promise<Category> {
  ensureInit();
  const rows = readList<Category>(KEYS.categories, DEMO_CATEGORIES);
  const existing = rows.find((c) => c.slug === cat.slug);
  if (existing) {
    const merged: Category = {
      ...existing,
      ...cat,
      updated_at: nowISO(),
    };
    const next = rows.map((c) => (c.id === existing.id ? merged : c));
    writeList(KEYS.categories, next);
    return merged;
  }
  const created: Category = {
    id: newId(),
    slug: cat.slug,
    name_en: cat.name_en,
    name_fr: cat.name_fr,
    name_rw: cat.name_rw,
    description_en: cat.description_en ?? null,
    description_fr: cat.description_fr ?? null,
    description_rw: cat.description_rw ?? null,
    icon: cat.icon ?? null,
    sort_order: cat.sort_order ?? 100,
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  writeList(KEYS.categories, [...rows, created]);
  return created;
}

export async function demoDeleteCategory(id: string): Promise<void> {
  ensureInit();
  const rows = readList<Category>(KEYS.categories, DEMO_CATEGORIES);
  writeList(
    KEYS.categories,
    rows.filter((c) => c.id !== id),
  );
}

export interface ListArticlesOpts {
  language?: LanguageCode;
  categoryId?: string | null;
  status?: ArticleStatus | ArticleStatus[];
  authorId?: string;
  limit?: number;
}

function allArticles(): Article[] {
  const rows = readList<Article>(KEYS.articles, DEMO_ARTICLES);
  return rows.map((a) => ({ ...a, review_note: a.review_note ?? null }));
}

function saveArticles(list: Article[]) {
  writeList(KEYS.articles, list);
}

// --- Articles (demo) ---
export async function demoListArticles(
  opts: ListArticlesOpts = {},
): Promise<Article[]> {
  ensureInit();
  await Promise.resolve();
  let rows = allArticles();
  if (opts.language) rows = rows.filter((a) => a.language === opts.language);
  if (opts.categoryId) rows = rows.filter((a) => a.category_id === opts.categoryId);
  if (opts.status) {
    const wanted = Array.isArray(opts.status) ? opts.status : [opts.status];
    rows = rows.filter((a) => wanted.includes(a.status));
  }
  if (opts.authorId) rows = rows.filter((a) => a.author_id === opts.authorId);
  rows.sort((a, b) => {
    const at = a.published_at ?? a.updated_at;
    const bt = b.published_at ?? b.updated_at;
    return bt.localeCompare(at);
  });
  return opts.limit ? rows.slice(0, opts.limit) : rows;
}

export async function demoArticleBySlug(
  slug: string,
): Promise<Article | null> {
  ensureInit();
  await Promise.resolve();
  return allArticles().find((a) => a.slug === slug) ?? null;
}

export async function demoArticleTranslations(
  translationGroupId: string,
  excludeArticleId?: string,
): Promise<Pick<Article, 'id' | 'language' | 'slug' | 'title'>[]> {
  ensureInit();
  await Promise.resolve();
  return allArticles()
    .filter(
      (a) =>
        a.translation_group_id === translationGroupId &&
        a.status === 'published' &&
        a.id !== excludeArticleId,
    )
    .map(({ id, language, slug, title }) => ({ id, language, slug, title }));
}

export async function demoInsertArticle(
  input: ArticleInsert & { id?: string },
): Promise<Article> {
  ensureInit();
  const rows = allArticles();
  const slug = input.slug || slugify(input.title);

  if (rows.some((a) => a.slug === slug && a.language === input.language)) {
    throw new Error('An article with that slug already exists in this language.');
  }

  const article: Article = {
    id: input.id ?? newId(),
    translation_group_id: input.translation_group_id ?? newId(),
    language: input.language,
    slug,
    title: input.title,
    excerpt: input.excerpt ?? null,
    body: input.body ?? '',
    category_id: input.category_id ?? null,
    author_id: input.author_id ?? null,
    status: input.status ?? 'draft',
    review_note: null,
    published_at:
      input.published_at ??
      (input.status === 'published' ? nowISO() : null),
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  saveArticles([...rows, article]);
  return article;
}

export async function demoUpdateArticle(
  id: string,
  patch: ArticleUpdate,
): Promise<Article> {
  ensureInit();
  const rows = allArticles();
  const existing = rows.find((a) => a.id === id);
  if (!existing) throw new Error('Article not found.');

  const nextStatus = (patch.status ?? existing.status) as ArticleStatus;
  const nextPublishedAt =
    patch.published_at !== undefined
      ? patch.published_at
      : nextStatus === 'published' && !existing.published_at
        ? nowISO()
        : existing.published_at;

  const merged: Article = {
    ...existing,
    ...patch,
    status: nextStatus,
    published_at: nextPublishedAt,
    updated_at: nowISO(),
  };
  saveArticles(rows.map((a) => (a.id === id ? merged : a)));
  notifyFollowersOnArticleChange(existing, merged);
  return merged;
}

function notifyFollowersOnArticleChange(oldArticle: Article, next: Article) {
  if (next.status !== 'published') return;

  let kind: Notification['kind'] | null = null;
  let title = '';
  if (oldArticle.status !== 'published') {
    kind = 'article_published';
    title = 'An article you follow is now published';
  } else if (
    oldArticle.title !== next.title ||
    oldArticle.excerpt !== next.excerpt ||
    oldArticle.body !== next.body
  ) {
    kind = 'article_updated';
    title = 'An article you follow was updated';
  }
  if (!kind) return;

  const follows = readList<DemoFollow>(KEYS.follows, []).filter(
    (f) => f.article_id === next.id && f.user_id !== next.author_id,
  );
  if (follows.length === 0) return;

  const existing = readList<Notification>(KEYS.notifications, []);
  const created = follows.map((f) => ({
    id: newId(),
    user_id: f.user_id,
    article_id: next.id,
    kind,
    title,
    body: next.title,
    link: `/article/${next.slug}`,
    read_at: null,
    created_at: nowISO(),
  }));
  writeList(KEYS.notifications, [...created, ...existing]);
}

export async function demoSubmitArticleForReview(
  id: string,
  authorId: string,
): Promise<Article> {
  ensureInit();
  const rows = allArticles();
  const existing = rows.find((a) => a.id === id);
  if (!existing) throw new Error('Article not found.');
  if (existing.author_id && existing.author_id !== authorId) {
    throw new Error('You can only submit your own articles for review.');
  }
  if (existing.status !== 'draft') {
    throw new Error('Only drafts can be submitted for review.');
  }
  if (!existing.title.trim() || !existing.body.trim() || !existing.category_id) {
    throw new Error('Add a title, body, and category before submitting.');
  }
  const merged: Article = {
    ...existing,
    status: 'in_review',
    review_note: null,
    updated_at: nowISO(),
  };
  saveArticles(rows.map((a) => (a.id === id ? merged : a)));
  return merged;
}

export async function demoApproveArticle(id: string): Promise<Article> {
  ensureInit();
  const rows = allArticles();
  const existing = rows.find((a) => a.id === id);
  if (!existing) throw new Error('Article not found.');
  if (existing.status !== 'in_review') {
    throw new Error('Only in-review articles can be approved.');
  }
  const merged: Article = {
    ...existing,
    status: 'published',
    published_at: existing.published_at ?? nowISO(),
    review_note: null,
    updated_at: nowISO(),
  };
  saveArticles(rows.map((a) => (a.id === id ? merged : a)));
  notifyFollowersOnArticleChange(existing, merged);
  return merged;
}

export async function demoSendBackArticle(
  id: string,
  note: string,
): Promise<Article> {
  ensureInit();
  const trimmed = note.trim();
  if (trimmed.length < 5) {
    throw new Error('Please write a short note so the author knows what to fix.');
  }
  const rows = allArticles();
  const existing = rows.find((a) => a.id === id);
  if (!existing) throw new Error('Article not found.');
  if (existing.status !== 'in_review') {
    throw new Error('Only in-review articles can be sent back.');
  }
  const merged: Article = {
    ...existing,
    status: 'draft',
    review_note: trimmed,
    updated_at: nowISO(),
  };
  saveArticles(rows.map((a) => (a.id === id ? merged : a)));
  return merged;
}

export async function demoUnpublishArticle(
  id: string,
  reason: string,
): Promise<Article> {
  ensureInit();
  const rows = allArticles();
  const existing = rows.find((a) => a.id === id);
  if (!existing) throw new Error('Article not found.');
  const merged: Article = {
    ...existing,
    status: 'draft',
    review_note: reason.trim() || 'Unpublished after a reader report.',
    updated_at: nowISO(),
  };
  saveArticles(rows.map((a) => (a.id === id ? merged : a)));
  return merged;
}

export async function demoCountArticlesByStatus(
  status: ArticleStatus,
): Promise<number> {
  ensureInit();
  await Promise.resolve();
  return allArticles().filter((a) => a.status === status).length;
}

function readReports(): ArticleReport[] {
  return readList<ArticleReport>(KEYS.reports, []);
}

function saveReports(list: ArticleReport[]) {
  writeList(KEYS.reports, list);
}

// --- Reports (demo) ---
export async function demoCreateArticleReport(
  input: ArticleReportInsert,
): Promise<ArticleReport> {
  ensureInit();
  const article = allArticles().find((a) => a.id === input.article_id);
  if (!article) throw new Error('That article no longer exists.');

  const note = input.note?.trim() || null;
  const now = nowISO();
  const report: ArticleReport = {
    id: newId(),
    article_id: input.article_id,
    reporter_user_id: input.reporter_user_id ?? null,
    reporter_email: input.reporter_email?.trim() || null,
    reason: input.reason,
    note,
    status: 'open',
    resolved_by: null,
    resolved_at: null,
    created_at: now,
    updated_at: now,
  };
  saveReports([...readReports(), report]);
  return report;
}

export async function demoListArticleReports(
  status?: ArticleReportStatus,
): Promise<ArticleReportWithArticle[]> {
  ensureInit();
  await Promise.resolve();
  const arts = allArticles();
  let rows = readReports();
  if (status) rows = rows.filter((r) => r.status === status);
  rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return rows.map((r) => {
    const a = arts.find((x) => x.id === r.article_id);
    return {
      ...r,
      article: a
        ? {
            id: a.id,
            slug: a.slug,
            title: a.title,
            language: a.language,
            status: a.status,
            author_id: a.author_id,
          }
        : null,
    };
  });
}

export async function demoCountOpenArticleReports(): Promise<number> {
  ensureInit();
  await Promise.resolve();
  return readReports().filter((r) => r.status === 'open').length;
}

export async function demoResolveArticleReport(
  id: string,
  reviewerId: string,
  action: 'dismiss' | 'unpublish',
  reason?: string,
): Promise<ArticleReport> {
  ensureInit();
  const rows = readReports();
  const existing = rows.find((r) => r.id === id);
  if (!existing) throw new Error('Report not found.');
  if (existing.status !== 'open') {
    throw new Error('This report has already been handled.');
  }
  if (action === 'unpublish') {
    await demoUnpublishArticle(
      existing.article_id,
      reason ?? 'Unpublished after a reader report.',
    );
  }
  const now = nowISO();
  const updated: ArticleReport = {
    ...existing,
    status: action === 'dismiss' ? 'dismissed' : 'resolved',
    resolved_by: reviewerId,
    resolved_at: now,
    updated_at: now,
  };
  saveReports(rows.map((r) => (r.id === id ? updated : r)));
  return updated;
}

function readReportReplies(): ArticleReportReply[] {
  return readList<ArticleReportReply>(KEYS.reportReplies, []);
}

function saveReportReplies(list: ArticleReportReply[]) {
  writeList(KEYS.reportReplies, list);
}

export async function demoCreateReportReply(
  input: ArticleReportReplyInsert,
): Promise<ArticleReportReply> {
  ensureInit();
  const report = readReports().find((r) => r.id === input.report_id);
  if (!report) throw new Error('Report not found.');
  const reply: ArticleReportReply = {
    id: newId(),
    report_id: input.report_id,
    article_id: report.article_id,
    author_id: input.author_id ?? null,
    author_kind: input.author_kind,
    body: input.body.trim(),
    created_at: nowISO(),
  };
  saveReportReplies([...readReportReplies(), reply]);
  return reply;
}

export async function demoListReportRepliesForReport(
  reportId: string,
): Promise<ArticleReportReply[]> {
  ensureInit();
  await Promise.resolve();
  return readReportReplies()
    .filter((r) => r.report_id === reportId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function demoListReportRepliesForArticle(
  articleId: string,
): Promise<ArticleReportReply[]> {
  ensureInit();
  await Promise.resolve();
  return readReportReplies()
    .filter((r) => r.article_id === articleId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function demoDeleteArticle(id: string): Promise<void> {
  ensureInit();
  saveArticles(allArticles().filter((a) => a.id !== id));
}

export interface SearchHit {
  article: Article;
  score: number;
}

export async function demoSearchArticles(
  query: string,
  _language?: LanguageCode,
): Promise<SearchHit[]> {
  ensureInit();
  await Promise.resolve();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}]+/gu, ''))
    .filter((t) => t.length >= 2);
  if (tokens.length === 0) return [];

  const categories = readList<Category>(KEYS.categories, DEMO_CATEGORIES);
  const matchedCategoryIds = new Set(
    categories
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
      .map((cat) => cat.id),
  );

  const rows = allArticles().filter((a) => a.status === 'published');
  const hits: SearchHit[] = [];

  for (const a of rows) {
    const title = a.title.toLowerCase();
    const excerpt = (a.excerpt ?? '').toLowerCase();
    const body = a.body.toLowerCase();
    let score = a.category_id && matchedCategoryIds.has(a.category_id) ? 4 : 0;

    for (const t of tokens) {
      if (title === t) score += 12;
      else if (title.startsWith(t)) score += 8;
      else if (title.includes(t)) score += 6;
      if (excerpt.includes(t)) score += 3;
      if (body.includes(t)) score += 1;
    }

    if (score > 0) hits.push({ article: a, score });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits;
}

// --- Users (demo) ---
export async function demoListProfiles(): Promise<Profile[]> {
  ensureInit();
  await Promise.resolve();
  return readList<Profile>(KEYS.profiles, DEMO_PROFILES);
}

export async function demoProfileById(id: string): Promise<Profile | null> {
  ensureInit();
  await Promise.resolve();
  return (
    readList<Profile>(KEYS.profiles, DEMO_PROFILES).find((p) => p.id === id) ??
    null
  );
}

export async function demoUpdateProfile(
  id: string,
  patch: Partial<Profile>,
): Promise<Profile> {
  ensureInit();
  const rows = readList<Profile>(KEYS.profiles, DEMO_PROFILES);
  const existing = rows.find((p) => p.id === id);
  if (!existing) throw new Error('Profile not found.');
  const merged: Profile = { ...existing, ...patch, updated_at: nowISO() };
  writeList(
    KEYS.profiles,
    rows.map((p) => (p.id === id ? merged : p)),
  );
  return merged;
}

export async function demoSetUserRole(
  id: string,
  role: UserRole,
): Promise<Profile> {
  return demoUpdateProfile(id, { role });
}

export async function demoSetAccountStatus(
  id: string,
  status: Profile['account_status'],
): Promise<Profile> {
  const updated = await demoUpdateProfile(id, { account_status: status });
  if (status === 'suspended' || status === 'active') {
    const notifKey = KEYS.notifications;
    const notifs = readList<Notification>(notifKey, []);
    notifs.unshift({
      id: newId(),
      user_id: id,
      article_id: null,
      kind: 'system',
      title:
        status === 'suspended'
          ? 'Your account has been suspended'
          : 'Your account is active again',
      body:
        status === 'suspended'
          ? 'An administrator suspended your Juza account. Contact support if you think this is a mistake.'
          : 'An administrator restored your Juza account.',
      link: status === 'suspended' ? '/contact' : '/dashboard',
      read_at: null,
      created_at: nowISO(),
    });
    writeList(notifKey, notifs.slice(0, 100));
  }
  return updated;
}

function readUsers(): DemoUser[] {
  return readList<DemoUser>(KEYS.users, []);
}

function readSession(): DemoSession | null {
  try {
    const raw = window.localStorage.getItem(KEYS.session);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: DemoSession | null) {
  if (session) {
    window.localStorage.setItem(KEYS.session, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(KEYS.session);
  }
}

export async function demoCurrentUserId(): Promise<string | null> {
  ensureInit();
  if (typeof window === 'undefined') return null;
  return readSession()?.userId ?? null;
}

// --- Auth (demo) ---
export async function demoSignIn(
  email: string,
  password: string,
): Promise<Profile> {
  ensureInit();
  const users = readUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
  );
  if (!user || user.password !== password) {
    throw new Error('That email and password don’t match.');
  }
  writeSession({ userId: user.id });
  const profile = await demoProfileById(user.id);
  if (!profile) throw new Error('Profile missing for user.');
  const status = profile.account_status ?? 'active';
  if (status === 'suspended') {
    writeSession(null);
    throw new Error('Your account has been suspended. Contact Juza support.');
  }
  if (status === 'removed') {
    writeSession(null);
    throw new Error('This account is no longer available.');
  }
  return profile;
}

export async function demoSignUp(
  email: string,
  password: string,
  fullName: string,
  preferredLanguage: LanguageCode = 'en',
): Promise<Profile> {
  ensureInit();
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
    throw new Error('An account with that email already exists.');
  }
  const lang: LanguageCode =
    preferredLanguage === 'fr' || preferredLanguage === 'rw'
      ? preferredLanguage
      : 'en';
  const id = newId();
  const user: DemoUser = {
    id,
    email: email.trim(),
    password,
    full_name: fullName || null,
    created_at: nowISO(),
  };
  writeList(KEYS.users, [...users, user]);

  const profile: Profile = {
    id,
    username: null,
    full_name: fullName || null,
    avatar_url: null,
    bio: null,
    role: 'citizen',
    preferred_language: lang,
    account_status: 'active',
    email_notifications: false,
    onboarding_completed_at: null,
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  const profiles = readList<Profile>(KEYS.profiles, DEMO_PROFILES);
  writeList(KEYS.profiles, [...profiles, profile]);

  writeSession({ userId: id });
  return profile;
}

export async function demoSignOut(): Promise<void> {
  ensureInit();
  writeSession(null);
}

export async function demoListBookmarks(userId: string): Promise<Article[]> {
  ensureInit();
  await Promise.resolve();
  const marks = readList<DemoBookmark>(KEYS.bookmarks, []).filter(
    (b) => b.user_id === userId,
  );
  const arts = allArticles();
  return marks
    .map((m) => arts.find((a) => a.id === m.article_id))
    .filter((a): a is Article => Boolean(a));
}

// --- Bookmarks (demo) ---
export async function demoIsBookmarked(
  userId: string,
  articleId: string,
): Promise<boolean> {
  ensureInit();
  await Promise.resolve();
  return readList<DemoBookmark>(KEYS.bookmarks, []).some(
    (b) => b.user_id === userId && b.article_id === articleId,
  );
}

export async function demoToggleBookmark(
  userId: string,
  articleId: string,
): Promise<boolean> {
  ensureInit();
  const marks = readList<DemoBookmark>(KEYS.bookmarks, []);
  const existing = marks.find(
    (b) => b.user_id === userId && b.article_id === articleId,
  );
  if (existing) {
    writeList(
      KEYS.bookmarks,
      marks.filter(
        (b) => !(b.user_id === userId && b.article_id === articleId),
      ),
    );
    return false;
  }
  writeList(KEYS.bookmarks, [
    ...marks,
    { user_id: userId, article_id: articleId, created_at: nowISO() },
  ]);
  return true;
}

// --- Follows & notifications (demo) ---
export async function demoIsFollowing(
  userId: string,
  articleId: string,
): Promise<boolean> {
  ensureInit();
  await Promise.resolve();
  return readList<DemoFollow>(KEYS.follows, []).some(
    (f) => f.user_id === userId && f.article_id === articleId,
  );
}

export async function demoToggleFollow(
  userId: string,
  articleId: string,
): Promise<boolean> {
  ensureInit();
  const follows = readList<DemoFollow>(KEYS.follows, []);
  const existing = follows.find(
    (f) => f.user_id === userId && f.article_id === articleId,
  );
  if (existing) {
    writeList(
      KEYS.follows,
      follows.filter(
        (f) => !(f.user_id === userId && f.article_id === articleId),
      ),
    );
    return false;
  }
  writeList(KEYS.follows, [
    ...follows,
    { user_id: userId, article_id: articleId, created_at: nowISO() },
  ]);
  return true;
}

export async function demoListNotifications(
  userId: string,
  limit = 20,
): Promise<Notification[]> {
  ensureInit();
  await Promise.resolve();
  return readList<Notification>(KEYS.notifications, [])
    .filter((n) => n.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export async function demoUnreadNotificationCount(
  userId: string,
): Promise<number> {
  ensureInit();
  await Promise.resolve();
  return readList<Notification>(KEYS.notifications, []).filter(
    (n) => n.user_id === userId && !n.read_at,
  ).length;
}

export async function demoMarkNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  ensureInit();
  const rows = readList<Notification>(KEYS.notifications, []);
  writeList(
    KEYS.notifications,
    rows.map((n) =>
      n.id === notificationId && n.user_id === userId && !n.read_at
        ? { ...n, read_at: nowISO() }
        : n,
    ),
  );
}

export async function demoMarkAllNotificationsRead(
  userId: string,
): Promise<void> {
  ensureInit();
  const rows = readList<Notification>(KEYS.notifications, []);
  writeList(
    KEYS.notifications,
    rows.map((n) =>
      n.user_id === userId && !n.read_at ? { ...n, read_at: nowISO() } : n,
    ),
  );
}

export async function demoArticleCountsByCategory(
  language: LanguageCode,
): Promise<Record<string, number>> {
  ensureInit();
  await Promise.resolve();
  const counts: Record<string, number> = {};
  for (const a of allArticles()) {
    if (
      a.status === 'published' &&
      a.language === language &&
      a.category_id
    ) {
      counts[a.category_id] = (counts[a.category_id] ?? 0) + 1;
    }
  }
  return counts;
}

function readRequests(): ContributorRequest[] {
  return readList<ContributorRequest>(KEYS.requests, []);
}

function saveRequests(list: ContributorRequest[]) {
  writeList(KEYS.requests, list);
}

export async function demoMyContributorRequest(
  userId: string,
): Promise<ContributorRequest | null> {
  ensureInit();
  await Promise.resolve();
  const mine = readRequests()
    .filter((r) => r.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return mine[0] ?? null;
}

// --- Contributor requests (demo) ---
export async function demoCreateContributorRequest(
  userId: string,
  reason: string,
): Promise<ContributorRequest> {
  ensureInit();
  const trimmed = reason.trim();
  if (trimmed.length < 20) {
    throw new Error('Please explain why you’d like to contribute (at least 20 characters).');
  }

  const requests = readRequests();
  const existing = requests
    .filter((r) => r.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

  if (existing && existing.status === 'pending') {
    throw new Error('You already have a request in review.');
  }
  if (existing && existing.status === 'approved') {
    throw new Error('You are already a contributor.');
  }

  const now = nowISO();
  const req: ContributorRequest = {
    id: newId(),
    user_id: userId,
    reason: trimmed,
    status: 'pending',
    admin_note: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: now,
    updated_at: now,
  };
  saveRequests([...requests, req]);
  return req;
}

export async function demoListContributorRequests(
  status?: ContributorRequestStatus,
): Promise<ContributorRequestWithProfile[]> {
  ensureInit();
  await Promise.resolve();
  const profiles = readList<Profile>(KEYS.profiles, DEMO_PROFILES);
  let rows = readRequests();
  if (status) rows = rows.filter((r) => r.status === status);
  rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return rows.map((r) => ({
    ...r,
    applicant: profiles.find((p) => p.id === r.user_id) ?? null,
  }));
}

export async function demoCountPendingContributorRequests(): Promise<number> {
  ensureInit();
  await Promise.resolve();
  return readRequests().filter((r) => r.status === 'pending').length;
}

async function reviewRequest(
  id: string,
  reviewerId: string,
  next: ContributorRequestStatus,
  adminNote: string | null,
): Promise<ContributorRequest> {
  ensureInit();
  const rows = readRequests();
  const existing = rows.find((r) => r.id === id);
  if (!existing) throw new Error('Request not found.');
  if (existing.status !== 'pending') {
    throw new Error('This request has already been reviewed.');
  }
  const updated: ContributorRequest = {
    ...existing,
    status: next,
    admin_note: adminNote,
    reviewed_by: reviewerId,
    reviewed_at: nowISO(),
    updated_at: nowISO(),
  };
  saveRequests(rows.map((r) => (r.id === id ? updated : r)));
  return updated;
}

export async function demoApproveContributorRequest(
  id: string,
  reviewerId: string,
): Promise<ContributorRequest> {
  const updated = await reviewRequest(id, reviewerId, 'approved', null);
  await demoUpdateProfile(updated.user_id, { role: 'contributor' });
  return updated;
}

export async function demoRejectContributorRequest(
  id: string,
  reviewerId: string,
  adminNote: string,
): Promise<ContributorRequest> {
  const note = adminNote.trim();
  if (!note) {
    throw new Error('Please add a short note so the applicant understands.');
  }
  return reviewRequest(id, reviewerId, 'rejected', note);
}

export function demoResetAll() {
  if (typeof window === 'undefined') return;
  for (const key of Object.values(KEYS)) {
    window.localStorage.removeItem(key);
  }
  initialized = false;
  ensureInit();
}
