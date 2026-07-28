import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  demoCountOpenArticleReports,
  demoCreateArticleReport,
  demoCreateReportReply,
  demoListArticleReports,
  demoListReportRepliesForArticle,
  demoListReportRepliesForReport,
  demoResolveArticleReport,
} from '@/demo/store';
import type {
  ArticleReport,
  ArticleReportInsert,
  ArticleReportReply,
  ArticleReportStatus,
  ArticleReportWithArticle,
  ReportReplyAuthorKind,
} from '@/types/database';

const REPORT_SELECT =
  'id, article_id, reporter_user_id, reporter_email, reason, note, status, resolved_by, resolved_at, created_at, updated_at, article:articles(id, slug, title, language, status, author_id)';

/** Attach reply threads to each report. */
async function attachReplies(
  rows: ArticleReportWithArticle[],
): Promise<ArticleReportWithArticle[]> {
  if (rows.length === 0) return rows;

  if (!isSupabaseConfigured) {
    return Promise.all(
      rows.map(async (r) => ({
        ...r,
        replies: await demoListReportRepliesForReport(r.id),
      })),
    );
  }

  const ids = rows.map((r) => r.id);
  const { data, error } = await getSupabase()
    .from('article_report_replies')
    .select('*')
    .in('report_id', ids)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[reports] replies unavailable:', error.message);
    return rows.map((r) => ({ ...r, replies: [] }));
  }

  const byReport = new Map<string, ArticleReportReply[]>();
  for (const reply of (data ?? []) as ArticleReportReply[]) {
    const list = byReport.get(reply.report_id) ?? [];
    list.push(reply);
    byReport.set(reply.report_id, list);
  }

  return rows.map((r) => ({
    ...r,
    replies: byReport.get(r.id) ?? [],
  }));
}

/** Submit a new article report or question. */
export async function createArticleReport(
  input: ArticleReportInsert,
): Promise<ArticleReport> {
  if (!isSupabaseConfigured) return demoCreateArticleReport(input);
  const { data, error } = await getSupabase()
    .from('article_reports')
    .insert(input as never)
    .select('*')
    .single();
  if (error) throw error;
  return data as ArticleReport;
}

/** All reports for the admin inbox. */
export async function listArticleReports(
  status?: ArticleReportStatus,
): Promise<ArticleReportWithArticle[]> {
  if (!isSupabaseConfigured) {
    const rows = await demoListArticleReports(status);
    return attachReplies(rows);
  }

  let q = getSupabase()
    .from('article_reports')
    .select(REPORT_SELECT)
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) throw error;

  return attachReplies((data ?? []) as unknown as ArticleReportWithArticle[]);
}

/** Reports for one article. */
export async function listReportsForArticle(
  articleId: string,
): Promise<ArticleReportWithArticle[]> {
  if (!isSupabaseConfigured) {
    const all = await demoListArticleReports();
    return attachReplies(all.filter((r) => r.article_id === articleId));
  }

  const { data, error } = await getSupabase()
    .from('article_reports')
    .select(REPORT_SELECT)
    .eq('article_id', articleId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return attachReplies((data ?? []) as unknown as ArticleReportWithArticle[]);
}

/** Current user’s reports on one article. */
export async function listMyReportsForArticle(
  articleId: string,
  userId: string,
): Promise<ArticleReportWithArticle[]> {
  const rows = await listReportsForArticle(articleId);
  return rows.filter((r) => r.reporter_user_id === userId);
}

/** All reports submitted by this user. */
export async function listMyArticleReports(
  userId: string,
): Promise<ArticleReportWithArticle[]> {
  if (!isSupabaseConfigured) {
    const all = await demoListArticleReports();
    return attachReplies(all.filter((r) => r.reporter_user_id === userId));
  }

  const { data, error } = await getSupabase()
    .from('article_reports')
    .select(REPORT_SELECT)
    .eq('reporter_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return attachReplies((data ?? []) as unknown as ArticleReportWithArticle[]);
}

/** How many reports are still open. */
export async function countOpenArticleReports(): Promise<number> {
  if (!isSupabaseConfigured) return demoCountOpenArticleReports();
  const { count, error } = await getSupabase()
    .from('article_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');
  if (error) throw error;
  return count ?? 0;
}

/** Dismiss or unpublish from a report. */
export async function resolveArticleReport(
  id: string,
  reviewerId: string,
  action: 'dismiss' | 'unpublish',
  reason?: string,
): Promise<ArticleReport> {
  if (!isSupabaseConfigured) {
    return demoResolveArticleReport(id, reviewerId, action, reason);
  }
  const { data, error } = await getSupabase().rpc('resolve_article_report', {
    report_id: id,
    action_kind: action,
    reason_text: reason ?? null,
  } as never);
  if (error) throw error;
  return data as unknown as ArticleReport;
}

/** Add a reply on a report thread. */
export async function addReportReply(input: {
  reportId: string;
  articleId: string;
  authorId: string;
  authorKind: ReportReplyAuthorKind;
  body: string;
}): Promise<ArticleReportReply> {
  const body = input.body.trim();
  if (!body) throw new Error('Reply cannot be empty.');

  if (!isSupabaseConfigured) {
    return demoCreateReportReply({
      report_id: input.reportId,
      article_id: input.articleId,
      author_id: input.authorId,
      author_kind: input.authorKind,
      body,
    });
  }

  const { data, error } = await getSupabase()
    .from('article_report_replies')
    .insert({
      report_id: input.reportId,
      article_id: input.articleId,
      author_id: input.authorId,
      author_kind: input.authorKind,
      body,
    } as never)
    .select('*')
    .single();
  if (error) {
    if (/does not exist|schema cache|Could not find/i.test(error.message)) {
      throw new Error(
        'Report replies are not set up yet. Run migration 0008_report_replies.sql in the Supabase SQL Editor.',
      );
    }
    throw error;
  }
  return data as ArticleReportReply;
}

/** All report replies for one article. */
export async function listRepliesForArticle(
  articleId: string,
): Promise<ArticleReportReply[]> {
  if (!isSupabaseConfigured) {
    return demoListReportRepliesForArticle(articleId);
  }
  const { data, error } = await getSupabase()
    .from('article_report_replies')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('[reports] replies unavailable:', error.message);
    return [];
  }
  return (data ?? []) as ArticleReportReply[];
}
