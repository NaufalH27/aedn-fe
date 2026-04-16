import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import type { AuthState, DecodedToken } from "../types/Auth";


const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  decoded: null,
  roles: [],
  subject: null,
  username: null,
  email: null,

  setAccessToken: (token: string) => {
    let decoded: DecodedToken | null = null;
    let roles: string[] = [];
    let subject: string | null = null;
    let username: string | null = null;
    let email: string | null = null;

    try {
      decoded = jwtDecode<DecodedToken>(token);
      roles = decoded?.roles || [];
      subject = decoded?.sub || null;
      username = decoded?.username || null;
      email = decoded?.email || null;
    } catch {
    }

    set({
      accessToken: token,
      decoded,
      roles,
      subject,
      username,
      email,
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
    }),
}));

export default useAuthStore;
