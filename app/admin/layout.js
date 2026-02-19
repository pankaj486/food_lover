"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { ChefHat, Folder, LayoutDashboard, LogOut, Utensils, UserCircle } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { SocketStatusWithAuth } from "../components/SocketStatus";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Categories", icon: Folder },
  { href: "/admin/food", label: "Food Items", icon: Utensils },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isInitializing } = useAuth();

  const isAuthRoute = useMemo(() => pathname?.startsWith("/admin/login"), [pathname]);

  useEffect(() => {
    if (!isInitializing && !user && !isAuthRoute) {
      router.push("/admin/login");
    }
  }, [isInitializing, user, isAuthRoute, router]);

  if (isAuthRoute) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  if (!isInitializing && !user) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full lg:w-64 flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white px-4 py-4 lg:py-6 shadow-sm flex lg:shadow-sm order-2 lg:order-1">
          <div className="flex flex-wrap items-center justify-center gap-3 px-2 sm:flex-nowrap sm:justify-start">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow">
              <ChefHat className="h-5 w-5" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Food Lover</p>
              <p className="text-lg font-semibold text-slate-900">Admin Panel</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Signed in as</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <UserCircle className="h-4 w-4 text-slate-500" />
                <span>{isInitializing ? "Loading..." : user?.email || "Admin"}</span>
              </div>
            </div>
            <button
              onClick={async () => {
                await logout();
                toast.success("Logged out successfully");
                router.push("/admin/login");
              }}
              className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 inline-flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 order-1 lg:order-2">
          <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
        </main>
      </div>
      <SocketStatusWithAuth />
    </div>
  );
}
