import { apiPaths } from '../config/apiPaths';
import type {
  AdminProductRow,
  AdminSalesReport,
  AdminStoreDetail,
  SellerDashboardStats,
  SellerVentasRow,
} from '../types/admin';
import { fetchDefault } from './fetchDefault';

export function fetchSellerDashboard(token: string, lowStockThreshold?: number) {
  const path = lowStockThreshold != null
    ? `${apiPaths.sellerDashboard}?lowStockThreshold=${lowStockThreshold}`
    : apiPaths.sellerDashboard;
  return fetchDefault<SellerDashboardStats>(path, { token });
}

export function fetchSellerProducts(token: string) {
  return fetchDefault<AdminProductRow[]>(apiPaths.sellerProducts, { token });
}

export function fetchSellerStoreById(token: string, storeId: string) {
  return fetchDefault<AdminStoreDetail>(apiPaths.sellerStore(storeId), {
    token,
  });
}

export function fetchSellerSalesReport(token: string) {
  return fetchDefault<AdminSalesReport>(apiPaths.sellerReportsSales, { token });
}

export function fetchSellerVentas(token: string) {
  return fetchDefault<SellerVentasRow[]>(apiPaths.sellerVentas, { token });
}
