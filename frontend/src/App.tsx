import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardListPage from './pages/BoardListPage';
import BoardPage from './pages/BoardPage';
import PostPage from './pages/PostPage';
import CreatePostPage from './pages/CreatePostPage';
import SearchPage from './pages/SearchPage';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Public Route component (redirect to home if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />

              {/* Auth routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />

              {/* Board routes */}
              <Route path="/boards" element={<BoardListPage />} />
              <Route path="/board/:slug" element={<BoardPage />} />
              <Route path="/board/:slug/post/create" element={<CreatePostPage />} />
              <Route path="/board/:slug/post/:postId" element={<PostPage />} />

              {/* Search route */}
              <Route path="/search" element={<SearchPage />} />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
