'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Package, User as UserIcon, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/orders/myorders', config);
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 py-12 min-h-[80vh]">
      <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Command Center
      </h1>
      <p className="text-muted-foreground mb-12">Manage your fleet of footwear.</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-2">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl mb-6 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-black font-black text-4xl mb-4 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold truncate w-full text-center">{user.name}</h2>
            <p className="text-xs text-cyan-400 font-mono mt-1 opacity-80">{user.email}</p>
          </div>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all border ${
              activeTab === 'orders' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400/30' : 'bg-transparent text-muted-foreground border-transparent hover:bg-white/5'
            }`}
          >
            <Package className="w-5 h-5" /> Order History
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all border ${
              activeTab === 'settings' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400/30' : 'bg-transparent text-muted-foreground border-transparent hover:bg-white/5'
            }`}
          >
            <UserIcon className="w-5 h-5" /> Account Settings
          </button>
          
          <button 
            onClick={() => { logout(); router.push('/signin'); }} 
            className="hidden lg:flex w-full items-center gap-4 px-6 py-4 rounded-2xl hover:bg-red-500/10 text-red-400 font-medium transition-colors mt-8 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[500px] overflow-hidden relative">
            <AnimatePresence mode="wait">
              
              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Order Arsenal</h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-20 text-cyan-400"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Package className="w-10 h-10" /></motion.div></div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">Your armory is empty. Deploy an order.</div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order.id} className="p-6 border border-white/10 rounded-2xl bg-white/[0.02]">
                          <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                            <div>
                              <p className="text-xs text-cyan-400 font-mono">#{order.id.split('-')[0].toUpperCase()}</p>
                              <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()} • {order.orderItems?.length || 0} items</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-xl">Rs {order.total.toFixed(2)}</p>
                              <span className="text-[10px] tracking-widest uppercase bg-white/10 px-2 py-1 rounded mt-1 inline-block">{order.paymentMethod}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-black px-3 py-1 rounded uppercase tracking-widest ${order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {order.status}
                            </span>
                            <Link href={`/product/${order.orderItems?.[0]?.productId}`} className="text-sm font-bold underline hover:text-cyan-400">
                             View Protocol
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Account Diagnostics</h2>
                  
                  <div className="max-w-md space-y-6">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Full Name</label>
                      <input type="text" value={user.name} disabled className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 opacity-50 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Contact Matrix (Email)</label>
                      <input type="email" value={user.email} disabled className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 opacity-50 outline-none" />
                    </div>
                    <p className="text-xs text-muted-foreground pt-4 border-t border-white/10">To amend credentials, contact higher-level administration endpoints.</p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Sign Out */}
        <div className="lg:hidden w-full mt-4">
          <button 
            onClick={() => { logout(); router.push('/signin'); }} 
            className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold tracking-widest uppercase transition-colors border border-red-500/20"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
