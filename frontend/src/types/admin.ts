export type AdminDashboardStats = {
  users: { total: number; customers: number; sellers: number };
  stores: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  products: { total: number; active: number };
  orders: { total: number; completed: number };
  revenue: { totalSales: number };
};

export type AdminUserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export type AdminStoreOwner = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AdminStoreRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isApproved: boolean;
  isRejected?: boolean;
  isActive: boolean;
  commission: string | number;
  userId: string;
  user?: AdminStoreOwner;
  createdAt?: string;
};

/** Respuesta de GET /admin/stores/:id (usuario sin campos sensibles). */
export type AdminStoreDetailUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Agregados en GET /admin/stores/:id para el panel de detalle. */
export type AdminStoreDetailStats = {
  productsTotal: number;
  productsActive: number;
  ordersTotal: number;
  ordersDelivered: number;
  revenue: number;
};

export type AdminStoreDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  shippingPolicy: string | null;
  returnPolicy: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isApproved: boolean;
  isRejected: boolean;
  isActive: boolean;
  commission: string | number;
  userId: string;
  user?: AdminStoreDetailUser;
  createdAt: string;
  updatedAt: string;
  stats?: AdminStoreDetailStats;
};

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  stock: number;
  isActive: boolean;
  storeId: string;
  store?: { id: string; name: string; slug: string };
  category?: { id: string; name: string } | null;
};

export type AdminOrderItemRow = {
  id: string;
  quantity: number;
  unitPrice: string | number;
  productId: string;
  product?: { id: string; name: string };
};

export type AdminOrderRow = {
  id: string;
  status: string;
  totalAmount: string | number;
  shippingAddress: string | null;
  userId: string;
  storeId: string;
  user?: AdminStoreOwner;
  store?: { id: string; name: string };
  items?: AdminOrderItemRow[];
  createdAt?: string;
  updatedAt?: string;
};

export type AdminMonthlySaleRow = {
  month: string;
  totalOrders: string;
  totalRevenue: string;
};

export type AdminTopStoreRow = {
  storeId: string;
  storeName: string;
  totalOrders: string;
  totalRevenue: string;
};

export type AdminSalesReport = {
  monthlySales: AdminMonthlySaleRow[];
  topStores: AdminTopStoreRow[];
};

export type AdminPlatformReport = {
  totalSales: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  productSales: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
};
