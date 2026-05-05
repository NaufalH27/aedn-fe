import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Product } from "../../types/Products";
import { getProductById } from "../../services/ProductService";
import LoadingPoage from "../../components/loading-page";
import ErrorState from "../../components/error-page";
import Breadcrumbs from "../../components/breadcrumbs";
import { formatCurrency } from "../../helper/currency";
import CommissionRequestForm from "../../components/request-form";
import { useAuthCheck } from "../../hooks/AuthCheck";
import useAuthStore from "../../store/AuthStore";
import type { AuthState } from "../../types/Auth";
import { LoadingIndicator } from "../../components/loading-indicator";
import ErrorRedBox from "../../components/error-red-box";

const DUMMY_TERMS = `
## Terms & Conditions

- Payment is required **upfront** before work begins. No refunds once the sketch phase is approved.
- You may use the final artwork for **personal use only** unless a commercial license is purchased.
- Estimated delivery is **14–21 business days** from payment confirmation.
- Up to **2 rounds of revisions** are included; additional revisions are billed separately.
- Artist retains the right to display the finished piece in their portfolio.
- By submitting a request you agree to these terms in full.
`;

const DUMMY_HOW_TO = `
## How to Request

1. **Review** the description and terms carefully.
2. **Tick** the acceptance checkbox on the right.
3. Click **Request Commission** — you'll be taken to the order form.
4. Fill in your details: character references, style notes, deadline preferences.
5. Wait for the artist to **confirm availability** (usually within 48 h).
6. Once confirmed, you'll receive a payment link to complete the order.
`;

export default function Commission() {
  const { status, error } = useAuthCheck();
  const { id } = useParams();
  const [imgIndex, setImgIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [expandRequestForm, setExpandRequestForm] = useState(false);
  const touchStartX = useRef<number | null>(null);
  type requestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "autheticated"; auth: AuthState }
  | { status: "unauthenticated" }
  const [reqState, setReqState] = useState<requestState>({ status: "idle" });
  type CommissionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Product };
  const [state, setState] = useState<CommissionState>({ status: "loading" });

  const handleGetData = async (id: string) => {
    setState({ status: "loading" });
    try {
      const result = await getProductById(id);
      setState({ status: "success", data: result });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleOnRequest = async() => {
    if (status === "loading") {
      setReqState({status: "loading"})
    } else if (status === "unauthenticated") {
      setReqState({status: "unauthenticated"})
    } else if (status === "unauthorized") {
      setReqState({status: "unauthenticated"})
    } else if (status === "error") {
      setReqState({status: "error", message: error ?? "Something Unexpected Happened, Please Try Again Later"})
    } else {
      const auth = useAuthStore.getState()
      if (auth.subject === null) {
        setReqState({status: "unauthenticated"})
      } else {
        setReqState({status:"autheticated", auth: auth})
        setExpandRequestForm(true)
      }
    }
  }

  useEffect(() => {
    if (!id) {
      setState({ status: "error", message: "ID is not provided in the URL" });
      return;
    }
    handleGetData(id);
  }, [id]);


  const prev = () => setImgIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setImgIndex((i) => (i + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  if (state.status === "loading") {
    return <LoadingPoage />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
      message={state.message}
      onRetry={id ? () => handleGetData(id) : undefined}
      />
    );
  }

  const data = state.data;

  const images =
    data?.pictureUrls && data.pictureUrls.length > 0
      ? data.pictureUrls
      : ["/static/placeholder.jpg"];

  const isClosed = !data.isActive;

  return (
    <div className={"min-h-screen bg-white text-black" + (isClosed ? " opacity-60" : "")}>
      <Breadcrumbs
        dynamicLabels={{
          [id ?? ""]: data?.title ?? id ?? "This Comission",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title row */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              {data.category?.name && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                  {data.category.name}
                </span>
              )}
              <span className="text-lg font-semibold text-gray-400">
                ☆☆☆☆☆ 0.0 (0)
              </span>
            </p>
          </div>
          {isClosed && (
            <span className="shrink-0 px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 text-xs font-semibold uppercase tracking-widest">
              Closed
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          <div className="space-y-8">

            <div>
              <div
                className="relative w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group"
                style={{ aspectRatio: "4/3" }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <div
                  className="absolute inset-0 scale-110 blur-2xl brightness-75"
                  style={{
                    backgroundImage: `url(${images[imgIndex]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <img
                  src={images[imgIndex]}
                  alt={`${data.title} — image ${imgIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-contain z-10"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/static/placeholder.jpg";
                  }}
                />

                {isClosed && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="bg-white/90 rounded-xl px-6 py-3 border border-gray-200 shadow">
                      <span className="text-sm font-semibold tracking-widest text-gray-700 uppercase">Closed</span>
                    </div>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 11L5 7L9 3" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3L9 7L5 11" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 z-20 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {imgIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        i === imgIndex
                          ? "border-black shadow-sm"
                          : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/static/placeholder.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <section>
              <div className="border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50">
                <h2 className="text-base font-semibold mb-3 border-b border-gray-100 pb-2 tracking-tight">
                  Description
                </h2>
                <div className="prose prose-sm prose-gray max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {data.description || "_No description provided._"}
                  </Markdown>
                </div>
              </div>
              <div className="prose prose-sm prose-gray max-w-none">
                <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                </Markdown>
              </div>
            </section>

          </div>

          {/* ── RIGHT: sticky request panel ──────────────────────────────── */}
          <div className="md:sticky md:top-6 space-y-4">
            {/* How to Request */}
            <section>
              <div className="border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50">
                <div className="prose prose-sm prose-gray max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {DUMMY_HOW_TO}
                  </Markdown>
                </div>
              </div>
            </section>

            {/* Terms & Conditions */}
            <section>
              <div className="border border-gray-200 rounded-2xl px-5 py-4">
                <div className="prose prose-sm prose-gray max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {DUMMY_TERMS}
                  </Markdown>
                </div>
              </div>
            </section>
            <div className="rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">

              {/* Price */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">
                  Starting price
                </p>
                <p className="text-3xl font-bold">
                  {formatCurrency(data.price, data.currencyCode)}
                </p>
                {data.quantity > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    * Add-ons Not Included
                  </p>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* T&C checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={accepted}
                    disabled={isClosed}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className={`sr-only ${
                      isClosed ? "bg-gray-100 text-gray-400" : ""
                    }`}
                  /> 
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      accepted
                        ? "bg-black border-black"
                        : "border-gray-300 group-hover:border-gray-500"
                    }`}
                  >
                    {accepted && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path
                          d="M1 4L4 7.5L10 1"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 leading-snug">
                  I have read and agree to the{" "}
                  <span className="font-medium text-black underline underline-offset-2 decoration-dotted">
                    Terms & Conditions
                  </span>
                </span>
              </label>

              {reqState.status === "error" && (
                <ErrorRedBox message={reqState.message}/>
              )}
              {reqState.status === "unauthenticated" && (
                <ErrorRedBox message="You need to Login to make a request commission"/>
              )}

              {/* Request button */}
              {!expandRequestForm && (
                <>
                <button
                  onClick={handleOnRequest}
                  disabled={!accepted || isClosed}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition ${
                    accepted && !isClosed
                      ? "bg-black text-white hover:bg-gray-800 shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {reqState.status === "loading" ? (
                    <LoadingIndicator />
                  ) : isClosed ? (
                    "Commission Closed"
                  ) : (
                    "Request Commission"
                  )}
                </button>
                {!accepted && !isClosed && (
                  <p className="text-xs text-gray-400 text-center -mt-2">
                    Accept the terms above to continue
                  </p>
                )}
                </>
              )}

              {expandRequestForm && reqState.status === "autheticated" && (
                <CommissionRequestForm authState={reqState.auth} product={state.data}/>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
