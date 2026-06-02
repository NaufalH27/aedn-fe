import { useEffect, useState } from "react";
import { OrderStatusList, type DrawingProgressPreviewDto, type OrderDto, type OrderStatus } from "../../types/OrderCommission";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/toast";
import { getMyOrder, getOrderDrawingProgress } from "../../services/OrderCommissionService";
import Modal from "../../components/modal";
import { OrderTable } from "../../components/order-table";
import { OrderCard } from "../../components/order-card";
import { OrderDrawing, OrderDrawingSkeleton } from "../../components/order-drawing-progress";
import { PaymentForm } from "../../components/payment-form";


type FetchState =
  | { status: "loading" }
  | { status: "success"; data: OrderDto[] }
  | { status: "error"; error: string };

type FetchDrawingProgressState =
  | { status: "loading" }
  | { status: "idle" }
  | { status: "success"; data: DrawingProgressPreviewDto[] }
  | { status: "error"; error: string };

const sortOrder: Record<OrderStatus, number> = {
  in_progress: 0,
  pending_payment: 1,
  done: 2,
  cancelled: 3,
};


export default function OrderPage() {
  const [state, setState] = useState<FetchState>({status: "loading",});
  const [drawingProgressState, setDrawingProgressState] = useState<FetchDrawingProgressState>({status: "idle",});
  const [activeTab, setActiveTab] = useState<"All" | OrderStatus>("All");
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const {showToast} = useToast();

  const item = searchParams.get("item");

  useEffect(() => {

    const params = new URLSearchParams(searchParams);

    if (selectedOrder) {
      params.set("item", selectedOrder.id);
    } else {
      params.delete("item");
    }

    const nextSearch = params.toString();
    const currentSearch = searchParams.toString();

    if (nextSearch !== currentSearch) {
      navigate(`?${nextSearch}`, { replace: true });
    }
  }, [selectedOrder, searchParams, navigate]);

  useEffect(() => {
    if (selectedOrder) {
      handleGetDrawingProgress(selectedOrder.id)
    } else {
      setDrawingProgressState({status: "idle"})
    }
  }, [selectedOrder])

  const filteredOrder =
  state.status === "success"
    ? state.data
        .filter((order) =>
          activeTab === "All" ? true : order.status === activeTab
        )
        .sort((a, b) => sortOrder[a.status] - sortOrder[b.status])
    : [];


  const handleGetAll = async () => {
    setState({ status: "loading" });
    try {
      const data = await getMyOrder();
      setState({ status: "success", data });
      if (item) {
        const select = data.find(x => x.id === item);
        if (select) {
          setSelectedOrder(select)
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

  const handleGetDrawingProgress = async(orderId: string) => {
    setDrawingProgressState({ status: "loading" });
    try {
      const data = await getOrderDrawingProgress(orderId);

      setDrawingProgressState({ status: "success", data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      setState({ status: "error", error: message });
    }
  }

  useEffect(() => {
    handleGetAll()
  }, [])

  return (
    <div className="min-h-screen px-6 py-8">
      <h1 className="text-4xl font-normal tracking-tight text-black">
        My Order
      </h1>
      <div className="mt-10 flex gap-6 border-b border-gray-200 text-sm font-semibold">
        {(["All", ...OrderStatusList] as const).map((tab) => (
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
        <div className="p-6 text-sm text-gray-500">Loading Order...</div>
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
        <OrderTable orders={filteredOrder} onClickOrder={setSelectedOrder} />
        {state.data.length === 0 && (
          <div className="w-full  h-100  justify-center flex content-center pt-30">
            <span> No Order Found </span>
          </div>

        )}
        </>
      )}
      {selectedOrder && (
        <Modal
          onClose={() => setSelectedOrder(null)}
          title={`${selectedOrder.username}'s ${selectedOrder.product.title} Order`}
          size="xl"
        >
          <div className={`relative w-full max-h-[90vh] overflow-y-auto px-2`}>
            <OrderCard order={selectedOrder} />
          {drawingProgressState.status === "success" && (
            <OrderDrawing drawings={drawingProgressState.data}/>
          )}
          {drawingProgressState.status === "loading" && (
            <OrderDrawingSkeleton />
          )}
          {selectedOrder.status === "pending_payment" &&(
            <PaymentForm/>
          )}
          </div>
        </Modal>
      )}
    </div>
  )
}

