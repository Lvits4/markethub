export type StoreSummary = {
  id: string;
  name: string;
  slug: string;
  /** Presente cuando el backend devuelve la tienda completa anidada en producto, etc. */
  logo?: string | null;
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
  /** Presente en respuestas del vendedor / admin */
  isRejected?: boolean;
  isActive: boolean;
  commission?: string | number;
  userId: string;
};
