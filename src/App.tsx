import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { SetupRequired } from '@/components/setup-required';
import { router } from '@/router';
import {
  clearDemoLocalData,
  getDataMode,
  isSupabaseConfigured,
} from '@/lib/supabase';

if (isSupabaseConfigured) {
  clearDemoLocalData();
}

export default function App() {
  const mode = getDataMode();

  if (mode === 'missing') {
    return (
      <ThemeProvider defaultTheme="light">
        <SetupRequired />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <RouterProvider
          router={router}
          future={{ v7_startTransition: true }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
