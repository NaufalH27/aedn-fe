import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/admin/Dashboard";
import Profile from "../pages/user/Profile";

import { useAuthCheck } from "../hooks/AuthCheck";
import type { ReactNode } from "react";
import Commission from "../pages/user/Commission";
import Commissions from "../pages/user/Commissions";
import Topbar from "../components/topbar";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { status, error } = useAuthCheck(roles);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>{error}</div>;
  if (status === "unauthenticated") return <div>unauthenticated</div>;
  if (status === "unauthorized") return <div>unauthorized</div>;

  return <>{children}</>;
};

function AppRouter() {
  return (
    <BrowserRouter>
      <Topbar />
      <Routes>
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
