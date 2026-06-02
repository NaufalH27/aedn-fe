import axios, { type InternalAxiosRequestConfig } from "axios";
import env from '../config/env'
import useAuthStore from "../store/AuthStore";
import type { ApiResponse } from "../types/ApiResponse";
import type { AuthToken } from "../types/AuthToken";
import { toast } from "../components/toast";
import { InvalidRefreshError, NoRefreshError } from "../exception/RefreshException";
import { refreshAccessToken } from "./AuthService";

const api = axios.create({
  baseURL: `${env.apiUrl}/v1`,
  withCredentials: true ,
});

api.interceptors.request.use((config) => {
  const authState = useAuthStore.getState().authState;
  if (authState.status === "authenticated") {
    config.headers.Authorization = `Bearer ${authState.data.accessToken}`;
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

export async function apiPut<T>(url: string, body?: any): Promise<ApiResponse<T>> {
  const res = await api.put<ApiResponse<T>>(url, body);
  return res.data;
}

export async function apiDelete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
  const res = await api.delete<ApiResponse<T>>(url, config);
  return res.data;
}

type refreshState = 
  {state: "refreshing"; token: Promise<AuthToken>} | 
  {state: "idle"; };

let refreshPromise: refreshState = {state: "idle"};

function refreshAccessTokenPromise(): Promise<AuthToken> {
  if (refreshPromise.state === "refreshing") {
    return refreshPromise.token;
  }

  refreshPromise = {
    state: "refreshing",
    token: refreshAccessToken()
      .finally(() => {
        refreshPromise = {state: "idle"}
      })
    }
    return refreshPromise.token;
}

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }
    if (
      useAuthStore.getState().authState.status !== "unauthenticated" &&
      error.response?.status === 401 && error.response?.data?.error?.code === "INVALID_JWT" &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;
      useAuthStore.getState().clearAccessToken()

      try {
        const tokenData = await refreshAccessTokenPromise();
        useAuthStore.getState().setAccessToken(tokenData.accessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;

        return api(originalRequest);
      } catch (err) {
        if (err instanceof NoRefreshError) {
          useAuthStore.getState().clearAccessToken();
        } else if (err instanceof InvalidRefreshError) {
          useAuthStore.getState().clearAccessToken();
          toast("error", "Invalid session, please login again");
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api
