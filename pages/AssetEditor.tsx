
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BrandingEngine } from '../lib/brandingEngine';
import { geminiService } from '../lib/gemini';
import { 
  ArrowLeft, Download, Share2, Type, Music, History, 
  Check, Loader2, Sparkles, Languages, Mic, Eye, EyeOff,
  Phone, MapPin, Globe, Shield, Info, Wand2, Volume2, 
  Play, Pause, RefreshCcw, MessageSquare, Headphones,
  ChevronRight, VolumeX
} from 'lucide-react';

export const AssetEditor: React.FC = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { assets, user } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'text' | 'audio'>('branding');
  
  const [visibleElements, setVisibleElements] = useState({
    logo: true,
    ribbon: true,
    name: true,
    contact: true,
    address: true,
    tagline: true
  });

  // Audio / TTS State
  const [ttsText, setTtsText] = useState('');
  const [isTtsGenerating, setIsTtsGenerating] = useState(false);
  const [ttsLanguage, setTtsLanguage] = useState<'en' | 'hi'>('en');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const asset = assets.find(a => a.id === assetId);

  // Define playAudio to fix the reported error
  const playAudio = (buffer: AudioBuffer) => {
    stopAudio();
    
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    source.onended = () => setIsPlaying(false);
    
    audioSourceRef.current = source;
    source.start(0);
    setIsPlaying(true);
  };

  // Define stopAudio for cleanup
  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Source might already be stopped
      }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleElement = (key: keyof typeof visibleElements) => {
    setVisibleElements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateTTS = async () => {
    if (!ttsText.trim()) return;
    
    // Check for API key as required by guidelines
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }

    setIsTtsGenerating(true);
    try {
      const buffer = await geminiService.generateTTS(ttsText, selectedVoice, ttsLanguage);
      if (buffer) {
        setAudioBuffer(buffer);
        // Automatically play on success for feedback
        playAudio(buffer);
      }
    } catch (e: any) {
      console.error(e);
      // Handle the "Requested entity was not found" error as per guidelines
      if (e.message?.includes('Requested entity was not found')) {
        await window.aistudio.openSelectKey();
      } else {
        alert("Voice synthesis failed. Please check your connection.");
      }
    } finally {
      setIsTtsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!asset || !user?.brand) return;
    setIsExporting(true);
    try {
      // Simulation of branding application
      await BrandingEngine.applyBranding(asset.url, user.brand.logoUrl || '', user.brand.companyName);
      alert("Brand-aligned asset exported successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!asset) return null;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Editor Header */}
      <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate max-w-xs">{asset.title}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-indigo-500" /> Auto-Branding Engine Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
            <Share2 className="h-4 w-4" /> Share Draft
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Finalize & Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Area */}
        <div className="flex-1 overflow-y-auto p-12 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <div className={`relative bg-black shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden ${asset.type === 'video' ? 'aspect-[9/16] w-[400px]' : 'aspect-[3/4] w-[450px]'} rounded-[3rem]`}>
            {/* Base Asset */}
            {asset.type === 'video' ? (
              <video src={asset.url} className="w-full h-full object-cover" autoPlay muted loop />
            ) : (
              <img src={asset.url} className="w-full h-full object-cover" alt="Editor view" />
            )}

            {/* Dynamic Branding Overlay */}
            {user?.brand && (
              <>
                {/* Logo Overlay */}
                {visibleElements.logo && user.brand.logoUrl && (
                  <div style={BrandingEngine.getLogoStyles(asset.type === 'video' ? '9:16' : '3:4')}>
                    <img src={user.brand.logoUrl} className="max-h-16 object-contain" alt="Brand Logo" />
                  </div>
                )}

                {/* Ribbon Overlay */}
                {visibleElements.ribbon && (
                  <div style={BrandingEngine.getRibbonStyles(user.brand.brandColors[0])}>
                    <div className="flex flex-col">
                      {visibleElements.name && (
                        <span className="text-white text-[11px] font-black uppercase tracking-tight">{user.brand.companyName}</span>
                      )}
                      {visibleElements.tagline && (
                        <span className="text-white/60 text-[8px] font-bold uppercase tracking-widest">{user.brand.tagline}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {visibleElements.contact && (
                        <div className="flex items-center gap-1.5 text-white/90">
                          <Phone className="h-2 w-2" />
                          <span className="text-[9px] font-black">{user.brand.contactNumber}</span>
                        </div>
                      )}
                      {visibleElements.address && (
                        <div className="flex items-center gap-1.5 text-white/70">
                          <MapPin className="h-2 w-2" />
                          <span className="text-[8px] font-bold truncate max-w-[120px]">{user.brand.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-[440px] bg-white border-l border-slate-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(['branding', 'text', 'audio'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"></div>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-12">
            {activeTab === 'branding' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Shield className="h-3 w-3" /> Visibility Layering
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(visibleElements).map(([key, val]) => (
                      <button 
                        key={key} 
                        onClick={() => toggleElement(key as any)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${val ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-500/10' : 'bg-slate-50 border-transparent text-slate-400'}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest capitalize">{key}</span>
                        {val ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-slate-900 rounded-[2.5rem] space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Volume2 className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm">Adaptive Branding</h4>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Ribbon + Identity Anchor</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    Our branding engine automatically positions your identity for maximum conversion on WhatsApp & Instagram.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Mic className="h-3 w-3" /> Voice Synthesis (Gemini 2.5)
                  </label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button 
                      onClick={() => setTtsLanguage('en')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ttsLanguage === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => setTtsLanguage('hi')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ttsLanguage === 'hi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                      Hindi
                    </button>
                  </div>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-sm h-32 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all resize-none shadow-inner"
                    placeholder={ttsLanguage === 'en' ? "Enter text for voiceover..." : "वॉयसओवर के लिए टेक्स्ट दर्ज करें..."}
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['Kore', 'Puck', 'Fenrir', 'Charon'].map(v => (
                    <button 
                      key={v}
                      onClick={() => setSelectedVoice(v)}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${selectedVoice === v ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{v}</span>
                      <Headphones className={`h-4 w-4 ${selectedVoice === v ? 'text-indigo-600' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleGenerateTTS}
                    disabled={isTtsGenerating || !ttsText.trim()}
                    className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                  >
                    {isTtsGenerating ? <Loader2 className="animate-spin h-5 w-5" /> : <RefreshCcw className="h-5 w-5" />}
                    Synthesize Voice
                  </button>

                  {audioBuffer && (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <Check className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-black text-emerald-900 uppercase tracking-widest">Audio Ready</span>
                      </div>
                      <button 
                        onClick={() => isPlaying ? stopAudio() : playAudio(audioBuffer)}
                        className="h-14 w-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-emerald-600 hover:scale-110 active:scale-90 transition-all"
                      >
                        {isPlaying ? <VolumeX className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="h-20 w-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                  <Type className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Creative Text Controls</h3>
                  <p className="text-slate-400 text-sm font-medium mt-2 max-w-[240px] mx-auto">
                    Advanced typography and AI copywriting controls coming in v2.0 update.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
