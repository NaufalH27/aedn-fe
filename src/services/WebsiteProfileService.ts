import { handleApiError } from "../hooks/ApiErr";
import type { UploadPictureDto } from "../types/Products";
import type { ContactInfoDto, WebsiteProfileDto, WebsiteProfileRequestDto } from "../types/WebsiteProfile";
import { apiGet, apiPost, apiPut } from "./ApiService";

export const getWebsiteProfile = async (): Promise<WebsiteProfileDto> => {
  try {
    const res = await apiGet<WebsiteProfileDto>("/website-profile");

    if (!res.success || !res.data) {
      throw new Error(
        res?.error?.details ??
          "Failed to get Website Profile, something unexpected happened"
      );
    }

    return res.data;
  } catch (err) {
    throw handleApiError(err);
  }
};

export const getAllWebsiteProfile = async (): Promise<WebsiteProfileDto> => {
  try {
    const res = await apiGet<WebsiteProfileDto>("/website-profile/all");

    if (!res.success || !res.data) {
      throw new Error(
        res?.error?.details ??
          "Failed to get Website Profile, something unexpected happened"
      );
    }

    return res.data;
  } catch (err) {
    throw handleApiError(err);
  }
};

export const getContact = async () => {
  try {
    const res = await apiGet<ContactInfoDto>("/website-profile/contact");

    if (!res.success || !res.data) {
      throw new Error(
        res?.error?.details ??
          "Failed to get Contact, something unexpected happened"
      );
    }

    return res.data;
  } catch (err) {
    throw handleApiError(err);
  }
};

export const updateWebsiteProfile = async (
  payload: WebsiteProfileRequestDto
): Promise<WebsiteProfileDto> => {
  try {
    const res = await apiPut<WebsiteProfileDto>(
      "/website-profile",
      payload
    );

    if (!res.success || !res.data) {
      throw new Error(
        res?.error?.details ??
          "Failed to update Website Profile, something unexpected happened"
      );
    }

    return res.data;
  } catch (err) {
    throw handleApiError(err);
  }
};

export const getUploadProfilePictureSignedUrl = async (imageExtension: string): Promise<UploadPictureDto> => {
  try {
    const res = await apiPost<UploadPictureDto>("/website-profile/profile-picture/signed-url", { imageExtension: imageExtension });
    if (!res.success || !res.data) {
      throw new Error(res?.error?.details ?? "Failed to get upload url, something unexpected Happend");
    }
    return res.data

  } catch (err) {
    throw handleApiError(err)
  }

}
