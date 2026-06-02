import { useState, useRef, useEffect } from "react";
import { getFileExtension } from "../helper/picture";
import { getUploadDrawingProgressSignedUrl, uploadNewOrderDrawingProgress } from "../services/OrderCommissionService";
import { uploadS3 } from "../services/S3Service";
import type { UploadPictureDto } from "../types/Products";
import { useToast } from "./toast";
import { LoadingIndicator } from "./loading-indicator";

type AddDrawingProgressProps = {
  id: string;
  onSuccess?: () => void;
};

export default function AddDrawingProgress({
  id,
  onSuccess,
}: AddDrawingProgressProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [images, setImages] = useState<UploadPictureDto[]>([]);
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (expanded) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, [expanded]);

  const { showToast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setIsUploading(true)

    if (!file) {
      showToast("error", "Cant Read File");
      return;
    }

    const ext = getFileExtension(file);

    try {
      const signedUrl = await getUploadDrawingProgressSignedUrl(ext);

      await uploadS3(signedUrl.s3SignedUrl, file, file.type);

      setImages((prev) => [...prev, signedUrl]);
      showToast("success", "Uploading Picture successfully!");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown Error";
      showToast("error", errMsg);
    } finally {
      e.target.value = "";
      setIsUploading(false)
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      showToast("error", "Progress title is required");
      return;
    }

    if (images.length === 0) {
      showToast("error", "Please upload at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      await uploadNewOrderDrawingProgress(
        id,
        images.map((image) => image.key),
        trimmedName
      );
      showToast("success", "Drawing progress updated successfully!");
      setName("");
      setImages([]);
      setExpanded(false);

      onSuccess?.();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown Error";
      showToast("error", errMsg);
    } finally {
      setIsSubmitting(false)
    }
  };

  const uploadDisabled = isSubmitting || isUploading
  const disabled =
    images.length === 0 ||
    !name.trim() || uploadDisabled

  if (!expanded) {
    return (
      <div className="pb-2">
        <button
          type="button"
          onClick={() => {
            setExpanded(true)
          }}
          className="group flex gap-5 items-center justify-between py-1 text-left"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-base font-light text-white transition group-hover:bg-gray-700">
            +
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Add new drawing progress
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              Upload line art, render, or revision drawings
            </p>
          </div>

        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 pt-5 pb-2">
      {/* Title row */}
      <div className="mb-4 flex items-center gap-2">
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Progress title"
          className="bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 border-gray-100 border rounded-md py-1 px-2"
        />
      </div>

      <div className="flex flex-wrap gap-2.5">
        {images.map((src, index) => (
          <div key={`${src.key}-${index}`} className="relative h-20 w-20">
            <div className="h-full w-full overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
              <img
                src={src.url}
                alt={`upload-${index}`}
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs leading-none text-white transition hover:bg-red-500"
            >
              ×
            </button>
          </div>
        ))}

        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 transition hover:bg-gray-100">
          { !uploadDisabled && (
            <span className="text-2xl font-light text-gray-400">+</span>
          )}
          {uploadDisabled && <LoadingIndicator />}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploadDisabled}
          />
        </label>
      </div>


      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-xs text-gray-400">
          {images.length === 0
            ? "Upload at least one image and give them a title to continue."
            : `${images.length} image${images.length > 1 ? "s" : ""} ready.`}
        </p>
        <div className="gap-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setName("");
              setImages([]);
            }}
            className="rounded-lg px-2.5 py-1 text-xs text-red-400 transition hover:bg-red-100 hover:text-red-600"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition ${
              disabled
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {uploadDisabled  ? "Updating..." : "Update progress"}
          </button>

        </div>

      </div>
        <div ref={bottomRef}/>
    </div>
  );
}
