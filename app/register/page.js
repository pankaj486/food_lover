"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { api, setAccessToken, setUser } = useAuth();
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [registerStatus, setRegisterStatus] = useState("Idle");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [step, setStep] = useState("register");
  const [otpCode, setOtpCode] = useState("");
  const [otpStatus, setOtpStatus] = useState("Idle");
  const [otpError, setOtpError] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [otpId, setOtpId] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const onRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const onRegister = async (event) => {
    event.preventDefault();
    setRegisterStatus("Creating account...");
    setRegisterError("");
    setRegisterSuccess("");

    if (!registerForm.email.trim() || !registerForm.password) {
      const message = "Email and password are required.";
      setRegisterError(message);
      toast.error(message);
      setRegisterStatus("Registration failed");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email.trim())) {
      const message = "Enter a valid email address.";
      setRegisterError(message);
      toast.error(message);
      setRegisterStatus("Registration failed");
      return;
    }

    if (registerForm.password.length < 8) {
      const message = "Password must be at least 8 characters.";
      setRegisterError(message);
      toast.error(message);
      setRegisterStatus("Registration failed");
      return;
    }

    try {
      const response = await api.post("/api/register", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });

      if (response.data?.requiresOtp) {
        setRegisterStatus("OTP required");
        setStep("otp");
        const hint = response.headers["x-otp-dev-code"];
        if (hint) setOtpHint(hint);
        if (response.data?.otpId) setOtpId(response.data.otpId);
        setResendCooldown(30);
        setRegisterSuccess("Account created. Verify the OTP sent to your email.");
        toast.success("OTP sent. Check your email.");
        return;
      }

      setRegisterStatus("Account created");
      setRegisterSuccess("Account created. You can now sign in.");
      toast.success("Account created. Please sign in.");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed.";
      setRegisterError(message);
      toast.error(message);
      setRegisterStatus("Registration failed");
    }
  };

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
      const response = await api.post("/api/verify-otp", {
        email: registerForm.email,
        code: otpCode,
        otpId: otpId || undefined,
      });

      setAccessToken(response.data.accessToken || "");
      setUser(response.data.user || null);
      setOtpStatus("Verified");
      toast.success("OTP verified. Welcome!");
      router.push("/");
    } catch (err) {
      const message = err.response?.data?.message || "OTP verification failed.";
      setOtpError(message);
      toast.error(message);
      setOtpStatus("Verification failed");
    }
  };

  const onResendOtp = async () => {
    if (!registerForm.email.trim() || !registerForm.password) {
      toast.error("Enter your email and password to resend OTP.");
      return;
    }
    if (resendCooldown > 0) return;

    setRegisterStatus("Resending OTP...");
    setOtpError("");
    setOtpHint("");

    try {
      const response = await api.post("/api/resend-otp", {
        email: registerForm.email,
        password: registerForm.password,
      });

      if (response.data?.requiresOtp) {
        toast.success("New OTP sent.");
        const hint = response.headers["x-otp-dev-code"];
        if (hint) setOtpHint(hint);
        if (response.data?.otpId) setOtpId(response.data.otpId);
        setResendCooldown(30);
        setRegisterStatus("OTP required");
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d8f3dc_0%,#fefae0_35%,#edf6f9_70%,#ffffff_100%)] text-emerald-950">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
        <div className="rounded-3xl border border-emerald-900/10 bg-white/85 p-8 shadow-[0_18px_40px_rgba(16,185,129,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Food Lover
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-emerald-950">
            Create your Food Lover account
          </h1>
          <p className="mt-2 text-sm text-emerald-700">
            Join to save favorites, follow chefs, and unlock tasting menus.
          </p>

          {step === "register" ? (
            <form onSubmit={onRegister} className="mt-8 space-y-4">
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
                {registerStatus === "Creating account..." ? "Creating account..." : "Create account"}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerifyOtp} className="mt-8 space-y-4">
              <label className="block text-sm font-medium text-emerald-800">
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
                  className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 outline-none focus:border-emerald-400"
                  placeholder="6-digit code"
                />
              </label>

              {otpHint ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
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
                className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
              >
                {otpStatus === "Verifying..." ? "Verifying..." : "Verify code"}
              </button>

              <button
                type="button"
                onClick={onResendOtp}
                disabled={resendCooldown > 0}
                className="w-full rounded-full border border-emerald-300 px-4 py-3 text-sm font-semibold text-emerald-800 hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between text-xs text-emerald-700">
            <p>Status: {step === "register" ? registerStatus : otpStatus}</p>
            <Link className="font-semibold text-emerald-800 hover:text-emerald-900" href="/login">
              Back to Food Lover sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
