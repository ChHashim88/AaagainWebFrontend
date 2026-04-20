'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { isOnSale } from '@/utils/sale';
import ShoeLoader from '@/components/ShoeLoader';

function ShopContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { addItem } = useCartStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [showOnlySale, setShowOnlySale] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<string>('');

  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
  const availableTiers = Array.from(new Set(products.map(p => p.tier).filter(Boolean))) as string[];

  useEffect(() => {
    // 1. Process Category deep links
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategories([cat]);
    } else {
      setSelectedCategories([]);
    }

    // 2. Process Condition Tier deep links safely translating '+' and encoded spaces
    const tier = searchParams.get('tier');
    if (tier) {
      setSelectedTier(tier.replace(/\+/g, ' '));
    } else {
      setSelectedTier('');
    }

    // 3. Process Brand deep links safely
    const brand = searchParams.get('brand');
    if (brand) {
      setSelectedBrand(brand.replace(/\+/g, ' '));
    } else {
      setSelectedBrand('');
    }

    // 4. Process Sale specific deep link
    if (searchParams.get('sale') === 'true') {
      setShowOnlySale(true);
    } else {
      setShowOnlySale(false);
    }

    // 5. Process Sort deep link
    if (searchParams.get('sort') === 'new') {
      setSortOrder('new');
    } else {
      setSortOrder('');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '/api/products');
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getImageUrl = (url: string | undefined) => {
    if (!url) return 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}${url}`;
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); // Prevent triggering any link clicks if wrapped
    addItem({
      id: product.id,
      name: product.name,
      price: isOnSale(product) ? Number(product.salePrice) : Number(product.price),
      image: getImageUrl(product.images?.[0]),
      quantity: 1
    });
    toast.success(`${product.name} added to cart`);
  };


  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  let filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const productCat = p.category?.name || 'Unisex';
    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.includes(productCat) ||
      (productCat === 'Unisex' && (selectedCategories.includes('Men') || selectedCategories.includes('Women') || selectedCategories.includes('Unisex')));
    const matchesPrice = Number(p.price) <= maxPrice;
    const matchesSize = selectedSizes.length === 0 || (p.sizes && p.sizes.some((s: string) => selectedSizes.includes(s)));
    const matchesBrand = selectedBrand === '' || p.brand === selectedBrand;
    const matchesTier = selectedTier === '' || p.tier === selectedTier;
    const matchesSale = !showOnlySale || isOnSale(p);
    return matchesSearch && matchesCategory && matchesPrice && matchesSize && matchesBrand && matchesTier && matchesSale;
  });

  if (sortOrder === 'new') {
    filteredProducts = filteredProducts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 pt-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">All Products</h1>
          <p className="text-muted-foreground">Discover our entire collection of advanced footwear.</p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
            />
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm hover:bg-white/10 transition-colors"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Sidebar Filters */}
        <div className={`${showMobileFilters ? 'block border-b mb-8 pb-8' : 'hidden'} md:block col-span-1 md:border-r md:border-b-0 border-white/10 md:pr-8 md:mb-0`}>

          <div className="mb-8">
            <h3 className="font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Brand</h3>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400 appearance-none text-sm"
            >
              <option value="" className="bg-black text-muted-foreground">All Brands</option>
              {availableBrands.map(b => (
                <option key={b} value={b} className="bg-black text-foreground">{b}</option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <h3 className="font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Quality Tier</h3>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-400 appearance-none text-sm"
            >
              <option value="" className="bg-black text-muted-foreground">All Tiers</option>
              {availableTiers.map(t => (
                <option key={t} value={t} className="bg-black text-foreground">{t}</option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <h3 className="font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Category</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {['Men', 'Women', 'Unisex'].map(cat => (
                <li key={cat} className="flex items-center cursor-pointer hover:text-cyan-400">
                  <input
                    type="checkbox"
                    className="mr-3 accent-cyan-400"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  /> {cat}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Max Price (Rs)</h3>
            <input
              type="range"
              className="w-full accent-cyan-400"
              min="0"
              max="200000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-cyan-400 mt-2 font-mono font-bold">
              <span>Rs 0</span>
              <span>Rs {maxPrice}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'].map(size => (
                <div
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={`border text-center py-2 text-xs cursor-pointer transition-colors ${selectedSizes.includes(size) ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-white/10 hover:border-white/30'}`}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="col-span-1 md:col-span-3">
          {isLoading ? (
            <ShoeLoader />
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 opacity-50">
                Coming Soon
              </h2>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
              {filteredProducts.map((product, idx) => (
                <Link href={`/product/${product.id}`} key={product.id} className="group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="flex flex-col h-full cursor-pointer"
                  >
                    <div className="bg-white/5 p-0 rounded-2xl relative overflow-hidden flex items-center justify-center h-40 sm:h-56 w-full">
                      {isOnSale(product) && <span className="absolute top-2 left-2 z-20 bg-purple-500 text-black text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-[0_0_15px_rgba(168,85,247,0.5)]">SALE</span>}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:bg-white hover:text-black transition-colors z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300"
                        title="Quick Add to Cart"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                      <Image
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover mix-blend-screen group-hover:scale-110 transition-transform duration-500 z-10"
                      />
                    </div>
                    <div className="mt-3 sm:mt-4 text-left">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        {product.brand && <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">{product.brand}</span>}
                        {product.tier && <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/30">{product.tier}</span>}
                        {product.colors && product.colors.length > 0 && <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 bg-pink-400/10 px-1.5 py-0.5 rounded border border-pink-400/30">{product.colors.join(' / ')}</span>}
                        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">{product.category?.name || 'Unisex'}</p>
                      </div>
                      <h3 className="text-sm sm:text-lg font-bold truncate group-hover:text-cyan-400 transition-colors">{product.name}</h3>

                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {product.sizes?.length > 0 ? (
                          product.sizes.map((s: string) => (
                            <span key={s} className="text-[10px] border border-white/20 rounded px-1.5 py-0.5 text-muted-foreground">{s}</span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground border border-white/10 rounded px-1.5 py-0.5">Standard</span>
                        )}
                      </div>

                      {isOnSale(product) ? (
                        <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
                          <span className="font-mono font-bold text-purple-400 text-sm sm:text-base">Rs {Number(product.salePrice).toFixed(2)}</span>
                          <span className="font-mono font-bold text-white/40 text-xs line-through">Rs {Number(product.price).toFixed(2)}</span>
                        </div>
                      ) : (
                        <p className="mt-2 sm:mt-3 font-mono font-bold text-cyan-400 text-sm sm:text-base">Rs {Number(product.price).toFixed(2)}</p>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShoeLoader />}>
      <ShopContent />
    </Suspense>
  );
}
