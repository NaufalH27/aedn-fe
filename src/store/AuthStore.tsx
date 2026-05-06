import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import type { AuthState, DecodedToken } from "../types/Auth";


const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  decoded: null,
  roles: [],
  subject: null,
  username: null,
  fullName: null,
  email: null,

  setAccessToken: (token: string) => {
    let decoded: DecodedToken | null = null;
    let roles: string[] = [];
    let subject: string | null = null;
    let username: string | null = null;
    let email: string | null = null;
    let fullName: string | null = null;

    try {
      decoded = jwtDecode<DecodedToken>(token);
      roles = decoded?.roles || [];
      subject = decoded?.sub || null;
      username = decoded?.username || null;
      email = decoded?.email || null;
      fullName = decoded?.fullName || null;
    } catch (err) {
      throw new Error("Malformed Token Please Reload This Page to reissue Token or relogin your account")
    }

    set({
      accessToken: token,
      decoded,
      roles,
      subject,
      username,
      email,
      fullName,
    });
  },

  clearAccessToken: () =>
    set({
      accessToken: null,
      decoded: null,
      roles: [],
      subject: null,
      username: null,
      email: null,
      fullName: null,
    }),
}));

export default useAuthStore;
