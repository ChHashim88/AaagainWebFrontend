'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({ 
    revenue: 0, 
    estimatedRevenue: 0, 
    orders: 0, 
    products: 0, 
    users: 0,
    revenueData: [],
    salesData: [],
    topProducts: [],
    metrics: {
      paid: 0, unpaid: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0
    }
  });
  const { user } = useAdminAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.token) return;
        const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/orders/stats', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black uppercase tracking-tight">Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Revenue', value: `Rs ${stats.revenue.toFixed(2)}`, change: 'Current active balance', color: 'text-green-400' },
          { title: 'Estimated Rev.', value: `Rs ${stats.estimatedRevenue.toFixed(2)}`, change: 'Total potential pipeline', color: 'text-cyan-400' },
          { title: 'Orders', value: stats.orders.toString(), change: 'Total cumulative orders', color: 'text-purple-400' },
          { title: 'Products', value: stats.products.toString(), change: 'In your catalog', color: 'text-rose-400' },
          { title: 'Users', value: stats.users.toString(), change: 'Customers & Admins', color: 'text-yellow-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl shadow-xl transition-all hover:border-white/20">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{kpi.title}</h3>
            <p className={`text-2xl font-black mt-3 font-mono ${kpi.color} truncate`}>{kpi.value}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-2 opacity-50">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Order Pipeline Detail Block */}
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-6 mt-8">
        <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6 border-b border-white/10 pb-4">Order Pipeline Breakdown</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending</span>
            <span className="text-lg font-mono font-black text-yellow-400">{stats.metrics.pending}</span>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Confirmed</span>
            <span className="text-lg font-mono font-black text-cyan-400">{stats.metrics.confirmed}</span>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Processing</span>
            <span className="text-lg font-mono font-black text-blue-400">{stats.metrics.processing}</span>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Shipped</span>
            <span className="text-lg font-mono font-black text-purple-400">{stats.metrics.shipped}</span>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivered</span>
            <span className="text-lg font-mono font-black text-green-400">{stats.metrics.delivered}</span>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cancelled</span>
            <span className="text-lg font-mono font-black text-red-500">{stats.metrics.cancelled}</span>
          </div>
          <div className="bg-white/5 border border-green-500/20 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Paid</span>
            <span className="text-lg font-mono font-black text-green-400">{stats.metrics.paid}</span>
          </div>
          <div className="bg-white/5 border border-red-500/20 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Unpaid</span>
            <span className="text-lg font-mono font-black text-red-400">{stats.metrics.unpaid}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl h-96">
          <h3 className="text-lg font-bold mb-4">Revenue Trajectory (6 Months)</h3>
          <ResponsiveContainer width="99%" height="100%" minHeight={1}>
            <LineChart data={stats.revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${value}`} width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" name="Realized Revenue (Paid)" dataKey="revenue" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              <Line type="monotone" name="Estimated Pipeline (All)" dataKey="estimatedRevenue" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl h-96">
          <h3 className="text-lg font-bold mb-4">Daily Volume (7 Days)</h3>
          <ResponsiveContainer width="99%" height="100%" minHeight={1}>
            <BarChart data={stats.salesData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} cursor={{ fill: '#ffffff10' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar name="Requested Orders" dataKey="totalOrders" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar name="Handled (Delivered)" dataKey="delivered" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-12">
        <div className="bg-[#0a0a0a] border border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.05)] p-6 rounded-2xl h-96">
          <h3 className="text-lg font-black uppercase tracking-widest text-center text-cyan-400 mb-4">Visual Pipeline Distribution</h3>
          <ResponsiveContainer width="99%" height="85%" minHeight={1}>
            <PieChart>
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ fontWeight: 'bold' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              <Pie 
                data={[
                  { name: 'Pending', value: stats.metrics.pending, fill: '#facc15' },
                  { name: 'Confirmed', value: stats.metrics.confirmed, fill: '#22d3ee' },
                  { name: 'Processing', value: stats.metrics.processing, fill: '#60a5fa' },
                  { name: 'Shipped', value: stats.metrics.shipped, fill: '#c084fc' },
                  { name: 'Delivered', value: stats.metrics.delivered, fill: '#4ade80' },
                  { name: 'Cancelled', value: stats.metrics.cancelled, fill: '#f87171' }
                ].filter(d => d.value > 0)} 
                cx="50%" 
                cy="50%" 
                innerRadius={70}
                outerRadius={100} 
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {[...Array(6)].map((_, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0a0a0a] border border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.05)] p-6 rounded-2xl h-96">
          <h3 className="text-lg font-black uppercase tracking-widest text-center text-pink-400 mb-4">Top 5 Brand Performance</h3>
          <ResponsiveContainer width="99%" height="85%" minHeight={1}>
            <BarChart data={stats.topBrands || []} layout="vertical" margin={{ left: 24, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} cursor={{ fill: '#ffffff10' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar name="Lifetime Units Sold" dataKey="sold" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar name="Physical Shelf Stock" dataKey="stock" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
