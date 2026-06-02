import { apiDelete, apiGet, apiPost, apiPut } from "./ApiService"
import type { Product, ReqProduct, UploadPictureDto } from "../types/Products";
import { handleApiError } from "../hooks/ApiErr";

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const res = await apiGet<Product[]>("/products");
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to fetch products, something unexpected happend");
    }
    return res.data;

  } catch (err) {
    throw handleApiError(err)
  }
};

export const getProductById = async (pId: string): Promise<Product> => {
  try {
    const res = await apiGet<Product>(`/products/${pId}`);
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to fetch products, something unexpected happend");
    }
    return res.data;
  } catch (err) {
    throw handleApiError(err)
  }
};

export const getUploadProductSignedUrl = async (imageExtension: string): Promise<UploadPictureDto> => {
  try {

    const res = await apiPost<UploadPictureDto>("/product/picture/signed-url/upload", { imageExtension: imageExtension });
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to get upload url, something unexpected Happend");
    }

    return res.data

  } catch (err) {
    throw handleApiError(err)
  }

}

export const submitProduct = async (product: ReqProduct) => {
  try {
    const res = await apiPost<Product>("/products", product);
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to submit products, something unexpected happend");
    }
  } catch (err) {
    throw handleApiError(err)
  }

}

export const editProduct = async (product: ReqProduct, id: string) => {
  try {
    const res = await apiPut<Product>(`/products/${id}`, product);
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to edit products, something unexpected happend");
    }
  } catch (err) {
    throw handleApiError(err)
  }

}

export const deleteProduct = async (id: string) => {
  try {
    const res = await apiDelete<Product>(`/products/${id}`);
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to delete products, something unexpected happend");
    }
  } catch (err) {
    throw handleApiError(err)
  }

}
