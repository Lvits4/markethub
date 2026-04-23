export type Category = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  parentId: string | null;
  children?: Category[];
};
