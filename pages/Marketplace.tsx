
import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Tag, Download, CheckCircle2, ShoppingCart, Loader2, Plus, X, Upload, IndianRupee, Image as ImageIcon, Video, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MarketplaceAsset } from '../types';

export const Marketplace: React.FC = () => {
  const { addAsset, assets, user, marketplace, addMarketplaceAsset, setMarketplace } = useStore();
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listing State
  const [listingTitle, setListingTitle] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [listingMedia, setListingMedia] = useState<string | null>(null);
  const [isListing, setIsListing] = useState(false);

  // Initialize marketplace with defaults if empty
  useEffect(() => {
    if (marketplace.length === 0) {
      const mockMarketItems: MarketplaceAsset[] = [
        { id: 'm1', title: 'Premium Diwali 4K Motion', creatorId: 'v1', creatorName: 'VisualArts', price: 499, thumbnail: 'https://picsum.photos/seed/m1/400/500', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video', tags: ['festival', 'diwali'] },
        { id: 'm2', title: 'Traditional Holi Poster Set', creatorId: 'v2', creatorName: 'DesiDesigns', price: 199, thumbnail: 'https://picsum.photos/seed/m2/400/500', url: 'https://picsum.photos/seed/m2/800/1200', type: 'image', tags: ['traditional', 'holi'] },
        { id: 'm3', title: 'Eid Greetings Bundle', creatorId: 'v3', creatorName: 'CraftyMinds', price: 299, thumbnail: 'https://picsum.photos/seed/m3/400/500', url: 'https://picsum.photos/seed/m3/800/1200', type: 'image', tags: ['eid', 'greetings'] },
        { id: 'm4', title: 'Republic Day Animated Overlay', creatorId: 'v4', creatorName: 'ProEditor', price: 349, thumbnail: 'https://picsum.photos/seed/m4/400/500', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video', tags: ['patriotic'] },
      ];
      setMarketplace(mockMarketItems);
    }
  }, [marketplace.length, setMarketplace]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setListingMedia(event.target?.result as string);
      reader.readAsDataURL(file);
      if (!listingTitle) setListingTitle(file.name.split('.')[0]);
    }
  };

  const handleListAsset = async () => {
    if (!listingMedia || !listingTitle || !listingPrice || !user) return;
    setIsListing(true);
    
    // Simulation of high-security listing process
    await new Promise(r => setTimeout(r, 1500));

    addMarketplaceAsset({
      id: `mkt-${Math.random().toString(36).substr(2, 9)}`,
      title: listingTitle,
      creatorId: user.id,
      creatorName: user.name,
      price: parseInt(listingPrice),
      url: listingMedia,
      thumbnail: listingMedia, // Using same for thumbnail in demo
      type: listingMedia.startsWith('data:video') ? 'video' : 'image',
      tags: ['new-arrival', user.role.toLowerCase()]
    });

    setIsListing(false);
    setIsSellModalOpen(false);
    setListingTitle('');
    setListingPrice('');
    setListingMedia(null);
  };

  const handleAcquire = (item: MarketplaceAsset) => {
    setIsPurchasing(item.id);
    
    // Simulate payment/license check
    setTimeout(() => {
      addAsset({
        id: `purchased-${item.id}-${Date.now()}`,
        title: item.title,
        type: item.type as 'image' | 'video',
        url: item.url,
        month: new Date().getMonth(), // Default to current month, but source:marketplace assets are typically anytime
        language: 'en',
        source: 'marketplace',
        availability: 'anytime' // Purchased content should be permanent
      });
      setIsPurchasing(null);
      alert(`"${item.title}" has been successfully added to your Dashboard. You can now brand and export it.`);
    }, 1500);
  };

  const isAlreadyAcquired = (id: string) => {
    return assets.some(a => a.id.includes(id));
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100">
            <ShoppingCart className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Asset Exchange</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-brand">Creative Marketplace</h1>
          <p className="text-slate-500 font-medium">Exclusive templates from independent creators worldwide.</p>
        </div>
        
        {user?.role === 'CREATOR' && (
          <button 
            onClick={() => setIsSellModalOpen(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5" /> Sell Your Creations
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold" placeholder="Search premium templates by festival or keyword..." />
        </div>
        <button className="flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
          <SlidersHorizontal className="h-4 w-4" /> Filter Categories
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {marketplace.map(item => {
          const acquired = isAlreadyAcquired(item.id);
          const loading = isPurchasing === item.id;

          return (
            <div key={item.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-2">
              <div className="aspect-[3/4] relative bg-slate-100 overflow-hidden">
                {item.type === 'video' ? (
                  <video src={item.url} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" muted onMouseOver={e => (e.target as any).play()} onMouseOut={e => (e.target as any).pause()} />
                ) : (
                  <img src={item.thumbnail} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                )}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-white">
                  <Tag className="h-3 w-3 text-indigo-600" />
                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Premium Template</span>
                </div>
                {acquired && (
                  <div className="absolute inset-0 bg-indigo-600/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in">
                    <CheckCircle2 className="h-12 w-12 mb-4" />
                    <p className="font-black text-xl tracking-tight">Acquired</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Available in Dashboard</p>
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</h3>
                <div className="flex items-center mt-3 mb-6 gap-3">
                  <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-slate-200">
                    {item.creatorName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">by {item.creatorName}</span>
                </div>
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Single License</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">₹ {item.price}</span>
                  </div>
                  <button 
                    onClick={() => !acquired && !loading && handleAcquire(item)}
                    disabled={acquired || loading}
                    className={`p-4 rounded-2xl transition-all shadow-xl ${acquired ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-90 shadow-indigo-600/20'}`}
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : acquired ? <CheckCircle2 className="h-6 w-6" /> : <Download className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: SELL ASSET */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 h-auto max-h-[90vh]">
            <div className="px-12 py-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
                  <Plus className="text-indigo-600 h-8 w-8" /> List for Sale
                </h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Monetize your creative assets in the global exchange</p>
              </div>
              <button onClick={() => setIsSellModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors">
                <X className="h-8 w-8 text-slate-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Title</label>
                   <input 
                     type="text" 
                     value={listingTitle}
                     onChange={e => setListingTitle(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
                     placeholder="e.g. Ultra Diwali Pack"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (INR)</label>
                   <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="number" 
                        value={listingPrice}
                        onChange={e => setListingPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
                        placeholder="999"
                      />
                   </div>
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Creative Media</label>
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full aspect-video border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-white transition-all overflow-hidden relative group"
                 >
                   {listingMedia ? (
                     <div className="w-full h-full relative">
                        {listingMedia.startsWith('data:video') ? (
                          <video src={listingMedia} className="w-full h-full object-cover" autoPlay muted loop />
                        ) : (
                          <img src={listingMedia} className="w-full h-full object-contain p-8" alt="Preview" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Upload className="text-white h-10 w-10" />
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-4 text-center p-8">
                       <Upload className="h-10 w-10 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                       <div>
                         <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Upload Creative Asset</span>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">High-quality video or image for premium listing</span>
                       </div>
                     </div>
                   )}
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*,image/*" className="hidden" />
               </div>

               <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-start gap-4">
                  <Star className="h-6 w-6 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-[11px] font-black text-indigo-900 uppercase tracking-widest">Creator Terms</p>
                    <p className="text-[10px] text-indigo-700/80 font-medium leading-relaxed mt-1">
                      By listing this asset, you confirm you own the rights to the content. AutoBrand takes a 20% commission on every global license acquired.
                    </p>
                  </div>
               </div>
            </div>

            <div className="p-12 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={handleListAsset}
                disabled={isListing || !listingMedia || !listingTitle || !listingPrice}
                className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-xl hover:bg-black transition-all flex items-center justify-center gap-6 disabled:opacity-50 shadow-2xl shadow-slate-900/40 active:scale-95"
              >
                {isListing ? <Loader2 className="animate-spin h-7 w-7" /> : <><CheckCircle2 className="h-7 w-7 text-emerald-400" /> Publish Premium Listing</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
