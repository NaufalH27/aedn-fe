import { MessageCircleMore } from "lucide-react";
import { formatCurrency } from "../helper/currency";
import { formatDate } from "../helper/date";
import type { RequestDto } from "../types/RequestCommission";
import { requestStatusBadge } from "./request-status-badge";
import ContactModal from "./contact-modal";
import { useState } from "react";

type RequestTableProps = {
  requests: RequestDto[];
  onClickRequest?: (dto: RequestDto) => void;
}

export function RequestTable({requests, onClickRequest}: RequestTableProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <>
    <table className="w-full border-separate border-spacing-y-3">
      <thead>
        <tr className="text-left text-xs font-semibold text-black">
          <th className="px-4">Commission</th>
          <th>Status</th>
          <th>Submitted</th>
          <th>Proposed Deadline</th>
          <th>Proposed Price</th>
          <th>Applicant</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr
            key={request.id}
            className="shadow-sm hover:shadow-md transition rounded-2xl "
          >
            <td className="px-4 py-3 bg-transparent">
              <div className="flex items-center gap-4">
                <img
                  src={request.product?.pictureUrls?.[0]}
                  className="h-16 w-28 rounded-xl object-cover"
                />

                <div>
                  <h2 className="text-sm font-medium">
                    {request.user.username + "'s " + request.product.title + " Request"}
                  </h2>

                  <p className="text-xs text-gray-400">
                    #{request.requestNumberId}
                  </p>
                </div>
              </div>
            </td>

            <td>
              <span className={`rounded-xl ${requestStatusBadge(request.status)} px-3 py-1 text-xs`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </td>

            <td className="text-sm">
              {formatDate(request.createdAt)}
            </td>

            <td className="text-sm">
              {formatDate(request.proposedDeadline)}
            </td>

            <td className="text-sm">
              {formatCurrency(
                request.proposedPrice,
                request.currencyCode
              )}
            </td>

            <td>
              <p className="text-xs">@{request.username}</p>
              <p className="text-xs text-gray-400">
                {request.email}
              </p>
            </td>


            <td className="rounded-r-2xl">
            <button 
              onClick={() => onClickRequest ? onClickRequest(request) : {}}
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
