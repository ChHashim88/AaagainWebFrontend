'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import axios from 'axios';
import { isOnSale } from '@/utils/sale';
import { useAuthStore } from '@/store/useAuthStore';
import { Star, MessageSquare } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const addItem = useCartStore(state => state.addItem);
  const items = useCartStore(state => state.items);

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('10');
  const [sizeSystem, setSizeSystem] = useState('');

  const user = useAuthStore(state => state.user);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const averageRating = product?.reviews?.length ? (product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / product.reviews.length).toFixed(1) : 0;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to leave a review');
      router.push('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${product.id}/reviews`, { rating, comment }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      // Refresh product data dynamically to fetch the newly mapped review to client
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${product.id}`);
      setProduct(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [{ data }, { data: settingsData }] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${params.id}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`)
        ]);
        setProduct(data);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        setSizeSystem(settingsData.sizeSystem || '');
      } catch (error) {
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const getImageUrl = (url: string | undefined) => {
    if (!url) return 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  const handleAddToCart = () => {
    let sizeStockObj = product.sizeStock || {};
    if (typeof sizeStockObj === 'string') sizeStockObj = JSON.parse(sizeStockObj);
    const specificSizeStock = sizeStockObj[selectedSize] || 0;

    if (!product || specificSizeStock <= 0) {
      toast.error('Out of Stock', { description: `Size ${selectedSize} is currently unavailable.` });
      return;
    }

    const existingItem = items.find(i => i.id === product.id && i.size === selectedSize);
    const requiredTotal = (existingItem?.quantity || 0) + 1;

    if (requiredTotal > specificSizeStock) {
      toast.error('Stock Limit Reached', { description: `You cannot add more than ${specificSizeStock} units of Size ${selectedSize}.` });
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: isOnSale(product) ? Number(product.salePrice) : Number(product.price),
      image: getImageUrl(product.images?.[0]),
      quantity: 1,
      size: selectedSize,
      stock: specificSizeStock
    });
    toast.success('Added to cart', {
      description: `${product.name} (Size ${selectedSize}) has been added to your cart.`
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-cyan-400 animate-pulse">Loading Database...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-red-500">Product not found.</div>;

  const displayImages = product.images?.length > 0 ? product.images : [null];

  return (
    <div className="relative w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 py-16 animate-in fade-in zoom-in-95 duration-500">

      {/* Absolute Close Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400 hover:text-cyan-400 rounded-full transition-all z-50 text-muted-foreground shadow-xl"
        title="Close Form"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col md:flex-row gap-16 mt-8">

        {/* Gallery */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white/5 rounded-3xl p-8 flex items-center justify-center relative overflow-hidden h-[300px] md:h-[500px] cursor-pointer group"
            onClick={() => setIsLightboxOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-purple-500/20 rounded-full blur-3xl" />
            <div className="relative w-full h-full z-10">
              <Image
                src={getImageUrl(displayImages[activeImage])}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center pointer-events-none">
              <span className="text-white font-bold tracking-widest uppercase border border-white/20 bg-black/50 px-6 py-3 rounded-full backdrop-blur-md">View Gallery</span>
            </div>
          </motion.div>

          {displayImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {displayImages.map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-24 shrink-0 rounded-2xl bg-white/5 p-2 cursor-pointer border-2 transition-all ${activeImage === idx ? 'border-cyan-400' : 'border-transparent hover:border-white/20'}`}
                >
                  <div className="relative w-full h-full">
                    <Image src={getImageUrl(img)} alt="Thumbnail" fill sizes="96px" className="object-cover rounded-md mix-blend-screen" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {product.brand && <span className="text-sm font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-sm border border-cyan-400/20">{product.brand}</span>}
              {product.tier && <span className="text-sm font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-sm border border-purple-500/30">{product.tier}</span>}
              {product.colors && product.colors.length > 0 && <span className="text-sm font-bold uppercase tracking-widest text-pink-400 bg-pink-400/10 px-3 py-1 rounded-sm border border-pink-400/30">{product.colors.join(' / ')}</span>}
              <p className="text-sm text-muted-foreground uppercase tracking-widest border border-white/10 px-3 py-1 rounded-sm">{product.category?.name || 'Exclusive'}</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">{product.name}</h1>
            
            {/* Average Rating Display */}
            <div className="flex items-center gap-4 mb-6">
               <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-white/20'}`} />
                  ))}
               </div>
               <span className="text-muted-foreground font-medium text-sm">
                 {product?.reviews?.length || 0} Reviews ({averageRating})
               </span>
            </div>

            {isOnSale(product) ? (
              <div className="flex items-baseline gap-4 mb-6">
                <span className="bg-purple-500 text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded shadow-[0_0_15px_rgba(168,85,247,0.3)]">SALE</span>
                <p className="text-2xl font-mono text-purple-400 font-bold">Rs {Number(product.salePrice).toFixed(2)}</p>
                <p className="text-xl font-mono text-white/40 font-bold line-through">Rs {Number(product.price).toFixed(2)}</p>
              </div>
            ) : (
              <p className="text-2xl font-mono text-cyan-400 font-bold mb-6">Rs {Number(product.price).toFixed(2)}</p>
            )}
            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Size {sizeSystem && `(${sizeSystem})`}
                  </h3>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">
                    <Ruler className="w-4 h-4" /> Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {product.sizes.map((size: string) => {
                    let sizeStockObj = product.sizeStock || {};
                    if (typeof sizeStockObj === 'string') sizeStockObj = JSON.parse(sizeStockObj);
                    const specificSizeStock = sizeStockObj[size] || 0;
                    const isOutOfStock = specificSizeStock <= 0;

                    return (
                      <button
                        key={size}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        className={`py-3 text-sm font-bold border transition-colors relative overflow-hidden ${selectedSize === size
                          ? 'border-purple-400 bg-purple-400/10 text-purple-400'
                          : 'border-white/10 hover:border-white/30 text-foreground'
                          } ${isOutOfStock ? 'opacity-30 cursor-not-allowed line-through hover:border-white/10' : ''}`}
                      >
                        {sizeSystem ? `${sizeSystem} ${size}` : size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(() => {
              let sizeStockObj = product.sizeStock || {};
              if (typeof sizeStockObj === 'string') sizeStockObj = JSON.parse(sizeStockObj);
              const specificSizeStock = sizeStockObj[selectedSize] || 0;

              return specificSizeStock <= 0 ? (
                <button
                  disabled
                  className="w-full py-5 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-black uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-3 mt-8"
                >
                  Size Sold Out
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-5 bg-foreground text-background rounded-xl font-black uppercase tracking-widest hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 flex items-center justify-center gap-3 mt-8"
                >
                  Add to Cart
                </button>
              );
            })()}
          </motion.div>
        </div>
      </div>

      {/* Review System Section */}
      <div className="mt-24 max-w-4xl mx-auto w-full border-t border-white/10 pt-16">
        <h2 className="text-3xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-cyan-400" /> Customer Reviews
        </h2>
        
        {/* Reviews List */}
        {(!product.reviews || product.reviews.length === 0) ? (
           <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-muted-foreground mb-12 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p>No reviews yet. Be the first to share your thoughts!</p>
           </div>
        ) : (
           <div className="space-y-6 mb-12">
             {product.reviews.map((review: any) => (
               <div key={review.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-colors hover:border-cyan-400/30">
                 <div className="flex items-center justify-between mb-4">
                   <p className="font-bold text-white uppercase tracking-wider">{review.user?.name || 'Anonymous'}</p>
                   <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                 </div>
                 <div className="flex text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-white/20'}`} />
                    ))}
                 </div>
                 <p className="text-white/80 leading-relaxed text-sm">{review.comment}</p>
               </div>
             ))}
           </div>
        )}

        {/* Submit Review Form */}
        <div className="bg-[#050505] border border-cyan-400/20 rounded-3xl p-6 sm:p-10 shadow-[0_0_40px_rgba(34,211,238,0.05)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 blur-3xl -mr-32 -mt-32 pointer-events-none rounded-full" />
           <h3 className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-6 relative z-10 text-white">Write a Review</h3>
           
           {!user ? (
             <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center relative z-10">
               <p className="mb-4 text-muted-foreground text-sm uppercase tracking-wider font-bold">You must be logged in to leave a review.</p>
               <button onClick={() => router.push('/login')} className="px-8 py-3 bg-cyan-400/20 text-cyan-400 font-bold uppercase tracking-widest rounded-lg hover:bg-cyan-400 hover:text-black transition-all">Log In Now</button>
             </div>
           ) : (
             <form onSubmit={submitReview} className="relative z-10">
               <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                 <label className="block text-sm text-neutral-400 font-bold uppercase tracking-[0.2em]">Your Rating</label>
                 <div className="flex gap-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button
                       type="button"
                       key={star}
                       onClick={() => setRating(star)}
                       className={`p-2.5 rounded-lg transition-all transform hover:scale-110 ${rating >= star ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'text-white/20 hover:text-white/50 bg-white/5 border border-white/10'}`}
                     >
                       <Star className="w-6 h-6 fill-current" />
                     </button>
                   ))}
                 </div>
               </div>
               
               <div className="mb-6">
                 <label className="block text-sm text-neutral-400 font-bold uppercase tracking-[0.2em] mb-4">Your Comment</label>
                 <textarea
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   required
                   rows={4}
                   className="w-full bg-black/80 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-cyan-400 outline-none transition-colors backdrop-blur-sm"
                   placeholder="Share your thoughts about this product's quality, fit, and comfort..."
                 />
               </div>
               
               <button
                 type="submit"
                 disabled={submittingReview}
                 className="w-full sm:w-auto px-10 py-4 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
               >
                 {submittingReview ? 'Submitting...' : 'Post Review'}
               </button>
             </form>
           )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[110]"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full max-w-6xl h-[70vh] flex items-center justify-center">
            {displayImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(prev => prev === 0 ? displayImages.length - 1 : prev - 1);
                }}
                className="absolute left-0 md:left-4 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[110] backdrop-blur-md shadow-2xl"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <Image
              src={getImageUrl(displayImages[activeImage])}
              alt="Enlarged product"
              fill
              sizes="100vw"
              className="object-contain filter drop-shadow-[0_0_50px_rgba(34,211,238,0.3)] animate-in zoom-in-95 duration-500"
              onClick={(e) => e.stopPropagation()}
            />

            {displayImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(prev => prev === displayImages.length - 1 ? 0 : prev + 1);
                }}
                className="absolute right-0 md:right-4 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[110] backdrop-blur-md shadow-2xl"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>

          {/* Thumbnails in Lightbox */}
          {displayImages.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 max-w-[90vw] overflow-x-auto pb-4 snap-x px-4 [&::-webkit-scrollbar]:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {displayImages.map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 shrink-0 rounded-2xl bg-white/5 p-2 cursor-pointer border-2 transition-all snap-center hover:-translate-y-2 ${activeImage === idx ? 'border-cyan-400' : 'border-transparent hover:border-white/20'}`}
                >
                  <div className="relative w-full h-full">
                    <Image src={getImageUrl(img)} alt="Thumb" fill sizes="80px" className="object-cover rounded-md mix-blend-screen" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="bg-[#050505] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-all z-10">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Ruler className="w-6 h-6 text-cyan-400" /> Size Chart</h2>
              <p className="text-muted-foreground text-sm mb-6">Compare standard sizes with actual foot measurements.</p>

              <div className="overflow-x-auto max-h-[60vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-white/5 text-muted-foreground sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-xl">US (Men / Women)</th>
                      <th className="px-4 py-3">UK</th>
                      <th className="px-4 py-3">EU</th>
                      <th className="px-4 py-3 rounded-tr-xl">Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { us: "6 / 7.5", uk: "5.5", eu: "38.5", cm: "24" },
                      { us: "6.5 / 8", uk: "6", eu: "39", cm: "24.5" },
                      { us: "7 / 8.5", uk: "6", eu: "40", cm: "25" },
                      { us: "7.5 / 9", uk: "6.5", eu: "40.5", cm: "25.5" },
                      { us: "8 / 9.5", uk: "7", eu: "41", cm: "26" },
                      { us: "8.5 / 10", uk: "7.5", eu: "42", cm: "26.5" },
                      { us: "9 / 10.5", uk: "8", eu: "42.5", cm: "27" },
                      { us: "9.5 / 11", uk: "8.5", eu: "43", cm: "27.5" },
                      { us: "10 / 11.5", uk: "9", eu: "44", cm: "28" },
                      { us: "10.5 / 12", uk: "9.5", eu: "44.5", cm: "28.5" },
                      { us: "11 / 12.5", uk: "10", eu: "45", cm: "29" },
                      { us: "11.5 / 13", uk: "10.5", eu: "45.5", cm: "29.5" },
                      { us: "12 / 13.5", uk: "11", eu: "46", cm: "30" },
                      { us: "12.5 / 14", uk: "11.5", eu: "47", cm: "30.5" },
                      { us: "13 / 14.5", uk: "12", eu: "47.5", cm: "31" },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-bold text-cyan-400">{row.us}</td>
                        <td className="px-4 py-3">{row.uk}</td>
                        <td className="px-4 py-3">{row.eu}</td>
                        <td className="px-4 py-3 text-white/50">{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
