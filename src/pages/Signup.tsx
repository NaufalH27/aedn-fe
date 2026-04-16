import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../services/AuthService";

function Signup() {
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
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await signup(
        form.username,
        form.email,
        form.password,
        form.fullName
      );

    } catch (err) {
      console.error("Login failed:", err);
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

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Full Name
            </label>
            <input
              name="fullName"
              value={form.fullName}
              placeholder="Enter your full name"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Username
            </label>
            <input
              name="username"
              value={form.username}
              placeholder="Enter username"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              placeholder="Enter email"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              placeholder="Enter password"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Confirm Password
            </label>
            <input
              name="confirmationPassword"
              type="password"
              value={form.confirmationPassword}
              placeholder="Confirm password"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-950 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
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

