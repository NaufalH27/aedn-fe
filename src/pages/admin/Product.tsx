import { useEffect, useMemo, useState } from "react";
import { getAllProducts } from "../../services/ProductService";
import type { Product } from "../../types/Products";
import ProductForm from "./ProductForm";
import Modal from "../../components/modal";

type Status = "idle" | "loading" | "success" | "error";

export default function ProductPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [confirmClose, setConfirmClose] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);



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

      {status === "success" && filteredProducts.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400">
          No Comission found.
        </div>
      )}

      {status === "success" && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`text-left rounded-2xl border border-gray-200 bg-white hover:border-black hover:shadow-sm transition min-h-70 grid grid-rows-[5fr_3fr] overflow-hidden ${ !product.isActive ? "opacity-60" : "" }`}
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
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  product.isActive ? "bg-gray-100 text-black" : "bg-gray-200 text-black"
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

            <div className="pl-5 pt-3">
              <h2 className="text-lg font-semibold line-clamp-1">
                {product.title}
              </h2>

              <p className="text-gray-400">
                Start from {product.currencyCode}{product.price}
              </p>
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
            edit={ true }
            categories={categories.filter((c) => c !== "All")}
            data= {{
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

