import { handleApiError } from "../hooks/ApiErr";
import type { UserDto } from "../types/User";
import { apiGet } from "./ApiService";

export const getMe = async (): Promise<UserDto> => {
  try {
    const res = await apiGet<UserDto>("/me");
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to get User Info, something unexpected happend");
    }
    return res.data;
  } catch (err) {
    throw handleApiError(err)
  }
};
