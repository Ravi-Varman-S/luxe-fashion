"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { removeBackground, removeBackgroundForDress } from "@/lib/bg-remove";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  image_url: string;
}

interface PlacedItem extends WardrobeItem {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export default function TryOnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [uploadingDress, setUploadingDress] = useState(false);
  const [processingBg, setProcessingBg] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  async function fetchWardrobe() {
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: false });

      if (!error && data) setWardrobe(data as WardrobeItem[]);
    } catch {
      // Supabase not configured
    }
  }

  useEffect(() => {
    if (session?.user?.email) fetchWardrobe();
  }, [session]);

  async function handleUploadUserPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = ev.target?.result as string;
      setUserPhoto(result);
      setProcessingBg(true);
      try {
        const processed = await removeBackground(result);
        setUserPhoto(processed);
      } catch {
        setUserPhoto(result);
      }
      setProcessingBg(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleUploadDress(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDress(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const rawUrl = ev.target?.result as string;
      let processedUrl = rawUrl;
      try {
        processedUrl = await removeBackgroundForDress(rawUrl);
      } catch {
        processedUrl = rawUrl;
      }
      const tempItem: WardrobeItem = {
        id: `temp-${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        category: "Uploaded",
        color: "#888888",
        image_url: processedUrl,
      };
      setWardrobe((prev) => [tempItem, ...prev]);
      setUploadingDress(false);
    };
    reader.readAsDataURL(file);
  }

  function placeItemOnCanvas(item: WardrobeItem) {
    const newItem: PlacedItem = {
      ...item,
      x: 50,
      y: 50,
      width: 150,
      height: 180,
      rotation: 0,
    };
    setPlacedItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  }

  function handleCanvasMouseDown(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const item = placedItems.find((p) => p.id === id);
    if (!item) return;
    dragOffset.current = {
      x: e.clientX - rect.left - item.x,
      y: e.clientY - rect.top - item.y,
    };
    setActiveDragId(id);
    setSelectedItemId(id);
  }

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!activeDragId || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.current.x;
      const y = e.clientY - rect.top - dragOffset.current.y;
      setPlacedItems((prev) =>
        prev.map((item) => (item.id === activeDragId ? { ...item, x, y } : item))
      );
    },
    [activeDragId]
  );

  function handleCanvasMouseUp() {
    setActiveDragId(null);
  }

  function updatePlacedItem(id: string, updates: Partial<PlacedItem>) {
    setPlacedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function deletePlacedItem(id: string) {
    setPlacedItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  }

  function clearAll() {
    setPlacedItems([]);
    setSelectedItemId(null);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const selectedItem = placedItems.find((i) => i.id === selectedItemId);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <Link href="/dashboard" className="text-2xl font-bold tracking-widest">
          LUXE
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-gray-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/wardrobe" className="hover:text-gray-600 transition-colors">
            Wardrobe
          </Link>
          <Link href="/dashboard/combinations" className="hover:text-gray-600 transition-colors">
            Combinations
          </Link>
          <Link href="/dashboard/try-on" className="font-semibold border-b-2 border-black pb-0.5">
            Try-On
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Virtual Try-On</h1>
        <p className="text-gray-500 mb-8">
          Upload your photo and drag wardrobe items onto it like a dressing doll.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Canvas Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upload Controls */}
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full cursor-pointer hover:bg-gray-800 transition-colors text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {processingBg ? "Removing background..." : "Upload Your Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadUserPhoto} />
              </label>

              <label className="inline-flex items-center gap-2 border border-black text-black px-5 py-2.5 rounded-full cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {uploadingDress ? "Removing background..." : "Upload New Dress"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadDress} disabled={uploadingDress} />
              </label>

              {placedItems.length > 0 && (
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 border border-red-500 text-red-500 px-5 py-2.5 rounded-full hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              className="relative bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 select-none"
              style={{ minHeight: 500 }}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onClick={() => setSelectedItemId(null)}
            >
              {/* User Photo Background */}
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="Your photo"
                  className="w-full h-full object-contain absolute inset-0"
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-lg font-medium">Upload a full-body photo</p>
                  <p className="text-sm">to start trying on outfits</p>
                </div>
              )}

              {/* Placed Items */}
              {placedItems.map((item) => (
                <div
                  key={item.id}
                  className={`absolute group ${activeDragId === item.id ? "z-50" : "z-10"}`}
                  style={{
                    left: item.x,
                    top: item.y,
                    width: item.width,
                    height: item.height,
                    transform: `rotate(${item.rotation}deg)`,
                    cursor: activeDragId === item.id ? "grabbing" : "grab",
                  }}
                  onMouseDown={(e) => handleCanvasMouseDown(e, item.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain pointer-events-none drop-shadow-lg"
                    draggable={false}
                  />

                  {/* Controls - show when selected */}
                  {selectedItemId === item.id && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black text-white rounded-full px-2 py-1 text-xs shadow-lg">
                      {/* Resize smaller */}
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePlacedItem(item.id, {
                            width: Math.max(50, item.width - 20),
                            height: Math.max(60, item.height - 24),
                          });
                        }}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                        title="Shrink"
                      >
                        −
                      </button>

                      {/* Resize larger */}
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePlacedItem(item.id, {
                            width: Math.min(400, item.width + 20),
                            height: Math.min(480, item.height + 24),
                          });
                        }}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                        title="Enlarge"
                      >
                        +
                      </button>

                      {/* Rotate left */}
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePlacedItem(item.id, { rotation: item.rotation - 15 });
                        }}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                        title="Rotate Left"
                      >
                        ↺
                      </button>

                      {/* Rotate right */}
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePlacedItem(item.id, { rotation: item.rotation + 15 });
                        }}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                        title="Rotate Right"
                      >
                        ↻
                      </button>

                      {/* Delete */}
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlacedItem(item.id);
                        }}
                        className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Selection border */}
                  {selectedItemId === item.id && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                  )}
                </div>
              ))}
            </div>

            {/* Item details when selected */}
            {selectedItem && (
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{selectedItem.name}</p>
                  <p className="text-sm text-gray-500">
                    Position: ({Math.round(selectedItem.x)}, {Math.round(selectedItem.y)}) ·
                    Size: {Math.round(selectedItem.width)}×{Math.round(selectedItem.height)} ·
                    Rotation: {selectedItem.rotation}°
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">Width</label>
                  <input
                    type="range"
                    min={50}
                    max={400}
                    value={selectedItem.width}
                    onChange={(e) => {
                      const w = Number(e.target.value);
                      const ratio = selectedItem.height / selectedItem.width;
                      updatePlacedItem(selectedItem.id, { width: w, height: Math.round(w * ratio) });
                    }}
                    className="w-24"
                  />
                  <label className="text-xs text-gray-400">Height</label>
                  <input
                    type="range"
                    min={60}
                    max={480}
                    value={selectedItem.height}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      const ratio = selectedItem.width / selectedItem.height;
                      updatePlacedItem(selectedItem.id, { height: h, width: Math.round(h * ratio) });
                    }}
                    className="w-24"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right - Wardrobe Panel */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-5">
              <h2 className="text-lg font-bold mb-4">Your Wardrobe</h2>
              {wardrobe.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No items yet. Upload a dress or add items to your wardrobe.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {wardrobe.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => placeItemOnCanvas(item)}
                      className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-black hover:shadow-md transition-all text-left"
                    >
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.category}</p>
                      </div>
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-2xl p-5">
              <h2 className="text-lg font-bold mb-3">How It Works</h2>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>
                    <strong>Upload your photo</strong> — Click &quot;Upload Your Photo&quot; and choose a full-body
                    picture.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>
                    <strong>Pick an item</strong> — Click any wardrobe piece on the right panel to place it on
                    your photo.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>
                    <strong>Drag to position</strong> — Click and drag placed items to move them around.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>
                    <strong>Resize &amp; rotate</strong> — Use the +/− buttons to resize and ↺/↻ to rotate.
                    Or use the sliders below the canvas.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                    5
                  </span>
                  <span>
                    <strong>Delete</strong> — Click the × button on any placed item to remove it.
                  </span>
                </li>
              </ol>
            </div>

            {/* Quick Stats */}
            <div className="bg-black text-white rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Items Placed</p>
                  <p className="text-2xl font-bold">{placedItems.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Wardrobe</p>
                  <p className="text-2xl font-bold">{wardrobe.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
