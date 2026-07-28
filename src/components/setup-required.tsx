import { BrandLockup } from '@/components/brand-mark';

/** Shown when Supabase is not configured. */
export function SetupRequired() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <BrandLockup className="h-8" />
      <h1 className="mt-8 font-display text-3xl tracking-tight text-foreground">
        Connect Supabase
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
        Juza is running in live mode. Add your project keys to{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
          .env
        </code>
        , then restart the dev server.
      </p>
      <pre className="mt-8 max-w-lg overflow-x-auto rounded-lg bg-muted/60 p-4 text-left text-xs leading-relaxed text-foreground">
        {`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SITE_URL=http://localhost:5173`}
      </pre>
      <p className="mt-6 max-w-md text-sm text-muted-foreground">
        Need the old offline playground? Set{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
          VITE_ALLOW_DEMO=true
        </code>{' '}
        in <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">.env</code>.
      </p>
    </div>
  );
}
