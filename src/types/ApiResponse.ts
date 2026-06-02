export type ErrorInfo = {
  code: string;
  details: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: ErrorInfo | null;
};
