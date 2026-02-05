"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";

export default function ForgotPasswordPage() {
  const { api } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpHint, setOtpHint] = useState("");

  const requestOtp = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      const message = "Email is required.";
      setError(message);
      toast.error(message);
      return;
    }

    setStatus("Sending OTP...");

    try {
      const response = await api.post("/api/forgot-password", { email: email.trim() });
      const hint = response.headers["x-otp-dev-code"];
      if (hint) setOtpHint(hint);
      setOtpId(response.data?.otpId || "");
      setStep("verify");
      setStatus("OTP sent");
      toast.success("OTP sent. Check your email.");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send OTP.";
      setError(message);
      setStatus("Failed");
      toast.error(message);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setOtpError("");

    if (!otpCode.trim()) {
      const message = "OTP code is required.";
      setOtpError(message);
      toast.error(message);
      return;
    }

    if (!newPassword || !confirmPassword) {
      const message = "Enter and confirm your new password.";
      setOtpError(message);
      toast.error(message);
      return;
    }

    if (newPassword !== confirmPassword) {
      const message = "Passwords do not match.";
      setOtpError(message);
      toast.error(message);
      return;
    }

    setStatus("Resetting password...");

    try {
      await api.post("/api/reset-password", {
        email: email.trim(),
        code: otpCode,
        otpId: otpId || undefined,
        newPassword,
      });

      toast.success("Password updated. Please sign in.");
      router.push("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Password reset failed.";
      setOtpError(message);
      setStatus("Failed");
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fde68a_25%,#fff7ed_55%,#ffffff_100%)] text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-12">
        <div className="rounded-3xl border border-amber-200 bg-white/85 p-8 shadow-[0_18px_40px_rgba(251,191,36,0.25)]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">
            Food Lover
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-700">
            We will email you a one-time code to reset your password.
          </p>

          {step === "request" ? (
            <form onSubmit={requestOtp} className="mt-8 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400"
                  placeholder="you@example.com"
                />
              </label>

              {error ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-amber-600"
              >
                {status === "Sending OTP..." ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="mt-8 space-y-4">
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
                  className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400"
                  placeholder="6-digit code"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                New password
                <input
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400"
                  placeholder="Create a new password"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Confirm new password
                <input
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400"
                  placeholder="Re-enter new password"
                />
              </label>

              {otpHint ? (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
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
                className="w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-amber-600"
              >
                {status === "Resetting password..." ? "Resetting..." : "Reset password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setOtpError("");
                  setStatus("Idle");
                }}
                className="w-full rounded-full border border-amber-300 px-4 py-3 text-sm font-semibold text-amber-900 hover:border-amber-500"
              >
                Change email
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between text-xs text-amber-700">
            <p>Status: {status}</p>
            <div className="flex items-center gap-3">
              <Link className="font-semibold text-amber-900 hover:text-amber-950" href="/login">
                Back to sign in
              </Link>
              <Link className="font-semibold text-amber-900 hover:text-amber-950" href="/">
                Back to landing
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
