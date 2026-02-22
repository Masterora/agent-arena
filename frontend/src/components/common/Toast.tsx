import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  type: "success" | "error" | "warning";
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-400" />,
  };

  const colors = {
    success: "bg-emerald-500/20 border-emerald-500/50 text-emerald-100",
    error: "bg-red-500/20 border-red-500/50 text-red-100",
    warning: "bg-amber-500/20 border-amber-500/50 text-amber-100",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} shadow-lg animate-slide-in`}
    >
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
