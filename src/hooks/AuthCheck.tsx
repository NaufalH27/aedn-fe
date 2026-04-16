import { useEffect, useState, useRef } from "react";
import useAuthStore from "../store/AuthStore";
import { refreshAccessToken } from "../services/AuthService";

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "unauthorized";

export const useAuthCheck = (requiredRoles?: string[]) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const checkAuth = async () => {
      try {
        let token = useAuthStore.getState().accessToken;

        if (!token) {
          const refreshToken = localStorage.getItem("refreshToken");

          if (!refreshToken) {
            setStatus("unauthenticated");
            return;
          }

          token = await refreshAccessToken(refreshToken);

          if (!token) {
            setStatus("unauthenticated");
            return;
          }
        }

        if (requiredRoles) {
          const roles = useAuthStore.getState().roles;

          const hasRole = requiredRoles.some((r) => roles.includes(r));
          console.info(roles)
          console.info(requiredRoles)

          if (!hasRole) {
            setStatus("unauthorized");
            return;
          }
        }

        setStatus("authenticated");
      } catch {
        setStatus("unauthenticated");
      }
    };

    checkAuth();
  }, []);

  return status;
};
