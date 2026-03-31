import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthProvider/AuthProvider';
import { ThemeProvider } from '../context/ThemeProvider/ThemeProvider';
import { AuthLayout } from '../layouts/AuthLayout/AuthLayout';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { CatalogPage } from '../views/CatalogPage/CatalogPage';
import { CartPage } from '../views/CartPage/CartPage';
import { FavoritesPage } from '../views/FavoritesPage/FavoritesPage';
import { LoginPage } from '../views/LoginPage/LoginPage';
import { ProductDetailPage } from '../views/ProductDetailPage/ProductDetailPage';
import { RegisterPage } from '../views/RegisterPage/RegisterPage';
import { SettingsPage } from '../views/SettingsPage/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: 'text-sm dark:bg-zinc-800 dark:text-zinc-100',
        duration: 3200,
      }}
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppToaster />
          <HashRouter>
            <Routes>
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<CatalogPage />} />
                <Route path="product/:id" element={<ProductDetailPage />} />
                <Route
                  path="favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </HashRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
