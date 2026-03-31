import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthProvider/AuthProvider';
import { ThemeProvider } from '../context/ThemeProvider/ThemeProvider';
import { AuthLayout } from '../layouts/AuthLayout/AuthLayout';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { AdminRoute } from '../components/AdminRoute/AdminRoute';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout/AdminLayout';
import { AdminCategoriesPage } from '../views/AdminCategoriesPage/AdminCategoriesPage';
import { AdminDashboardPage } from '../views/AdminDashboardPage/AdminDashboardPage';
import { AdminModerationPage } from '../views/AdminModerationPage/AdminModerationPage';
import { AdminOrdersPage } from '../views/AdminOrdersPage/AdminOrdersPage';
import { AdminProductsPage } from '../views/AdminProductsPage/AdminProductsPage';
import { AdminSalesPage } from '../views/AdminSalesPage/AdminSalesPage';
import { AdminStoresPage } from '../views/AdminStoresPage/AdminStoresPage';
import { AdminUsersPage } from '../views/AdminUsersPage/AdminUsersPage';
import { CatalogPage } from '../views/CatalogPage/CatalogPage';
import { CatalogEntry } from '../views/CatalogEntry/CatalogEntry';
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
        className: 'rounded-md text-sm dark:bg-zinc-800 dark:text-zinc-100',
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
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="moderation" element={<AdminModerationPage />} />
                <Route path="stores" element={<AdminStoresPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="sales" element={<AdminSalesPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
              </Route>
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<CatalogEntry />} />
                <Route path="browse" element={<CatalogPage />} />
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
