import type { OrderStatus, PaymentStatus } from "../types/OrderCommission";

export function orderStatusBadge(status?: OrderStatus | null) {
  switch (status) {
    case "pending_payment":
      return "bg-yellow-100 text-yellow-700";
    case "in_progress":
      return "bg-blue-100 text-blue-700";
    case "done":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function orderPaymentStatusBadge(status?: PaymentStatus | null) {
  switch (status) {
    case "skipped":
      return "bg-yellow-100 text-yellow-700";
    case "paid":
      return "bg-green-100 text-green-700";
    case "unpaid":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
