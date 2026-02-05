"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../providers/AuthProvider";
import { adminLogin, adminResendOtp, adminVerifyOtp } from "../../lib/authApi";

export default function AdminLoginPage() {
  const router = useRouter();
  const { api, setAccessToken, setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState("login");
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [otpStatus, setOtpStatus] = useState("Idle");
  const [otpError, setOtpError] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [otpId, setOtpId] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus("Signing in...");
    setError("");
    setOtpHint("");

    if (!form.email.trim() || !form.password) {
      const message = "Email and password are required.";
      setError(message);
      toast.error(message);
      setStatus("Login failed");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      const message = "Enter a valid email address.";
      setError(message);
      toast.error(message);
      setStatus("Login failed");
      return;
    }

    try {
      const response = await adminLogin(api, {
        email: form.email,
        password: form.password,
      });

      if (response.data?.requiresOtp) {
        setStatus("OTP required");
        setStep("otp");
        toast.success("OTP sent. Check your email.");
        const hint = response.headers["x-otp-dev-code"];
        if (hint) setOtpHint(hint);
        if (response.data?.otpId) setOtpId(response.data.otpId);
        setResendCooldown(30);
        return;
      }

      setStatus("Login failed");
      setError("OTP required but not issued.");
      toast.error("OTP step failed. Try again.");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed.";
      setError(message);
      toast.error(message);
      setStatus("Login failed");
    }
  };

  const onResendOtp = async () => {
    if (!form.email.trim() || !form.password) {
      toast.error("Enter your email and password to resend OTP.");
      return;
    }
    if (resendCooldown > 0) return;

    setStatus("Resending OTP...");
    setOtpError("");
    setOtpHint("");

    try {
      const response = await adminResendOtp(api, {
        email: form.email,
        password: form.password,
      });

      if (response.data?.requiresOtp) {
        toast.success("New OTP sent.");
        const hint = response.headers["x-otp-dev-code"];
        if (hint) setOtpHint(hint);
        if (response.data?.otpId) setOtpId(response.data.otpId);
        setResendCooldown(30);
        setStatus("OTP required");
        return;
      }
      toast.error("Unable to resend OTP.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onVerifyOtp = async (event) => {
    event.preventDefault();
    setOtpStatus("Verifying...");
    setOtpError("");

    if (!/^\d{6}$/.test(otpCode.trim())) {
      const message = "OTP must be 6 digits.";
      setOtpError(message);
      toast.error(message);
      setOtpStatus("Verification failed");
      return;
    }

    try {
      const response = await adminVerifyOtp(api, {
        email: form.email,
        code: otpCode,
        otpId: otpId || undefined,
      });

      setAccessToken(response.data.accessToken || "");
      setUser(response.data.user || null);
      setOtpStatus("Verified");
      toast.success("OTP verified. Welcome, admin!");
      router.push("/admin");
    } catch (err) {
      const message = err.response?.data?.message || "OTP verification failed.";
      setOtpError(message);
      toast.error(message);
      setOtpStatus("Verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f1f5f9_0%,#e2e8f0_45%,#ffffff_100%)] text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Food Lover Admin
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Use your admin email to access the console.
          </p>

          {step === "login" ? (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  placeholder="admin@example.com"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
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
                className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800"
              >
                {status === "Signing in..." ? "Signing in..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerifyOtp} className="mt-8 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Verification code
                <input
                  name="otp"
                  type="text"
                  value={otpCode}
                  onChange={(event) => {
                    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtpCode(digitsOnly);
                  }}
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  placeholder="6-digit code"
                />
              </label>

              {otpHint ? (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  Dev OTP: {otpHint}
                </p>
              ) : null}

              {otpError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {otpError}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800"
              >
                {otpStatus === "Verifying..." ? "Verifying..." : "Verify code"}
              </button>

              <button
                type="button"
                onClick={onResendOtp}
                disabled={resendCooldown > 0}
                className="w-full rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between text-xs text-slate-600">
            <p>Status: {step === "login" ? status : otpStatus}</p>
            <div className="flex items-center gap-3">
              <Link className="font-semibold text-slate-700 hover:text-slate-900" href="/">
                Back to landing
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
