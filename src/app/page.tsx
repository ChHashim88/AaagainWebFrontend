'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isOnSale } from '@/utils/sale';

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [menShoes, setMenShoes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '/api/products');
        // Prefer explicit trending items configured in Admin Handle; fallback to newest 3 if store unconfigured
        const explicitTrending = data.filter((p: any) => p.isTrending);
        setTrending(explicitTrending.length > 0 ? explicitTrending.slice(0, 3) : data.slice(0, 3));
        const menFiltered = data.filter((p: any) => p.category?.name === 'Men' || p.category?.name === 'Unisex');
        setMenShoes(menFiltered.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch trending products');
      }
    };

    const fetchBrands = async () => {
      try {
        const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '/api/brands');
        setBrands(data);
      } catch (error) {
        console.error('Failed to fetch brands');
      }
    };

    fetchTrending();
    fetchBrands();
  }, []);

  const getImageUrl = (url: string | undefined) => {
    if (!url) return 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}${url}`;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen pt-16 overflow-x-hidden w-full">

      {/* Hero Section */}
      <section className="relative w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 py-24 md:py-32 flex flex-col lg:flex-row items-center justify-between">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

        <div className="w-full lg:w-1/2 space-y-8 text-center md:text-left z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-tight uppercase"
          >
            THE FINEST <br /> PRE-OWNED <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">FOOTWEAR</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0"
          >
            Access exclusive, pre-owned pairs from exactly the brands you love. Carefully curated, strictly authenticated, and delivered with premium quality without the retail markup.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
          >
            <Link href="/shop" className="px-8 py-4 bg-foreground text-background font-bold uppercase tracking-wider rounded-none hover:bg-cyan-400 hover:text-black transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto text-center">
              Shop Now
            </Link>
            <Link href="/about" className="px-8 py-4 border border-border/50 text-foreground font-bold uppercase tracking-wider rounded-none hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300 w-full sm:w-auto text-center">
              About Us
            </Link>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/2 mt-16 md:mt-0 relative hidden md:flex lg:flex justify-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.6, type: "spring" }}
            whileHover={{ y: -10, rotate: 5, transition: { duration: 0.4 } }}
            className="relative w-72 h-72 md:w-96 md:h-96"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/40 to-purple-500/40 rounded-full blur-3xl animate-pulse" />
            <Image
              src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800"
              alt="Futuristic Sneaker"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain filter drop-shadow-2xl brightness-110 contrast-125 hover:drop-shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-500 z-10"
            />
          </motion.div>
        </div>
      </section>

      {/* Featured Collection Strip */}
      <section id="trending" className="w-full bg-black py-20 border-y border-white/5">
        <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-12 uppercase border-b border-border/50 inline-block pb-2">Trending Models</h2>

          {trending.length === 0 ? (
            <p className="text-muted-foreground">Store empty. Check back when admin adds sneakers!</p>
          ) : (
            <>
              {/* Unified Responsive Grid View */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                {trending.map((product, index) => (
                  <Link 
                    href={`/product/${product.id}`} 
                    key={product.id} 
                    className={`group cursor-pointer ${index === 2 ? 'max-lg:hidden' : ''}`}
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="relative bg-[#050505] border border-white/10 hover:border-cyan-400/30 rounded-[1.25rem] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[280px] sm:h-[450px]"
                    >
                      {/* Magical background gradient that pulses subtly */}
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-cyan-400/10 rounded-full blur-3xl -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:bg-cyan-400/20 transition-colors duration-700" />

                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                        <span className="bg-cyan-500 text-black text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-[0_0_15px_rgba(34,211,238,0.5)] w-max">Trending</span>
                        {isOnSale(product) && (
                          <span className="bg-purple-500 text-black text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-[0_0_15px_rgba(168,85,247,0.5)] w-max">SALE</span>
                        )}
                      </div>

                      <div className="relative h-[60%] sm:h-3/5 w-full bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center p-4 sm:p-6">
                        <Image
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 33vw"
                          className="object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-700 z-10 p-2 sm:p-4"
                        />
                      </div>

                      {/* Content block inside the card */}
                      <div className="relative z-20 flex-1 bg-black/60 backdrop-blur-md border-t border-white/5 p-3 sm:p-5 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm sm:text-lg font-black truncate group-hover:text-cyan-400 transition-colors tracking-tight text-white">{product.name}</h3>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
                            {product.brand && <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#888]">{product.brand}</span>}
                            {product.tier && <span className="text-[8px] sm:text-[10px] font-bold uppercase text-purple-400 border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 rounded">{product.tier}</span>}
                            {product.colors && product.colors.length > 0 && <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 rounded truncate max-w-[80px] sm:max-w-[120px]">{product.colors.join(' / ')}</span>}
                          </div>
                        </div>
                        <div className="flex justify-between items-end mt-2 sm:mt-4">
                          <div className="flex flex-col items-start max-w-[75%] sm:max-w-[70%]">
                            {isOnSale(product) ? (
                              <div className="flex items-baseline gap-1.5 sm:gap-2 truncate">
                                <span className="font-mono font-bold text-purple-400 text-xs sm:text-lg">Rs {Number(product.salePrice).toFixed(0)}</span>
                                <span className="font-mono font-bold text-white/40 text-[9px] sm:text-sm line-through">Rs {Number(product.price).toFixed(0)}</span>
                              </div>
                            ) : (
                              <span className="font-mono font-bold text-cyan-400 text-xs sm:text-lg truncate">Rs {Number(product.price).toFixed(0)}</span>
                            )}
                          </div>
                          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-colors text-white/30 text-[10px] sm:text-sm">
                            &rarr;
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Men Collection Masonry Grid */}
      <section className="w-full pt-24 pb-8 bg-background">
        <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Men's Collection</h2>
              <p className="text-muted-foreground">Engineered for absolute dominance.</p>
            </div>
            <Link href="/shop" className="md:flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold tracking-widest uppercase transition-colors">
              View All Men's &rarr;
            </Link>
          </div>

          {menShoes.length === 0 ? (
            <p className="text-muted-foreground">No Men's shoes available at the moment.</p>
          ) : (
            <div className="relative group/slider">
              {/* Navigation Arrows */}
              <button
                onClick={() => scroll('left')}
                className="absolute left-1 md:-left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white flex items-center justify-center opacity-70 md:opacity-0 group-hover/slider:opacity-100 hover:bg-cyan-500 hover:text-black hover:scale-110 transition-all shadow-xl"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 -ml-0.5 md:-ml-1" />
              </button>

              <button
                onClick={() => scroll('right')}
                className="absolute right-1 md:-right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white flex items-center justify-center opacity-70 md:opacity-0 group-hover/slider:opacity-100 hover:bg-cyan-500 hover:text-black hover:scale-110 transition-all shadow-xl animate-pulse md:animate-none"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 -mr-0.5 md:-mr-1" />
              </button>

              <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 pt-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 md:px-0"
              >
                {menShoes.map((product, idx) => (
                  <Link href={`/product/${product.id}`} key={product.id} className="block group shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(45%-1rem)] lg:w-[32%] snap-start">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="bg-[#0a0a0a] rounded-3xl relative overflow-hidden border border-white/10 hover:border-cyan-400/50 hover:bg-[#111] transition-all p-4 sm:p-8 flex flex-col items-center justify-center shadow-2xl h-[300px] sm:h-[500px] md:h-[600px] w-full group/card"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10" />

                      {/* Inner Name Overlay */}
                      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 translate-y-8 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {isOnSale(product) && <p className="text-black font-black uppercase tracking-widest text-[10px] sm:text-xs bg-purple-500 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(168,85,247,0.5)]">SALE</p>}
                          {product.brand && <p className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs bg-cyan-400/10 px-1.5 py-0.5 rounded">{product.brand}</p>}
                          {product.tier && <p className="text-purple-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs bg-purple-400/10 px-1.5 py-0.5 rounded">{product.tier}</p>}
                          {product.colors && product.colors.length > 0 && <p className="text-pink-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs bg-pink-400/10 px-1.5 py-0.5 rounded truncate max-w-[100px]">{product.colors.join(' / ')}</p>}
                        </div>
                        <h3 className="text-white font-black text-lg sm:text-2xl tracking-tight leading-tight">{product.name}</h3>
                        {isOnSale(product) ? (
                          <div className="flex items-baseline gap-2 mt-1 w-fit bg-black/50 px-2 sm:px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                            <span className="text-purple-400 font-mono font-bold text-sm sm:text-base">Rs {Number(product.salePrice).toFixed(2)}</span>
                            <span className="text-white/40 font-mono font-bold text-xs sm:text-sm line-through">Rs {Number(product.price).toFixed(2)}</span>
                          </div>
                        ) : (
                          <p className="text-white/70 font-mono mt-1 text-sm sm:text-base w-fit bg-black/50 px-2 sm:px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">Rs {Number(product.price).toFixed(2)}</p>
                        )}
                      </div>

                      {/* Minimalist Hover Arrow in Center */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md rounded-full w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center border border-white/20 opacity-0 group-hover/card:opacity-0 group-hover/card:scale-150 transition-all duration-500 shadow-2xl text-transparent">
                        &rarr;
                      </div>

                      <div className="relative w-[90%] h-[90%] z-0">
                        <Image
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-contain filter drop-shadow-2xl group-hover/card:scale-110 group-hover/card:-translate-y-2 sm:group-hover/card:-translate-y-4 transition-transform duration-700"
                        />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Shoe Condition Tier Section */}
      <section className="w-full pt-16 pb-24 border-t border-white/5 bg-[#050505] relative z-10">
        <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Shoes Condition</h2>
          <p className="text-muted-foreground mb-12">Select your ideal grade of luxury and performance.</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">

            {/* Tier 1 */}
            <Link href="/shop?tier=Premium+Plus" className="group block h-full">
              <motion.div whileHover={{ y: -10 }} className="relative bg-white/5 border border-white/10 hover:border-cyan-400/50 rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 h-auto min-h-[220px] sm:h-80 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-cyan-400/10 rounded-full blur-2xl sm:blur-3xl -mr-10 -mt-10 sm:-mr-16 sm:-mt-16 group-hover:bg-cyan-400/30 transition-colors duration-500 pointer-events-none" />
                <div className="relative z-10 text-left flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-cyan-400">Pristine</span>
                  </div>
                  <h3 className="text-lg sm:text-3xl font-black uppercase tracking-tight text-white mb-1.5 sm:mb-2 leading-none sm:leading-tight">Premium<br className="sm:hidden" /> Plus</h3>
                  <p className="text-[9px] sm:text-sm text-muted-foreground leading-relaxed sm:leading-relaxed">Absolute perfection. Factory sealed aesthetics with zero flaws or wear.</p>
                </div>
                <div className="relative z-10 w-full flex justify-end mt-3 sm:mt-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors text-cyan-400 font-bold text-sm">
                    &rarr;
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Tier 2 */}
            <Link href="/shop?tier=Premium" className="group block h-full">
              <motion.div whileHover={{ y: -10 }} className="relative bg-white/5 border border-white/10 hover:border-purple-400/50 rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 h-auto min-h-[220px] sm:h-80 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-400/10 rounded-full blur-2xl sm:blur-3xl -mr-10 -mt-10 sm:-mr-16 sm:-mt-16 group-hover:bg-purple-400/30 transition-colors duration-500 pointer-events-none" />
                <div className="relative z-10 text-left flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-purple-400">Excellent</span>
                  </div>
                  <h3 className="text-lg sm:text-3xl font-black uppercase tracking-tight text-white mb-1.5 sm:mb-2 leading-none sm:leading-tight">Premium</h3>
                  <p className="text-[9px] sm:text-sm text-muted-foreground leading-relaxed sm:leading-relaxed">Near flawless structure with minor, virtually invisible cosmetic variances.</p>
                </div>
                <div className="relative z-10 w-full flex justify-end mt-3 sm:mt-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-black transition-colors text-purple-400 font-bold text-sm">
                    &rarr;
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Tier 3 */}
            <Link href="/shop?tier=Excellent" className="group block h-full">
              <motion.div whileHover={{ y: -10 }} className="relative bg-white/5 border border-white/10 hover:border-blue-400/50 rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 h-auto min-h-[220px] sm:h-80 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-400/10 rounded-full blur-2xl sm:blur-3xl -mr-10 -mt-10 sm:-mr-16 sm:-mt-16 group-hover:bg-blue-400/20 transition-colors duration-500 pointer-events-none" />
                <div className="relative z-10 text-left flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400" />
                    <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-blue-400">High Quality</span>
                  </div>
                  <h3 className="text-lg sm:text-3xl font-black uppercase tracking-tight text-white mb-1.5 sm:mb-2 leading-none sm:leading-tight">Excellent</h3>
                  <p className="text-[9px] sm:text-sm text-muted-foreground leading-relaxed sm:leading-relaxed">High performance stability with normal visual characteristics of luxury wear.</p>
                </div>
                <div className="relative z-10 w-full flex justify-end mt-3 sm:mt-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-black transition-colors text-blue-400 font-bold text-sm">
                    &rarr;
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Tier 4 */}
            <Link href="/shop?tier=Very+Good" className="group block h-full">
              <motion.div whileHover={{ y: -10 }} className="relative bg-white/5 border border-white/10 hover:border-rose-400/50 rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 h-auto min-h-[220px] sm:h-80 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-rose-400/10 rounded-full blur-2xl sm:blur-3xl -mr-10 -mt-10 sm:-mr-16 sm:-mt-16 group-hover:bg-rose-400/20 transition-colors duration-500 pointer-events-none" />
                <div className="relative z-10 text-left flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400" />
                    <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-rose-400">Great Value</span>
                  </div>
                  <h3 className="text-lg sm:text-3xl font-black uppercase tracking-tight text-white mb-1.5 sm:mb-2 leading-none sm:leading-tight">Very Good</h3>
                  <p className="text-[9px] sm:text-sm text-muted-foreground leading-relaxed sm:leading-relaxed">Aggressively priced utility. Shows clear cosmetic wear, structural integrity holds.</p>
                </div>
                <div className="relative z-10 w-full flex justify-end mt-3 sm:mt-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-black transition-colors text-rose-400 font-bold text-sm">
                    &rarr;
                  </div>
                </div>
              </motion.div>
            </Link>

          </div>
        </div>
      </section>

      {/* Featured Brands Section */}
      <section className="w-full pt-16 pb-24 border-t border-white/5 bg-[#0a0a0a] relative z-10">
        <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Shop by Brand</h2>
          <p className="text-muted-foreground mb-12">Discover the world's most premium sneaker manufacturers.</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {brands.map((brand) => (
              <Link href={`/shop?brand=${encodeURIComponent(brand.name)}`} key={brand.id} className="group block focus:outline-none">
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="relative w-full h-32 sm:h-40 rounded-3xl bg-[#030303] flex items-center justify-center p-6 sm:p-8 shadow-2xl transition-all duration-500"
                >
                  {/* Ultra-premium glowing border interaction */}
                  <div className="absolute inset-0 rounded-3xl border border-white/5 group-hover:border-cyan-400/50 transition-colors duration-500 z-10 pointer-events-none" />

                  {/* Neon Ambient Blurs */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/0 group-hover:bg-cyan-400/20 blur-3xl rounded-full transition-all duration-700 pointer-events-none -mr-8 -mt-8" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/0 group-hover:bg-purple-500/20 blur-3xl rounded-full transition-all duration-700 pointer-events-none -ml-8 -mb-8" />

                  {/* Glass Background Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-3xl z-0 pointer-events-none" />

                  <h3 className="relative z-20 text-xl sm:text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 group-hover:from-cyan-300 group-hover:to-purple-400 transition-all duration-700 truncate w-full text-center drop-shadow-xl">
                    {brand.name}
                  </h3>

                  {/* Animated micro-interaction arrow */}
                  <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-8 h-8 rounded-full border border-white/10 group-hover:border-cyan-400/30 flex items-center justify-center opacity-0 group-hover:opacity-100 -rotate-45 group-hover:rotate-0 transition-all duration-500 text-cyan-400 bg-black/50 backdrop-blur-xl z-20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    &rarr;
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          {brands.length === 0 && <p className="text-muted-foreground text-sm">No brands currently listed.</p>}
        </div>
      </section>

    </main>
  );
}
