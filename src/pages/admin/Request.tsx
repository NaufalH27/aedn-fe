import { useEffect, useState } from "react";
import { RequestStatusList, type RequestDto, type RequestStatus } from "../../types/RequestCommission";
import { getAllRequest, proceedRequest, rejectRequest } from "../../services/RequestCommissionService";
import Modal from "../../components/modal";
import { ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmModal from "../../components/confirm-modal";
import { LoadingModal } from "../../components/loading-modal";
import { useToast } from "../../components/toast";
import { RequestTable } from "../../components/request-table";
import { RequestCard } from "../../components/request-card";
import { CreateOrderForm } from "../../components/create-order-form";


type FetchState =
  | { status: "loading" }
  | { status: "success"; data: RequestDto[] }
  | { status: "error"; error: string };

type ChangeStatusState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "loading" }
  | { status: "error"; error: string };

const sortOrder: Record<RequestStatus, number> = {
  pending: 0,
  proceed: 1,
  confirmed: 2,
  cancelled:3, 
  rejected: 4,
};

export default function RequestPage() {
  const [state, setState] = useState<FetchState>({status: "loading",});
  const [changeStatusState, setChangeStatusState] = useState<ChangeStatusState>({status: "idle",});
  const [selectedRequest, setSelectedRequest] = useState<RequestDto | null>(null)
  const [activeTab, setActiveTab] = useState<"All" | RequestStatus>("All");
  const [proceedModal, setProceedModal] = useState<boolean>(false)
  const [rejectModal, setRejectModal] = useState(false)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams();

  const item = searchParams.get("item");

  const [orderForm, setOrderForm] = useState<boolean>(false)

  const filteredRequests =
  state.status === "success"
    ? state.data
        .filter((request) =>
          activeTab === "All" ? true : request.status === activeTab
        )
        .sort((a, b) => sortOrder[a.status] - sortOrder[b.status])
    : [];

  const handleGetAll = async () => {
    setState({ status: "loading" });

    try {
      const data = await getAllRequest();
      setState({ status: "success", data });
      if (item) {
        const select = data.find(x => x.id === item);
        if (select) {
          setSelectedRequest(select)
        } else {
          showToast("error", "Item Not Found")
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";

      setState({ status: "error", error: message });
    }
  };

  useEffect(() => {
    handleGetAll();
  }, []);


  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (selectedRequest) {
      params.set("item", selectedRequest.id);
    } else {
      params.delete("item");
    }

    const nextSearch = params.toString();
    const currentSearch = searchParams.toString();

    if (nextSearch !== currentSearch) {
      navigate(`?${nextSearch}`, { replace: true });
    }
  }, [selectedRequest, searchParams, navigate]);

  const { showToast } = useToast();

  const handleChangeStatus = async(reqStatus: RequestStatus, requestId: string) => {
    try {
      setChangeStatusState({status: "loading"})
      switch (reqStatus) {
        case "pending":
          showToast("error", "pending is invalid transition. nothing to do")
          break

        case "proceed":
          await proceedRequest(requestId)
          showToast("success", "Request Proceed successfully!")
          setChangeStatusState({status: "success"})
          break

        case "rejected":
          await rejectRequest(requestId)
          setChangeStatusState({status: "success"})
          showToast("success", "Request rejected successfully!")
          break

        case "cancelled":
          showToast("error", "Admin Cant Cancel Order")
          break

        case "confirmed":
          showToast("error", "wrong execute path")
          break

        default: {
          const exhaustiveCheck: never = reqStatus;
          return exhaustiveCheck;
        }
      }
      setSelectedRequest(null)
      await handleGetAll()

    } catch (err) {
      let message = err instanceof Error ? err.message : "Unknown error"
      showToast("error", message)

    } finally {
      setChangeStatusState({status: "idle"})
      setProceedModal(false)
      setRejectModal(false)
    }

  }

  return (
    <div className="min-h-screen px-6 py-8">
      <h1 className="text-4xl font-normal tracking-tight text-black">
        My Requests
      </h1>
      <div className="mt-10 flex gap-6 border-b border-gray-200 text-sm font-semibold">
        {(["All", ...RequestStatusList] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 transition ${
              tab === activeTab
                ? "border-b border-black text-black"
                : "text-gray-400 hover:text-black"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {state.status === "loading" && (
        <div className="p-6 text-sm text-gray-500">Loading requests...</div>
      )}

      {state.status === "error" && (
        <>
        <div className="p-6 text-sm text-red-500">{state.error}</div>
          <button onClick={handleGetAll} className="px-5 py-2 bg-black text-white rounded-xl">
            Retry
          </button>
        </>
      )}
      
      {state.status === "success" && (
        <>
          <RequestTable onClickRequest={setSelectedRequest}  requests={filteredRequests}/>
          {state.data.length === 0 && (
            <div className="w-full  h-100  justify-center flex content-center pt-30">
              <span> No Request Found </span>
            </div>

          )}
        </>
      )}


      {selectedRequest && (
        <Modal
          onClose={() => {
             setOrderForm(false)
             setSelectedRequest(null) 
          }}
          title={`${selectedRequest.username}'s ${selectedRequest.product.title} Request`}
          size="xl"
        >
          <div className={`relative w-full max-h-[90vh] overflow-y-auto px-2`}>
            <RequestCard request={selectedRequest} />
            {!orderForm && (
              <div className="mt-4 w-full flex items-center justify-end gap-3">
                {!(selectedRequest.status === "rejected" || selectedRequest.status === "confirmed" || selectedRequest.status === "cancelled") && (
                  <button 
                    onClick={() => setRejectModal(true)}
                    className="rounded-xl bg-red-500 px-6 py-3 text-sm font-medium text-white hover:bg-red-400 transition" > 
                    Reject
                  </button>
                )}
                {selectedRequest.status === "rejected" && (
                  <p className="text-sm">The Request Already Rejected</p>
                )}
                {selectedRequest.status === "cancelled" && (
                  <p className="text-sm">The Request Already Cancelled</p>
                )}
                {(selectedRequest.status === "proceed") && (
                  <button 
                    onClick={() => setOrderForm(true)}
                    className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition" > 
                    Create Order
                  </button>
                )}
                {(selectedRequest.status === "pending") && (
                  <button 
                    onClick={() => setProceedModal(true)}
                    className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition" > 
                    Proceed
                  </button>
                )}
                {selectedRequest.status === "confirmed" && (
                  <>
                  <p className="text-md">Order has been created for this request</p>
                  <button 
                    onClick={() => {
                      if (selectedRequest.orderSummary) {
                        navigate(`?tabs=Order&item=${selectedRequest.orderSummary.id}`,)
                      } else {
                        showToast("error", "Malformed Data: Order id not found")
                      }
                    }}
                    className="rounded-xl bg-black px-6 py-3 text-sm font-medium flex text-center text-white hover:bg-gray-800 transition" > 
                    Check Order 
                    <ChevronRight size={20}/>
                  </button>
                  </>
                )}
              </div>

            )}
            {orderForm && (
              <CreateOrderForm request={selectedRequest} onClose={() => setOrderForm(false)} onSuccess={() => {
                setSelectedRequest(null)
                setOrderForm(false)
                handleGetAll()
              }}/>
            )}
          </div>
        </Modal>
      )}

      {changeStatusState.status === "loading" && (
        <LoadingModal open={changeStatusState.status === "loading"} />
      )}

      {selectedRequest && (
        <>
        {proceedModal && (
          <>
          {selectedRequest.status === "pending" && (
            <ConfirmModal
              open={proceedModal}
              title="Proceed Request"
              description="Do you want to proceed this request? (initial sketch and negotiate)"
              confirmText="Proceed"
              onCancel={() => setProceedModal(false)}
              onConfirm={() => {
               handleChangeStatus("proceed", selectedRequest.id) 
              }}
            />
          )}
          </>
        )}
        {rejectModal && (
          <ConfirmModal
            open={rejectModal}
            title="Reject Request"
            description="Do you want to reject this request?"
            confirmClassName="bg-red-500 text-white"
            confirmText="Reject"
            onCancel={() => setRejectModal(false)}
            onConfirm={() => {
              handleChangeStatus("rejected", selectedRequest.id) 
            }}
          />
        )}
        </>
      )}
    </div>
  );
}

