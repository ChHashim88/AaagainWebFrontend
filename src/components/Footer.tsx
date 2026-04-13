'use client';

import { usePathname } from 'next/navigation';

import Link from 'next/link';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname?.startsWith('/admin')) return null;
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm mt-24">
      <div className="w-full max-w-[1800px] mx-auto py-12 px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-start">
            <Link href="/" className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Aaagain
            </Link>
            <p className="mt-4 text-sm text-muted-foreground w-3/4">
              Building the future of footwear. Step into a new dimension of performance, comfort, and style.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shop?sort=new" className="hover:text-cyan-400 transition-colors">New Arrivals</Link></li>
              <li><Link href="/#trending" className="hover:text-cyan-400 transition-colors">Best Sellers</Link></li>
              <li><Link href="/shop?sale=true" className="hover:text-cyan-400 transition-colors">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Shipping & Returns</a></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Aaagain, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
