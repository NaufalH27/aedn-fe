import { useNavigate } from "react-router-dom";
import type { RequestDto } from "../types/RequestCommission";
import { formatCurrency } from "../helper/currency";
import { ChevronRight } from "lucide-react";
import { requestStatusBadge } from "./request-status-badge";
import { formatDate } from "../helper/date";

type RequestProps = {
  request: RequestDto;
};

export function RequestCard({ request }: RequestProps) {
  const productImage = request.product.pictureUrls?.[0];
  const navigate = useNavigate()

  return (
    <div>
      <div
        onClick={() => navigate(`/commissions/${request.product.id}`)}
        className="mv-5 mh-5 flex items-center gap-4 rounded-2xl bg-gray-50 border-gray-100 border p-3 mb-5 transition hover:bg-gray-100"
      >
        <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-200">
          {productImage ? (
            <img
              src={productImage}
              alt={request.product.title}
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
            {request.product.title}
          </p>
          <p className="text-sm text-gray-500">
            {formatCurrency(request.product.price, request.product.currencyCode)}
          </p>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Request</p>
          <h2 className="text-lg font-semibold text-gray-900">
            #{request.requestNumberId}
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${requestStatusBadge(
            request.status
          )}`}
        >
          {request.status}
        </span>
      </div>

      <div className="mb-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Username" value={request.username} />
        <Info label="Email" value={request.email} />
        <Info label="Proposed Price" value={formatCurrency(request.proposedPrice, request.currencyCode)} />
        <Info label="Proposed Deadline" value={formatDate(request.proposedDeadline)} />
        <Info label="Created At" value={formatDate(request.createdAt)} />
      </div>

      <div className="mb-5 rounded-xl bg-gray-50 p-4">
        <p className="mb-1 text-xs font-medium text-gray-500">Extra Info</p>
        <p className="text-sm text-gray-800">{request.extraInfo === "" || !request.extraInfo ? "-" : request.extraInfo}</p>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="break-words text-gray-900">{value ?? "-"}</p>
    </div>
  );
}
