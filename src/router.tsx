import { createBrowserRouter } from 'react-router-dom';
import { SiteLayout } from '@/components/layout/site-layout';
import { RequireAuth } from '@/components/require-auth';
import HomePage from '@/pages/home';
import BrowsePage from '@/pages/browse';
import BrowseCategoryPage from '@/pages/browse-category';
import ArticlePage from '@/pages/article';
import SearchPage from '@/pages/search';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import DashboardPage from '@/pages/dashboard';
import MyArticlesPage from '@/pages/my-articles';
import MyBookmarksPage from '@/pages/my-bookmarks';
import MyMessagesPage from '@/pages/my-messages';
import MyFeedbackPage from '@/pages/my-feedback';
import SettingsPage from '@/pages/settings';
import EditorPage from '@/pages/editor';
import AdminIndexPage from '@/pages/admin';
import AdminCategoriesPage from '@/pages/admin/categories';
import AdminArticlesPage from '@/pages/admin/articles';
import AdminUsersPage from '@/pages/admin/users';
import AdminRequestsPage from '@/pages/admin/requests';
import AdminReportsPage from '@/pages/admin/reports';
import AdminMessagesPage from '@/pages/admin/messages';
import AdminActivityPage from '@/pages/admin/activity';
import NotFoundPage from '@/pages/not-found';
import { StaticContentPage } from '@/pages/static-content';
import ContactPage from '@/pages/contact';
import HelpPage from '@/pages/help';
import ForgotPasswordPage from '@/pages/forgot-password';
import ResetPasswordPage from '@/pages/reset-password';

/** App routes (public, dashboard, admin). */
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <SiteLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'browse', element: <BrowsePage /> },
        { path: 'browse/:categorySlug', element: <BrowseCategoryPage /> },
        { path: 'article/:slug', element: <ArticlePage /> },
        { path: 'search', element: <SearchPage /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'register', element: <RegisterPage /> },
        { path: 'about', element: <StaticContentPage page="about" /> },
        { path: 'help', element: <HelpPage /> },
        { path: 'contact', element: <ContactPage /> },
        { path: 'privacy', element: <StaticContentPage page="privacy" /> },
        { path: 'terms', element: <StaticContentPage page="terms" /> },
        { path: 'forgot-password', element: <ForgotPasswordPage /> },
        { path: 'reset-password', element: <ResetPasswordPage /> },

        {
          path: 'dashboard',
          element: (
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          ),
        },
        {
          path: 'dashboard/bookmarks',
          element: (
            <RequireAuth>
              <MyBookmarksPage />
            </RequireAuth>
          ),
        },
        {
          path: 'dashboard/messages',
          element: (
            <RequireAuth>
              <MyMessagesPage />
            </RequireAuth>
          ),
        },
        {
          path: 'dashboard/feedback',
          element: (
            <RequireAuth>
              <MyFeedbackPage />
            </RequireAuth>
          ),
        },
        {
          path: 'dashboard/settings',
          element: (
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          ),
        },
        {
          path: 'dashboard/articles',
          element: (
            <RequireAuth roles={['contributor', 'admin']}>
              <MyArticlesPage />
            </RequireAuth>
          ),
        },
        {
          path: 'dashboard/articles/new',
          element: (
            <RequireAuth roles={['contributor', 'admin']}>
              <EditorPage />
            </RequireAuth>
          ),
        },
        {
          path: 'dashboard/articles/:id',
          element: (
            <RequireAuth roles={['contributor', 'admin']}>
              <EditorPage />
            </RequireAuth>
          ),
        },

        {
          path: 'admin',
          element: (
            <RequireAuth roles={['admin']}>
              <AdminIndexPage />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/categories',
          element: (
            <RequireAuth roles={['admin']}>
              <AdminCategoriesPage />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/articles',
          element: (
            <RequireAuth roles={['admin']}>
              <AdminArticlesPage />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/users',
          element: (
            <RequireAuth roles={['admin']}>
              <AdminUsersPage />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/requests',
          element: (
            <RequireAuth roles={['admin']}>
              <AdminRequestsPage />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/reports',
          element: (
            <RequireAuth roles={['admin']}>
              <AdminReportsPage />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/messages',
          element: (
            <RequireAuth roles={['admin']}>
              <AdminMessagesPage />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/activity',
          element: (
            <RequireAuth roles={['admin']}>
              <AdminActivityPage />
            </RequireAuth>
          ),
        },

        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);
