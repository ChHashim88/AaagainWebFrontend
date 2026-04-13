'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const pathname = usePathname();

  if (pathname === '/login' || pathname?.startsWith('/admin')) return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Aaagain
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-sm font-medium hover:text-cyan-400 transition-colors">
              All Products
            </Link>
            <Link href="/shop?category=Men" className="text-sm font-medium hover:text-cyan-400 transition-colors">
              Men
            </Link>
            <Link href="/shop?category=Women" className="text-sm font-medium hover:text-cyan-400 transition-colors">
              Women
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/cart" className="relative hover:text-cyan-400 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-cyan-500 text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/profile" className="hover:text-cyan-400 transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border/50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link onClick={() => setIsOpen(false)} href="/shop" className="block px-3 py-2 text-base font-medium hover:bg-white/5 rounded-md">
              Shop All
            </Link>
            <Link onClick={() => setIsOpen(false)} href="/shop?category=Men" className="block px-3 py-2 text-base font-medium hover:bg-white/5 rounded-md">
              Men
            </Link>
            <Link onClick={() => setIsOpen(false)} href="/shop?category=Women" className="block px-3 py-2 text-base font-medium hover:bg-white/5 rounded-md">
              Women
            </Link>
            <Link onClick={() => setIsOpen(false)} href="/cart" className="block px-3 py-2 text-base font-medium hover:bg-white/5 rounded-md">
              Cart ({cartCount})
            </Link>
            <Link onClick={() => setIsOpen(false)} href="/profile" className="block px-3 py-2 text-base font-medium hover:bg-white/5 rounded-md">
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
