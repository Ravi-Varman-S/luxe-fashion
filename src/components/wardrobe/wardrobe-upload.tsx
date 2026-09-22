"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "dress", label: "Dress" },
  { value: "shoes", label: "Shoes" },
  { value: "accessory", label: "Accessory" },
  { value: "outerwear", label: "Outerwear" },
];

const COLORS = [
  "Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple",
  "Orange", "Brown", "Grey", "Navy", "Beige", "Cream", "Teal", "Maroon",
];

export default function WardrobeUpload({ onItemAdded }: { onItemAdded?: () => void }) {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "top",
    color: "Black",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url && url !== "your_supabase_project_url" && url.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !preview) return;

    setIsUploading(true);
    try {
      if (isSupabaseConfigured()) {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        const fileName = `${session.user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("wardrobe-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("wardrobe-images")
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase.from("wardrobe_items").insert({
          user_id: session.user.id,
          name: formData.name,
          category: formData.category,
          color: formData.color,
          image_url: urlData.publicUrl,
        });

        if (dbError) throw dbError;
      } else {
        const localItems = JSON.parse(localStorage.getItem("luxe_wardrobe") || "[]");
        localItems.unshift({
          id: `local-${Date.now()}`,
          user_id: session.user.id,
          name: formData.name,
          category: formData.category,
          color: formData.color,
          image_url: preview,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("luxe_wardrobe", JSON.stringify(localItems));
      }

      setFormData({ name: "", category: "top", color: "Black" });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      onItemAdded?.();
    } catch (error) {
      console.error("Error uploading item:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dress Image
        </label>
        <div
          className="relative flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Click to upload your dress photo
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Item Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Blue Summer Dress"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.value })}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                formData.category === cat.value
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                formData.color === color
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isUploading || !preview}
        className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isUploading ? "Uploading..." : "Add to Wardrobe"}
      </button>
    </form>
  );
}
