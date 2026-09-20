"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const features = [
  {
    title: "My Wardrobe",
    description: "Upload and manage your dress collection",
    href: "/dashboard/wardrobe",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: "Combinations",
    description: "Generate outfit ideas from your wardrobe",
    href: "/dashboard/combinations",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    title: "Virtual Try-On",
    description: "Upload your photo and try on outfits like a doll",
    href: "/dashboard/try-on",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold tracking-wider text-black">
                LUXE
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-medium text-black border-b-2 border-black pb-1">
                  Dashboard
                </Link>
                <Link href="/dashboard/wardrobe" className="text-sm font-medium text-gray-700 hover:text-black">
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
                <img src={session.user.image} alt="Profile" className="h-8 w-8 rounded-full" />
              )}
              <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-black">Welcome, {session.user?.name?.split(" ")[0]}</h1>
          <p className="mt-2 text-gray-500">Manage your wardrobe and discover new outfit combinations</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-2xl border border-gray-100 p-8 transition-all hover:border-gray-200 hover:shadow-lg"
            >
              <div className="mb-4 text-black group-hover:text-gray-600 transition-colors">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-black">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
