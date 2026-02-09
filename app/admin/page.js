"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";

export default function AdminPage() {
  const router = useRouter();
  const { api, user, isInitializing } = useAuth();
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);

  const loadAdminData = useCallback(async () => {
    if (!user) {
      setError("Sign in to access the admin console.");
      return;
    }

    setStatus("Loading...");
    setError("");

    try {
      const [categoriesRes, foodItemsRes] = await Promise.all([
        api.get("/api/admin/categories"),
        api.get("/api/admin/food-items"),
      ]);

      setCategories(categoriesRes.data?.categories || []);
      setFoodItems(foodItemsRes.data?.foodItems || []);
      setStatus("Ready");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load admin data.";
      setError(message);
      setStatus("Failed");
      toast.error(message);
    }
  }, [api, user]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    if (!isInitializing && user && !user.isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/dashboard");
    }
  }, [user, isInitializing, router]);

  const stats = useMemo(() => {
    return [
      { label: "Categories", value: categories.length },
      { label: "Food Items", value: foodItems.length },
      { label: "Available Items", value: foodItems.filter(item => item.isAvailable).length },
    ];
  }, [categories, foodItems]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f1f5f9_0%,#e2e8f0_40%,#ffffff_100%)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

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

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8fafc_0%,#e2e8f0_45%,#ffffff_100%)] text-slate-900">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-12">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-[0_18px_40px_rgba(220,38,38,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-red-600">
              Access Denied
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Admin Only</h1>
            <p className="mt-2 text-sm text-slate-600">
              You don't have permission to access the admin panel.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-500"
              >
                Back to Home
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
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">
                Manage your restaurant's food catalog and monitor orders.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadAdminData}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-500"
              >
                Refresh data
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Quick Actions */}
        <section className="rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 via-orange-50 to-amber-50 p-6 shadow-[0_18px_40px_rgba(251,146,60,0.15)]">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <p className="mt-2 text-sm text-slate-600">Manage your restaurant's food catalog</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/categories"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-2xl">
                📂
              </div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-amber-600">Categories</p>
                <p className="text-xs text-slate-500">Manage categories</p>
              </div>
            </Link>
            
            <Link
              href="/admin/food"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-400 to-red-500 text-2xl">
                🍽️
              </div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-orange-600">Food Items</p>
                <p className="text-xs text-slate-500">Add & edit food</p>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-400 to-indigo-500 text-2xl">
                📦
              </div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-blue-600">Orders</p>
                <p className="text-xs text-slate-500">Coming soon</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Food Service Stats */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Restaurant Overview</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 via-white to-orange-50 p-5 shadow-[0_18px_40px_rgba(251,146,60,0.12)]"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-amber-600">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="font-semibold text-slate-900">Getting Started</p>
          <p className="mt-2">
            Use the Quick Actions above to manage your food catalog. Add categories first, then create food items under those categories. Use the View Menu link to see how customers will browse your offerings.
          </p>
        </section>
      </main>
    </div>
  );
}
