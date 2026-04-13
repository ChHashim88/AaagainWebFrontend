'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { toast } from 'sonner';
import { isOnSale } from '@/utils/sale';

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{ id: string, name: string, description: string, price: string, categoryId: string, stock: string, sizeStock: Record<string, string>, imageUrls: string[], sizes: string[], brand: string, tier: string, salePrice: string, saleStartDate: string, saleEndDate: string, colors: string[] }>({ id: '', name: '', description: '', price: '', categoryId: '', stock: '', sizeStock: {}, imageUrls: [], sizes: [], brand: '', tier: '', salePrice: '', saleStartDate: '', saleEndDate: '', colors: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);
  const TIERS = ["Premium Plus", "Premium", "Excellent", "Very Good"];
  const [uploading, setUploading] = useState(false);
  const { user } = useAdminAuthStore();

  const fetchProducts = async () => {
    try {
      const [{ data: pData }, { data: cData }, { data: bData }] = await Promise.all([
        axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/products', { headers: { Authorization: `Bearer ${user?.token}` } }),
        axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/categories'),
        axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/brands')
      ]);
      setProducts(pData);
      setCategories(cData);
      setBrands(bData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);

    try {
      const { data } = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/upload', uploadData);
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, data] }));
      toast.success('Image uploaded securely!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedSizeStock = Object.fromEntries(
        Object.entries(formData.sizeStock).map(([k, v]) => [k, Number(v) || 0])
      );
      const computedGlobalStock = Object.values(parsedSizeStock).reduce((sum, val) => sum + val, 0);

      const payload = {
        name: formData.name,
        description: formData.description || 'Sample description',
        price: Number(formData.price),
        stock: computedGlobalStock,
        sizeStock: parsedSizeStock,
        images: formData.imageUrls,
        categoryId: formData.categoryId || undefined,
        sizes: formData.sizes,
        colors: formData.colors,
        brand: formData.brand || undefined,
        tier: formData.tier || undefined,
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        saleStartDate: formData.saleStartDate ? new Date(formData.saleStartDate).toISOString() : null,
        saleEndDate: formData.saleEndDate ? new Date(formData.saleEndDate).toISOString() : null
      };

      if (isEditing) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        toast.success('Product updated');
      } else {
        await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/products', payload, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        toast.success('Product created');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const openEditModal = (product: any) => {
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId || '',
      imageUrls: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      sizeStock: typeof product.sizeStock === 'string' ? JSON.parse(product.sizeStock) : (product.sizeStock || {}),
      brand: product.brand || '',
      tier: product.tier || '',
      salePrice: product.salePrice ? String(product.salePrice) : '',
      saleStartDate: product.saleStartDate ? new Date(product.saleStartDate).toISOString().split('T')[0] : '',
      saleEndDate: product.saleEndDate ? new Date(product.saleEndDate).toISOString().split('T')[0] : ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({ id: '', name: '', description: '', price: '', categoryId: '', stock: '10', sizeStock: {}, imageUrls: [], sizes: [], brand: '', tier: '', salePrice: '', saleStartDate: '', saleEndDate: '', colors: [] });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => {
      const isSelected = prev.sizes.includes(size);
      const newSizes = isSelected ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size];
      const newSizeStock = { ...prev.sizeStock };
      if (!isSelected) {
        newSizeStock[size] = '0';
      } else {
        delete newSizeStock[size];
      }
      return { ...prev, sizes: newSizes, sizeStock: newSizeStock };
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Products</h2>
          <p className="text-muted-foreground text-sm">Manage your inventory and live product listings.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold text-sm tracking-wider uppercase rounded-xl hover:bg-cyan-400 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-muted-foreground">
                <th className="p-6 font-bold">Product ID</th>
                <th className="p-6 font-bold">Name</th>
                <th className="p-6 font-bold">Pricing</th>
                <th className="p-6 font-bold">Sold & Stock</th>
                <th className="p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6 font-mono font-bold text-sm truncate max-w-[150px]">
                    <span className="text-cyan-400 mr-1">#</span>{product.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="p-6 font-bold">{product.name}</td>
                  <td className="p-6 font-mono font-bold">
                    {isOnSale(product) ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-widest font-black">Sale Active</span>
                        <span className="text-purple-400">Rs {Number(product.salePrice).toFixed(2)}</span>
                        <span className="text-white/30 text-xs line-through">Rs {Number(product.price).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-cyan-400">Rs {Number(product.price).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">
                        Sold: {product.sold || 0}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${product.stock > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(product)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No products found. Start by adding one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#050505] border border-white/10 w-full max-w-4xl rounded-3xl relative max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(34,211,238,0.05)]">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                {isEditing ? 'Edit Product' : 'New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-all shadow-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent flex-1">
              <form id="productForm" onSubmit={handleSave} className="space-y-8">
                {/* Basic Info Section */}
                <div>
                  <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Product Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-400 focus:bg-[#1a1a1a] transition-all text-sm font-medium" placeholder="E.g. Lunar Glide 3" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Colors (Comma Separated)</label>
                      <input type="text" value={formData.colors.join(', ')} onChange={e => setFormData({ ...formData, colors: e.target.value.split(',').map(c => c.trim()).filter(Boolean) })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-400 focus:bg-[#1a1a1a] transition-all text-sm font-medium" placeholder="E.g. Obsidian Black, Neon Blue" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Description</label>
                      <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-400 focus:bg-[#1a1a1a] transition-all text-sm font-medium resize-none" placeholder="Elaborate details about the product..." />
                    </div>
                  </div>
                </div>

                {/* Media Section */}
                <div>
                  <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Media & Visuals</h4>
                  <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
                    <div className="flex gap-4 items-center">
                      <div className="relative overflow-hidden w-full md:w-auto">
                        <button type="button" disabled={uploading} className="w-full md:w-48 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm font-bold hover:bg-cyan-500/20 transition-all flex justify-center shadow-lg hover:shadow-cyan-500/10">
                          {uploading ? 'Uploading...' : '+ Upload Photo'}
                        </button>
                        <input type="file" onChange={uploadFileHandler} className="absolute inset-0 opacity-0 cursor-pointer w-full" />
                      </div>
                      <p className="text-xs text-muted-foreground hidden md:block">Upload high-quality images. Recommended format: webp, jpg.</p>
                    </div>

                    {formData.imageUrls.length > 0 && (
                      <div className="flex gap-4 mt-6 overflow-x-auto pb-2 items-center">
                        {formData.imageUrls.map((url, idx) => (
                          <div key={idx} className="relative w-28 h-28 shrink-0 rounded-xl bg-black border border-white/10 overflow-hidden group shadow-lg">
                            <Image src={url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`} alt="Preview" fill sizes="112px" className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 mix-blend-screen" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 shadow-md hover:bg-red-400">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Classification Section */}
                <div>
                  <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Classification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Category</label>
                      <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-400 focus:bg-[#1a1a1a] appearance-none transition-all text-sm font-medium">
                        <option value="" className="bg-black text-muted-foreground">Select Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id} className="bg-black text-foreground">{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Brand</label>
                      <select value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-400 focus:bg-[#1a1a1a] appearance-none transition-all text-sm font-medium">
                        <option value="" className="bg-black text-muted-foreground">Select Brand</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.name} className="bg-black text-foreground">{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Condition / Tier</label>
                      <select value={formData.tier} onChange={e => setFormData({ ...formData, tier: e.target.value })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-400 focus:bg-[#1a1a1a] appearance-none transition-all text-sm font-medium">
                        <option value="" className="bg-black text-muted-foreground">Select Tier</option>
                        {TIERS.map(t => (
                          <option key={t} value={t} className="bg-black text-foreground">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Sale Section */}
                <div>
                  <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Pricing & Offers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Standard Price (Rs)</label>
                      <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-400 focus:bg-[#1a1a1a] transition-all text-sm font-mono text-purple-100" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 block">Sale Price</label>
                      <input type="number" step="0.01" value={formData.salePrice} onChange={e => setFormData({ ...formData, salePrice: e.target.value })} className="w-full bg-purple-900/40 border border-purple-500/40 rounded-xl px-4 py-3 outline-none focus:border-purple-400 focus:bg-purple-900/60 text-purple-200 placeholder:text-purple-700 transition-all text-sm font-mono" placeholder="Optional" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 block">Sale Start</label>
                      <input type="date" value={formData.saleStartDate} onChange={e => setFormData({ ...formData, saleStartDate: e.target.value })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-400 focus:bg-[#1a1a1a] transition-all text-sm text-purple-200 css-color-scheme-dark" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 block">Sale End</label>
                      <input type="date" value={formData.saleEndDate} onChange={e => setFormData({ ...formData, saleEndDate: e.target.value })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-400 focus:bg-[#1a1a1a] transition-all text-sm text-purple-200 css-color-scheme-dark" />
                    </div>
                  </div>
                </div>

                {/* Sizes and Stock Section */}
                <div>
                  <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Inventory Management</h4>
                  <div className="mb-8">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Enable Sizes</label>
                    <div className="flex gap-2 flex-wrap">
                      {['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'].map(size => (
                        <div
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`w-12 h-10 flex items-center justify-center rounded-xl border text-sm font-bold cursor-pointer transition-all hover:-translate-y-0.5 ${formData.sizes.includes(size) ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-[#111] text-muted-foreground border-white/10 hover:border-white/30 hover:bg-[#1a1a1a]'}`}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.sizes.length > 0 && (
                    <div className="bg-[#080808] p-6 rounded-2xl border border-white/10 shadow-[inset_0_0_20px_rgba(34,211,238,0.02)]">
                      <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5 block flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        Size Specific Stock
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {formData.sizes.map(size => (
                          <div key={size} className="flex flex-col gap-2 focus-within:text-cyan-400 text-muted-foreground transition-colors group">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-center w-full block">SZ {size}</span>
                            <input
                              type="number"
                              min="0"
                              value={formData.sizeStock[size] || '0'}
                              onChange={(e) => setFormData(prev => ({ ...prev, sizeStock: { ...prev.sizeStock, [size]: e.target.value } }))}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-2 py-2.5 outline-none focus:border-cyan-400 focus:bg-black text-center font-mono font-bold text-cyan-400 transition-all placeholder:text-white/20 text-sm shadow-inner"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <style jsx>{`
                  .css-color-scheme-dark::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.5;
                    transition: 0.2s;
                    cursor: pointer;
                  }
                  .css-color-scheme-dark::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                  }
                `}</style>
              </form>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-white/10 bg-[#060606] flex justify-end gap-4 rounded-b-3xl">
               <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 bg-white/5 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all rounded-xl text-xs sm:text-sm shadow-lg">
                 Cancel
               </button>
               <button form="productForm" type="submit" className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-black uppercase tracking-widest hover:brightness-110 transition-all rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] text-xs sm:text-sm">
                 {isEditing ? 'Save Changes' : 'Create Product'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
