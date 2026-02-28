/**
 * 供 API 层（如 axios 拦截器）在非 React 上下文中触发全局 Toast。
 * 由 Layout 的 ToastProvider 在挂载时注册。
 */
type ToastTrigger = (type: "success" | "error" | "warning", message: string) => void;

let trigger: ToastTrigger | null = null;

export const toastBridge = {
  setHandler(fn: ToastTrigger | null) {
    trigger = fn;
  },
  trigger(type: "success" | "error" | "warning", message: string) {
    trigger?.(type, message);
  },
  error(message: string) {
    trigger?.("error", message);
  },
  success(message: string) {
    trigger?.("success", message);
  },
};
