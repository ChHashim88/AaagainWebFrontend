'use client';

import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { Trash2, ShoppingBag, Plus, Minus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  const handleIncreaseQuantity = async (item: any) => {
    const lockKey = `${item.id}-${item.size}-${item.color}`;
    setLoadingItems(prev => ({ ...prev, [lockKey]: true }));

    try {
      // Robustly ping real-time database stock to prevent ghost-item overrides
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/products/${item.id}`);
      const liveStock = data.stock;

      if (item.quantity >= liveStock) {
        toast.error('Maximum Stock Reached', { description: `We only have ${liveStock} units available right now!` });
      } else {
        updateQuantity(item.id, item.size, item.color, item.quantity + 1);
      }
    } catch (error) {
      toast.error('Stock verification failed', { description: 'Could not contact database to verify stock limits.' });
    } finally {
      setLoadingItems(prev => ({ ...prev, [lockKey]: false }));
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 py-12 min-h-[70vh]">
      <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Your Cart</h1>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/20 rounded-3xl mt-12 bg-white/5">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Your cart is empty.</p>
          <Link href="/shop" className="mt-6 px-6 py-3 bg-cyan-400 text-black font-bold uppercase tracking-widest text-sm hover:bg-cyan-300 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 mt-12">
          
          {/* Cart Items */}
          <div className="w-full lg:w-2/3 space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl items-center relative group flex-col sm:flex-row">
                <div className="w-24 h-24 bg-white/5 rounded-2xl flex-shrink-0 flex items-center justify-center p-2">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-screen" />
                </div>
                <div className="flex-grow w-full">
                  <h3 className="text-xl font-bold truncate">{item.name}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <p>Size: <span className="text-foreground">{item.size}</span></p>
                    <p>Color: <span className="text-foreground">{item.color}</span></p>
                  </div>
                  
                  <div className="mt-4 flex items-center w-max bg-black/50 border border-white/10 rounded-xl overflow-hidden p-1 shadow-inner">
                    <button 
                      onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                      className="p-1 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className={`w-4 h-4 ${item.quantity <= 1 ? 'opacity-30' : ''}`} />
                    </button>
                    <span className="w-12 text-center font-mono font-bold text-sm tracking-widest">{item.quantity}</span>
                    <button 
                      onClick={() => handleIncreaseQuantity(item)}
                      className="p-1 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                      disabled={loadingItems[`${item.id}-${item.size}-${item.color}`] || (item.stock !== undefined && item.quantity >= item.stock)}
                    >
                      {loadingItems[`${item.id}-${item.size}-${item.color}`] ? (
                         <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      ) : (
                         <Plus className={`w-4 h-4 ${item.stock !== undefined && item.quantity >= item.stock ? 'opacity-30 text-red-500' : ''}`} />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <p className="text-xl font-mono font-bold text-cyan-400">Rs {(item.price * item.quantity).toFixed(2)}</p>
                  <button 
                    onClick={() => {
                      removeItem(item.id, item.size, item.color);
                      toast('Item removed from cart');
                    }}
                    className="text-red-400 opacity-50 hover:opacity-100 transition-opacity p-2 hover:bg-red-400/10 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-24">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6 pb-4 border-b border-white/10">Order Summary</h2>
              <div className="space-y-4 mb-6 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground">Rs {getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Fees</span>
                  <span className="text-foreground">Calculated at Checkout</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-white/10 pt-6 mb-8">
                <span>Subtotal</span>
                <span className="text-cyan-400">Rs {getTotal().toFixed(2)}</span>
              </div>
              <Link href="/checkout" className="w-full flex justify-center py-4 bg-foreground text-background font-black uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
