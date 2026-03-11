import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/ErrorBoundary';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import { Suspense, useEffect } from 'react';
import { init as initDiagnostics } from '@/lib/diagnosticCollector';

// Start global error collector (silent, zero UI impact)
initDiagnostics();

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const OnboardingRedirect = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const localDone = localStorage.getItem(`ob_${user.id}`) === '1';
    const isDone = user.onboarding_complete || localDone;

    // Auto-bypass for accounts created more than 1 hour ago — existing users
    // shouldn't be forced through onboarding they've never seen before.
    if (!isDone && user.created_at) {
      const ageMs = Date.now() - new Date(user.created_at).getTime();
      if (ageMs > 60 * 60 * 1000) {
        localStorage.setItem(`ob_${user.id}`, '1');
        return;
      }
    }

    if (
      !isDone &&
      !location.pathname.includes('Onboarding') &&
      !location.pathname.includes('login')
    ) {
      navigate('/Onboarding', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  // Not authenticated — show landing page + login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  // Render the main app
  return (
    <>
      <OnboardingRedirect />
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin" />
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        </div>
      }>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/" element={
              <LayoutWrapper currentPageName={mainPageKey}>
                <MainPage />
              </LayoutWrapper>
            } />
            {Object.entries(Pages).map(([path, Page]) => (
              path === 'Onboarding' ? (
                <Route key={path} path={`/${path}`} element={<Page />} />
              ) : (
                <Route
                  key={path}
                  path={`/${path}`}
                  element={
                    <LayoutWrapper currentPageName={path}>
                      <Page />
                    </LayoutWrapper>
                  }
                />
              )
            ))}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster richColors position="top-center" />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
