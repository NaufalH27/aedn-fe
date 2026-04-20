import { apiGet } from "./ApiService"
import type { Product } from "../types/Products";
import axios, { AxiosError } from "axios";
import type { ApiResponse } from "../types/ApiResponse";

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const res = await apiGet<Product[]>("/products");
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to fetch products, something unexpected happend");
    }
    return res.data;

  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<ApiResponse<unknown>>;
      throw new Error(axiosErr.response?.data?.error?.details ?? "Failed to fetch products (500)");
    }

    throw err;
  }

};
