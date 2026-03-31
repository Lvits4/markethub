export type ReviewUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  productId: string;
  user?: ReviewUser;
};
