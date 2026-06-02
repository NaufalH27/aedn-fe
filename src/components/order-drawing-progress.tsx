import { useState } from "react";
import type { DrawingProgressPreviewDto } from "../types/OrderCommission";
import { DownloadIcon, Eye } from "lucide-react";
import { getOrderDrawingDownloadUrl } from "../services/OrderCommissionService";
import { useToast } from "./toast";

type OrderDrawingProps = {
  drawings: DrawingProgressPreviewDto[];
};

const FINISHED_KEY = "finished";

function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }) +
    " UTC"
  );
}

export function OrderDrawing({ drawings }: OrderDrawingProps) {
  type GroupedDrawingProgress = Record<string, DrawingProgressPreviewDto[]>;

  const [selectedDrawing, setSelectedDrawing] =
    useState<DrawingProgressPreviewDto | null>(null);

  const groupAndSortDrawing = (
    items: DrawingProgressPreviewDto[]
  ): GroupedDrawingProgress => {
    return items.reduce<GroupedDrawingProgress>((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = [];
      }
      acc[item.name].push(item);
      return acc;
    }, {});
  };
  
  const {showToast} = useToast()
  const handleDownload = async (id: string) => {
    try {
      const url = await getOrderDrawingDownloadUrl(id);
      showToast("success", "downloading")
      const a = document.createElement("a");
      a.href = url;
      a.download = ""; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);


    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showToast("error", message)
    }
  };

  const handleBulkDownload = async (drawings: DrawingProgressPreviewDto[]) => {
    try {
      showToast("success", "Preparing downloads...");

      for (const drawing of drawings) {
        const url = await getOrderDrawingDownloadUrl(drawing.id);

        const a = document.createElement("a");
        a.href = url;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      showToast("success", "Finished drawings downloaded");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showToast("error", message);
    }
  };

  const groupedDrawing = groupAndSortDrawing(drawings);

  const sortedEntries = Object.entries(groupedDrawing).sort(([a], [b]) => {
    if (a.toLowerCase() === FINISHED_KEY) return 1;
    if (b.toLowerCase() === FINISHED_KEY) return -1;
    return 0;
  });

  const finishedDrawings = groupedDrawing[FINISHED_KEY] ?? [];
  const isFinished = finishedDrawings.length > 0;

  if (!drawings.length) {
    return (
      <div className="py-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
            Drawing Progress
          </span>
          <div className="flex-1 border-t border-gray-100" />
        </div>
        <p className="text-sm text-gray-400">No drawing progress uploaded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="py-6">

        {/* ── Finished banner ── */}
        {isFinished && (
          <div className="mb-5 rounded-xl bg-emerald-50 px-3.5 py-3 ring-1 ring-emerald-100">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-emerald-800">Drawing finished</p>
                <p className="text-xs text-emerald-600">
                  {formatDateTime(finishedDrawings[finishedDrawings.length - 1].createdAt)}
                </p>
              </div>

            </div>
            <div className="flex justify-between items-center pl-7 pr-2">
            <div className="mt-3 flex flex-wrap gap-2">
              {finishedDrawings.map((drawing, index) => (
                <button
                  type="button"
                  key={drawing.id}
                  onClick={() => setSelectedDrawing(drawing)}
                  className="group relative h-14 w-14 overflow-hidden rounded-lg bg-emerald-100 ring-1 ring-emerald-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img
                    src={drawing.previewBlob}
                    alt={`finished-${index}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30 hover:text-white text-transparent">
                    <Eye size={14}/>
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleBulkDownload(finishedDrawings)
              }
              className="flex p-2 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200 hover:text-emerald-800"
            >
             <DownloadIcon />
            </button>

            </div>

          </div>
        )}

        <div className="mb-5 flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
            Drawing Progress
          </span>
          <div className="flex-1 border-t border-gray-100" />
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
            {drawings.length} image{drawings.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-5">
          {sortedEntries.map(([name, groupDrawings], groupIndex) => {
            const isFinishedGroup = name.toLowerCase() === FINISHED_KEY;
            return (
              <div
                key={name}
                className={
                  isFinishedGroup
                    ? "rounded-xl bg-emerald-50/60 px-3 py-3 ring-1 ring-emerald-100"
                    : ""
                }
              >
                <div className="mb-2.5 flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold leading-none ${
                      isFinishedGroup
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {groupIndex + 1}
                  </span>

                  <h4
                    className={`text-sm font-medium capitalize ${
                      isFinishedGroup ? "text-emerald-700" : "text-gray-600"
                    }`}
                  >
                    {name}
                  </h4>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isFinishedGroup
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {groupDrawings.length}
                  </span>

                  <span className="ml-auto text-xs text-gray-400">
                    {formatDateTime(groupDrawings[0].createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {groupDrawings.map((drawing, _) => (
                    <button
                      type="button"
                      key={drawing.previewBlob ?? drawing.id}
                      onClick={() => setSelectedDrawing(drawing)}
                      className={`group relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100 transition hover:-translate-y-0.5 hover:shadow-md ${
                        isFinishedGroup
                          ? "ring-1 ring-emerald-200"
                          : "ring-1 ring-gray-200"
                      }`}
                    >
                      <img
                        src={drawing.previewBlob}
                        alt={drawing.id}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
                        <span className="scale-95 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-800 opacity-0 shadow-sm transition group-hover:scale-100 group-hover:opacity-100">
                          Preview
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDrawing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDrawing(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl rounded-3xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 capitalize">
                  {selectedDrawing.name}
                </h4>
                <p className="text-sm text-gray-400">
                  {formatDateTime(selectedDrawing.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      selectedDrawing.id
                    )
                  }
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Download Original {`(${selectedDrawing.originalSize.width} x ${selectedDrawing.originalSize.height})`}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDrawing(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
                >
                  ×
                </button>
              </div>
            </div>

            <PreviewImage
              src={selectedDrawing.previewBlob}
              alt={selectedDrawing.name}
            />
          </div>
        </div>
      )}
    </>
  );
}

type PreviewImageProps = {
  src: string;
  alt: string;
};

function PreviewImage({ src, alt }: PreviewImageProps) {
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  return (
    <div className="relative flex max-h-[72vh] items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
      <p className="absolute top-4 left-4 z-10 rounded bg-black/60 px-2 py-1 text-sm text-white">
        Preview
        {imageSize && ` (${imageSize.width} × ${imageSize.height})`}
      </p>

      <img
        src={src}
        alt={alt}
        onLoad={(e) => {
          setImageSize({
            width: e.currentTarget.naturalWidth,
            height: e.currentTarget.naturalHeight,
          });
        }}
        className="max-h-[72vh] w-auto max-w-full object-contain"
      />
    </div>
  );
}

export function OrderDrawingSkeleton() {
  return (
    <div className="py-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
        <div className="flex-1 border-t border-gray-100" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
      </div>

      <div className="space-y-5">
        {[1, 2].map((group) => (
          <div key={group}>
            <div className="mb-2.5 flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded-full bg-gray-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-6 animate-pulse rounded-full bg-gray-100" />
              <div className="ml-auto h-3 w-20 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="flex flex-wrap gap-2.5">
              {[...Array(group === 1 ? 2 : 1)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-20 animate-pulse rounded-xl bg-gray-100 ring-1 ring-gray-200"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
