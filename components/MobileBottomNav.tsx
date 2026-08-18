"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, Heart, User } from "lucide-react";

interface MobileBottomNavProps {
  cartCount: number;
  favoritesCount: number;
}

export function MobileBottomNav({ cartCount, favoritesCount }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-50 flex items-center justify-around py-2 px-3 shadow-lg pb-safe">
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 text-[11px] font-bold transition-colors ${
          pathname === "/" ? "text-teal-600 font-extrabold" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Shop</span>
      </Link>

      <a
        href="#categories-section"
        className="flex flex-col items-center gap-0.5 text-[11px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Grid className="w-5 h-5" />
        <span>Categories</span>
      </a>

      <Link
        href="/cart"
        className={`flex flex-col items-center gap-0.5 text-[11px] font-bold transition-colors relative ${
          pathname === "/cart" ? "text-teal-600 font-extrabold" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse shadow-xs">
              {cartCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </Link>

      <Link
        href="/checkout"
        className={`flex flex-col items-center gap-0.5 text-[11px] font-bold transition-colors relative ${
          pathname === "/checkout" ? "text-teal-600 font-extrabold" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <User className="w-5 h-5" />
        <span>Checkout</span>
      </Link>
    </nav>
  );
}
