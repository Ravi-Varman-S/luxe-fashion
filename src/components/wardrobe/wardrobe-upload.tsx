"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { saveItem, compressImage } from "@/lib/wardrobe-db";

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
  const [processingBg, setProcessingBg] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("image");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "top",
    color: "Black",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInfo({ name: file.name, size: file.size });
      const isImage = file.type.startsWith("image/");
      setFileType(isImage ? "image" : file.type || "file");

      const reader = new FileReader();
      reader.onloadend = async () => {
        const raw = reader.result as string;
        setPreview(raw);
        if (isImage) {
          setProcessingBg(true);
          try {
            const { removeBackgroundForDress } = await import("@/lib/bg-remove");
            const processed = await removeBackgroundForDress(raw);
            setPreview(processed);
          } catch {
            // keep original
          }
          setProcessingBg(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url && url !== "your_supabase_project_url" && url.length > 0;
  };

  const getUserId = () => {
    const s = session as Record<string, unknown> | null;
    const u = s?.user as Record<string, unknown> | undefined;
    return (u?.id as string) || (u?.sub as string) || "anonymous";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;
    if (!formData.name.trim()) return;

    const userId = getUserId();
    setIsUploading(true);
    try {
      if (isSupabaseConfigured()) {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("wardrobe-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("wardrobe-images")
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase.from("wardrobe_items").insert({
          user_id: userId,
          name: formData.name,
          category: formData.category,
          color: formData.color,
          image_url: urlData.publicUrl,
        });

        if (dbError) throw dbError;
      } else {
        let storedUrl = preview;
        if (fileType === "image") {
          storedUrl = await compressImage(preview, 800, 0.8);
        }
        await saveItem({
          id: `local-${Date.now()}`,
          user_id: userId,
          name: formData.name,
          category: formData.category,
          color: formData.color,
          image_url: storedUrl,
          created_at: new Date().toISOString(),
        });
      }

      setFormData({ name: "", category: "top", color: "Black" });
      setPreview(null);
      setFileType("image");
      setFileInfo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      onItemAdded?.();
      alert("Item added to wardrobe!");
    } catch (error) {
      console.error("Error uploading item:", error);
      alert("Failed to add item: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dress File (image, PDF, etc.)
        </label>
        <div
          className="relative flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview && fileType === "image" ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : preview ? (
            <div className="text-center px-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-700 truncate max-w-[200px] mx-auto">
                {fileInfo?.name}
              </p>
              <p className="text-xs text-gray-400">
                {fileInfo ? `${(fileInfo.size / 1024).toFixed(1)} KB` : ""}
              </p>
            </div>
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
                Click to upload any file (image, PDF, etc.)
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
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
        disabled={isUploading || processingBg || !preview}
        className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {processingBg
          ? "Removing background..."
          : isUploading
          ? "Uploading..."
          : "Add to Wardrobe"}
      </button>
    </form>
  );
}
