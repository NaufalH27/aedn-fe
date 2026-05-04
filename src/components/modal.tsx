
type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

export default function Modal({
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5 rounded">
      <div
        className={`w-full ${sizeClass[size]} bg-white rounded-2xl flex flex-col max-h-[90vh] p-5`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="w-10 h-10 hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
