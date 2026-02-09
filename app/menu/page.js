"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";

export default function MenuPage() {
  const router = useRouter();
  const { user, api, isInitializing } = useAuth();
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [selectedCategory, isVegOnly, searchQuery]);

  useEffect(() => {
    if (!isInitializing && user?.isAdmin) {
      toast.error("Admin users cannot access the public menu. Please use Admin Panel.");
      router.push("/admin");
    }
  }, [user, isInitializing, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (isVegOnly) params.append("isVeg", "true");
      if (searchQuery) params.append("search", searchQuery);

      const [foodRes, catRes] = await Promise.all([
        fetch(`/api/food-items?${params.toString()}`).then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);

      setFoodItems(foodRes.foodItems || []);
      setCategories(catRes.categories || []);
    } catch (error) {
      toast.error("Failed to load menu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    toast.success(`${item.name} added to cart!`);
    // TODO: Implement cart functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Our Menu</h1>
              <p className="text-slate-600 mt-1">Discover delicious food from our kitchen</p>
            </div>
            {user && (
              <div className="flex gap-3">
                <Link
                  href="/orders"
                  className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50"
                >
                  My Orders
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  Profile
                </Link>
              </div>
            )}
            {!user && (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for food..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Veg Filter */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVegOnly}
                  onChange={(e) => setIsVegOnly(e.target.checked)}
                  className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Vegetarian Only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Food Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading delicious food...</p>
          </div>
        ) : foodItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No items found</h3>
            <p className="text-slate-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 relative">
                  {item.images?.[0]?.imageUrl ? (
                    <img
                      src={item.images[0].imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                      {item.isVeg ? "🥗" : "🍗"}
                    </div>
                  )}
                  
                  {/* Veg/Non-Veg Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        item.isVeg
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.isVeg ? "🌱 Veg" : "🍖 Non-Veg"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <div className="text-xl font-bold text-amber-600">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>

                  {item.category && (
                    <div className="mb-2">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                        {item.category.name}
                      </span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {item.isAvailable ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed font-medium"
                    >
                      Currently Unavailable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && foodItems.length > 0 && (
          <div className="mt-8 text-center text-sm text-slate-600">
            Showing {foodItems.length} {foodItems.length === 1 ? "item" : "items"}
            {selectedCategory && " in selected category"}
            {isVegOnly && " (vegetarian only)"}
          </div>
        )}
      </div>
    </div>
  );
}
