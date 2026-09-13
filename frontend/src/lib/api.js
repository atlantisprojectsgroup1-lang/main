import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

const api = axios.create({ baseURL: API, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("atlantis_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export function formatApiError(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || "").filter(Boolean).join(" ");
  return fallback;
}
