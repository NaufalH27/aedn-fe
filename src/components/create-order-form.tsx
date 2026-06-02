import { useState } from "react";
import type { RequestDto } from "../types/RequestCommission";
import type { UploadPictureDto } from "../types/Products";
import { useToast } from "./toast";
import { confirmRequest } from "../services/RequestCommissionService";
import { formatToPostgresTimestamp } from "../helper/timestamp";
import { getFileExtension } from "../helper/picture";
import { uploadS3 } from "../services/S3Service";
import { LoadingModal } from "./loading-modal";
import { LoadingIndicator } from "./loading-indicator";
import ConfirmModal from "./confirm-modal";
import { getUploadDrawingProgressSignedUrl } from "../services/OrderCommissionService";

type OrderFormProps = {
  request: RequestDto;
  onClose: () => void;
  onSuccess?: () => void;
};

type PostState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "loading" }
  | { status: "error"; error: string };


export function CreateOrderForm({ request, onClose, onSuccess }: OrderFormProps) {
  const [postState, setPostState] = useState<PostState>({status: "idle",});
  const [confirmationModal,setConfirmationModal] = useState(false)

  const [deadline, setDeadline] = useState(() =>
    request.proposedDeadline
      ? new Date(request.proposedDeadline).toISOString().split("T")[0]
      : ""
  );
  const [price, setPrice] = useState(request.proposedPrice);
  const [isUploadingPicture, setIsUploadingPicture ] = useState(false);
  const [images, setImages] = useState<UploadPictureDto[]>([]);

  const {showToast} = useToast()

  const handleCreateOrder = async () => {
    try {
      setPostState({status: "success"})
      await confirmRequest(request.id, {
        deadline: formatToPostgresTimestamp(deadline),
        price: price,
        sketchUrlKey: images.map(({ key }) => key),
      })

      showToast("success", "Order Created successfully!")
      if (onSuccess){
        onSuccess()
      }
    } catch (error) {
      const errMsg =  error instanceof Error ? error.message : "Unknown Error"
      setPostState({status:"error", error: errMsg})
      showToast("error", errMsg)
    } finally {
      setConfirmationModal(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        showToast("error", "Cant Read File");
        return
      }
      const ext = getFileExtension(file)
      setIsUploadingPicture(true)
    try {
      const signedUrl = await getUploadDrawingProgressSignedUrl(ext);
      await uploadS3(signedUrl.s3SignedUrl, file, file.type)
      setImages((prev) => [...prev, signedUrl]);
      showToast("success", "Uploading Picture successfully!")
      
    } catch (error) {
      const errMsg =  error instanceof Error ? error.message : "Unknown Error"
      showToast("error", errMsg)
    } finally {
      e.target.value = "";
      setIsUploadingPicture(false)
    }
  };

  const handleRemoveImage = (indexToRemove: Number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };
  return (
    <div className="pb-4">
    <LoadingModal open={postState.status === "loading"} />

      <div className="w-full pr-2">
        <div className="w-full flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Price {` (${request.currencyCode})`}
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter price"
            />
          </div>
        </div>
        <p>Upload Sketch</p>
        <div className="flex flex-wrap gap-4 mt-5">

          {images.map((src, index) => (
            <div key={index} className="relative w-28 h-28">
              <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={src.url}
                  alt={`upload-${index}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 z-10"
              >
                −
              </div>
            </div>
          ))}

          <label className="w-28 h-28 bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-300 transition">
            {!isUploadingPicture && (
              <span className="text-4xl text-gray-500 font-light">+</span>
            )}
            {isUploadingPicture && (
              <LoadingIndicator />
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={isUploadingPicture}
              onChange={handleUpload}
            />
          </label>
        </div>

      </div>
      <div className="mt-4 w-full flex items-center justify-end gap-3">
        <button 
          onClick={() => {
            onClose()
          }}
          className="rounded-xl bg-white px-6 py-3 text-sm font-medium  hover:bg-gray-200 border-black border text-black transition" > 
          Cancel
        </button>
        <button 
          onClick={() => setConfirmationModal(true)}
          className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition" > 
            Create Order
        </button>
      </div>
      <ConfirmModal
        open={confirmationModal}
        title="Proceed Request"
        description="Do you want to Create Order for this request?"
        confirmText="Create Order"
        onCancel={() => setConfirmationModal(false)}
        onConfirm={handleCreateOrder}
      />
    </div>
  )
}


