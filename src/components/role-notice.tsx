import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Short note about user roles. */
export function RoleNotice({ variant = 'signup' }: { variant?: 'signup' | 'citizen' }) {
  const { t } = useTranslation();

  const title =
    variant === 'signup'
      ? t('auth.roleModel.signupTitle')
      : t('auth.roleModel.citizenTitle');

  return (
    <div
      className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-4 text-sm"
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="space-y-2">
        <p className="font-medium text-foreground">{title}</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">
              {t('auth.roles.citizen')}.
            </span>{' '}
            {t('auth.roleModel.citizen')}
          </li>
          <li>
            <span className="font-medium text-foreground">
              {t('auth.roles.contributor')}.
            </span>{' '}
            {t('auth.roleModel.contributor')}
          </li>
          <li>
            <span className="font-medium text-foreground">
              {t('auth.roles.admin')}.
            </span>{' '}
            {t('auth.roleModel.admin')}
          </li>
        </ul>
      </div>
    </div>
  );
}
