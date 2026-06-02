import { MessageCircleMore } from "lucide-react";
import type { OrderDto } from "../types/OrderCommission";
import { formatDate } from "../helper/date";
import { formatCurrency } from "../helper/currency";
import { orderPaymentStatusBadge, orderStatusBadge } from "./order-status-badge";
import ContactModal from "./contact-modal";
import { useState } from "react";

type OrderTableProps = {
  orders: OrderDto[];
  onClickOrder?: (dto: OrderDto) => void;
}

export function OrderTable({orders, onClickOrder}: OrderTableProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
    <table className="w-full border-separate border-spacing-y-3">
      <thead>
        <tr className="text-left text-xs font-semibold text-black">
          <th className="px-4">Commission</th>
          <th>Status</th>
          <th>Submitted</th>
          <th>Deadline</th>
          <th>Price</th>
          <th>Payment Status</th>
          <th>Applicant</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {orders.map((order) => (
          <tr
            key={order.id}
            className="shadow-sm hover:shadow-md transition rounded-2xl "
          >
            <td className="px-4 py-3 bg-transparent">
              <div className="flex items-center gap-4">
                <img
                  src={order.product?.pictureUrls?.[0]}
                  className="h-16 w-28 rounded-xl object-cover"
                />

                <div>
                  <h2 className="text-sm font-medium">
                    {order.username + "'s " + order.product.title + " Request"}
                  </h2>

                  <p className="text-xs text-gray-400">
                    #{order.requestNumberId}
                  </p>
                </div>
              </div>
            </td>

            <td>
              <span className={`rounded-xl ${orderStatusBadge(order.status)} px-3 py-1 text-xs`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </td>

            <td className="text-sm">
              {formatDate(order.createdAt)}
            </td>

            <td className="text-sm">
              {formatDate(order.proposedDeadline)}
            </td>

            <td className="text-sm">
              {formatCurrency(
                order.price,
                order.currencyCode
              )}
            </td>

            <td className="text-sm">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  orderPaymentStatusBadge(order.paidStatus)
                }`}
              >
                {order.paidStatus}
              </span>
            </td>
            <td>
              <p className="text-xs">@{order.username}</p>
              <p className="text-xs text-gray-400">
                {order.email}
              </p>
            </td>


            <td className="rounded-r-2xl">
            <button 
              onClick={() => onClickOrder ? onClickOrder(order) : {}}
              className="rounded-xl bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition" > 
              Detail
            </button>
            </td>

            <td>
              <button
                 onClick={() => setIsContactOpen(true)}
                className="rounded-xl p-2 hover:text-gray-400 transition"
              >
                <MessageCircleMore size={22} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {isContactOpen && (
      <ContactModal
        onClose={() => setIsContactOpen(false)}
      />
    )}
</>

  )
}

