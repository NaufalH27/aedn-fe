import type { RequestStatus } from "../types/RequestCommission";

export function requestStatusBadge(status?: RequestStatus | null) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "proceed":
      return "bg-blue-100 text-blue-700";
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
