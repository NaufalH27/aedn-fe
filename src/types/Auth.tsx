
export type DecodedToken = {
  roles?: string[];
  sub?: string;
  username?: string;
  email?: string;
};

export type AuthState = {
  accessToken: string | null;
  decoded: DecodedToken | null;
  roles: string[];
  subject: string | null;
  username: string | null;
  email: string | null;

  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
};
