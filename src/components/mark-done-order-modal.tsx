import { useState } from "react";
import { getFileExtension } from "../helper/picture";
import { finishDrawing, getUploadDrawingProgressSignedUrl } from "../services/OrderCommissionService";
import { uploadS3 } from "../services/S3Service";
import type { UploadPictureDto } from "../types/Products";
import { LoadingIndicator } from "./loading-indicator";
import Modal from "./modal";
import { useToast } from "./toast";

export default function MarkAsDoneModal({
  open,
  onCancel,
  onSuccess,
  id,
}: {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  id: string;
}) {
  const [images, setImages] = useState<UploadPictureDto[]>([]);
  const [isUploadPicture, setIsUploadPicture] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { showToast } = useToast();

  if (!open) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];


    if (!file) {
      showToast("error", "Cant read file" );
      return;
    }

    setIsUploadPicture(true)

    const ext = getFileExtension(file);

    try {
      const signedUrl = await getUploadDrawingProgressSignedUrl(ext);

      await uploadS3(signedUrl.s3SignedUrl, file, file.type);

      setImages((prev) => [...prev, signedUrl]);
      showToast("success", "Finished drawing uploaded successfully!");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown Error";
      showToast("error", errMsg);
    } finally {
      e.target.value = "";
      setIsUploadPicture(false)
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      showToast("error", "Please upload at least one finished drawing");
      return;
    }

    setIsSubmitting(true)

    try {
      await finishDrawing(id,images.map((image) => image.key));
      showToast("success", "Finished drawing uploaded successfully!");
      setImages([]);
      onSuccess?.();
      onCancel();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown Error";
      showToast("error", errMsg);
    } finally {
      setIsSubmitting(false)
    }
  };

  const uploadDisabled = isSubmitting || isUploadPicture
  const disabled =
    images.length === 0 || uploadDisabled

  return (
    <Modal title="Mark as Done" size="sm" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload the finished drawing before marking this order as done.
        </p>

        <div className="flex flex-wrap gap-2.5">
          {images.map((src, index) => (
            <div key={`${src.key}-${index}`} className="relative h-20 w-20">
              <div className="h-full w-full overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
                <img
                  src={src.url}
                  alt={`finished-drawing-${index}`}
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
            {!uploadDisabled && (
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

        <p className="text-xs text-gray-400">
          {images.length === 0
            ? "Upload at least one finished drawing to continue."
            : `${images.length} finished drawing${
                images.length > 1 ? "s" : ""
              } ready.`}
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setImages([]);
              onCancel();
            }}
            className="px-4 py-2 border rounded-lg cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg text-white ${
              disabled
                ? "cursor-not-allowed bg-gray-300"
                : "cursor-pointer bg-gray-900 hover:bg-gray-800"
            }`}
          >
            {uploadDisabled ? "Uploading..." : "Mark as Done"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
