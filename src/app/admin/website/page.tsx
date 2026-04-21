'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { toast } from 'sonner';
import { Save, Globe, Plus, Trash2, Edit2, X, Tag } from 'lucide-react';
import Image from 'next/image';
import { isOnSale } from '@/utils/sale';

export default function WebsiteHandlePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Brand Management State
  const [brands, setBrands] = useState<{id: string, name: string}[]>([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [editingBrand, setEditingBrand] = useState<{id: string, name: string} | null>(null);
  
  // Checkout Settings State
  const [deliveryFeeType, setDeliveryFeeType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [deliveryFeeValue, setDeliveryFeeValue] = useState<number>(0);
  const [codFeeType, setCodFeeType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [codFeeValue, setCodFeeValue] = useState<number>(0);
  const [sizeSystem, setSizeSystem] = useState<string>('UK');
  
  // Local Payment Gateways
  const [enableCod, setEnableCod] = useState(true);
  const [enableBank, setEnableBank] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [enableEasypaisa, setEnableEasypaisa] = useState(true);
  const [easypaisaNumber, setEasypaisaNumber] = useState('');
  const [enableJazzcash, setEnableJazzcash] = useState(true);
  const [jazzcashNumber, setJazzcashNumber] = useState('');

  // Contact Page Info
  const [emailSupport, setEmailSupport] = useState('');
  const [directLine, setDirectLine] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [headquartersAddress, setHeadquartersAddress] = useState('');

  // POS State
  const [posProductId, setPosProductId] = useState('');
  const [posSize, setPosSize] = useState('');

  const { user } = useAdminAuthStore();

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '') + '/api/brands');
      setBrands(data);
    } catch (error) {
      console.error('Failed to load brands');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '') + '/api/settings');
      setDeliveryFeeType(data.deliveryFeeType || 'FIXED');
      setDeliveryFeeValue(data.deliveryFeeValue || 0);
      setCodFeeType(data.codFeeType || 'FIXED');
      setCodFeeValue(data.codFeeValue || 0);
      setSizeSystem(data.sizeSystem || 'UK');
      setEnableCod(data.enableCod !== false);
      setEnableBank(data.enableBank === true);
      setBankName(data.bankName || 'Meezan Bank');
      setBankAccountNumber(data.bankAccountNumber || '');
      setEnableEasypaisa(data.enableEasypaisa !== false);
      setEasypaisaNumber(data.easypaisaNumber || '');
      setEnableJazzcash(data.enableJazzcash !== false);
      setJazzcashNumber(data.jazzcashNumber || '');
      setEmailSupport(data.emailSupport || 'support@bazarbeats.com');
      setDirectLine(data.directLine || '+1 (800) 555-0199');
      setHeadquarters(data.headquarters || 'Neon District');
      setHeadquartersAddress(data.headquartersAddress || 'Cyber City, CC 92041, Sector 7.');
    } catch (error) {
      console.error('Failed to load settings');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '') + '/api/products');
      setProducts(data);
      
      const trending = data.filter((p: any) => p.isTrending).map((p: any) => p.id);
      setSelectedIds(trending);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        toast.error('You can only select exactly 3 trending models');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    if (selectedIds.length !== 3 && selectedIds.length !== 0) {
      toast.error('Please select exactly 3 products (or 0 to clear)');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await Promise.all([
        axios.put((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '') + '/api/products/trending', { productIds: selectedIds }, config),
        axios.put((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '') + '/api/settings', {
          deliveryFeeType,
          deliveryFeeValue,
          codFeeType,
          codFeeValue,
          sizeSystem,
          enableCod,
          enableBank,
          bankName,
          bankAccountNumber,
          enableEasypaisa,
          easypaisaNumber,
          enableJazzcash,
          jazzcashNumber,
          emailSupport,
          directLine,
          headquarters,
          headquartersAddress
        }, config)
      ]);
      toast.success('Website configuration instantly locked!');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  const handlePOSSubmit = async () => {
    if (!posProductId || !posSize) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '') + '/api/orders/physical', { productId: posProductId, size: posSize }, config);
      toast.success('Physical Sale tracked successfully! Native stock decremented.');
      fetchProducts(); // Refresh immediately to show accurate remaining stock
      setPosProductId('');
      setPosSize('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process physical sale');
    }
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}${url}`;
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com') + '') + '/api/brands', { name: newBrandName }, config);
      toast.success('Brand added');
      setNewBrandName('');
      fetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add brand');
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand || !editingBrand.name.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/brands/${editingBrand.id}`, { name: editingBrand.name }, config);
      toast.success('Brand updated and products synced!');
      setEditingBrand(null);
      fetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update brand');
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Delete this brand? Products using this brand will keep the string value unless updated.')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/brands/${id}`, config);
      toast.success('Brand deleted');
      fetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-cyan-400 flex items-center gap-3">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
            Website Handle
          </h2>
          <p className="text-muted-foreground mt-2 text-xs sm:text-sm font-medium">Override the 3 featured Homepage Trending Models.</p>
        </div>
        <button 
          onClick={handleSave} 
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all w-full sm:w-auto shrink-0"
        >
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
           <h3 className="text-lg sm:text-xl font-bold text-white">Select Active Models</h3>
           <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest text-cyan-400 font-bold border border-cyan-400/20 w-fit">
             {selectedIds.length} / 3 SELECTED
           </span>
        </div>
        
        {products.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No products found in the database.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => handleToggle(product.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedIds.includes(product.id) ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500' : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  selectedIds.includes(product.id) ? 'bg-cyan-500 border-cyan-500' : 'border-white/20 bg-black'
                }`}>
                  {selectedIds.includes(product.id) && <span className="text-black font-black text-xs">✓</span>}
                </div>
                

                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-white">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground font-mono">Rs {product.price}</p>
                    {product.tier && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 uppercase tracking-widest font-bold rounded">{product.tier}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
           <h3 className="text-lg sm:text-xl font-bold text-white">Checkout Configuration</h3>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          
          <div className="space-y-4 bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">Delivery Charges</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={deliveryFeeType} 
                onChange={(e) => setDeliveryFeeType(e.target.value as any)}
                className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none w-full sm:w-1/3 focus:border-cyan-400 text-white"
              >
                <option value="FIXED">Flat Rate (Rs)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
              <input 
                type="number"
                value={deliveryFeeValue}
                onChange={(e) => setDeliveryFeeValue(Number(e.target.value))}
                className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none flex-1 focus:border-cyan-400 text-white font-mono w-full"
                placeholder="Enter value..."
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Overrides the standard checkout delivery rate.</p>
          </div>

          <div className="space-y-4 bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">COD Surcharge</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={codFeeType} 
                onChange={(e) => setCodFeeType(e.target.value as any)}
                className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none w-full sm:w-1/3 focus:border-cyan-400 text-white"
              >
                <option value="FIXED">Flat Rate (Rs)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
              <input 
                type="number"
                value={codFeeValue}
                onChange={(e) => setCodFeeValue(Number(e.target.value))}
                className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none flex-1 focus:border-cyan-400 text-white font-mono w-full"
                placeholder="Enter value..."
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Added to Grand Total if "Cash on Delivery" is selected.</p>
          </div>

          <div className="space-y-4 bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">Size System Label</h4>
            <div className="flex gap-4">
              <select 
                value={sizeSystem} 
                onChange={(e) => setSizeSystem(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none w-full focus:border-cyan-400 text-white font-bold"
              >
                <option value="UK">UK</option>
                <option value="US">US</option>
                <option value="EU">EU</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Prefix added to product sizes (e.g. "UK 10").</p>
          </div>

        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
           <h3 className="text-lg sm:text-xl font-bold text-white">Local Payment Gateways</h3>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          
          <div className={`space-y-4 p-4 sm:p-5 rounded-xl border transition-colors ${enableCod ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm flex items-center gap-2">
                Cash on Delivery (COD)
                {!enableCod && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase tracking-widest">Disabled</span>}
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enableCod} onChange={(e) => setEnableCod(e.target.checked)} />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>

          <div className={`space-y-4 p-4 sm:p-5 rounded-xl border transition-colors ${enableBank ? 'bg-purple-500/10 border-purple-500/50' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-purple-400 uppercase tracking-wider text-sm flex items-center gap-2">
                Custom Bank Transfer
                {!enableBank && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase tracking-widest">Disabled</span>}
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enableBank} onChange={(e) => setEnableBank(e.target.checked)} />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            {enableBank && (
              <div className="mt-2 text-sm text-foreground space-y-3">
                 <div>
                   <p className="text-muted-foreground text-xs font-medium mb-1">Bank Name:</p>
                   <input 
                     type="text" 
                     value={bankName} 
                     onChange={(e) => setBankName(e.target.value)}
                     className="w-full bg-black border border-purple-500/30 rounded-lg px-4 py-3 text-sm focus:border-purple-400 outline-none text-white font-mono"
                     placeholder="e.g. Meezan Bank, HBL"
                   />
                 </div>
                 <div>
                   <p className="text-muted-foreground text-xs font-medium mb-1">Bank Account / IBAN:</p>
                   <input 
                     type="text" 
                     value={bankAccountNumber} 
                     onChange={(e) => setBankAccountNumber(e.target.value)}
                     className="w-full bg-black border border-purple-500/30 rounded-lg px-4 py-3 text-sm focus:border-purple-400 outline-none text-white font-mono"
                     placeholder="e.g. PK35MEZN..."
                   />
                 </div>
              </div>
            )}
          </div>

          <div className={`space-y-4 p-4 sm:p-5 rounded-xl border transition-colors ${enableEasypaisa ? 'bg-green-500/10 border-green-500/50' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-green-400 uppercase tracking-wider text-sm flex items-center gap-2">
                Easypaisa Transfer
                {!enableEasypaisa && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase tracking-widest">Disabled</span>}
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enableEasypaisa} onChange={(e) => setEnableEasypaisa(e.target.checked)} />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            {enableEasypaisa && (
              <div className="mt-2 text-sm text-foreground space-y-2">
                 <p className="text-muted-foreground text-xs font-medium">Easypaisa Mobile Number:</p>
                 <input 
                   type="text" 
                   value={easypaisaNumber} 
                   onChange={(e) => setEasypaisaNumber(e.target.value)}
                   className="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-sm focus:border-green-400 outline-none text-white font-mono"
                   placeholder="e.g. 0333-1234567"
                 />
              </div>
            )}
          </div>

          <div className={`space-y-4 p-4 sm:p-5 rounded-xl border transition-colors ${enableJazzcash ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-red-400 uppercase tracking-wider text-sm flex items-center gap-2">
                JazzCash Transfer
                {!enableJazzcash && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase tracking-widest">Disabled</span>}
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enableJazzcash} onChange={(e) => setEnableJazzcash(e.target.checked)} />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            {enableJazzcash && (
              <div className="mt-2 text-sm text-foreground space-y-2">
                 <p className="text-muted-foreground text-xs font-medium">JazzCash Mobile Number:</p>
                 <input 
                   type="text" 
                   value={jazzcashNumber} 
                   onChange={(e) => setJazzcashNumber(e.target.value)}
                   className="w-full bg-black border border-red-500/30 rounded-lg px-4 py-3 text-sm focus:border-red-400 outline-none text-white font-mono"
                   placeholder="e.g. 0300-7654321"
                 />
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4 sm:p-6 mt-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
           <h3 className="text-lg sm:text-xl font-bold text-white">Contact Page Info</h3>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-4 p-4 sm:p-5 rounded-xl border bg-white/5 border-white/10">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">Email Support</h4>
            <input type="text" value={emailSupport} onChange={(e) => setEmailSupport(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-cyan-400 outline-none text-white font-mono" placeholder="support@bazarbeats.com" />
          </div>
          <div className="space-y-4 p-4 sm:p-5 rounded-xl border bg-white/5 border-white/10">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">Direct Line</h4>
            <input type="text" value={directLine} onChange={(e) => setDirectLine(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-cyan-400 outline-none text-white font-mono" placeholder="+1 (800) 555-0199" />
          </div>
          <div className="space-y-4 p-4 sm:p-5 rounded-xl border bg-white/5 border-white/10">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">Headquarters (Title)</h4>
            <input type="text" value={headquarters} onChange={(e) => setHeadquarters(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-cyan-400 outline-none text-white font-mono" placeholder="Neon District" />
          </div>
          <div className="space-y-4 p-4 sm:p-5 rounded-xl border bg-white/5 border-white/10">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">Location</h4>
            <input type="text" value={headquartersAddress} onChange={(e) => setHeadquartersAddress(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-cyan-400 outline-none text-white font-mono" placeholder="Cyber City, CC 92041, Sector 7." />
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-rose-500/20 overflow-hidden shadow-[0_0_40px_rgba(244,63,94,0.05)] p-4 sm:p-6 relative mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-3xl -mr-32 -mt-32 pointer-events-none rounded-full" />
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4 relative z-10">
           <h3 className="text-lg sm:text-xl font-black text-rose-400 uppercase tracking-widest">In-Store Point of Sale (POS)</h3>
        </div>
        
        <div className="bg-black/50 p-4 sm:p-6 rounded-xl border border-white/5 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Select Internal Product</label>
              <select 
                value={posProductId} 
                onChange={(e) => { setPosProductId(e.target.value); setPosSize(''); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 outline-none text-white focus:border-rose-400 font-bold transition-all"
              >
                <option value="" disabled className="bg-black text-muted-foreground">--- Choose Physical Inv. ---</option>
                {products.filter(p => p.stock > 0).map(p => {
                  const activeSale = isOnSale(p);
                  const displayPrice = activeSale ? p.salePrice : p.price;
                  return (
                    <option key={p.id} value={p.id} className="bg-black">
                      {p.name} - Rs {displayPrice} {activeSale ? '(ON SALE)' : ''} [Inventory: {p.stock}]
                    </option>
                  );
                })}
              </select>
            </div>

            {posProductId && (
              <div className="w-[140px] shrink-0">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Size</label>
                <select 
                  value={posSize} 
                  onChange={(e) => setPosSize(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 outline-none text-white focus:border-rose-400 font-bold transition-all appearance-none"
                >
                  <option value="" disabled className="bg-black text-muted-foreground">Size</option>
                  {(products.find(p => p.id === posProductId)?.sizes || []).map((size: string) => {
                    const stock = products.find(p => p.id === posProductId)?.sizeStock?.[size] || 0;
                    return (
                      <option key={size} value={size} disabled={stock < 1} className="bg-black">
                        {size} ({stock} left)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            
            <button 
              onClick={handlePOSSubmit}
              disabled={!posProductId || !posSize}
              className="bg-rose-500 hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-black px-8 py-3.5 rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all w-full md:w-auto shrink-0"
            >
              Log Cash Sale
            </button>
          </div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mt-4 tracking-widest">Warning: Logging a sale instantly injects revenue and rigidly decrements live hardware stock. Use strictly for physical walk-ins.</p>
        </div>
      </div>

      {/* Brand Management Section */}
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
           <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
             <Tag className="w-5 h-5 text-cyan-400 shrink-0" /> Options: Brand Dictionary
           </h3>
           <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest text-cyan-400 font-bold border border-cyan-400/20 w-fit">
             {brands.length} PRESETS
           </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input 
            type="text" 
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            placeholder="Add new generic brand name..."
            className="bg-black/50 border border-white/10 rounded-xl px-5 py-4 sm:py-3 text-sm outline-none flex-1 focus:border-cyan-400 text-white w-full"
          />
          <button 
            onClick={handleAddBrand}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-4 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all w-full sm:w-auto shrink-0"
          >
            <Plus className="w-5 h-5" /> Add Brand
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map(brand => (
            <div key={brand.id} className="relative group bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-400/50 transition-all flex items-center justify-between">
              {editingBrand?.id === brand.id ? (
                <div className="flex flex-col gap-2 w-full">
                  <input 
                    type="text" 
                    value={editingBrand.name} 
                    onChange={e => setEditingBrand({...editingBrand, name: e.target.value})}
                    className="bg-black w-full text-sm text-white px-2 py-1 outline-none border border-cyan-400/50 rounded"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdateBrand} className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded w-full font-bold">Save</button>
                    <button onClick={() => setEditingBrand(null)} className="text-xs bg-white/10 text-white px-2 py-1 rounded w-full flex justify-center"><X className="w-4 h-4"/></button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-sm font-bold text-white truncate pr-2">{brand.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingBrand({ id: brand.id, name: brand.name })} className="p-1.5 hover:bg-white/10 rounded text-cyan-400"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteBrand(brand.id)} className="p-1.5 hover:bg-rose-500/20 hover:text-rose-400 rounded text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {brands.length === 0 && <p className="col-span-full text-muted-foreground text-sm text-center py-4">No brands available. Please add some.</p>}
        </div>
      </div>

    </div>
  );
}
