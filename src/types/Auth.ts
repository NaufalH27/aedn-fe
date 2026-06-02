
export type DecodedToken = {
  roles?: string[];
  sub?: string;
  username?: string;
  email?: string;
  fullName?: string;
};

export type AuthData = {
  accessToken: string | null;
  decoded: DecodedToken | null;
  roles: string[];
  subject: string | null;
  username: string | null;
  email: string | null;
  fullName: string | null;
};

