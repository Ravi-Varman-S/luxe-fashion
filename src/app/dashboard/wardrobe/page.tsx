"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WardrobeUpload from "@/components/wardrobe/wardrobe-upload";
import WardrobeList from "@/components/wardrobe/wardrobe-list";

export default function WardrobePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleItemAdded = () => {
    setShowUpload(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold tracking-wider text-black">
                LUXE
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-black">
                  Dashboard
                </Link>
                <Link href="/dashboard/wardrobe" className="text-sm font-medium text-black border-b-2 border-black pb-1">
                  My Wardrobe
                </Link>
                <Link href="/dashboard/combinations" className="text-sm font-medium text-gray-700 hover:text-black">
                  Combinations
                </Link>
                <Link href="/dashboard/try-on" className="text-sm font-medium text-gray-700 hover:text-black">
                  Virtual Try-On
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">My Wardrobe</h1>
            <p className="mt-1 text-gray-500">
              Upload and manage your dress collection
            </p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Dress
          </button>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Add to Wardrobe</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <svg
                    className="h-5 w-5"
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
              <WardrobeUpload onItemAdded={handleItemAdded} />
            </div>
          </div>
        )}

        {/* Wardrobe List */}
        <WardrobeList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}
