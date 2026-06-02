import axios, { AxiosError } from "axios";
import { apiPost } from "./ApiService"
import useAuthStore from '../store/AuthStore'
import type { AuthToken } from "../types/AuthToken";
import type { ApiResponse } from "../types/ApiResponse";
import { handleApiError } from "../hooks/ApiErr";
import { InvalidRefreshError, NoRefreshError } from "../exception/RefreshException";

export const signup = async (username: string, email: string, password: string, fullName: string ) => {
  try {
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
  } catch (err) {
    throw handleApiError(err)

  }
};

export const login = async (username: string, email: string, password: string, loginMethod: string ) => {
  try {
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
    return accessToken
  } catch (err) {
    throw handleApiError(err)
  }
};

export const logout = async() => {
  try {
    const res = await apiPost<void>("/auth/logout");
    if (!res.success) {
      throw new Error(`Logout Failed: ${res.error?.details ?? "Unknown Error"}`);
    }
    useAuthStore.getState().clearAccessToken(); 
  } catch (err) {
    throw handleApiError(err)
  }
};

export const refreshAccessToken = async () => {
  try {
    const res = await apiPost<AuthToken>(`/auth/refresh-token`);

    if (!res.success || !res.data) {
      throw new Error(res.error?.details ?? "Something went wrong, Please Try To Login Again");
    }
    return res.data;
  } catch (err) {

    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<ApiResponse<unknown>>;

      const status = axiosErr.response?.status;
      const errorCode = axiosErr.response?.data?.error?.code;

      if (status === 401) {
        if (errorCode === "MISSING_REFRESH_TOKEN") {
          useAuthStore.getState().clearAccessToken();
          throw new NoRefreshError(axiosErr.response?.data?.error?.details ?? "Invalid Session, Please Login Again");
        }
        if (errorCode === "INVALID_REFRESH_TOKEN") {
          useAuthStore.getState().clearAccessToken();
          throw new InvalidRefreshError(axiosErr.response?.data?.error?.details ?? "Invalid Session, Please Login Again");
        }
      }
    }
    throw handleApiError(err)
  }
};
