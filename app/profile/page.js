"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";
import { uploadImage } from "../lib/uploadImage";

export default function ProfilePage() {
  const { user, logout, api, setUser } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");

  const [profileForm, setProfileForm] = useState({ name: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [profileStatus, setProfileStatus] = useState("Idle");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (!user) return;
    setProfileForm({ name: user.name || "" });
    setImagePreview(user.imageUrl || "");
  }, [user]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const onSaveProfile = async () => {
    setProfileError("");
    setProfileStatus("Saving...");

    try {
      let imageUrl = user?.imageUrl || "";

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      const response = await api.patch("/api/profile", {
        name: profileForm.name,
        imageUrl,
      });

      const updatedUser = response.data?.user || null;
      if (updatedUser) {
        setUser(updatedUser);
      }

      setProfileStatus("Saved");
      setImageFile(null);
      toast.success("Profile updated");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unable to update profile.";
      setProfileError(message);
      setProfileStatus("Failed");
      toast.error(message);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      const message = "Fill in all password fields.";
      setError(message);
      toast.error(message);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      const message = "New passwords do not match.";
      setError(message);
      toast.error(message);
      return;
    }

    setStatus("Updating...");

    try {
      await api.post("/api/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password updated.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setStatus("Updated");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to update password.";
      setError(message);
      setStatus("Failed");
      toast.error(message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fde68a_25%,#fff7ed_55%,#ffffff_100%)] text-slate-950">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-12">
          <div className="rounded-3xl border border-amber-200 bg-white/80 p-8 text-center shadow-[0_18px_40px_rgba(251,191,36,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">
              Food Lover
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Profile access</h1>
            <p className="mt-2 text-sm text-slate-700">Sign in to manage your profile.</p>
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

  const avatarInitial = (user.name || user.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fde68a_25%,#fff7ed_55%,#ffffff_100%)] text-slate-950">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Food Lover</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your profile</h1>
            <p className="mt-2 text-sm text-slate-700">
              Manage your account details and update your password.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900 hover:border-amber-500"
            >
              Back to dashboard
            </Link>
            <button
              onClick={logout}
              className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-amber-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(251,191,36,0.18)]">
            <h2 className="text-lg font-semibold text-slate-900">Profile details</h2>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border border-amber-200 bg-amber-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-amber-700">
                    {avatarInitial}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Profile photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="mt-2 block w-full text-sm text-slate-600"
                  />
                </label>
                <p className="mt-1 text-xs text-slate-500">PNG or JPG up to 5MB.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <label className="block text-sm font-medium text-slate-700">
                Name
                <input
                  name="name"
                  type="text"
                  value={profileForm.name}
                  onChange={onProfileChange}
                  className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400"
                  placeholder="Your name"
                />
              </label>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Email</p>
                <p className="mt-2 font-medium text-slate-900">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Role</p>
                <p className="mt-2 font-medium text-slate-900">
                  {user.isAdmin ? "Admin" : "Customer"}
                </p>
              </div>
            </div>

            {profileError ? (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {profileError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={onSaveProfile}
              className="mt-5 w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-amber-600"
            >
              {profileStatus === "Saving..." ? "Saving..." : "Save profile"}
            </button>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(251,191,36,0.18)]">
            <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
            <p className="mt-2 text-sm text-slate-700">
              Use a strong password you have not used elsewhere.
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Current password
                <input
                  name="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  onChange={onChange}
                  className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400"
                  placeholder="Enter current password"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                New password
                <input
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={onChange}
                  className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400"
                  placeholder="Create a new password"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Confirm new password
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={onChange}
                  className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400"
                  placeholder="Re-enter new password"
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
                {status === "Updating..." ? "Updating..." : "Update password"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
