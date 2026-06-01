import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline, Snackbar, Alert, CircularProgress, Box } from '@mui/material';
import { getAppTheme } from './theme/theme';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { Layout } from './components/Layout/Layout.tsx';

const Dashboard = lazy(() => import('./components/Dashboard/Dashboard.tsx').then(m => ({ default: m.Dashboard })));
const LeadsPage = lazy(() => import('./components/Leads/LeadsPage.tsx').then(m => ({ default: m.LeadsPage })));
const Login = lazy(() => import('./components/Auth/Login.tsx').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./components/Auth/Register.tsx').then(m => ({ default: m.Register })));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress color="primary" />
  </Box>
);

// Instantiate TanStack React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive queries refetching on click-away
      retry: 1,
    },
  },
});

// Guard Component to secure private pages
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  const { initializeAuth } = useAuthStore();
  const { themeMode, notification, closeNotification } = useUIStore();

  // Load auth session token from storage on startup!
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Construct dynamic Theme
  const theme = getAppTheme(themeMode);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />

            {/* Protected CRM Admin Routes */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Layout />
                </AuthGuard>
              }
            >
              <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
              <Route path="leads" element={<Suspense fallback={<PageLoader />}><LeadsPage /></Suspense>} />
            </Route>

            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Unified Application Global Toast Snacker */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={closeNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
export default App;

