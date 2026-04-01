import { apiPaths } from '../config/apiPaths';
import type {
  AdminDashboardStats,
  AdminOrderRow,
  AdminPlatformReport,
  AdminProductRow,
  AdminSalesReport,
  AdminStoreDetail,
  AdminStoreRow,
  AdminUserRow,
} from '../types/admin';
import { fetchDefault } from './fetchDefault';

export function fetchAdminDashboard(token: string) {
  return fetchDefault<AdminDashboardStats>(apiPaths.adminDashboard, { token });
}

export function fetchAdminUsers(token: string) {
  return fetchDefault<AdminUserRow[]>(apiPaths.adminUsers, { token });
}

export function toggleAdminUserActive(token: string, userId: string) {
  return fetchDefault<AdminUserRow>(apiPaths.adminUserToggleActive(userId), {
    token,
    method: 'PATCH',
  });
}

export function fetchAdminStores(token: string) {
  return fetchDefault<AdminStoreRow[]>(apiPaths.adminStores, { token });
}

export function fetchAdminStoreById(token: string, storeId: string) {
  return fetchDefault<AdminStoreDetail>(apiPaths.adminStore(storeId), {
    token,
  });
}

export function patchAdminStoreCommission(
  token: string,
  storeId: string,
  commission: number,
) {
  return fetchDefault<AdminStoreRow>(apiPaths.adminStoreCommission(storeId), {
    token,
    method: 'PATCH',
    body: { commission },
  });
}

export function deleteAdminStore(token: string, storeId: string) {
  return fetchDefault<{ message: string }>(apiPaths.adminStore(storeId), {
    token,
    method: 'DELETE',
  });
}

export function fetchAdminProducts(token: string) {
  return fetchDefault<AdminProductRow[]>(apiPaths.adminProducts, { token });
}

export function fetchAdminOrders(token: string) {
  return fetchDefault<AdminOrderRow[]>(apiPaths.adminOrders, { token });
}

export function fetchAdminSalesReport(token: string) {
  return fetchDefault<AdminSalesReport>(apiPaths.adminReportsSales, { token });
}

export function fetchRejectedStores(token: string) {
  return fetchDefault<AdminStoreRow[]>(apiPaths.storesRejected, { token });
}

export function approveStore(token: string, storeId: string) {
  return fetchDefault<AdminStoreRow>(apiPaths.storeApprove(storeId), {
    token,
    method: 'PATCH',
  });
}

export function rejectStore(token: string, storeId: string) {
  return fetchDefault<AdminStoreRow>(apiPaths.storeReject(storeId), {
    token,
    method: 'PATCH',
  });
}

export function fetchOrdersStoreReport(token: string) {
  return fetchDefault<AdminPlatformReport>(apiPaths.ordersStoreReport, {
    token,
  });
}
