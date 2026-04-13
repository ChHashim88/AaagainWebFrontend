'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Search, ShieldCheck, Mail, Calendar, Edit2, Trash2, X, Eye, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', password: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  // New Orders Modal States
  const [viewingOrdersUser, setViewingOrdersUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const { user } = useAdminAuthStore();

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/users', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
  }, [user]);

  const handleEditClick = (targetUser: any) => {
    setEditingUser(targetUser);
    setEditForm({ name: targetUser.name, email: targetUser.email, role: targetUser.role, password: '' });
  };

  const handleViewOrdersClick = async (targetUser: any) => {
    setViewingOrdersUser(targetUser);
    setLoadingOrders(true);
    setUserOrders([]);
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/user/${targetUser.id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setUserOrders(data);
    } catch (error) {
      toast.error('Failed to isolate user orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${editingUser.id}`, editForm, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('User updated successfully!');
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to permanently delete this user?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('User has been purged from the system.');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-cyan-400" />
            User Matrix
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">View and manage all registered civilian and admin entities.</p>
        </div>
        <div className="relative border border-white/10 rounded-xl overflow-hidden bg-black/50 focus-within:border-cyan-400/50 transition-colors">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-transparent outline-none py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-muted-foreground bg-white/[0.02]">
                <th className="py-4 px-6 font-bold">User Identity</th>
                <th className="py-4 px-6 font-bold">Registration Data</th>
                <th className="py-4 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground">
                    Scanning database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground">
                    No matching entities found in the system.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-lg border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold tracking-wide group-hover:text-white transition-colors">{u.name}</p>
                          <p className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 border-l border-white/5">
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] font-mono mt-1 opacity-50 px-1 py-0.5 bg-white/5 rounded w-max">ID: {u.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 border-l border-white/5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleViewOrdersClick(u)} className="p-2 bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 rounded-lg transition-colors border border-transparent hover:border-purple-500/30 flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                          <Eye className="w-4 h-4" /> <span>Orders</span>
                        </button>
                        <button onClick={() => handleEditClick(u)} className="p-2 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {/* User Modification Modal */}
        {editingUser && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-[50px] -z-10" />
              <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black uppercase tracking-wider mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
                Edit Entity
              </h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                   <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1 block">Full Name</label>
                   <input required type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 outline-none" />
                </div>
                <div>
                   <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1 block">Email Address</label>
                   <input required type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 outline-none" />
                </div>
                <div>
                   <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1 block flex justify-between">
                     Force Password Reset
                     <span className="text-[9px] text-yellow-500">Optional</span>
                   </label>
                   <input type="text" placeholder="Leave blank to keep existing password..." value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="w-full bg-black/50 border border-yellow-500/30 font-mono text-yellow-400 rounded-xl px-4 py-3 text-sm focus:border-yellow-400 outline-none" />
                   <p className="text-[10px] text-muted-foreground mt-2">Passwords cannot be viewed due to strict bcrypt cryptography. Typing here will permanently overwrite their existing hash.</p>
                </div>
                <div className="pt-4 border-t border-white/10 mt-6">
                  <button type="submit" disabled={isUpdating} className="w-full py-4 bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-cyan-300 transition-colors uppercase tracking-widest font-black rounded-xl disabled:opacity-50">
                    {isUpdating ? 'Transmitting...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* User Orders Isolated Matrix Modal */}
        {viewingOrdersUser && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] -z-10" />
              
              <div className="flex items-center justify-between shrink-0 mb-6 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
                    <Package className="w-6 h-6 text-purple-400" />
                    Isolated User Ledger
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm font-bold flex gap-2">
                    Viewing pipeline history for: <strong className="text-white">{viewingOrdersUser.name}</strong> 
                    <span className="opacity-50 font-mono">({viewingOrdersUser.email})</span>
                  </p>
                </div>
                <button onClick={() => setViewingOrdersUser(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-2 space-y-4 custom-scrollbar">
                {loadingOrders ? (
                  <div className="py-20 text-center text-muted-foreground animate-pulse font-bold tracking-widest uppercase">
                    Extracting historical transactions...
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <Package className="w-16 h-16 text-white/5 mb-4" />
                    <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Target user currently holds zero orders.</p>
                  </div>
                ) : (
                  userOrders.map((order, i) => (
                    <div key={order.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-colors">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground mb-1">ID: {order.id}</p>
                        <p className="font-bold text-sm tracking-widest uppercase">{new Date(order.createdAt).toLocaleString()}</p>
                        <p className="text-sm mt-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-black/50 border border-white/5 rounded-md text-cyan-400 font-mono font-bold">
                            Rs {order.total.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground tracking-widest uppercase">• {order.orderItems?.length || 0} unique items</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1 block">Pipeline Status</p>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex w-max mx-auto ${
                            order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                            order.status === 'Confirmed' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                            order.status === 'Processing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            order.status === 'Shipped' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            order.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.2)]' :
                            'bg-red-500/20 text-red-500 border border-red-500/30'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1 block">Payment</p>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex w-max mx-auto ${
                             order.isPaid ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                           }`}>
                             {order.isPaid ? 'Paid' : 'Unpaid'}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
