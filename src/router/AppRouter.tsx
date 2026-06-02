import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/admin/Dashboard";
import Profile from "../pages/user/Profile";

import { useAuthCheck } from "../hooks/AuthCheck";
import { useEffect, type ReactNode } from "react";
import Commission from "../pages/user/Commission";
import Commissions from "../pages/user/Commissions";
import Topbar from "../components/topbar";
import useAuthStore from "../store/AuthStore";
import { InvalidRefreshError, NoRefreshError } from "../exception/RefreshException";
import { toast } from "../components/toast";
import OrderPage from "../pages/user/Orders";
import RequestPage from "../pages/user/Requests";
import { Home } from "../pages/Home";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const state = useAuthCheck(roles);

  if (state.status === "loading") return <div>Loading...</div>;
  if (state.status === "error") return <div>{state.error}</div>;
  if (state.status === "unauthenticated") return <div>unauthenticated</div>;
  if (state.status === "unauthorized") return <div>unauthorized</div>;

  return <>{children}</>;
};

function AppRouter() {
   useEffect(() => {
    useAuthStore
      .getState()
      .initAuth()
      .catch((error) => {
        if (error instanceof NoRefreshError) {
          useAuthStore.getState().clearAccessToken();
        } else if (error instanceof InvalidRefreshError) {
          useAuthStore.getState().clearAccessToken();
          toast("error", "Invalid Session Please Login Again");
        } else {
          toast(
            "error",
            error instanceof Error
              ? error.message
              : "Unknown Error When getting Auth Information"
          );
        }
      });
  }, []);
  return (
    <BrowserRouter>
      <Topbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="/commissions/:id" element={<Commission />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ROLE_ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["ROLE_USER"]}>
              <OrderPage/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute roles={["ROLE_USER"]}>
              <RequestPage/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["ROLE_USER"]}>
              <Profile/>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
