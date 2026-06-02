import Modal from "./modal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmClassName = "bg-black text-white",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <Modal title={title} size="sm" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg cursor-pointer ${confirmClassName}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
