import { useState, useCallback } from 'react';

interface ToastState {
  type: 'success' | 'error' | 'warning';
  message: string;
  id: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback(
    (type: 'success' | 'error' | 'warning', message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { type, message, id }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string) => showToast('success', message),
    error: (message: string) => showToast('error', message),
    warning: (message: string) => showToast('warning', message),
  };
};
