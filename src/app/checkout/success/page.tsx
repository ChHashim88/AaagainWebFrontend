'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const storedOrder = sessionStorage.getItem('lastOrder');
    if (storedOrder) {
      setOrder(JSON.parse(storedOrder));
    } else {
      router.push('/shop');
    }
  }, [router]);

  if (!order) return <div className="min-h-screen flex items-center justify-center animate-pulse text-cyan-400 font-mono">Loading Receipt...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-24 min-h-screen flex flex-col items-center">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-in zoom-in duration-500">
        <CheckCircle2 className="w-10 h-10 text-green-400" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-center">Order Confirmed</h1>
      <p className="text-muted-foreground text-center mb-12 max-w-lg">
        Thank you for shopping with Bazar Beats! Your futuristic footwear is being prepared for dispatch. 
        A confirmation email has been sent to <span className="text-white font-bold">{order.shippingAddress?.email}</span>.
      </p>

      <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-cyan-400" />
        
        <div className="flex flex-col md:flex-row justify-between mb-8 border-b border-white/10 pb-8 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Order Number</p>
            <p className="font-mono font-bold text-cyan-400">{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Date</p>
            <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Payment Method</p>
            <p className="font-bold">{order.paymentMethod}</p>
          </div>
        </div>

        <div className="mb-8 border-b border-white/10 pb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" /> Items Purchased
          </h3>
          <div className="space-y-4">
            {order.orderItems?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-xl overflow-hidden p-1 flex items-center justify-center shrink-0">
                    <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.product?.images?.[0] || ''}`} className="w-full h-full object-contain mix-blend-screen" alt={item.product?.name || "Product"} />
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-wide">{item.product?.name || 'Bazar Beats Sneaker'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity} | Size: {item.size || 'N/A'}</p>
                  </div>
                </div>
                <p className="font-mono font-bold text-cyan-400 pl-4 text-right">Rs {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center text-lg font-black uppercase tracking-wider">
          <span>Total Paid</span>
          <span className="text-2xl font-mono text-cyan-400">Rs {Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-12 flex gap-4 w-full md:w-auto">
        <Link href="/shop" className="w-full md:w-auto px-10 py-5 bg-cyan-400 text-black font-black uppercase tracking-widest hover:bg-cyan-300 transition-colors flex justify-center items-center gap-3 rounded-full hover:-translate-y-1">
          Continue Shopping <ArrowRight className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
