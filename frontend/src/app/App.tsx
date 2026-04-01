import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthProvider/AuthProvider';
import { ThemeProvider } from '../context/ThemeProvider/ThemeProvider';
import { useTheme } from '../hooks/useTheme';
import { AuthLayout } from '../layouts/AuthLayout/AuthLayout';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { AdminRoute } from '../components/AdminRoute/AdminRoute';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { SellerRoute } from '../components/SellerRoute/SellerRoute';
import { AdminLayout } from '../layouts/AdminLayout/AdminLayout';
import { SellerLayout } from '../layouts/SellerLayout/SellerLayout';
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
import { ForgotPasswordPage } from '../views/ForgotPasswordPage/ForgotPasswordPage';
import { ResetPasswordPage } from '../views/ResetPasswordPage/ResetPasswordPage';
import { OrdersPage } from '../views/OrdersPage/OrdersPage';
import { OrderDetailPage } from '../views/OrderDetailPage/OrderDetailPage';
import { SellerDashboardPage } from '../views/SellerDashboardPage/SellerDashboardPage';
import { SellerStoreProductsPage } from '../views/SellerStoreProductsPage/SellerStoreProductsPage';
import { SellerProductFormPage } from '../views/SellerProductFormPage/SellerProductFormPage';
import { SellerOrdersPage } from '../views/SellerOrdersPage/SellerOrdersPage';
import { SellerReportPage } from '../views/SellerReportPage/SellerReportPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppToaster() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'rounded-md border text-sm',
        style: {
          background: isDark ? '#1f1f2e' : '#ffffff',
          color: isDark ? '#f4f4f5' : '#18181b',
          borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        },
        iconTheme: {
          primary: isDark ? '#60a5fa' : '#2563eb',
          secondary: isDark ? '#0b1020' : '#ffffff',
        },
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
              <Route
                path="/seller"
                element={
                  <ProtectedRoute>
                    <SellerRoute>
                      <SellerLayout />
                    </SellerRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<SellerDashboardPage />} />
                <Route
                  path="stores/:storeId/products"
                  element={<SellerStoreProductsPage />}
                />
                <Route path="products/new" element={<SellerProductFormPage />} />
                <Route
                  path="products/:productId/edit"
                  element={<SellerProductFormPage />}
                />
                <Route path="orders" element={<SellerOrdersPage />} />
                <Route path="report" element={<SellerReportPage />} />
              </Route>
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
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
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </HashRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
