export type StoreSummary = {
  id: string;
  name: string;
  slug: string;
};

/** Tienda pública o propia (vendedor) alineada al backend */
export type Store = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner?: string | null;
  shippingPolicy: string | null;
  returnPolicy: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isApproved: boolean;
  isActive: boolean;
  commission?: string | number;
  userId: string;
};
