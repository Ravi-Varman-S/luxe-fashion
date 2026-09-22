"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

interface WardrobeItem {
  id: string;
  user_id: string;
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

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url && url !== "your_supabase_project_url" && url.length > 0;
  };

  const fetchItems = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("wardrobe_items")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setItems(data);
        }
      } else {
        const localItems = JSON.parse(localStorage.getItem("luxe_wardrobe") || "[]");
        const uid = session?.user?.id;
      setItems(localItems.filter((i: WardrobeItem) => uid && i.user_id === uid));
      }
    } catch {
      const localItems = JSON.parse(localStorage.getItem("luxe_wardrobe") || "[]");
      const uid = session?.user?.id;
      setItems(localItems.filter((i: WardrobeItem) => uid && i.user_id === uid));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [session, refreshTrigger]);

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Remove this item from your wardrobe?")) return;

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from("wardrobe_items")
          .delete()
          .eq("id", id);

        if (error) throw error;

        const fileName = imageUrl.split("/").pop();
        if (fileName) {
          await supabase.storage.from("wardrobe-images").remove([fileName]);
        }
      } else {
        const localItems = JSON.parse(localStorage.getItem("luxe_wardrobe") || "[]");
        localStorage.setItem(
          "luxe_wardrobe",
          JSON.stringify(localItems.filter((i: WardrobeItem) => i.id !== id))
        );
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
        <div className="py-20 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-50">
            <svg
              className="h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Your closet is calling — but it's empty
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
            Start building your collection by adding your first piece. Once it's here, the outfit magic begins.
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
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'h-full w-full flex items-center justify-center';
                      fallback.style.backgroundColor = '#f3f4f6';
                      fallback.innerHTML = `<svg class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                      parent.appendChild(fallback);
                    }
                  }}
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
