"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../providers/AuthProvider";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, api, isInitializing } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "Veg",
    parentId: "",
    isActive: true,
  });

  useEffect(() => {
    if (user?.isAdmin) {
      loadCategories();
    }
  }, [user]);

  useEffect(() => {
    if (!isInitializing && user && !user.isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/dashboard");
    }
  }, [user, isInitializing, router]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/categories");
      setCategories(res.data.categories || []);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleNameChange = (name) => {
    setForm({
      ...form,
      name,
      slug: editingCategory ? form.slug : generateSlug(name),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.slug || !form.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingCategory) {
        await api.patch(`/api/admin/categories/${editingCategory.id}`, {
          name: form.name,
          slug: form.slug,
          type: form.type,
          parentId: form.parentId || null,
          isActive: form.isActive,
        });
        toast.success("Category updated");
      } else {
        await api.post("/api/admin/categories", {
          name: form.name,
          slug: form.slug,
          type: form.type,
          parentId: form.parentId || null,
        });
        toast.success("Category created");
      }
      
      resetForm();
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      type: category.type,
      parentId: category.parentId || "",
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will fail if the category has food items or child categories.")) return;
    
    try {
      await api.delete(`/api/admin/categories/${id}`);
      toast.success("Category deleted");
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      type: "Veg",
      parentId: "",
      isActive: true,
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <p className="text-slate-700">Loading...</p>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Admin Access Required</h1>
          <p className="text-slate-600 mb-6">You need admin privileges to access this page.</p>
          <Link href="/" className="inline-block px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Category Management</h1>
              <p className="text-slate-600 mt-1">Organize your food menu by categories</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/food"
                className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50"
              >
                Manage Food Items
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                {showForm ? "Cancel" : "Add Category"}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900"
                    placeholder="e.g., North Indian"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900"
                    placeholder="e.g., north-indian"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900"
                    required
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900"
                  >
                    <option value="">None (Top Level)</option>
                    {categories
                      .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {editingCategory && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                  />
                  <label className="text-sm font-medium text-slate-700">Active</label>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Categories ({categories.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              No categories yet. Click "Add Category" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Food Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{category.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.type === "Veg"
                              ? "bg-green-100 text-green-800"
                              : category.type === "Non-Veg"
                              ? "bg-red-100 text-red-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {category.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {category.parent?.name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {category._count?.foodItems || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.isActive
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-amber-600 hover:text-amber-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
