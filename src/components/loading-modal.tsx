import { createPortal } from "react-dom";
import { LoadingIndicator } from "./loading-indicator";

type LoadingModalProps = {
  open: boolean;
};

export const LoadingModal = ({ open }: LoadingModalProps) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[0px]">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl">
        <LoadingIndicator className="black"/>
      </div>
    </div>,
    document.body
  );
};
