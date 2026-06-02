import { useEffect, useMemo, useState } from "react";
import { getAllProducts, deleteProduct } from "../../services/ProductService";
import type { Product } from "../../types/Products";
import ProductForm from "./CommissionForm";
import Modal from "../../components/modal";
import ConfirmModal from "../../components/confirm-modal";
import { formatCurrency } from "../../helper/currency";
import CommissionForm from "./CommissionForm";
import { useToast } from "../../components/toast";

type Status = "idle" | "loading" | "success" | "error";

export default function CommissionPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [commissions, setCommissions] = useState<Product[]>([]);
  const [confirmClose, setConfirmClose] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Product | null>(
    null
  );
  
  const {showToast} = useToast()

  const handleDelete = (comm: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(comm);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await deleteProduct(deleteTarget.id);
      await handleGetAll();
      showToast("success", "Successfully deleted commission!");
      setDeleteTarget(null);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown Error";
      showToast("error", errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGetAll = async () => {
    setStatus("loading");
    setError(null);

    try {
      const data = await getAllProducts();

      data.sort((a, b) => Number(b.isActive) - Number(a.isActive));
      setCommissions(data);
      setStatus("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("error");
    }
  };

  useEffect(() => {
    handleGetAll();
  }, []);

  const categories = useMemo(() => {
    const names = commissions
      .map((commission) => commission.category?.name?.trim())
      .filter((name): name is string => !!name);

    if (names.length === 0) return [];

    return ["All", ...Array.from(new Set(names))];
  }, [commissions]);

  const filteredCommissions = useMemo(() => {
    if (selectedCategory === "All") return commissions;

    return commissions.filter(
      (commission) => commission.category?.name === selectedCategory
    );
  }, [commissions, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Your Commissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ayo open komis puh sepuh
          </p>
        </div>

        <button
          onClick={() => setOpenCreateModal(true)}
          className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 hover:cursor-pointer transition-colors duration-200"
        >
          <div className="flex gap-2">
            <p>+</p>
            <p>New Commission</p>
          </div>
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 mb-8">
        {categories.map((category) => {
          const active = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition
                ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-300 hover:border-black"
                }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      {status === "loading" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl border border-gray-200 animate-pulse bg-gray-100"
            />
          ))}
        </div>
      )}

      {status === "error" && (
        <button
          onClick={handleGetAll}
          className="px-5 py-2 bg-black text-white rounded-xl"
        >
          Retry
        </button>
      )}

      {status === "success" && filteredCommissions.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400">
          No Commission found.
        </div>
      )}

      {status === "success" && filteredCommissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCommissions.map((commission) => (
            <div
              key={commission.id}
              onClick={() => setSelectedCommission(commission)}
              className={`text-left rounded-2xl border border-gray-200 bg-white hover:border-black hover:shadow-sm transition min-h-70 grid grid-rows-[5fr_3fr] overflow-hidden ${
                !commission.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="relative p-4">
                <img
                  src={commission.pictureUrls[0] ?? "/static/placeholder.jpg"}
                  alt={commission.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/static/placeholder.jpg";
                  }}
                />
                <div className="relative flex justify-between flex-row-reverse mb-6">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      commission.isActive
                        ? "bg-gray-100 text-black"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {commission.isActive ? "Open" : "Closed"}
                  </span>

                  {commission?.category?.name && (
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100">
                      {commission.category.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-start pl-5 pr-5 pt-3 pb-4">
                <div>
                  <h2 className="text-lg font-semibold line-clamp-1">
                    {commission.title}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Start From{" "}
                    {formatCurrency(
                      commission.price,
                      commission.currencyCode
                    )}
                  </p>
                </div>

                <div className="flex gap-1 -mt-1 -mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCommission(commission);
                    }}
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={(e) => handleDelete(commission, e)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          open={!!deleteTarget}
          title="Delete commission?"
          description={`"${deleteTarget.title}" will be permanently deleted. This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          confirmClassName="bg-red-500 text-white disabled:opacity-60"
          onCancel={() => {
            if (!isDeleting) setDeleteTarget(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {openCreateModal && (
        <Modal
          onClose={() => setConfirmClose(true)}
          title="Create New Commission"
          size="full"
        >
          <div className="w-full max-h-[90vh] overflow-y-auto">
            <ProductForm
              categories={categories.filter((category) => category !== "All")}
              onSuccess={async () => {
                setOpenCreateModal(false);
                await handleGetAll();
              }}
            />
          </div>
        </Modal>
      )}

      {selectedCommission && (
        <Modal
          onClose={() => setConfirmClose(true)}
          title={"Edit's " + selectedCommission.title}
          size="full"
        >
          <div className="w-full max-h-[90vh] overflow-y-auto">
            <CommissionForm
              edit={true}
              categories={categories.filter((category) => category !== "All")}
              data={{
                id: selectedCommission.id,
                title: selectedCommission.title,
                price: selectedCommission.price.toString(),
                currencyCode: selectedCommission.currencyCode,
                description: selectedCommission.description,
                categoryName: selectedCommission.category?.name ?? "",
                pictureUrls: selectedCommission.pictureUrls,
                isActive: selectedCommission.isActive,
              }}
              onSuccess={async () => {
                setSelectedCommission(null);
                await handleGetAll();
              }}
            />
          </div>
        </Modal>
      )}

      {confirmClose && (
        <ConfirmModal
          open={confirmClose}
          title="Discard changes?"
          description="Your changes will be lost. Are you sure you want to close?"
          confirmText="Discard"
          confirmClassName="bg-red-500 text-white"
          onCancel={() => setConfirmClose(false)}
          onConfirm={() => {
            setConfirmClose(false);
            setSelectedCommission(null);
            setOpenCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
