"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  image_url: string;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  top: "Top",
  bottom: "Bottom",
  dress: "Dress",
  shoes: "Shoes",
  accessory: "Accessory",
  outerwear: "Outerwear",
};

export default function WardrobeList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchItems = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [session, refreshTrigger]);

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Remove this item from your wardrobe?")) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from("wardrobe_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Delete from storage
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("wardrobe-images").remove([fileName]);
      }

      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const filteredItems = filter === "all"
    ? items
    : items.filter((item) => item.category === filter);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] rounded-2xl bg-gray-200"></div>
            <div className="mt-2 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="mt-1 h-3 w-1/2 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {["all", "top", "bottom", "dress", "shoes", "accessory", "outerwear"].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === cat
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat === "all" ? "All Items" : CATEGORY_LABELS[cat]}
            </button>
          )
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No items yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload your first dress to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="group relative">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => handleDelete(item.id, item.image_url)}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {CATEGORY_LABELS[item.category]} • {item.color}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
