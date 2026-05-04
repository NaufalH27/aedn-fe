import { useState } from "react";
import type { Product } from "../types/Products";

// user facing
export function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = product.pictureUrls?.length > 0 ? product.pictureUrls : ["/static/placeholder.jpg"];
  const isClosed = !product.isActive;

    // TODO: implement bookmark handler
    const handleBookmark = (id: string) => {
        console.info("TODO: handle bookmark " + id)
    };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % images.length);
  };

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white overflow-hidden transition grid grid-rows-[1fr_auto] shadow-sm
        ${isClosed ? "opacity-60 cursor-not-allowed" : "hover:border-black hover:shadow-md cursor-pointer"}`}
    >
      {/* Image area */}
      <div className="relative w-full h-52 overflow-hidden group">
        {/* Gradient background fill */}
        <div
          className="absolute inset-0 scale-110 blur-xl brightness-75"
          style={{
            backgroundImage: `url(${images[imgIndex]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Actual image centered */}
        <img
          src={images[imgIndex]}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-contain z-10"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/static/placeholder.jpg";
          }}
        />

        {isClosed && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="bg-white/90 rounded-xl px-6 py-3 border border-gray-300 shadow">
              <span className="text-sm font-semibold tracking-widest text-gray-700 uppercase">Closed</span>
            </div>
          </div>
        )}

        {images.length > 1 && !isClosed && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7L9 3" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3L9 7L5 11" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        <div className="absolute top-0 right-3 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBookmark(String(product.id));
            }}
            className={`flex flex-col items-center pt-1.5 pb-2.5 px-2.5 rounded-b-full shadow-md transition-all
              ${product.isBookmarked ? "bg-black text-white" : "bg-white/90 text-gray-600 hover:bg-black hover:text-white"}`}
            style={{ minHeight: 56 }}
            title={product.isBookmarked ? "Bookmarked" : "Bookmark"}
          >
            <span className="w-1 h-1 rounded-full bg-current mb-0.5 opacity-30" />
            <span className="w-1 h-1 rounded-full bg-current mb-1 opacity-50" />
            <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
              <path
                d="M1.5 2C1.5 1.44772 1.94772 1 2.5 1H12.5C13.0523 1 13.5 1.44772 13.5 2V15.382C13.5 15.7607 13.0724 15.9888 12.7764 15.7635L7.5 11.882L2.22361 15.7635C1.92764 15.9888 1.5 15.7607 1.5 15.382V2Z"
                fill={product.isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>

        {/* Image dots indicator */}
        {images.length > 1 && product.isActive && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1 opacity-0 group-hover:opacity-100">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition ${i === imgIndex ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-tight line-clamp-1">{product.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            From {product.currencyCode ?? "$"}{product.price}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isClosed) onClick();
          }}
          disabled={isClosed}
          className="shrink-0 px-3 py-2 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Request Now
        </button>
      </div>
    </div>
  );
}
