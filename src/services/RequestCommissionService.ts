import { handleApiError } from "../hooks/ApiErr";
import type { ConfirmRequestDto, RequestCommissionDto, RequestDto } from "../types/RequestCommission";
import { apiGet, apiPost, apiPut } from "./ApiService";

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

export const getAllRequest = async () => {
  try {
    const res = await apiGet<RequestDto[]>("/requests");
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to submit request, something unexpected happend");
    }
    if (!res.data) {
      return []
    }
    return res.data
  } catch (err) {
    throw handleApiError(err)
  }
}

export const getMyRequests = async () => {
  try {
    const res = await apiGet<RequestDto[]>("/requests/me");
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to submit request, something unexpected happend");
    }
    if (!res.data) {
      return []
    }
    return res.data
  } catch (err) {
    throw handleApiError(err)
  }
}

export const confirmRequest = async (id: string, dto: ConfirmRequestDto ) => {
  try {
    const res = await apiPost<RequestDto>(`/requests/${id}/confirm`, dto);
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to submit request, something unexpected happend");
    }
  } catch (err) {
    throw handleApiError(err)
  }

}

export const proceedRequest = async (id: string) => {
  try {
    const res = await apiPut<RequestDto>(`/requests/${id}/proceed`);
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to submit request, something unexpected happend");
    }
  } catch (err) {
    throw handleApiError(err)
  }

}

export const rejectRequest = async (id: string) => {
  try {
    const res = await apiPut<RequestDto>(`/requests/${id}/reject`);
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to submit request, something unexpected happend");
    }
  } catch (err) {
    throw handleApiError(err)
  }
}

export const cancelRequest = async (id: string) => {
  try {
    const res = await apiPut<RequestDto>(`/requests/${id}/cancel`);
    if (!res.success) {
      throw new Error(res?.error?.details ?? "Failed to submit request, something unexpected happend");
    }
  } catch (err) {
    throw handleApiError(err)
  }
}

