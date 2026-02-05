"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

export default function AdminPage() {
  const { api, user } = useAuth();
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [otps, setOtps] = useState([]);
  const [revokingId, setRevokingId] = useState("");

  const loadAdminData = useCallback(async () => {
    if (!user) {
      setError("Sign in to access the admin console.");
      return;
    }

    setStatus("Loading...");
    setError("");

    try {
      const [overviewRes, usersRes, otpsRes] = await Promise.all([
        api.get("/api/admin/overview"),
        api.get("/api/admin/users"),
        api.get("/api/admin/otps"),
      ]);

      setOverview(overviewRes.data || null);
      setUsers(usersRes.data?.users || []);
      setOtps(otpsRes.data?.otps || []);
      setStatus("Ready");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load admin data.";
      setError(message);
      setStatus("Failed");
      toast.error(message);
    }
  }, [api, user]);

  const revokeOtp = async (id) => {
    if (!id || revokingId) return;

    setRevokingId(id);
    try {
      await api.post("/api/admin/otps/revoke", { id });
      toast.success("OTP revoked");
      await loadAdminData();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to revoke OTP.";
      toast.error(message);
    } finally {
      setRevokingId("");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const stats = useMemo(() => {
    if (!overview?.totals) return [];
    return [
      { label: "Total users", value: overview.totals.users },
      { label: "Total OTPs", value: overview.totals.otps },
      { label: "Active OTPs", value: overview.totals.activeOtps },
    ];
  }, [overview]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8fafc_0%,#e2e8f0_45%,#ffffff_100%)] text-slate-900">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-12">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              Food Lover
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Admin console</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to access admin operations and audit data.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/admin/login"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
              >
                Sign in
              </Link>
              <Link
                href="/"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-500"
              >
                Back to landing
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f1f5f9_0%,#e2e8f0_40%,#ffffff_100%)] text-slate-950">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Food Lover</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Admin console</h1>
              <p className="mt-2 text-sm text-slate-600">
                Monitor sign-ins, OTP activity, and user registrations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadAdminData}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-500"
              >
                Refresh data
              </button>
              <Link
                href="/dashboard"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-semibold text-slate-900">Latest users</h2>
            <p className="mt-2 text-sm text-slate-600">Newest accounts created in the system.</p>
            <div className="mt-4 space-y-3">
              {users.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  No users yet.
                </p>
              ) : (
                users.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-900"
                  >
                    <p className="font-semibold text-slate-900">{row.email}</p>
                    <p className="text-xs text-slate-600">{row.name || "No name"}</p>
                    <p className="text-xs text-slate-500">Created: {formatDate(row.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-semibold text-slate-900">Recent OTP activity</h2>
            <p className="mt-2 text-sm text-slate-600">Monitor OTP creation and expiration.</p>
            <div className="mt-4 space-y-3">
              {otps.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  No OTPs yet.
                </p>
              ) : (
                otps.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {row.user?.email || row.userId}
                        </p>
                        <p className="text-xs text-slate-600">Purpose: {row.purpose}</p>
                        <p className="text-xs text-slate-500">
                          Expires: {formatDate(row.expiresAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          Used: {row.usedAt ? formatDate(row.usedAt) : "Not used"}
                        </p>
                        <button
                          onClick={() => revokeOtp(row.id)}
                          disabled={Boolean(row.usedAt) || revokingId === row.id}
                          className="mt-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {row.usedAt ? "Revoked" : revokingId === row.id ? "Revoking..." : "Revoke"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="font-semibold text-slate-900">Admin access control</p>
          <p className="mt-2">
            Set `ADMIN_EMAILS` (comma-separated) or `ADMIN_EMAIL` in `.env` to grant admin access
            based on the email embedded in access tokens.
          </p>
        </section>
      </main>
    </div>
  );
}
