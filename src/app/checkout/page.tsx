'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { getTotal, items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', country: 'Pakistan'
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [transactionId, setTransactionId] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getTotal();

  let deliveryFee = 0;
  if (settings) {
    if (settings.deliveryFeeType === 'PERCENTAGE') {
      deliveryFee = subtotal * (settings.deliveryFeeValue / 100);
    } else {
      deliveryFee = settings.deliveryFeeValue;
    }
  }

  let codFee = 0;
  if (settings && paymentMethod === 'COD') {
    if (settings.codFeeType === 'PERCENTAGE') {
      codFee = subtotal * (settings.codFeeValue / 100);
    } else {
      codFee = settings.codFeeValue;
    }
  }

  const totalPrice = subtotal + deliveryFee + codFee;

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    } else {
      fetchSettings();
    }
  }, [items, router]);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '') + '/api/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings');
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.email || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      toast.error('Please complete all compulsory shipping details.');
      return;
    }

    // Strict Email RegEx Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      toast.error('Please enter a valid email address structure (e.g. name@gmail.com).');
      return;
    }

    // Aggressive domain typo catching
    const domain = shippingAddress.email.split('@')[1]?.toLowerCase();
    
    // Block anything resembling gmail that isn't exactly gmail.com
    if (domain !== 'gmail.com' && (domain.includes('gmai') || domain.includes('gamil') || domain.includes('gmal') || domain.includes('gma.') || domain === 'gmail.co' || domain === 'gmail.con')) {
      toast.error(`Invalid Domain: Did you mean @gmail.com?`);
      return;
    }
    // Block anything resembling yahoo that isn't exactly yahoo.com
    if (domain !== 'yahoo.com' && (domain.includes('yaho.') || domain.includes('yahoo.ca') || domain.includes('yahoo.co') && domain !== 'yahoo.com')) {
      toast.error(`Invalid Domain: Did you mean @yahoo.com?`);
      return;
    }
    // Block anything resembling hotmail that isn't exactly hotmail.com
    if (domain !== 'hotmail.com' && (domain.includes('hotmal') || domain.includes('hotmai.') || domain === 'hotmail.co')) {
      toast.error(`Invalid Domain: Did you mean @hotmail.com?`);
      return;
    }

    // Strict Pakistani Phone Number Validation (03XX-XXXXXXX)
    const phoneRegex = /^(03)[0-9]{9}$/;
    const sanitizedPhone = shippingAddress.phone.replace(/[-\s]/g, ''); // strip dashes if they typed 0300-1234567
    if (!phoneRegex.test(sanitizedPhone)) {
      toast.error('Please enter a valid 11-digit Pakistani mobile number starting with 03 (e.g. 03001234567).');
      return;
    }

    // Assign back the sanitized phone to the address object to keep the DB clean
    setShippingAddress({...shippingAddress, phone: sanitizedPhone});

    if ((paymentMethod === 'Easypaisa' || paymentMethod === 'JazzCash') && !transactionId) {
      toast.error(`Please enter your ${paymentMethod} Transaction ID (TID) to verify payment.`);
      return;
    }

    setShowConfirmModal(true);
  };

  const processOrder = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);

    try {
      const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
      
      const optimizedPaymentMethod = transactionId ? `${paymentMethod} (TID: ${transactionId})` : paymentMethod;

      const { data } = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/orders', {
        orderItems: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price, size: i.size, color: i.color })),
        shippingAddress,
        paymentMethod: optimizedPaymentMethod,
        totalPrice
      }, config);

      // Save order details to session storage so the success page can read it quickly
      sessionStorage.setItem('lastOrder', JSON.stringify(data));

      toast.success("Order placed successfully! We will verify and process your delivery.");
      clearCart();
      router.push('/checkout/success');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order creation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 py-12">
      <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Secure Checkout</h1>
      <p className="text-muted-foreground mb-12">Complete your order swiftly.</p>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <form onSubmit={handlePreSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-10">
            
            {/* 1. Address Section */}
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider pb-4 mb-6 border-b border-white/10">1. Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="col-span-1 md:col-span-2">
                  <input required type="text" value={shippingAddress.fullName} onChange={e => setShippingAddress({...shippingAddress, fullName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 outline-none" placeholder="Full Name" />
                </div>
                <div className="col-span-1">
                  <input required type="email" value={shippingAddress.email} onChange={e => setShippingAddress({...shippingAddress, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 outline-none" placeholder="Email Address" />
                </div>
                <div className="col-span-1">
                  <input required type="text" value={shippingAddress.phone} onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 outline-none" placeholder="Mobile Number (03XX-...)" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <input required type="text" value={shippingAddress.address} onChange={e => setShippingAddress({...shippingAddress, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 outline-none" placeholder="Street Address / House No." />
                </div>
                <div className="col-span-1">
                  <input required type="text" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 outline-none" placeholder="City" />
                </div>
                <div className="col-span-1">
                  <input required type="text" value={shippingAddress.postalCode} onChange={e => setShippingAddress({...shippingAddress, postalCode: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 outline-none" placeholder="Postal / Zip Code" />
                </div>
              </div>
            </div>

            {/* 2. Payment Section */}
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider pb-4 mb-6 border-b border-white/10">2. Payment Method</h2>
              <div className="flex flex-col gap-4 bg-black/20 p-6 rounded-2xl border border-white/5">
                
                <label className={`relative flex cursor-pointer rounded-xl border p-5 focus:outline-none transition-colors ${paymentMethod === 'COD' ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}>
                  <input type="radio" className="sr-only" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-cyan-400' : 'border-white/30'}`}>
                        {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                      </div>
                      <span className="font-bold uppercase tracking-wider">Cash on Delivery (COD)</span>
                    </div>
                  </div>
                </label>

                {settings?.enableEasypaisa && (
                  <label className={`relative flex flex-col cursor-pointer rounded-xl border p-5 focus:outline-none transition-colors ${paymentMethod === 'Easypaisa' ? 'border-green-400 bg-green-400/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}>
                    <div className="flex w-full items-center">
                      <input type="radio" className="sr-only" name="paymentMethod" value="Easypaisa" checked={paymentMethod === 'Easypaisa'} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'Easypaisa' ? 'border-green-400' : 'border-white/30'}`}>
                          {paymentMethod === 'Easypaisa' && <div className="w-2.5 h-2.5 rounded-full bg-green-400" />}
                        </div>
                        <span className="font-bold uppercase tracking-wider text-green-400">Easypaisa Transfer</span>
                      </div>
                    </div>
                    {paymentMethod === 'Easypaisa' && (
                      <div className="mt-4 pl-8 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-muted-foreground mb-3">Please transfer <strong className="text-white">Rs {totalPrice.toFixed(2)}</strong> to <strong>{settings?.easypaisaNumber || 'Admin Number'}</strong></p>
                        <input type="text" placeholder="Enter Easypaisa TID (Transaction ID)" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full bg-black/50 border border-green-500/30 rounded-lg px-4 py-3 text-sm focus:border-green-400 outline-none" />
                      </div>
                    )}
                  </label>
                )}

                {settings?.enableJazzcash && (
                  <label className={`relative flex flex-col cursor-pointer rounded-xl border p-5 focus:outline-none transition-colors ${paymentMethod === 'JazzCash' ? 'border-red-400 bg-red-400/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}>
                    <div className="flex w-full items-center">
                      <input type="radio" className="sr-only" name="paymentMethod" value="JazzCash" checked={paymentMethod === 'JazzCash'} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'JazzCash' ? 'border-red-400' : 'border-white/30'}`}>
                          {paymentMethod === 'JazzCash' && <div className="w-2.5 h-2.5 rounded-full bg-red-400" />}
                        </div>
                        <span className="font-bold uppercase tracking-wider text-red-500">JazzCash Transfer</span>
                      </div>
                    </div>
                    {paymentMethod === 'JazzCash' && (
                      <div className="mt-4 pl-8 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-muted-foreground mb-3">Please transfer <strong className="text-white">Rs {totalPrice.toFixed(2)}</strong> to <strong>{settings?.jazzcashNumber || 'Admin Number'}</strong></p>
                        <input type="text" placeholder="Enter JazzCash TID (Transaction ID)" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-sm focus:border-red-400 outline-none" />
                      </div>
                    )}
                  </label>
                )}

              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-8 py-5 bg-cyan-400 text-black font-black uppercase tracking-widest hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              {isProcessing ? 'Processing Order...' : `Confirm Order — Rs ${totalPrice.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Dynamic Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-24">
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6 pb-4 border-b border-white/10 flex justify-between">
              Order Summary
              <span className="text-cyan-400 text-sm bg-cyan-400/10 px-3 py-1 rounded-full">{items.length} Items</span>
            </h2>
            
            <div className="space-y-5 mb-8 max-h-[350px] overflow-y-auto pr-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-20 h-20 bg-black/40 border border-white/5 rounded-2xl p-2 shrink-0 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-screen" />
                  </div>
                  <div className="flex-1 py-1">
                    <p className="font-bold text-sm leading-tight group-hover:text-cyan-400 transition-colors">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {item.size ? `Size: ${item.size}` : 'Standard'} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-cyan-400 text-sm font-bold pt-1">
                    Rs {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm text-muted-foreground border-t border-white/10 pt-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-foreground">Rs {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span className={deliveryFee === 0 ? "text-cyan-400 font-bold tracking-widest uppercase" : "text-foreground font-mono"}>
                  {deliveryFee === 0 ? 'Free' : `Rs ${deliveryFee.toFixed(2)}`}
                </span>
               </div>
              {paymentMethod === 'COD' && codFee > 0 && (
                <div className="flex justify-between">
                  <span>COD Surcharge</span>
                  <span className="text-foreground font-mono">Rs {codFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between font-black text-xl pt-6 border-t border-white/10 mt-6 items-center">
              <span>Grand Total</span>
              <span className="text-cyan-400 text-3xl font-mono tracking-tighter">Rs {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-400" />
            
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Confirm Your Order</h3>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              You are about to place an order for <strong className="text-white">{items.length} items</strong> using <strong className="text-cyan-400 uppercase tracking-widest text-xs font-mono px-1 border border-cyan-400/20 bg-cyan-400/5 ml-1 rounded">{paymentMethod}</strong>.
              <br/><br/>
              Your final total is <strong className="text-white font-mono text-lg">Rs {totalPrice.toFixed(2)}</strong>.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold uppercase tracking-widest text-sm"
              >
                No, Go Back
              </button>
              <button 
                onClick={processOrder}
                className="w-full py-4 rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 transition-colors font-black uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
