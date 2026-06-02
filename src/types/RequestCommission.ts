import type { CurrencyCode } from "../helper/currency";
import type { PaymentStatus } from "./OrderCommission";
import type { Product } from "./Products";
import type { UserDto } from "./User";

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

export const RequestStatusList = [
  "pending",
  "proceed",
  "rejected",
  "confirmed",
  "cancelled"
] as const;

export type RequestStatus =
  (typeof RequestStatusList)[number];

export type RequestDto = {
  id: string; 
  requestNumberId: string;
  user: UserDto; 
  productId: string; 
  productTitle?: string | null;
  currencyCode: CurrencyCode;
  proposedDeadline: string;
  proposedPrice: number;
  username: string;
  email: string;
  product: Product;
  status: RequestStatus;
  extraInfo?: string | null;
  createdAt: Date;
  orderSummary?: OrderSummaryDto;
}

export type OrderSummaryDto = {
    id: string;
    paidStatus: PaymentStatus,
    status: string;
}

export type ConfirmRequestDto = {
  deadline: string;
  price: number;
  sketchUrlKey: string[];
}
