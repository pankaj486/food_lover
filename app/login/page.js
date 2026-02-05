"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { api, setAccessToken, setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [registerStatus, setRegisterStatus] = useState("Idle");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus("Signing in...");
    setError("");

    try {
      const response = await api.post("/api/login", {
        email: form.email,
        password: form.password,
      });

      setAccessToken(response.data.accessToken || "");
      setUser(response.data.user || null);
      setStatus("Authenticated");
      router.push("/");
    } catch (err) {
      setError("Login failed. Check your email and password.");
      setStatus("Login failed");
    }
  };

  const onRegister = async (event) => {
    event.preventDefault();
    setRegisterStatus("Creating account...");
    setRegisterError("");
    setRegisterSuccess("");

    try {
      await api.post("/api/register", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });
      setRegisterStatus("Account created");
      setRegisterSuccess("Account created. You can now sign in.");
      setRegisterForm({ name: "", email: "", password: "" });
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed.";
      setRegisterError(message);
      setRegisterStatus("Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d8f3dc_0%,#fefae0_35%,#edf6f9_70%,#ffffff_100%)] text-emerald-950">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-12">
        <div className="rounded-3xl border border-emerald-900/10 bg-white/85 p-8 shadow-[0_18px_40px_rgba(16,185,129,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Mermaid Auth Demo
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-emerald-950">Sign in</h1>
          <p className="mt-2 text-sm text-emerald-700">
            Use your real MongoDB-backed user account to access the protected API flow.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-emerald-800">
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 outline-none focus:border-emerald-400"
                placeholder="you@example.com"
              />
            </label>

            <label className="block text-sm font-medium text-emerald-800">
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 outline-none focus:border-emerald-400"
                placeholder="••••••••"
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              {status === "Signing in..." ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-emerald-700">
            <p>Status: {status}</p>
            <Link className="font-semibold text-emerald-800 hover:text-emerald-900" href="/">
              Back to flow
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-900/10 bg-white/80 p-8 shadow-[0_18px_40px_rgba(16,185,129,0.1)]">
          <h2 className="text-2xl font-semibold text-emerald-950">Create an account</h2>
          <p className="mt-2 text-sm text-emerald-700">
            New here? Register and then sign in to get your access token.
          </p>

          <form onSubmit={onRegister} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-emerald-800">
              Name (optional)
              <input
                name="name"
                type="text"
                value={registerForm.name}
                onChange={onRegisterChange}
                className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 outline-none focus:border-emerald-400"
                placeholder="Your name"
              />
            </label>

            <label className="block text-sm font-medium text-emerald-800">
              Email
              <input
                name="email"
                type="email"
                value={registerForm.email}
                onChange={onRegisterChange}
                required
                className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 outline-none focus:border-emerald-400"
                placeholder="you@example.com"
              />
            </label>

            <label className="block text-sm font-medium text-emerald-800">
              Password
              <input
                name="password"
                type="password"
                value={registerForm.password}
                onChange={onRegisterChange}
                required
                className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 outline-none focus:border-emerald-400"
                placeholder="Create a password"
              />
            </label>

            {registerError ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {registerError}
              </p>
            ) : null}

            {registerSuccess ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {registerSuccess}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              {registerStatus === "Creating account..." ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-xs text-emerald-700">Status: {registerStatus}</p>
        </div>
      </main>
    </div>
  );
}
