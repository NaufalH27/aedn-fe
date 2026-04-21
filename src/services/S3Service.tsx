import axios, { AxiosError } from "axios";

export async function uploadS3(s3Url: string, file: File, mimeType: string) {
  try {
    const response = await axios.put(s3Url, file, {
      headers: {
        "Content-Type": mimeType,
      }
    });

    return response.status;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<any>;
      const status = axiosErr.response?.status;

      if (status && status >= 413) {
        throw new Error("File Size exceed the limit of 8MB");
      }

      if (status && status >= 500) {
        throw new Error("Something UNexpected Happend in the server. Please try again later");
      }

    }
    throw new Error("Something Unexpected happend when trying to connect file server. Please try again later")
  }
}
