import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../services/AuthService";
import { AxiosError } from "axios";

function Signup() {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmationPassword: "",
    fullName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const passwordsMatch =
    form.password === form.confirmationPassword ||
    form.confirmationPassword === "";
  const passwordValid = form.password.length >= 8 || form.password === "";
  const usernameValid = form.username.length >= 3 && usernameRegex.test(form.username) || form.username === "";
  const emailValid = emailRegex.test(form.email) || form.email === "";

  const isFormValid =
    passwordsMatch &&
    passwordValid &&
    usernameValid &&
    emailValid;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordsMatch) return;

    try {
      await signup(
        form.username,
        form.email,
        form.password,
        form.fullName
      );
    } catch (err) {
      console.error("Signup failed:", err);
      if (err instanceof AxiosError) {
        if (err.response) {
          setError(
            (err.response.data?.error?.details ||
              err.response.data?.message ||
              "Request failed" ) + ` (${err.response.status})`
          );
        } else {
          setError("Server is unreachable");
        }

      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something unexpected happend");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h2>

        <p className="text-gray-500 text-center mb-6">
          Sign up for a new account
        </p>

        {error && (
          <div className="bg-red-100 border mb-5 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
          Sign Up Failed: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Full Name (Optional)
            </label>
            <input
              name="fullName"
              value={form.fullName}
              maxLength={255}
              placeholder="Enter your full name"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {form.fullName.length === 255 && (
              <p className="text-red-500 text-sm mt-1">
                fullname can only be less than 255 characters
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Username
            </label>
            <input
              name="username"
              value={form.username}
              maxLength={255}
              required
              placeholder="Enter username"
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2
                ${usernameValid
                  ? "border-gray-300 focus:ring-blue-500"
                  : "border-red-500 focus:ring-red-500"
                }`}
            />
            {(!usernameValid && form.username.length !== 255) && (
              <p className="text-red-500 text-sm mt-1">
              Username must be more than 3 characters and can only contain letters and numbers
              </p>
            )}
            {form.username.length === 255 && (
              <p className="text-red-500 text-sm mt-1">
                username can only be less than 255 characters
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Email
            </label>
            <input
              name="email"
              value={form.email}
              maxLength={255}
              required
              placeholder="Enter email"
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2
                ${emailValid
                  ? "border-gray-300 focus:ring-blue-500"
                  : "border-red-500 focus:ring-red-500"
                }`}
            />
            {(!emailValid && form.email.length !== 255) && (
              <p className="text-red-500 text-sm mt-1">
              Please enter a valid email address
              </p>
            )}
            {form.email.length === 255 && (
              <p className="text-red-500 text-sm mt-1">
                email can only be less than 255 characters
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              maxLength={72}
              required
              placeholder="Enter password"
              onChange={handleChange}
              className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${passwordValid
                  ? "border-gray-300 focus:ring-blue-500"
                  : "border-red-500 focus:ring-red-500"
              }`}
            />
            {!passwordValid && (
              <p className="text-red-500 text-sm mt-1">
                password must be 8 character minimum
              </p>
            )}

            {form.password.length === 72 && (
              <p className="text-red-500 text-sm mt-1">
                Password can only be less than 72 characters
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Confirm Password
            </label>
            <input
              name="confirmationPassword"
              type="password"
              value={form.confirmationPassword}
              maxLength={72}
              required
              placeholder="Confirm password"
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2
              ${
                passwordsMatch || form.password.length === 72
                  ? "border-gray-300 focus:ring-blue-500"
                  : "border-red-500 focus:ring-red-500"
              }`}
            />

            {!passwordsMatch && (
              <p className="text-red-500 text-sm mt-1">
                Passwords do not match
              </p>
            )}

          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 mt-2 rounded-lg font-semibold transition
            ${
              isFormValid
                ? "bg-gray-950 text-white hover:bg-gray-800"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            SIGN UP
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
