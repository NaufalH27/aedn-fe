import type { Product } from "./Products";

export type RequestCommissionDto = {
  productId: string; // UUID
  proposedDeadline: string; // ISO 8601 timestamp (Instant)
  productTitle: string;
  extraInfo: string;
  username: string;
  email: string;
  currencyCode: string; 
  price?: number;
};

export type RequestDto = {
  id: string; // UUID
  requestNumberId: string;
  currencyCode?: string;
  proposedDeadline: string; // ISO 8601
  username: string;
  email: string;
  status?: string; // pending, proposed, rejected
  extraInfo?: string;
  createdAt: string; // ISO 8601
  productTitle?: string;
  proposedPrice?: number;
  product: Product;
};
