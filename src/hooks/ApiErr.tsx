import axios, { AxiosError } from "axios";

export const handleApiError = (err: unknown): unknown => {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<any>;
    const status = axiosErr.response?.status;
    if (!axiosErr.response) {
      return new Error("Cannot connect to server. Server is unreachable, check your internet or try again later");
    }

    if (status && status >= 500) {
      return new Error("Something UNexpected Happend in the server. Please try again later");
    }

    return new Error(
      axiosErr.response?.data?.error?.details ??
      "Request failed: " + err.message
    );
  }

  return err;
};
