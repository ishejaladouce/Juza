import * as React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile } from '@/lib/data/users';

const STEPS = ['search', 'follow', 'feedback', 'language'] as const;

/** localStorage key for finished onboarding. */
function onboardingStorageKey(userId: string) {
  return `juza-onboarding-done:${userId}`;
}

/** True if user dismissed onboarding in this browser. */
function isOnboardingDoneLocally(userId: string) {
  try {
    return localStorage.getItem(onboardingStorageKey(userId)) === '1';
  } catch {
    return false;
  }
}

/** Remember onboarding as done in this browser. */
function markOnboardingDoneLocally(userId: string) {
  try {
    localStorage.setItem(onboardingStorageKey(userId), '1');
  } catch {
    // ignore
  }
}

/** First-login walkthrough (search, follow, feedback). */
export function OnboardingGuide() {
  const { t } = useTranslation();
  const { profile, refreshProfile, isAuthenticated } = useAuth();
  const [step, setStep] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated || !profile) {
      setOpen(false);
      return;
    }
    const done =
      Boolean(profile.onboarding_completed_at) ||
      isOnboardingDoneLocally(profile.id);
    setOpen(!done);
  }, [isAuthenticated, profile]);

  if (!open || !profile) return null;

  const key = STEPS[step];

  async function finish() {
    if (!profile) return;
    setBusy(true);
    try {
      try {
        await updateProfile(profile.id, {
          onboarding_completed_at: new Date().toISOString(),
        });
        await refreshProfile();
      } catch (err) {
        console.warn('[onboarding] profile save failed:', err);
      }
      markOnboardingDoneLocally(profile.id);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {t('onboarding.eyebrow', { step: step + 1, total: STEPS.length })}
        </p>
        <h2
          id="onboarding-title"
          className="mt-2 font-display text-2xl font-normal tracking-tight"
        >
          {t(`onboarding.steps.${key}.title`)}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t(`onboarding.steps.${key}.body`)}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {step < STEPS.length - 1 ? (
            <>
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                {t('onboarding.next')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => void finish()}
              >
                {t('onboarding.skip')}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" disabled={busy} onClick={() => void finish()}>
                {t('onboarding.done')}
              </Button>
              <Button asChild variant="outline">
                <Link to="/browse" onClick={() => void finish()}>
                  {t('onboarding.browse')}
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
