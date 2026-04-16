import axios, { AxiosError } from "axios";
import env from '../config/env'
import useAuthStore from "../store/AuthStore";
import type { ApiResponse } from "../types/ApiResponse";
import type { AuthToken } from "../types/AuthToken";

const api = axios.create({
  baseURL: `${env.apiUrl}/v1`,
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export async function apiGet<T>(url: string, config?: any): Promise<ApiResponse<T>> {
  const res = await api.get<ApiResponse<T>>(url, config);
  return res.data;
}

export async function apiPost<T>(url: string, body?: any): Promise<ApiResponse<T>> {
  const res = await api.post<ApiResponse<T>>(url, body);
  return res.data;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.data?.error?.code === "INVALID_JWT" &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        useAuthStore.getState().clearAccessToken();
        throw new Error("Invalid Session, Please Login Again");
      }

      try {
        const res = await apiPost<AuthToken>(`/auth/refresh-token`, {
          token: refreshToken,
        });

        if (!res.success || !res.data) {
          throw new Error(res.error?.details ?? "Invalid Session, Please Login Again");
        }

        const newAccessToken = res.data.accessToken
        const newRefresh = res.data.refreshToken

        useAuthStore.getState().setAccessToken(newAccessToken);
        localStorage.setItem("refreshToken", newRefresh);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosErr = err as AxiosError<ApiResponse<unknown>>;

          const status = axiosErr.response?.status;
          const errorCode = axiosErr.response?.data?.error?.code;

          if (status === 401 && errorCode === "INVALID_REFRESH_TOKEN") {
            useAuthStore.getState().clearAccessToken();
            localStorage.removeItem("refreshToken");
            throw new Error(axiosErr.response?.data?.error?.details ?? "Invalid Session, Please Login Again");
          }
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api
