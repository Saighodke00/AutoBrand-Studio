
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Sparkles, Video, X, Loader2, Stars, 
  Cloud, Star, Trash2, 
  Wand2, Play, Calendar, Zap, Terminal, ShoppingBag, 
  ArrowRight, LayoutGrid, History, ShieldCheck, Database, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { geminiService } from '../lib/gemini';

interface AssetCardProps {
  asset: any;
  activeMonth: number;
  months: string[];
  onDelete: (id: string) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, activeMonth, months, onDelete }) => {
  const getSourceBadge = () => {
    switch (asset.source) {
      case 'global':
        return { label: asset.availability === 'anytime' ? 'Permanent Master' : 'Admin Master', color: 'bg-slate-900', icon: asset.availability === 'anytime' ? Globe : ShieldCheck };
      case 'ai':
        return { label: 'AI Synth', color: 'bg-emerald-500', icon: Sparkles };
      case 'marketplace':
        return { label: 'Premium', color: 'bg-amber-500', icon: ShoppingBag };
      default:
        return { label: 'Local', color: 'bg-indigo-500', icon: Cloud };
    }
  };

  const badge = getSourceBadge();

  return (
    <div className="group bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
      <div className="aspect-[3/4] relative bg-slate-50 overflow-hidden">
        {asset.type === 'video' ? (
          <video src={asset.url} className="object-cover w-full h-full" muted loop />
        ) : (
          <img src={asset.url} className="object-cover w-full h-full" alt={asset.title} />
        )}
        
        <div className="absolute top-6 left-6 z-10">
          <div className={`${badge.color} text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-white/20 backdrop-blur-md`}>
            <badge.icon className="h-3.5 w-3.5" /> {badge.label}
          </div>
        </div>

        {asset.availability === 'anytime' && (
          <div className="absolute top-6 right-6 z-10">
            <div className="bg-white/90 backdrop-blur-md text-slate-900 p-2 rounded-full shadow-lg border border-white">
              <Globe className="h-3.5 w-3.5" />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-8 flex flex-col gap-6">
        <div>
          <h3 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight leading-tight">{asset.title}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
             <Calendar className="h-3 w-3 text-indigo-500/50" /> {asset.availability === 'anytime' ? 'Always Available' : `${months[activeMonth]} Release`}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link to={`/editor/${asset.id}`} className="w-full bg-slate-100 text-slate-900 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2">
            Customize <Wand2 className="h-3.5 w-3.5" />
          </Link>
          <button 
            onClick={(e) => { e.preventDefault(); onDelete(asset.id); }}
            className="w-full text-slate-400 hover:text-rose-500 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all py-1"
          >
            <Trash2 className="h-3 w-3" /> Remove Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { assets, user, addAsset, removeAsset } = useStore();
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [sourceFilter, setSourceFilter] = useState<'all' | 'global' | 'ai' | 'marketplace'>('all');
  
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const monthlyHistory = useMemo(() => {
    return assets.filter(a => {
      // Logic: Show seasonal assets that match the month OR show 'anytime' assets in every month
      const monthMatch = a.availability === 'anytime' || a.month === activeMonth;
      const sourceMatch = sourceFilter === 'all' || a.source === sourceFilter;
      return monthMatch && sourceMatch;
    });
  }, [assets, activeMonth, sourceFilter]);

  const stats = useMemo(() => {
    return {
      master: assets.filter(a => a.source === 'global').length,
      ai: assets.filter(a => a.source === 'ai').length,
      premium: assets.filter(a => a.source === 'marketplace').length
    };
  }, [assets]);

  const handleGenerateAIImage = async () => {
    if (!imagePrompt.trim()) return;
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) await window.aistudio.openSelectKey();
    setIsGenerating(true);
    try {
      const result = await geminiService.generateAIImage({
        userPrompt: imagePrompt,
        style: 'Cinematic',
        brandPersonality: user?.brand?.personality,
        industryType: user?.brand?.industryType,
        targetAudience: user?.brand?.targetAudience,
        brandColors: user?.brand?.brandColors
      });
      if (result) {
        addAsset({
          id: `ai-img-${Math.random().toString(36).substr(2, 9)}`,
          title: imagePrompt.length > 20 ? `${imagePrompt.substring(0, 20)}...` : imagePrompt,
          type: 'image',
          url: result,
          month: activeMonth,
          language: 'en',
          source: 'ai',
          availability: 'seasonal'
        });
        setIsImageModalOpen(false);
        setImagePrompt('');
      }
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const handleGenerateAIVideo = async () => {
    if (!videoPrompt.trim()) return;
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) await window.aistudio.openSelectKey();
    setIsGenerating(true);
    try {
      const result = await geminiService.generateAIVideo({
        prompt: videoPrompt,
        resolution: '720p',
        aspectRatio: '9:16'
      });
      if (result) {
        addAsset({
          id: `ai-vid-${Math.random().toString(36).substr(2, 9)}`,
          title: videoPrompt.length > 20 ? `${videoPrompt.substring(0, 20)}...` : videoPrompt,
          type: 'video',
          url: result,
          month: activeMonth,
          language: 'en',
          source: 'ai',
          availability: 'seasonal'
        });
        setIsVideoModalOpen(false);
        setVideoPrompt('');
      }
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm("Permanently remove this asset from your brand history?")) {
      removeAsset(id);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-16 w-full">
        {/* Hero Section */}
        <section className="relative h-[440px] rounded-[4.5rem] overflow-hidden bg-slate-900 group shadow-2xl flex flex-col items-center justify-center text-center px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.35),transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
          
          <div className="relative max-w-4xl space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex items-center gap-3 w-fit bg-white/10 backdrop-blur-2xl border border-white/10 px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] mx-auto">
              <Stars className="h-4 w-4 text-emerald-400" /> Unified Lifecycle Hub
            </div>
            <h1 className="text-6xl lg:text-7xl font-black font-brand leading-[1] tracking-tighter text-white">
              Content <span className="text-indigo-400">Chronicle.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto leading-relaxed opacity-80">
              Synthesize intelligence, acquire premiums, and deploy master templates from your timeline.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
              <button onClick={() => setIsVideoModalOpen(true)} className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl active:scale-95">
                <Video className="h-5 w-5" /> Video Architect
              </button>
              <button onClick={() => setIsImageModalOpen(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95">
                <Sparkles className="h-5 w-5" /> Vision Architect
              </button>
            </div>
          </div>
        </section>

        {/* CHRONOLOGY SECTION */}
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex flex-col items-center text-center space-y-4 px-4">
             <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl">
               <Calendar className="h-4 w-4 text-indigo-400" /> Active Timeline
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tight">Select Distribution Period</h2>
             <p className="text-slate-400 text-sm font-medium max-w-lg">Access seasonal campaigns, admin masters, and AI synthesized assets by selecting a month.</p>
          </div>

          <div className="bg-white rounded-[3.5rem] border border-slate-200 p-6 shadow-sm overflow-hidden">
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
               {months.map((m, idx) => (
                 <button 
                   key={m} 
                   onClick={() => setActiveMonth(idx)}
                   className={`group px-6 py-8 rounded-[2rem] border-2 transition-all duration-300 relative flex flex-col items-center gap-3 ${
                     activeMonth === idx 
                       ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-[1.05] z-10' 
                       : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200 hover:text-slate-900'
                   }`}
                 >
                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeMonth === idx ? 'text-indigo-200' : 'text-slate-400'}`}>{m.substring(0, 3)}</span>
                   <span className="text-xl font-black tracking-tighter">{m}</span>
                   {activeMonth === idx && (
                     <div className="absolute top-4 right-4 h-2 w-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                   )}
                 </button>
               ))}
             </div>
          </div>
        </section>

        {/* INVENTORY SECTION */}
        <div className="space-y-12 pb-32">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                  {months[activeMonth]} <span className="text-slate-300 font-light text-3xl">Asset Cloud</span>
                </h2>
                <div className="bg-indigo-100 px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest h-fit border border-indigo-200">
                  {monthlyHistory.length} Distributed
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="h-3 w-3 text-indigo-500" /> High-Performance Brand Resources
              </p>
            </div>

            <div className="flex bg-white p-1.5 rounded-[1.75rem] border border-slate-200 shadow-sm self-start lg:self-auto overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Cloud', icon: LayoutGrid },
                { id: 'global', label: 'Admin Masters', icon: ShieldCheck },
                { id: 'ai', label: 'AI Synth', icon: Zap },
                { id: 'marketplace', label: 'Premium', icon: ShoppingBag }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setSourceFilter(f.id as any)}
                  className={`px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${sourceFilter === f.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <f.icon className="h-3 w-3" /> {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4">
            {monthlyHistory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {monthlyHistory.map(asset => (
                  <AssetCard 
                    key={asset.id} 
                    asset={asset} 
                    activeMonth={activeMonth} 
                    months={months} 
                    onDelete={handleDeleteAsset} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[4rem] border border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                  <History className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Timeline Unpopulated</h3>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                    No {sourceFilter !== 'all' ? sourceFilter.toUpperCase() : ''} assets found for {months[activeMonth]}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Credits Status Board */}
          <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-10 flex flex-wrap items-center justify-between gap-8 mt-16 animate-in fade-in duration-1000">
            <div className="space-y-1">
              <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Account Cloud Status
              </h4>
              <p className="text-slate-400 text-sm font-medium">Enterprise Core active and synchronized.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="h-10 w-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">{stats.master}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Master Repository</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">{user?.credits.images}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AI Synth Tokens</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="h-10 w-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">{stats.premium}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Premium Assets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain structurally the same */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden p-12 lg:p-16 flex flex-col space-y-10 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tight"><Video className="text-indigo-600 h-8 w-8" /> Video Architect</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">High-Resolution Motion Synthesis</p>
              </div>
              <button onClick={() => setIsVideoModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><X className="h-8 w-8 text-slate-300" /></button>
            </div>
            <textarea 
              className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-bold text-lg h-48 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all resize-none shadow-inner"
              placeholder="Describe the cinematic scene..."
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
            />
            <button 
              onClick={handleGenerateAIVideo}
              disabled={isGenerating || !videoPrompt.trim()}
              className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-xl hover:bg-black transition-all flex items-center justify-center gap-5 shadow-2xl shadow-slate-900/40 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin h-7 w-7" /> : <><Play className="h-7 w-7 fill-white" /> Synthesize Motion</>}
            </button>
          </div>
        </div>
      )}

      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden p-12 lg:p-16 flex flex-col space-y-10 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tight"><Sparkles className="text-emerald-500 h-8 w-8" /> Vision Architect</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Enterprise Image Synthesis</p>
              </div>
              <button onClick={() => setIsImageModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><X className="h-8 w-8 text-slate-300" /></button>
            </div>
            <textarea 
              className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-bold text-lg h-48 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all resize-none shadow-inner"
              placeholder="Describe your vision..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
            <button 
              onClick={handleGenerateAIImage}
              disabled={isGenerating || !imagePrompt.trim()}
              className="w-full bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-5 shadow-2xl shadow-indigo-500/40 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin h-7 w-7" /> : <><Sparkles className="h-7 w-7" /> Synthesize Vision</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
