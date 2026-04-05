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

export function deleteAdminUser(token: string, userId: string) {
  return fetchDefault<{ message: string }>(apiPaths.adminUser(userId), {
    token,
    method: 'DELETE',
  });
}

export type AdminCreateUserPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive?: boolean;
};

export type AdminUpdateUserPayload = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
};

export function createAdminUser(token: string, body: AdminCreateUserPayload) {
  return fetchDefault<AdminUserRow>(apiPaths.adminUsers, {
    token,
    method: 'POST',
    body,
  });
}

export function updateAdminUser(
  token: string,
  userId: string,
  body: AdminUpdateUserPayload,
) {
  return fetchDefault<AdminUserRow>(apiPaths.adminUser(userId), {
    token,
    method: 'PATCH',
    body,
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
