import axios, { AxiosError } from "axios";
import { apiPost } from "./ApiService"
import useAuthStore from '../store/AuthStore'
import type { AuthToken } from "../types/AuthToken";
import type { ApiResponse } from "../types/ApiResponse";

export const signup = async (username: string, email: string, password: string, fullName: string ) => {
  const redirectUrl = `${window.location.origin}/verify-email`
  const data = {
    username,
    email,
    password,
    fullName,
    redirectUrl
  };
  const res = await apiPost<AuthToken>("/auth/signup", data);
  if (!res.success || !res.data) {
    throw new Error(`signup Failed: ${res.error?.details}`);
  }
};

export const login = async (username: string, email: string, password: string, loginMethod: string ) => {
  const data = {
    username,
    email,
    password,
    loginMethod,
  };
  const res = await apiPost<AuthToken>("/auth/login", data);
  if (!res.success || !res.data) {
    throw new Error(`Login Failed: ${res.error?.details}`);
  }
  const accessToken = res.data.accessToken
  const refreshToken = res.data.refreshToken

  useAuthStore.getState().setAccessToken(accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  return accessToken
};

export const logout = () => {
  useAuthStore.getState().clearAccessToken(); 
  localStorage.removeItem("refreshToken");
};



export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const res = await apiPost<AuthToken>(`/auth/refresh-token`, {
      token: refreshToken,
    });

    if (!res.success || !res.data) {
      throw new Error(res.error?.details ?? "Invalid Session, Please Login Again");
    }

    const newAccessToken = res.data.accessToken;
    const newRefresh = res.data.refreshToken;

    useAuthStore.getState().setAccessToken(newAccessToken);
    localStorage.setItem("refreshToken", newRefresh);

    return newAccessToken;

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

    throw err;
  }
};
