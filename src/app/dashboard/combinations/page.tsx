"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  image_url: string;
}

const COLOR_HARMONY: Record<string, string[]> = {
  Black: ["White", "Red", "Grey", "Beige", "Cream"],
  White: ["Black", "Navy", "Red", "Blue", "Grey"],
  Red: ["Black", "White", "Grey", "Navy", "Cream"],
  Blue: ["White", "Beige", "Grey", "Cream", "Brown"],
  Green: ["Black", "White", "Cream", "Brown", "Beige"],
  Yellow: ["Black", "White", "Navy", "Grey", "Blue"],
  Pink: ["Black", "White", "Grey", "Navy", "Cream"],
  Purple: ["Black", "White", "Grey", "Cream", "Beige"],
  Orange: ["Black", "White", "Navy", "Grey", "Brown"],
  Brown: ["White", "Beige", "Cream", "Green", "Blue"],
  Grey: ["Black", "White", "Pink", "Red", "Blue"],
  Navy: ["White", "Beige", "Cream", "Grey", "Red"],
  Beige: ["Black", "Navy", "Brown", "Blue", "Green"],
  Cream: ["Black", "Navy", "Brown", "Green", "Red"],
  Teal: ["Black", "White", "Grey", "Beige", "Cream"],
  Maroon: ["Black", "White", "Grey", "Cream", "Beige"],
};

function generateOutfits(items: WardrobeItem[], _occasion: string) {
  const tops = items.filter((i) => i.category === "top");
  const bottoms = items.filter((i) => i.category === "bottom");
  const dresses = items.filter((i) => i.category === "dress");
  const shoes = items.filter((i) => i.category === "shoes");
  const accessories = items.filter((i) => i.category === "accessory");
  const outerwear = items.filter((i) => i.category === "outerwear");
  const results: { name: string; items: WardrobeItem[] }[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      const compatible = COLOR_HARMONY[top.color] || [];
      if (compatible.includes(bottom.color) || Math.random() > 0.4) {
        const combo: WardrobeItem[] = [top, bottom];
        if (shoes.length) combo.push(shoes[Math.floor(Math.random() * shoes.length)]);
        if (accessories.length && Math.random() > 0.5) combo.push(accessories[Math.floor(Math.random() * accessories.length)]);
        if (outerwear.length && Math.random() > 0.7) combo.push(outerwear[Math.floor(Math.random() * outerwear.length)]);
        results.push({ name: `${top.name} + ${bottom.name}`, items: combo });
      }
    }
  }

  for (const dress of dresses) {
    const combo: WardrobeItem[] = [dress];
    if (shoes.length) combo.push(shoes[Math.floor(Math.random() * shoes.length)]);
    if (accessories.length && Math.random() > 0.5) combo.push(accessories[Math.floor(Math.random() * accessories.length)]);
    results.push({ name: dress.name, items: combo });
  }

  return results.sort(() => 0.5 - Math.random()).slice(0, 12);
}

export default function CombinationsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [combinations, setCombinations] = useState<{ name: string; items: WardrobeItem[] }[]>([]);
  const [occasion, setOccasion] = useState("Casual");
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data } = await supabase
        .from("wardrobe_items").select("*").eq("user_id", session?.user?.id).order("created_at", { ascending: false });
      if (data) setItems(data);
    } catch {
      // Supabase not configured
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.id) fetchItems();
  }, [session]);

  const handleGenerate = () => {
    setCombinations(generateOutfits(items, occasion));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-8">
            <Link href="/" className="text-2xl font-bold tracking-wider text-black">LUXE</Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-black">Dashboard</Link>
            <Link href="/dashboard/wardrobe" className="text-sm font-medium text-gray-700 hover:text-black">Wardrobe</Link>
            <Link href="/dashboard/combinations" className="text-sm font-medium text-black border-b-2 border-black pb-1">Combinations</Link>
            <Link href="/dashboard/try-on" className="text-sm font-medium text-gray-700 hover:text-black">Try-On</Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Outfit Combinations</h1>
          <p className="mt-1 text-gray-500">Generate outfit ideas from your wardrobe</p>
        </div>

        <div className="mb-8 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
            <div className="flex gap-2">
              {["Casual", "Formal", "Party", "Work", "Date Night"].map((o) => (
                <button key={o} onClick={() => setOccasion(o)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${occasion === o ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={items.length === 0}
            className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300">
            Generate Combinations
          </button>
        </div>

        {items.length === 0 && (
          <div className="py-16 text-center bg-gray-50 rounded-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800">No wardrobe items yet</p>
            <p className="mt-1 text-sm text-gray-500">Add clothes to your wardrobe and we'll create stunning outfit combos for you.</p>
            <Link href="/dashboard/wardrobe" className="mt-5 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
              Build Your Wardrobe
            </Link>
          </div>
        )}

        {combinations.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {combinations.map((combo, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-shadow">
                <h3 className="mb-3 text-lg font-semibold text-black">{combo.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {combo.items.map((item, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {combo.items.map((item, i) => (
                    <span key={i} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {item.name}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400 uppercase tracking-wider">{occasion}</p>
              </div>
            ))}
          </div>
        )}

        {combinations.length === 0 && items.length > 0 && (
          <div className="py-16 text-center bg-gray-50 rounded-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800">Ready to style your look?</p>
            <p className="mt-1 text-sm text-gray-500">Hit the button above to generate outfit ideas based on your wardrobe pieces.</p>
          </div>
        )}
      </main>
    </div>
  );
}
