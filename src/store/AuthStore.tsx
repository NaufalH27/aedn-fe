import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import type { AuthData,  DecodedToken } from "../types/Auth";
import { refreshAccessToken } from "../services/AuthService";

type AuthState =
  | { status: "init", initPromise: Promise<AuthData> }
  | { status: "authenticated"; data: AuthData }
  | { status: "unauthenticated" }

type AuthStore = {
  authState: AuthState;
  initAuth: () => Promise<AuthData>;
  setAccessToken: (token: string) => AuthData;
  clearAccessToken: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  authState: { status: "unauthenticated" },

  setAccessToken: (token) => {
    const decoded = jwtDecode<DecodedToken>(token);

    const authData: AuthData = {
      accessToken: token,
      decoded,
      roles: decoded.roles ?? [],
      subject: decoded.sub ?? null,
      username: decoded.username ?? null,
      email: decoded.email ?? null,
      fullName: decoded.fullName ?? null,
    };

    const newAuthState: AuthState = {
        status: "authenticated",
        data: authData,
      }

    set({authState: newAuthState});

    return authData;
  },

  initAuth: async () => {
    const current = get().authState;

    if (current.status === "init") {
      return current.initPromise;
    }

    const initPromise = refreshAccessToken()
      .then((res) => get().setAccessToken(res.accessToken))
      .catch((err) => {
        set({
          authState: {
            status: "unauthenticated",
          },
        });
        throw err
      });

    set({
      authState: {
        status: "init",
        initPromise,
      },
    });

    return initPromise;
  },

  clearAccessToken: () => {
    set({
      authState: {
        status: "unauthenticated",
      },
    });
  },
}));

export default useAuthStore
