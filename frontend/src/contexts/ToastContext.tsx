import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Toast } from "../components/common/Toast";
import { toastBridge } from "../utils/toastBridge";

interface ToastState {
  type: "success" | "error" | "warning";
  message: string;
  id: number;
}

interface ToastContextValue {
  toasts: ToastState[];
  removeToast: (id: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback(
    (type: "success" | "error" | "warning", message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { type, message, id }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => showToast("success", message), [showToast]);
  const error = useCallback((message: string) => showToast("error", message), [showToast]);
  const warning = useCallback((message: string) => showToast("warning", message), [showToast]);

  useEffect(() => {
    toastBridge.setHandler((type, message) => showToast(type, message));
    return () => toastBridge.setHandler(null);
  }, [showToast]);

  const value: ToastContextValue = {
    toasts,
    removeToast,
    success,
    error,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};
