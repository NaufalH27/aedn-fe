import { useEffect, useState, useRef } from "react";
import useAuthStore from "../store/AuthStore";
import { refreshAccessToken } from "../services/AuthService";

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "unauthorized"
  | "error";

type UseAuthCheckResult = {
  status: AuthStatus;
  error: string | null;
};

export const useAuthCheck = (
  requiredRoles?: string[]
): UseAuthCheckResult => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
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

          const hasRole = requiredRoles.some((r) =>
            roles.includes(r)
          );

          if (!hasRole) {
            setStatus("unauthorized");
            return;
          }
        }

        setStatus("authenticated");
      } catch (err) {
        setStatus("error");

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something unexpected happened");
        }
      }
    };

    checkAuth();
  }, [requiredRoles]);

  return { status, error };
};
