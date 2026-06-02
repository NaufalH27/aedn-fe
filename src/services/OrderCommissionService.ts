import { handleApiError } from "../hooks/ApiErr";
import type { DrawingProgressDto, DrawingProgressPreviewDto, OrderDto } from "../types/OrderCommission";
import { apiGet, apiPost, apiPut } from "./ApiService";
import type { UploadPictureDto } from "../types/Products";
import { compressImageBlobToWebp } from "../helper/compressBlob";

export const getAllOrder = async () => {
  try {
    const res = await apiGet<OrderDto[]>("/orders");
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to get orders, something unexpected happend");
    }
    if (!res.data) {
      return []
    }
    return res.data
  } catch (err) {
    throw handleApiError(err)
  }
}

export const getMyOrder = async () => {
  try {
    const res = await apiGet<OrderDto[]>("/orders/me");
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to get orders, something unexpected happend");
    }
    if (!res.data) {
      return []
    }
    return res.data
  } catch (err) {
    throw handleApiError(err)
  }
}


export const getOrderDrawingProgress = async (
  orderId: string
): Promise<DrawingProgressPreviewDto[]> => {
  try {
    const res = await apiGet<DrawingProgressDto[]>(
      "/orders/drawings/" + orderId
    );

    if (!res.success || !res.data) {
      throw new Error(
        res?.error?.details ??
          "Failed to get Drawing from object server, something unexpected happened"
      );
    }

    const drawingsWithPreview = await Promise.all(
      res.data.map(async (drawing) => {
        const fileRes = await fetch(drawing.srcUrl);

        if (!fileRes.ok) {
          throw new Error(`Failed to fetch drawing: ${drawing.id}`);
        }

        const blob = await fileRes.blob();
        const bitmap = await createImageBitmap(blob);
        const compressedBlob = await compressImageBlobToWebp(blob);

        const previewBlob = URL.createObjectURL(compressedBlob);

        return {
          ...drawing,
          previewBlob,
          originalSize: {
              width: bitmap.width,
              height: bitmap.height
          }
        };
      })
    );

    return drawingsWithPreview;
  } catch (err) {
    throw handleApiError(err);
  }
};

export const getOrderDrawingDownloadUrl = async (drawingId :string) => {
  try {

    const res = await apiGet<string>(`/orders/drawings/${drawingId}/download-url`);
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to get Drawing from object server, something unexpected Happend");
    }
    return res.data
  } catch (err) {
    throw handleApiError(err)
  }
}

export const proceedOrderPaymentAnyway = async (id: string) => {
  try {
    const res = await apiPut<OrderDto>(`/orders/${id}/proceed-without-payment`);
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to change order status, something unexpected happend");
    }
  } catch (err) {
    throw handleApiError(err)
  }
}

export const getUploadDrawingProgressSignedUrl = async (imageExtension: string): Promise<UploadPictureDto> => {
  try {
    const res = await apiPost<UploadPictureDto>("/orders/drawings/signed-url", { imageExtension: imageExtension });
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to get upload url, something unexpected Happend");
    }

    return res.data

  } catch (err) {
    throw handleApiError(err)
  }

}

export const uploadNewOrderDrawingProgress = async (id: string, srcUrlKeys: string[], name: string) => {
  try {
    const res = await apiPost<void>(`/orders/${id}/drawings`, { srcUrlKeys, name });
    if (!res.success) {
      throw new Error(res?.error?.details ?? "something unexpected Happend");
    }

    return res.data

  } catch (err) {
    throw handleApiError(err)
  }

}

export const finishDrawing = async (id: string, srcUrlKeys: string[]) => {
  try {
    const res = await apiPut<void>(`/orders/${id}/finish`, { srcUrlKeys });
    if (!res.success) {
      throw new Error(res?.error?.details ?? "something unexpected Happend");
    }

    return res.data

  } catch (err) {
    throw handleApiError(err)
  }

}
