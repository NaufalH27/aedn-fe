import type { CurrencyCode } from "../helper/currency";
import type { Product } from "./Products";
import type { RequestStatus } from "./RequestCommission";
import type { UserDto } from "./User";

export const OrderStatusList = [
  "pending_payment",
  "in_progress",
  "cancelled",
  "done",
] as const;

export type OrderStatus =
  (typeof OrderStatusList)[number];

export const PaymentStatusList = [
  "paid",
  "unpaid",
  "skipped",
] as const;

export type PaymentStatus =
  (typeof PaymentStatusList)[number];

export type OrderDto = {
  id: string; // request_id
  requestId: string;
  requestNumberId: string;
  requestStatus: RequestStatus;
  product: Product;
  currencyCode: CurrencyCode;
  proposedDeadline: string;
  proposedPrice: number;
  username: string;
  email: string;
  extraInfo?: string | null;
  requestCreatedAt: Date;
  user: UserDto;
  status: OrderStatus;
  deadline: string;
  price: number;
  paidStatus: PaymentStatus;
  paidAt?: Date | null;
  rating?: number | null;
  createdAt?: Date | null;
};

export type DrawingProgressDto = {
  id: string;
  srcUrl: string;
  name: string;
  position: number;
  createdAt: Date;
};

export type DrawingProgressPreviewDto = {
  id: string;
  name: string;
  position: number;
  createdAt: Date;
  previewBlob: string;
  originalSize: {
    height: number;
    width: number;
  };
};

