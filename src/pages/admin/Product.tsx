import { useEffect, useMemo, useState } from "react";
import { getAllProducts, deleteProduct } from "../../services/ProductService";
import type { Product } from "../../types/Products";
import ProductForm from "./ProductForm";

type Status = "idle" | "loading" | "success" | "error";

export default function ProductPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [confirmClose, setConfirmClose] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this commission?")) {
      try {
        await deleteProduct(id);
        await handleGetAll();
      } catch (err) {
        alert("Failed to delete commission.");
      }
    }
  };

  const handleGetAll = async () => {
    setStatus("loading");
    setError(null);

    try {
      var data = await getAllProducts();

      data.sort((a, b) => Number(b.isActive) - Number(a.isActive));
      setProducts(data);
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
    const names = products
      .map((p) => p.category?.name?.trim())
      .filter((name): name is string => !!name);

    if (names.length === 0) return [];

    return ["All", ...Array.from(new Set(names))];
  }, [products]);


  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;

    return products.filter(
      (product) => product.category?.name === selectedCategory
    );
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Your Comissions
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
            <p>Comission</p>
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
                ${active
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

      {status === "success" && filteredProducts.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400">
          No products found.
        </div>
      )}

      {status === "success" && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`text-left rounded-2xl border border-gray-200 bg-white hover:border-black hover:shadow-sm transition min-h-70 grid grid-rows-[5fr_3fr] overflow-hidden ${!product.isActive ? "opacity-60" : ""}`}
            >

              <div className="relative p-4">
                <img
                  src={product.pictureUrls[0] ?? "/static/placeholder.jpg"}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/static/placeholder.jpg";
                  }}
                />
                <div className="relative flex justify-between flex-row-reverse mb-6">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${product.isActive ? "bg-gray-100 text-black" : "bg-gray-200 text-black"
                    }`}>
                    {product.isActive ? "Open" : "Closed"}
                  </span>

                  {product?.category?.name && (
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100">
                      {product.category.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-start pl-5 pr-5 pt-3 pb-4">
                <div>
                  <h2 className="text-lg font-semibold line-clamp-1">
                    {product.title}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Start from ${product.price}
                  </p>
                </div>
                
                <div className="flex gap-1 -mt-1 -mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDelete(product.id, e)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {openCreateModal && (
        <Modal onClose={() => setConfirmClose(true)} title="Create New Comission" size="full">
          <div
            className={`w-full max-h-[90vh] overflow-y-auto`}
          >
            <ProductForm
              categories={categories.filter((c) => c !== "All")}
              onSuccess={async () => {
                setOpenCreateModal(false);
                await handleGetAll();
              }}>
            </ProductForm>
          </div>
        </Modal>
      )}

      {selectedProduct && (
        <Modal
          onClose={() => setConfirmClose(true)}
          title={"Edit's " + selectedProduct.title}
          size="full"
        >
          <div
            className={`w-full max-h-[90vh] overflow-y-auto`}
          >
            <ProductForm
              edit={true}
              categories={categories.filter((c) => c !== "All")}
              data={{
                id: selectedProduct.id,
                title: selectedProduct.title,
                price: selectedProduct.price.toString(),
                currencyCode: selectedProduct.currencyCode,
                description: selectedProduct.description,
                categoryName: selectedProduct.category?.name ?? "",
                pictureUrls: selectedProduct.pictureUrls,
                isActive: selectedProduct.isActive,
              }}
              onSuccess={async () => {
                setSelectedProduct(null);
                await handleGetAll();
              }}>
            </ProductForm>
          </div>
        </Modal>
      )}
      {confirmClose && (
        <Modal
          title="Discard changes?"
          size="sm"
          onClose={() => setConfirmClose(false)}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your changes will be lost. Are you sure you want to close?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmClose(false)}
                className="px-4 py-2 border rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setConfirmClose(false);
                  setSelectedProduct(null);
                  setOpenCreateModal(false)
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

function Modal({
  title,
  children,
  onClose,
  size = "md",
}: ModalProps) {
  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5 rounded">
      <div
        className={`w-full ${sizeClass[size]} bg-white rounded-2xl flex flex-col max-h-[90vh] p-5`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="w-10 h-10 hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}