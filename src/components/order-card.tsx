import { Link } from "react-router-dom";
import type { OrderDto } from "../types/OrderCommission";
import { formatCurrency } from "../helper/currency";
import { ChevronRight } from "lucide-react";
import { orderPaymentStatusBadge, orderStatusBadge } from "./order-status-badge";
import { formatDate } from "../helper/date";

type CardProps = {
  order: OrderDto;
};

export function OrderCard({ order }: CardProps) {
  const productImage = order.product.pictureUrls?.[0];

  return (
    <div>
      <Link
        to={`/commissions/${order.product.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mv-5 mh-5 flex items-center gap-4 rounded-2xl bg-gray-50 border-gray-100 border p-3 mb-5 transition hover:bg-gray-100"
      >
        <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-200">
          {productImage ? (
            <img
              src={productImage}
              alt={order.product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900">
            {order.product.title}
          </p>
          <p className="text-sm text-gray-500">
            {formatCurrency(order.product.price, order.product.currencyCode)}
          </p>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400" />
      </Link>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Request</p>
          <h2 className="text-lg font-semibold text-gray-900">
            #{order.requestNumberId}
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${orderStatusBadge(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Username" value={order.username} />
        <Info label="Email" value={order.email} />
        <Info label={<>Agreed Price {order.price !== order.proposedPrice && (<span className="text-red-400"> *</span>)}</>} value={formatCurrency(order.price, order.currencyCode)}/>
        <Info label={<>Agreed Deadline {order.deadline !== order.proposedDeadline && (<span className="text-red-400"> *</span>)}</>} value={formatDate(order.deadline)}/>
        <Info
          label="Payment Status"
          value={
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${ orderPaymentStatusBadge(order.paidStatus)}`}
            >
              {order.paidStatus}
            </span>
          }
        />
        <Info label="Paid At" value={order.paidAt ? formatDate(order.paidAt) : "-"} />
      </div>
      {order.price === order.proposedPrice || order.deadline !== order.proposedDeadline && (
        <p className="text-sm text-gray-500 mt-4">
          Note: <span className="text-red-400">*</span> indicates the value has changed from the proposed value that client requests.
        </p>
      )}


      <div className="mb-5 mt-5 rounded-xl bg-gray-50 p-4">
        <p className="mb-1 text-xs font-medium text-gray-500">Extra Info</p>
        <p className="text-sm text-gray-800">{order.extraInfo === "" || !order.extraInfo ? "-" : order.extraInfo}</p>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: React.ReactNode;
  value?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="break-words text-gray-900">{value ?? "-"}</p>
    </div>
  );
}
