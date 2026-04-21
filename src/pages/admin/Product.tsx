import { useEffect, useMemo, useState } from "react";
import { getAllProducts } from "../../services/ProductService";
import type { Product } from "../../types/Products";
import CreateProductForm from "./CreateProductForm";

type Status = "idle" | "loading" | "success" | "error";

export default function ProductPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);



  const handleGetAll = async () => {
    setStatus("loading");
    setError(null);

    try {
      var data = await getAllProducts();
      for (const d of data) {
        if (d.pictureUrls.length === 0) {
            d.pictureUrls = [
              "https://upload-os-bbs.hoyolab.com/upload/2025/06/22/17138284/4329c2edf6213b9ad1c9a605afd366a6_4185052829146806197.jpeg"
            ];

        }
      }

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
          No products found.
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

            <div className="bg-cover bg-center bg-no-repeat p-4"
              style={{
                backgroundImage: `url(${product.pictureUrls[0]})`,
              }}
            >
              <div className="flex justify-between  flex-row-reverse mb-6">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    product.isActive ? "bg-gray-100 text-black" : "text-black bg-gray-200"
                  }`}
                >
                  {product.isActive ? "Open" : "Closed"}
                </span>

                {!product?.category || product?.category.name !== ""  && (
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100">
                      {product.category?.name}
                    </span>

                ) }

              </div>
            </div>

            <div className="pl-5 pt-3">
              <h2 className="text-lg font-semibold line-clamp-1">
                {product.title}
              </h2>

              <p className="text-gray-400">
                Start from ${product.price}
              </p>
            </div>

            </div>
          ))}
        </div>
      )}

      {openCreateModal && (
        <Modal onClose={() => setOpenCreateModal(false)} title="Create New Comission" size="lg">
        <div
          className={`w-full max-h-[90vh] overflow-y-auto rounded-3xl`}
          >
        <CreateProductForm
        categories={categories.filter((c) => c !== "All")}
         onSuccess={async () => {
          setOpenCreateModal(false);
          await handleGetAll();
        }}>
        </CreateProductForm>
          </div>
        </Modal>
      )}

      {selectedProduct && (
        <Modal
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.title}
        >
          <div className="h-72 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
            Blank Canvas
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">
      <div
        className={`w-full ${sizeClass[size]} rounded-3xl bg-white p-6 shadow-2xl`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
