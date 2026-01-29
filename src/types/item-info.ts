export interface ItemInfoResponse {
  name: string;
  topCategory: string;
  subCategory: string;
  description: string | null;
  inventoryWidth: number | null;
  inventoryHeight: number | null;
  inventoryMaxBundleCount: number | null;
  history: string | null;
  acquisitionMethod: string | null;
  storeSalesPrice: string | null;
  weaponType: string | null;
  repair: string | null;
  maxAlterationCount: number | null;
}

export interface ItemInfoSearchParams {
  topCategory: string;
  subCategory?: string;
  name?: string;
  page?: number;
  size?: number;
  direction?: "ASC" | "DESC";
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ItemInfoCategory {
  topCategory: string;
  subCategories: string[];
}
