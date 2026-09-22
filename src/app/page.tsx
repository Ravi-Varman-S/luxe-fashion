"use client";

import { useSession } from "next-auth/react";
import AuthButton from "@/components/auth-button";
import Link from "next/link";

const featuredProducts = [
  {
    id: 1,
    name: "Cashmere Sweater",
    price: 299,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop",
    category: "Knitwear",
  },
  {
    id: 2,
    name: "Silk Dress",
    price: 459,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
    category: "Dresses",
  },
  {
    id: 3,
    name: "Leather Jacket",
    price: 689,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
    category: "Outerwear",
  },
  {
    id: 4,
    name: "Tailored Trousers",
    price: 189,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
    category: "Bottoms",
  },
];

const categories = [
  { name: "New Arrivals", icon: "✦" },
  { name: "Women", icon: "♀" },
  { name: "Men", icon: "♂" },
  { name: "Accessories", icon: "◆" },
];

export default function Home() {
  const { data: session } = useSession();

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
                <Link href="#" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  Shop
                </Link>
                <Link href="#" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  Collections
                </Link>
                <Link href="#" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  About
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-br from-stone-100 to-stone-200">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gray-600">
              New Collection 2026
            </p>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-black md:text-6xl">
              Elevate Your
              <br />
              <span className="text-gray-500">Style</span>
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Discover our curated collection of premium fashion pieces.
              Timeless elegance meets modern design.
            </p>
            <div className="flex gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Get Started
                </Link>
              )}
              <Link
                href="#products"
                className="rounded-full border border-black px-8 py-3 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
              >
                View Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href="#"
                className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 p-8 transition-all hover:border-gray-200 hover:shadow-lg"
              >
                <span className="mb-3 text-3xl">{category.icon}</span>
                <span className="text-sm font-medium text-gray-800 group-hover:text-black">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-black">Featured Pieces</h2>
            <p className="text-gray-500">
              Handpicked selections from our latest collection
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href="#"
                className="group"
              >
                <div className="mb-4 aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                  {product.category}
                </p>
                <h3 className="mb-2 text-lg font-medium text-black">
                  {product.name}
                </h3>
                <p className="text-base font-semibold text-gray-800">
                  ${product.price}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Status Banner */}
      {!session && (
        <section className="py-16 bg-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Join LUXE Today
            </h2>
            <p className="mb-8 text-gray-400 max-w-xl mx-auto">
              Sign in with your Google account to unlock exclusive offers,
              save your favorites, and enjoy a personalized shopping experience.
            </p>
            <AuthButton />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold text-black">LUXE</h3>
              <p className="text-sm text-gray-500">
                Premium fashion for the modern individual.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-black">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-black">New Arrivals</Link></li>
                <li><Link href="#" className="hover:text-black">Women</Link></li>
                <li><Link href="#" className="hover:text-black">Men</Link></li>
                <li><Link href="#" className="hover:text-black">Accessories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-black">Help</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-black">FAQ</Link></li>
                <li><Link href="#" className="hover:text-black">Shipping</Link></li>
                <li><Link href="#" className="hover:text-black">Returns</Link></li>
                <li><Link href="#" className="hover:text-black">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-black">Follow Us</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-black">Instagram</Link></li>
                <li><Link href="#" className="hover:text-black">Pinterest</Link></li>
                <li><Link href="#" className="hover:text-black">Twitter</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
            © 2026 LUXE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
