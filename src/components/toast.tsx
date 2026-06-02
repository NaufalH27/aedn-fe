import React, { createContext, useContext, useState } from "react";

type ToastType = "success" | "error";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

let globalShowToast:
  | ((type: ToastType, message: string, duration?: number) => void)
  | null = null;

export const toast = (
  type: ToastType,
  message: string,
  duration?: number
) => {
  globalShowToast?.(type, message, duration);
};

type ToastContextType = {
  showToast: (type: ToastType, message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    type: ToastType,
    message: string,
    duration = 3000
  ) => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  globalShowToast = showToast;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-20 right-5 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              min-w-[260px] rounded-xl border bg-white px-4 py-3 shadow-lg
              transition-all
              ${
                toast.type === "success"
                  ? "border-green-200 text-green-800"
                  : "border-red-200 text-red-800"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">
                {toast.type === "success" ? "✅" : "❌"}
              </span>

              <p className="text-sm font-medium leading-5">
                {toast.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
