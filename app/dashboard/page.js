"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";

export default function DashboardPage() {
  const { accessToken, user, setAccessToken, api, logout, isInitializing } = useAuth();
  const [status, setStatus] = useState("Idle");
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [
      { id: crypto.randomUUID(), message, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  const tokenPreview = useMemo(() => {
    if (!accessToken) return "No access token";
    return `${accessToken.slice(0, 16)}...${accessToken.slice(-12)}`;
  }, [accessToken]);

  const refreshToken = async () => {
    addLog("Calling /api/refresh with refresh token cookie");

    try {
      const response = await api.post("/api/refresh");
      setAccessToken(response.data.accessToken || "");
      addLog("Refresh successful. New access token stored in memory.");
      toast.success("Access token refreshed");
      return response.data.accessToken;
    } catch (error) {
      addLog("Refresh token invalid. User must login again.");
      setAccessToken("");
      toast.error("Refresh failed. Please login again.");
      return null;
    }
  };

  const callProtected = async () => {
    if (!accessToken) {
      addLog("No access token in memory. Login first.");
      setStatus("Unauthorized");
      return;
    }

    setStatus("Calling protected API...");
    addLog("Calling /api/protected with Authorization header");

    try {
      const response = await api.get("/api/protected");
      addLog(`Protected data received: ${response.data.message}`);
      setStatus("Success");
      toast.success("Protected data received");
    } catch (error) {
      if (error.response?.status === 401) {
        addLog("Access token expired. Axios interceptor triggered refresh.");
        setStatus("Refreshing");
        toast("Refreshing access token...");
        return;
      }
      addLog("Protected API call failed.");
      setStatus("Request failed");
      toast.error("Protected API failed");
    }
  };

  const clearAccessToken = () => {
    setAccessToken("");
    addLog("Access token cleared from memory.");
    setStatus("Idle");
    toast("Access token cleared.");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fde68a_25%,#fff7ed_55%,#ffffff_100%)] text-slate-950">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-12">
          <div className="rounded-3xl border border-amber-200 bg-white/80 p-8 text-center shadow-[0_18px_40px_rgba(251,191,36,0.25)]">
            <p className="text-sm text-slate-700">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fde68a_25%,#fff7ed_55%,#ffffff_100%)] text-slate-950">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-12">
          <div className="rounded-3xl border border-amber-200 bg-white/80 p-8 text-center shadow-[0_18px_40px_rgba(251,191,36,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">
              Food Lover
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Dashboard access</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to view your orders, session tools, and protected API logs.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900 hover:border-amber-500"
              >
                Create account
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fde68a_25%,#fff7ed_55%,#ffffff_100%)] text-slate-950">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Food Lover</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Customer dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">
                Review your session, refresh tokens, and test protected APIs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900 hover:border-amber-500"
              >
                Back to landing
              </Link>
              <Link
                href="/profile"
                className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900 hover:border-amber-500"
              >
                Profile
              </Link>
              {user?.isAdmin ? (
                <Link
                  href="/admin"
                  className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900 hover:border-amber-500"
                >
                  Admin console
                </Link>
              ) : null}
              <button
                onClick={logout}
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-amber-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(251,191,36,0.18)]">
            <p className="text-sm font-semibold text-amber-700">Your Food Lover session</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{status}</p>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span className="font-semibold">Access token</span>
                <p className="mt-1 break-all text-xs text-amber-800">{tokenPreview}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-xs text-slate-900">
                <p>Signed-in user</p>
                <p className="mt-1 font-mono text-[11px]">{user?.email || "Not signed in"}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={refreshToken}
                  className="rounded-full border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-900 hover:border-amber-500"
                >
                  Refresh token
                </button>
                <button
                  onClick={clearAccessToken}
                  className="rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:border-amber-500"
                >
                  Clear access token
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(251,191,36,0.18)]">
            <h2 className="text-lg font-semibold text-slate-900">Order command center</h2>
            <p className="mt-2 text-sm text-slate-700">
              Use these controls to test secure APIs powering orders and kitchen updates.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={callProtected}
                className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900 hover:border-amber-500"
              >
                Fetch protected order data
              </button>
            </div>
            <div className="mt-6 max-h-[260px] space-y-3 overflow-y-auto pr-2">
              {logs.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
                  No events yet. Use the controls above to test the flow.
                </p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-slate-900"
                  >
                    <p className="text-xs text-amber-700">{log.time}</p>
                    <p className="mt-1">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
