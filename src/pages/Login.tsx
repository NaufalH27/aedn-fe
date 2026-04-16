import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import { jwtDecode } from "jwt-decode";
import useAuthStore from "../store/AuthStore";
import type { DecodedToken } from "../types/Auth";

type LoginMethod = "username" | "email";

type FormState = {
  username: string;
  email: string;
  password: string;
};

function Login() {
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState<LoginMethod>("username");

  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleMethod = () => {
    setLoginMethod((prev) =>
      prev === "username" ? "email" : "username"
    );

    setForm({
      username: "",
      email: "",
      password: "",
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const accessToken = await login(
        form.username,
        form.email,
        form.password,
        loginMethod
      );

      const decoded = jwtDecode<DecodedToken>(accessToken);
      const roles = decoded?.roles || [];

      useAuthStore.getState().setAccessToken(accessToken);

      if (roles.includes("ROLE_ADMIN")) {
        navigate("/admin");
      } else if (roles.includes("ROLE_USER")) {
        navigate("/home");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h2>

        <p className="text-gray-500 text-center mb-6">
          Login to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              {loginMethod === "username" ? "Username" : "Email"}
            </label>

            <input
              type="text"
              name={loginMethod}
              value={form[loginMethod]}
              placeholder={`Enter your ${loginMethod}`}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              placeholder="Enter your password"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <p
            onClick={toggleMethod}
            className="text-sm text-blue-600 cursor-pointer hover:underline"
          >
            Use {loginMethod === "username" ? "Email" : "Username"} instead
          </p>

          <button
            type="submit"
            className="w-full bg-gray-950 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            LOGIN
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
