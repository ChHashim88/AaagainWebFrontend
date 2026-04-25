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
import ShoeLoader from '@/components/ShoeLoader';

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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [{ data }, { data: settingsData }] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/products/${params.id}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/settings`)
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
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}${url}`;
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

  if (isLoading) return <ShoeLoader />;
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

          <div 
            className="relative w-full max-w-6xl h-[70vh] flex items-center justify-center cursor-pointer"
            onTouchStart={(e) => {
              setTouchEnd(null);
              setTouchStart(e.targetTouches[0].clientX);
            }}
            onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
            onTouchEnd={() => {
              if (touchStart === null || touchEnd === null) return;
              const distance = touchStart - touchEnd;
              if (distance > 50) {
                setActiveImage(prev => prev === displayImages.length - 1 ? 0 : prev + 1);
              } else if (distance < -50) {
                setActiveImage(prev => prev === 0 ? displayImages.length - 1 : prev - 1);
              }
            }}
          >
            {displayImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(prev => prev === 0 ? displayImages.length - 1 : prev - 1);
                }}
                className="absolute left-2 md:left-4 p-2 text-white/50 hover:text-white transition-all z-[110] drop-shadow-md"
              >
                <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
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
                className="absolute right-2 md:right-4 p-2 text-white/50 hover:text-white transition-all z-[110] drop-shadow-md"
              >
                <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
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
