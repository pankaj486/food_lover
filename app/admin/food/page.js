"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../providers/AuthProvider";
import { uploadImage } from "../../lib/uploadImage";

export default function AdminFoodPage() {
  const router = useRouter();
  const { user, api, isInitializing } = useAuth();
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    isVeg: true,
    isAvailable: true,
    categoryId: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (!isInitializing && user && !user.isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/dashboard");
    }
  }, [user, isInitializing, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [foodRes, catRes] = await Promise.all([
        api.get("/api/admin/food-items"),
        api.get("/api/admin/categories"),
      ]);
      setFoodItems(foodRes.data.foodItems || []);
      setCategories(catRes.data.categories || []);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = editingItem?.images?.[0]?.imageUrl || "";

      // Upload image if a new file is selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      const foodData = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        isVeg: form.isVeg,
        isAvailable: form.isAvailable,
        categoryId: form.categoryId,
      };

      let foodItemId;
      
      if (editingItem) {
        await api.patch(`/api/admin/food-items/${editingItem.id}`, foodData);
        foodItemId = editingItem.id;
        toast.success("Food item updated");
      } else {
        const res = await api.post("/api/admin/food-items", foodData);
        foodItemId = res.data.foodItem.id;
        toast.success("Food item created");
      }

      // Add/Update image if uploaded
      if (imageFile && imageUrl) {
        await api.post(`/api/admin/food-items/${foodItemId}/images`, {
          imageUrl,
          isPrimary: true,
        });
      }
      
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      categoryId: item.categoryId,
    });
    setImagePreview(item.images?.[0]?.imageUrl || "");
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;
    
    try {
      await api.delete(`/api/admin/food-items/${id}`);
      toast.success("Food item deleted");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      isVeg: true,
      isAvailable: true,
      categoryId: "",
    });
    setImageFile(null);
    setImagePreview("");
    setEditingItem(null);
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
              <h1 className="text-3xl font-bold text-slate-900">Food Management</h1>
              <p className="text-slate-600 mt-1">Manage your food menu items</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/categories"
                className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50"
              >
                Manage Categories
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                {showForm ? "Cancel" : "Add Food Item"}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {editingItem ? "Edit Food Item" : "Add New Food Item"}
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
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900"
                    placeholder="e.g., Butter Chicken"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900"
                    placeholder="9.99"
                    required
                  />
                </div>

                <div className="flex gap-4 items-center pt-7">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isVeg}
                      onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
                      className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Vegetarian</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isAvailable}
                      onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                      className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Available</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900"
                  rows="3"
                  placeholder="Describe the dish..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Food Image
                </label>
                <div className="flex items-start gap-4">
                  {imagePreview && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Upload a food image (JPG, PNG, max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Food Items List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Food Items ({foodItems.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading...</div>
          ) : foodItems.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              No food items yet. Click "Add Food Item" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Type
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
                  {foodItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.images?.[0]?.imageUrl ? (
                          <img
                            src={item.images[0].imageUrl}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">
                            {item.isVeg ? "🥗" : "🍗"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-slate-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{item.category?.name || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">${item.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.isVeg
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.isVeg ? "Veg" : "Non-Veg"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.isAvailable
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-amber-600 hover:text-amber-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
