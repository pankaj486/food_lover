"use client";

import Link from "next/link";
import { useAuth } from "./providers/AuthProvider";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fde68a_25%,#fff7ed_55%,#ffffff_100%)] text-slate-950">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
        <header className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-200 font-bold text-amber-900">
                FL
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Food Lover</p>
                <p className="text-sm font-semibold text-slate-900">Fresh kitchens, bold flavors</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
                  >
                    Go to dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900 hover:border-amber-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="text-5xl font-semibold leading-tight text-slate-900">
                Discover local chefs, street favorites, and late-night cravings.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
                Food Lover connects hungry people with the best kitchens nearby. Track your
                orders, save favorites, and unlock exclusive tasting menus.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-amber-600">
                  Explore menus
                </button>
                <button className="rounded-full border border-amber-300 px-5 py-3 text-sm font-semibold text-amber-900 hover:border-amber-500">
                  Become a chef partner
                </button>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-amber-900">
                <span className="rounded-full bg-amber-100 px-3 py-1">Handpicked kitchens</span>
                <span className="rounded-full bg-amber-100 px-3 py-1">Live order tracking</span>
                <span className="rounded-full bg-amber-100 px-3 py-1">Chef stories</span>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(251,191,36,0.25)]">
              <p className="text-sm font-semibold text-amber-700">Welcome to Food Lover</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Fresh picks near you</p>
              <p className="mt-3 text-sm text-slate-700">
                Sign in to save your favorite kitchens, track orders live, and unlock
                tasting menus curated by local chefs.
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  "Top-rated biryani spots",
                  "Late-night street food",
                  "Chef specials & tasting menus",
                  "Healthy bowls under 500 cal",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-amber-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(251,191,36,0.18)]">
            <h2 className="text-lg font-semibold text-slate-900">Featured on Food Lover</h2>
            <p className="mt-2 text-sm text-slate-700">
              Replace these placeholders with real dishes, kitchen photos, or promotional banners.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "Biryani Night",
                "Coastal Curry",
                "Vegan Bowl",
                "Street Tacos",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <div className="h-24 rounded-xl bg-gradient-to-br from-amber-200 to-amber-100"></div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{item}</p>
                  <p className="text-xs text-slate-600">Image placeholder</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(251,191,36,0.18)]">
            <h2 className="text-lg font-semibold text-slate-900">Why Food Lover?</h2>
            <p className="mt-2 text-sm text-slate-700">A quick look at what you get once you join.</p>
            <div className="mt-6 grid gap-4">
              {[
                {
                  title: "Live order tracking",
                  detail: "Follow your meal from kitchen to doorstep with real-time updates.",
                },
                {
                  title: "Chef curated menus",
                  detail: "Seasonal specials and limited tasting drops every week.",
                },
                {
                  title: "Personalized picks",
                  detail: "Smart recommendations tailored to your cravings and diet.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
