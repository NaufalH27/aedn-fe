import { handleApiError } from "../hooks/ApiErr";
import type { RequestCommissionDto, RequestDto } from "../types/Commission";
import { apiPost } from "./ApiService";

export const createRequest = async (reqForm: RequestCommissionDto) => {
  try {
    const res = await apiPost<RequestDto>("/requests", reqForm);
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to submit request, something unexpected happend");
    }
  } catch (err) {
    throw handleApiError(err)
  }

}
