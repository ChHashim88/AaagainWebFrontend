'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { toast } from 'sonner';
import { LayoutDashboard, Tag, ShoppingBag, Banknote, Users, Settings, LogOut, Menu, X, MessageSquare } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Live Notification Polling
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const prevTotalOrdersRef = useRef<number | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [user, router, isHydrated]);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isAuthorized || !user?.token) return;

    const fetchStats = async () => {
      try {
        const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/orders/stats', {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const currentTotal = data.orders;
        setPendingOrdersCount(data.metrics?.pending || 0);

        if (prevTotalOrdersRef.current !== null && currentTotal > prevTotalOrdersRef.current) {
          const newAmount = currentTotal - prevTotalOrdersRef.current;
          toast.success(`🚨 ${newAmount} New Order${newAmount > 1 ? 's' : ''} Received!`, {
            description: 'A customer just completed checkout. Process it via the Orders dashboard.',
            duration: 8000,
          });
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {});
        }
        
        prevTotalOrdersRef.current = currentTotal;
      } catch (error: any) {
        if (error.response?.status === 401) {
          logout();
          router.push('/login');
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [isAuthorized, user?.token]);

  if (!isAuthorized) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400">Verifying access...</div>;
  }

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname?.startsWith(path);
  };

  const NavLinks = () => (
    <>
      <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin') ? 'bg-white/5 text-cyan-400 font-bold' : 'text-muted-foreground hover:text-white hover:bg-white/5 font-medium'}`}>
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/products') ? 'bg-white/5 text-cyan-400 font-bold' : 'text-muted-foreground hover:text-white hover:bg-white/5 font-medium'}`}>
        <Tag className="w-5 h-5" />
        <span>Products</span>
      </Link>
      <Link href="/admin/orders" className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors group ${isActive('/admin/orders') ? 'bg-white/5 text-cyan-400 font-bold' : 'text-muted-foreground hover:text-white hover:bg-white/5 font-medium'}`}>
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </div>
        {pendingOrdersCount > 0 && (
          <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full transition-colors ${isActive('/admin/orders') ? 'bg-cyan-400 text-black' : 'bg-cyan-500 text-black animate-[pulse_2s_ease-in-out_infinite] group-hover:bg-cyan-400'}`}>
            {pendingOrdersCount}
          </span>
        )}
      </Link>
      <Link href="/admin/paid" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/paid') ? 'bg-white/5 text-cyan-400 font-bold' : 'text-muted-foreground hover:text-white hover:bg-white/5 font-medium'}`}>
        <Banknote className="w-5 h-5" />
        <span>Paid Ledger</span>
      </Link>
      <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/users') ? 'bg-white/5 text-cyan-400 font-bold' : 'text-muted-foreground hover:text-white hover:bg-white/5 font-medium'}`}>
        <Users className="w-5 h-5" />
        <span>Users</span>
      </Link>
      <Link href="/admin/messages" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/messages') ? 'bg-white/5 text-cyan-400 font-bold' : 'text-muted-foreground hover:text-white hover:bg-white/5 font-medium'}`}>
        <MessageSquare className="w-5 h-5" />
        <span>Messages</span>
      </Link>
      <Link href="/admin/website" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/website') ? 'bg-white/5 text-cyan-400 font-bold' : 'text-muted-foreground hover:text-white hover:bg-white/5 font-medium'}`}>
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-black text-foreground">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/10 hidden md:flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Bazar Beats Admin
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors text-muted-foreground"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <aside className="w-[80vw] max-w-[300px] h-full bg-[#0a0a0a] border-r border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
              <span className="text-xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                AERO ADMIN
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-muted-foreground hover:text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              <NavLinks />
            </nav>
            <div className="p-4 border-t border-white/10">
              <button 
                onClick={() => { logout(); router.push('/login'); }}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors text-muted-foreground"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </aside>
          <div className="flex-1 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-background/50 backdrop-blur-md sticky top-0 z-10 w-full flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold truncate hidden sm:block">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm font-bold text-muted-foreground truncate">{user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-black font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6 pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}
