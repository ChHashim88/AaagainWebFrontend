'use client';

import { useState, useEffect } from 'react';
import { Eye, X, Trash2, Settings } from 'lucide-react';
import axios from 'axios';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [statusModalOrder, setStatusModalOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newIsPaid, setNewIsPaid] = useState(false);

  const { user } = useAdminAuthStore();

  const fetchOrders = async () => {
    try {
      if (!user?.token) return;
      const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '/api/orders', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleSaveStatus = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      
      if (newStatus !== statusModalOrder.status) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/orders/${statusModalOrder.id}/status`, { status: newStatus }, config);
      }
      
      if (newIsPaid !== statusModalOrder.isPaid) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/orders/${statusModalOrder.id}/payment`, { isPaid: newIsPaid }, config);
      }

      toast.success('Order metrics successfully updated!');
      setStatusModalOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order details');
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('CRITICAL WARNING: Are you sure you want to literally destroy this entire order?\n\nThis will cleanly refund and restore all of the physical unit stock back to your warehouse!')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        toast.success('Order completely destroyed and stock automatically restored!');
        fetchOrders();
      } catch (error) {
        toast.error('Failed to cancel order');
      }
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(term) || 
      (order.user?.email || '').toLowerCase().includes(term) ||
      (order.shippingAddress?.email || '').toLowerCase().includes(term) ||
      (order.shippingAddress?.fullName || '').toLowerCase().includes(term);
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Orders</h2>
          <p className="text-muted-foreground text-sm">Track, manage, and update customer orders.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search order ID or email..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-400 w-full max-w-sm"
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-400"
        >
          <option value="all" className="bg-black">All Status</option>
          <option value="pending" className="bg-black">Pending</option>
          <option value="confirmed" className="bg-black">Confirmed</option>
          <option value="processing" className="bg-black">Processing</option>
          <option value="shipped" className="bg-black">Shipped</option>
          <option value="delivered" className="bg-black">Delivered</option>
        </select>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-muted-foreground">
                <th className="p-6 font-bold">Order ID</th>
                <th className="p-6 font-bold">Customer</th>
                <th className="p-6 font-bold">Date</th>
                <th className="p-6 font-bold">Method</th>
                <th className="p-6 font-bold">Total</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground text-sm">No orders found matching your filters.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6 font-mono font-bold text-sm truncate max-w-[150px]">
                    <span className="text-cyan-400 mr-1">#</span>{order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="p-6 text-sm">{order.user?.email || 'Guest Checkout'}</td>
                  <td className="p-6 text-muted-foreground text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-6 text-sm">
                    <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-mono">{order.paymentMethod || 'COD'}</span>
                  </td>
                  <td className="p-6 font-mono font-bold text-cyan-400">Rs {Number(order.total).toFixed(2)}</td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full 
                        ${order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 
                          order.status === 'SHIPPED' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 
                          order.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                          order.status === 'CONFIRMED' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' :
                          order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${order.isPaid ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedOrder(order)} title="View Details" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => {
                          setStatusModalOrder(order);
                          setNewStatus(order.status);
                          setNewIsPaid(order.isPaid || false);
                        }} 
                        title="Update Status" 
                        className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors text-muted-foreground hover:text-cyan-400"
                      >
                        <Settings className="w-4 h-4" />
                      </button>

                      <button onClick={() => handleDeleteClick(order.id)} title="Cancel & Delete Order" className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Order Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setSelectedOrder(null)}>
          <div 
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Digital Receipt</h3>
                <p className="text-cyan-400 font-mono text-sm mt-1 font-bold">#{selectedOrder.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto space-y-8 [&::-webkit-scrollbar]:hidden">
              
              {/* Shipping Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Customer Details</h4>
                  <p className="text-sm font-bold text-white text-lg">{selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress?.email || selectedOrder.user?.email || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                </div>
                
                <div className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h4 className="text-purple-400 text-xs font-bold uppercase tracking-widest">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress?.postalCode}, {selectedOrder.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Items Block */}
              <div>
                <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">Line Items</h4>
                <div className="space-y-4">
                  {selectedOrder.orderItems?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/5 rounded-xl p-2 shrink-0 border border-white/5">
                          {item.product?.images?.[0] ? (
                             <img src={item.product.images[0].startsWith('http') ? item.product.images[0] : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}${item.product.images[0]}`} className="w-full h-full object-contain mix-blend-screen" alt="Thumb" />
                          ) : (
                             <div className="w-full h-full bg-white/5 rounded" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {item.size ? `Sz: ${item.size}` : 'Standard'} {item.color ? `• Col: ${item.color}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground mb-1">{item.quantity} x Rs {Number(item.price).toFixed(0)}</p>
                        <p className="text-white font-mono text-sm font-bold">Rs {(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculations Block */}
              <div className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl border border-white/10 space-y-4">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground font-bold">Payment Method</span>
                   <span className="text-white font-mono bg-black/50 px-3 py-1 flex items-center rounded-lg text-xs tracking-widest border border-white/10">{selectedOrder.paymentMethod || 'COD'}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground font-bold">Order Status</span>
                   <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs">{selectedOrder.status}</span>
                 </div>
                 <div className="flex justify-between items-center pt-5 border-t border-white/10 mt-5">
                   <span className="text-white text-xl font-black uppercase tracking-tighter">Grand Total</span>
                   <span className="text-cyan-400 text-3xl font-mono font-black border-b-2 border-cyan-400/20 pb-1">Rs {Number(selectedOrder.total).toFixed(2)}</span>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Global Status Update Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-sm p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 text-white border-b border-white/10 pb-4">Manage Order</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs text-cyan-400 uppercase font-bold tracking-widest block mb-3">Order Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-white focus:border-cyan-400 font-bold text-sm"
                >
                  <option value="PENDING" className="bg-black">Pending</option>
                  <option value="CONFIRMED" className="bg-black">Confirmed</option>
                  <option value="PROCESSING" className="bg-black">Processing / Packing</option>
                  <option value="SHIPPED" className="bg-black">Shipped</option>
                  <option value="DELIVERED" className="bg-black">Delivered</option>
                  <option value="CANCELLED" className="bg-black">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-green-400 uppercase font-bold tracking-widest block mb-3">Payment Status</label>
                <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <button 
                    onClick={() => setNewIsPaid(false)}
                    className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-colors ${!newIsPaid ? 'bg-red-500 text-black' : 'text-muted-foreground hover:bg-white/10'}`}
                  >
                    Unpaid
                  </button>
                  <button 
                    onClick={() => setNewIsPaid(true)}
                    className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-colors ${newIsPaid ? 'bg-green-500 text-black' : 'text-muted-foreground hover:bg-white/10'}`}
                  >
                    Paid
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
              <button onClick={() => setStatusModalOrder(null)} className="flex-1 py-3 border border-white/10 text-muted-foreground hover:text-white rounded-xl font-bold text-sm hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleSaveStatus} className="flex-1 py-3 bg-cyan-400 text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">Save Rules</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
