import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../store/AuthStore";
import { login } from "../services/AuthService";
import { useToast } from "../components/toast";

type LoginMethod = "username" | "email";
type LoginStatus = "idle" | "loading" | "success" | "error";

type FormState = {
  username: string;
  email: string;
  password: string;
};

function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("username");

  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
  });

  const resetStatus = () => {
    setStatus("idle");
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetStatus();

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleMethod = () => {
    resetStatus();

    setLoginMethod((prev) =>
      prev === "username" ? "email" : "username"
    );

    setForm({
      username: "",
      email: "",
      password: "",
    });
  };

  const {showToast} = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetStatus();
    setStatus("loading");

    try {
      const accessToken = await login(
        form.username,
        form.email,
        form.password,
        loginMethod
      );

      const authData = useAuthStore
        .getState()
        .setAccessToken(accessToken);

      setStatus("success");
      showToast("success", "Login Success");

      if (authData.roles.includes("ROLE_ADMIN")) {
        navigate("/admin");
      } else if (authData.roles.includes("ROLE_USER")) {
        navigate("/commissions");
      } else {
        navigate("/");
      }
    } catch (err) {
      setStatus("error");

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something unexpected happened");
      }
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 from-gray-950 via-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/95 shadow-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-950">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue to your account
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Login failed: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {loginMethod === "username" ? "Username" : "Email"}
            </label>

            <input
              type={loginMethod === "email" ? "email" : "text"}
              name={loginMethod}
              value={form[loginMethod]}
              placeholder={
                loginMethod === "username"
                  ? "Enter your username"
                  : "Enter your email"
              }
              maxLength={255}
              required
              disabled={isLoading}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/20 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                placeholder="Enter your password"
                maxLength={72}
                required
                disabled={isLoading}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMethod}
            disabled={isLoading}
            className="text-sm font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
          >
            Use {loginMethod === "username" ? "Email" : "Username"} instead
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gray-950 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
