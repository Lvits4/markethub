import { apiPaths } from '../config/apiPaths';
import type {
  AdminDashboardStats,
  AdminProductRow,
  AdminSalesReport,
  AdminStoreDetail,
} from '../types/admin';
import { fetchDefault } from './fetchDefault';

export function fetchSellerDashboard(token: string) {
  return fetchDefault<AdminDashboardStats>(apiPaths.sellerDashboard, { token });
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
