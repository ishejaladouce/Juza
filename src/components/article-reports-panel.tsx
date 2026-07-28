import * as React from 'react';
import { Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReportThread } from '@/components/report-thread';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import {
  listMyReportsForArticle,
  listReportsForArticle,
} from '@/lib/data/reports';
import { formatDate } from '@/lib/formatting';
import type { LanguageCode } from '@/types/database';

/** Admin panel of reports on one article. */
export function ArticleReportsPanel({
  articleId,
  language,
}: {
  articleId: string;
  language: LanguageCode;
}) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [tick, setTick] = React.useState(0);
  const isAdmin = profile?.role === 'admin';

  const state = useAsync(async () => {
    if (!profile) return [];
    if (isAdmin) return listReportsForArticle(articleId);
    return listMyReportsForArticle(articleId, profile.id);
  }, [articleId, profile?.id, isAdmin, tick]);

  if (!profile) return null;
  if (state.status === 'loading' || state.status === 'idle') return null;
  if (state.status === 'error') return null;

  const rows = state.data ?? [];
  if (rows.length === 0 && !isAdmin) return null;
  if (rows.length === 0 && isAdmin) return null;

  return (
    <aside className="mt-12 rounded-xl border border-foreground/10 bg-muted/30 p-5 md:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl text-foreground">
        <Flag className="h-4 w-4 text-primary" aria-hidden="true" />
        {isAdmin ? t('report.articlePanelAdminTitle') : t('report.articlePanelMyTitle')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {isAdmin
          ? t('report.articlePanelAdminHint')
          : t('report.articlePanelMyHint')}
      </p>

      <ul className="mt-5 space-y-5">
        {rows.map((report) => (
          <li
            key={report.id}
            className="rounded-lg border border-foreground/8 bg-background/80 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {t(`report.reasons.${report.reason}`)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(report.created_at, language)} · {t(`admin.reportTabs.${report.status}`)}
              </span>
            </div>
            {report.note && (
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {report.note}
              </p>
            )}
            <ReportThread
              reportId={report.id}
              articleId={articleId}
              replies={report.replies ?? []}
              authorId={profile.id}
              authorKind={isAdmin ? 'admin' : 'reporter'}
              language={language}
              onReplied={() => setTick((n) => n + 1)}
              compact
            />
          </li>
        ))}
      </ul>
    </aside>
  );
}
