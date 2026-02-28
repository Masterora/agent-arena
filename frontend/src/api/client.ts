import axios from "axios";
import { toastBridge } from "../utils/toastBridge";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 响应拦截器：统一将 API 错误以 Toast 展示
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return "请求参数错误";
    if (detail?.errors) return "请求参数校验失败";
  }
  return (error as Error)?.message ?? "网络错误，请重试";
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getErrorMessage(error);
    toastBridge.error(message);
    return Promise.reject(error);
  }
);
