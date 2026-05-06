import { useState, useEffect, useMemo } from "react";
import type { Product } from "../../types/Products";
import { getAllProducts } from "../../services/ProductService";
import { ProductCard } from "../../components/product-card";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/breadcrumbs";


export default function UserPage() {
  let nav = useNavigate()
  const [status, setStatus] = useState("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleGetAll = async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await getAllProducts();
      data.sort((a, b) => Number(b.isActive) - Number(a.isActive));
      setProducts(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
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
    return products.filter((p) => p.category?.name === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div>
      <Breadcrumbs/>
      <div className="min-h-screen bg-white text-black p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Commissions</h1>
            <p className="text-sm text-gray-500 mt-1">Browse and request from open commissions</p>
          </div>
        </div>

        {categories.length > 0 && (
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
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl border border-gray-200 animate-pulse bg-gray-100" />
            ))}
          </div>
        )}

        {status === "error" && (
          <button onClick={handleGetAll} className="px-5 py-2 bg-black text-white rounded-xl">
            Retry
          </button>
        )}

        {status === "success" && filteredProducts.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400">
            No commissions found.
          </div>
        )}

        {status === "success" && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => nav(`/commissions/${product.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
