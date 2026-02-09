"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, api, logout, isInitializing } = useAuth();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFoodItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/food-items");
      setFoodItems(response.data?.foodItems || []);
    } catch (error) {
      console.error("Failed to load food items:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadFoodItems();
  }, [loadFoodItems]);

  useEffect(() => {
    if (!isInitializing && user?.isAdmin) {
      toast.success("Redirecting to Admin Panel...");
      router.push("/admin");
    }
  }, [user, isInitializing, router]);

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
                Browse our delicious menu and manage your orders.
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
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-500"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Food Menu Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Our Menu</h2>
              <p className="mt-1 text-sm text-slate-600">Discover our delicious food items</p>
            </div>
            <div className="text-sm font-semibold text-amber-700">
              {foodItems.length} items available
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading menu items...</p>
              </div>
            </div>
          ) : foodItems.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/50 px-8 py-12 text-center">
              <p className="text-amber-900">No menu items available at the moment</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {foodItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col rounded-xl sm:rounded-2xl border border-amber-200 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:border-amber-300 overflow-hidden"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-linear-to-br from-amber-50 to-orange-50 w-full aspect-square sm:aspect-video">
                    {item.images && item.images.length > 0 && item.images[0]?.imageUrl ? (
                      <img
                        src={item.images[0].imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-amber-100 to-orange-100">
                        <span className="text-4xl sm:text-5xl">🍽️</span>
                      </div>
                    )}
                    
                    {/* Vegetarian Badge */}
                    {item.isVegetarian && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                        Veg
                      </div>
                    )}

                    {/* Availability Badge */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-semibold bg-red-600 px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 flex flex-col grow">
                    {/* Name and Category */}
                    <div className="mb-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-amber-700 font-semibold mt-1">
                        {item.category?.name || "Uncategorized"}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-2 sm:mb-3 leading-relaxed grow">
                      {item.description || "Delicious food item"}
                    </p>

                    {/* Price and Button */}
                    <div className="flex items-center justify-between gap-2 mt-auto pt-2 sm:pt-3 border-t border-amber-100">
                      <div>
                        <span className="text-lg sm:text-xl font-bold text-amber-600">
                          ₹{item.price}
                        </span>
                      </div>
                      <button
                        disabled={!item.isAvailable}
                        className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                          item.isAvailable
                            ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {item.isAvailable ? "Order" : "N/A"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
