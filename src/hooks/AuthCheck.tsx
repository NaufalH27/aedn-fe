import { useEffect, useState } from "react";
import useAuthStore from "../store/AuthStore";
import type { AuthData } from "../types/Auth";
import { InvalidRefreshError, NoRefreshError } from "../exception/RefreshException";

type AuthCheckState =
  | {status:"loading"}
  | {status:"authenticated", data: AuthData}
  | {status:"unauthenticated"}
  | {status:"unauthorized"}
  | {status:"error", error: string};

export const useAuthCheck = (
  requiredRoles?: string[]
): AuthCheckState => {
  const [state, setState] = useState<AuthCheckState>({status:"loading"});
  const authState = useAuthStore((s) => s.authState);

  const checkAuth = async () => {
    try {
      if (authState.status === "unauthenticated") {
        setState({status: "unauthenticated"})
      } else if (authState.status === "init") {
        setState({status: "loading"})
        const authData = await authState.initPromise;
        setState(checkRoles(requiredRoles ?? [], authData))
      } else {
        setState(checkRoles(requiredRoles ?? [], authState.data))
      }
    } catch (error) {
      const errMsg =  error instanceof Error ? error.message : "Unknown Error"
      if (error instanceof NoRefreshError) {
        useAuthStore.getState().clearAccessToken()
        setState({status:"unauthenticated"})
        return
      } else if (error instanceof InvalidRefreshError) {
        useAuthStore.getState().clearAccessToken()
        setState({status:"error", error:"Invalid Session Please Login Again"})
        return
      } 
      setState({status:"error", error:errMsg})
    }
  }

  useEffect(() => {
    checkAuth();
  }, [requiredRoles, authState]);

  return state ;
};

function checkRoles(
  requiredRoles: string[],
  authData: AuthData
): AuthCheckState {
  if (requiredRoles.length === 0) {
    return {
      status: "authenticated",
      data: authData,
    };
  }
  const hasRole = requiredRoles.some((role) => authData.roles.includes(role));

  if (!hasRole) {
    return { status: "unauthorized" };
  }

  return { status: "authenticated", data: authData };
}
