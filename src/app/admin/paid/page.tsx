'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { toast } from 'sonner';
import { Banknote, Search, CheckCircle2 } from 'lucide-react';

export default function PaidDetailsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { user } = useAdminAuthStore();

  useEffect(() => {
    fetchPaidOrders();
  }, []);

  const fetchPaidOrders = async () => {
    try {
      if (!user?.token) return;
      const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/orders', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Filter strictly for PAID orders
      setOrders(data.filter((order: any) => order.isPaid === true));
    } catch (error) {
      toast.error('Failed to load financial ledger');
    }
  };

  const filteredOrders = orders.filter(
    (order) => order.id.toLowerCase().includes(search.toLowerCase()) || 
               (order.user?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  // Compute Aggregates
  const totalPaidRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalProductRevenue = filteredOrders.reduce((sum, order) => {
    const productCost = order.orderItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    return sum + productCost;
  }, 0);
  const totalCapturedFees = totalPaidRevenue - totalProductRevenue;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-green-400 flex items-center gap-3">
            <Banknote className="w-8 h-8" />
            Paid Ledger Details
          </h2>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Verify absolute isolated product revenue excluding shipping and extra COD configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Gross Collected</h3>
          <p className="text-2xl font-black mt-2 font-mono text-white">Rs {totalPaidRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 p-5 rounded-2xl">
          <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest">Isolated Product Revenue</h3>
          <p className="text-2xl font-black mt-2 font-mono text-green-400">Rs {totalProductRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl">
          <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Calculated Carrier Fees (Delivery + COD)</h3>
          <p className="text-2xl font-black mt-2 font-mono text-red-400">Rs {totalCapturedFees.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-widest">Financial History</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search paid ID or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all font-mono text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Date / Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Tx. Hash</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Gross Total</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-red-400 uppercase tracking-wider">- Fees</th>
                <th className="px-6 py-4 text-right text-xs font-black text-green-400 uppercase tracking-wider">= Product Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground font-medium uppercase tracking-widest text-sm">No Paid history recovered</td></tr>
              ) : (
                filteredOrders.map((order) => {
                  const productCost = order.orderItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                  const fees = order.total - productCost;

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground">
                        {order.id.split('-')[0].toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border border-green-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-medium opacity-50">
                        Rs {order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-medium text-red-400">
                        (- Rs {fees.toFixed(2)})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-black text-green-400">
                        Rs {productCost.toFixed(2)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
