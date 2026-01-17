
import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { geminiService } from '../lib/gemini';
import { 
  Loader2, Palette, Building2, Upload, Sparkles, CheckCircle2, 
  ChevronRight, X, Info, Type, Image as ImageIcon, Globe, MapPin, 
  Phone, Hash, FileText, Target, ChevronDown, Download, AlertTriangle, 
  Zap, Gift, Check, ArrowRight, ArrowLeft
} from 'lucide-react';

const INDUSTRIES = [
  'Retail & Shopping', 'Technology & Software', 'Food, Beverage & Cafe',
  'Healthcare & Wellness', 'Education & Learning', 'Real Estate & Property',
  'Fashion & Apparel', 'Automotive & Services', 'Hospitality & Travel',
  'Finance & Legal', 'Art & Design', 'Non-Profit', 'Entertainment', 'Other'
];

const FONT_STYLES = [
  { id: 'modern', label: 'Modern', desc: 'Clean, geometric and high-tech', preview: 'Futura' },
  { id: 'classic', label: 'Classic', desc: 'Traditional and authoritative', preview: 'Times' },
  { id: 'playful', label: 'Playful', desc: 'Friendly and energetic', preview: 'Rounded' },
  { id: 'luxury', label: 'Luxury', desc: 'Sophisticated and high-contrast', preview: 'Didot' },
  { id: 'minimal', label: 'Minimal', desc: 'Thin and essential', preview: 'Inter' }
] as const;

const PERSONALITIES = [
  'Professional & Corporate', 
  'Playful & Energetic', 
  'Luxury & Elegant', 
  'Minimal & Modern', 
  'Vintage & Traditional', 
  'Organic & Natural', 
  'Bold & Disruptive', 
  'High-Tech & Futuristic',
  'Ethereal & Mystical',
  'Aggressive & Sporty',
  'Friendly & Approachable',
  'Industrial & Rugged'
];

const ICON_STYLES = [
  'Minimalist Line-art', 
  'Abstract Geometry', 
  'Pictorial (Object-based)', 
  'Monogram', 
  'Badge / Emblem', 
  'Hand-drawn / Organic',
  '3D Rendered',
  'Mascot Character',
  'Typographic Wordmark',
  'Negative Space'
];

export const Onboarding: React.FC = () => {
  const { user, setUser } = useStore();
  const [step, setStep] = useState(1);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    industryType: INDUSTRIES[0],
    customIndustry: '',
    address: '',
    contactNumber: '',
    website: '',
    gstNo: '',
    fssaiNo: '',
    brandColors: ['#4f46e5'],
    brandFontStyle: 'modern' as 'modern' | 'classic' | 'playful' | 'luxury' | 'minimal',
    personality: PERSONALITIES[0],
    audience: 'General Public',
    tagline: '',
    iconStyle: ICON_STYLES[0]
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  const handleGenerateLogos = async () => {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }

    setIsGenerating(true);
    setGeneratedLogos([]);
    setKeyError(null);
    
    try {
      const results: string[] = [];
      for (let i = 0; i < 3; i++) {
        const logo = await geminiService.generateLogo({
          companyName: formData.companyName,
          industryType: formData.industryType === 'Other' ? formData.customIndustry : formData.industryType,
          targetAudience: formData.audience,
          personality: formData.personality,
          brandColors: formData.brandColors,
          tagline: formData.tagline,
          iconStyle: formData.iconStyle,
          brandFontStyle: formData.brandFontStyle
        });
        if (logo) {
          results.push(logo);
          setGeneratedLogos([...results]);
        }
      }
    } catch (e: any) {
      if (e.message === "API_KEY_REQUIRED") setKeyError("API_KEY_REQUIRED");
      else setKeyError("Logo synthesis encountered an issue.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    if (!user) return;
    setUser({
      ...user,
      brand: {
        companyName: formData.companyName,
        industryType: formData.industryType === 'Other' ? formData.customIndustry : formData.industryType,
        address: formData.address,
        contactNumber: formData.contactNumber,
        website: formData.website || undefined,
        gstNo: formData.gstNo || undefined,
        fssaiNo: formData.fssaiNo || undefined,
        brandColors: formData.brandColors,
        brandFontStyle: formData.brandFontStyle,
        personality: formData.personality,
        targetAudience: formData.audience,
        tagline: formData.tagline || undefined,
        logoUrl: selectedLogo || undefined
      }
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-20 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 mb-6 animate-in fade-in slide-in-from-top-4">
             <div className="h-6 w-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">AS</div>
             <span className="text-xs font-black uppercase tracking-widest text-slate-500">Business Onboarding</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight font-brand mb-4">Set up your <span className="text-indigo-600">Brand Identity</span></h1>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">We use your profile to automatically design and brand every asset you create.</p>
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col">
          {/* Progress Bar */}
          <div className="flex bg-slate-50/50 border-b border-slate-100">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`flex-1 py-6 text-center transition-all duration-500 relative ${step >= s ? 'text-indigo-600' : 'text-slate-300'}`}>
                <div className="flex flex-col items-center gap-2">
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {step > s ? <Check className="h-4 w-4" /> : s}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
                    {s === 1 ? 'Business' : s === 2 ? 'Details' : s === 3 ? 'Aesthetic' : 'Identity'}
                  </span>
                </div>
                {s < 4 && (
                  <div className={`absolute top-10 left-[calc(50%+20px)] right-[-calc(50%-20px)] h-0.5 transition-all duration-700 ${step > s ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                )}
              </div>
            ))}
          </div>

          <div className="p-12 lg:p-20">
            {step === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Company Name *</label>
                    <div className="relative group">
                      <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-lg" 
                        placeholder="e.g. Acme Coffee Roasters" 
                        value={formData.companyName} 
                        onChange={e => setFormData({...formData, companyName: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Industry Vertical *</label>
                    <div className="relative group">
                      <select 
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none text-slate-900 font-bold text-lg cursor-pointer appearance-none" 
                        value={formData.industryType} 
                        onChange={e => setFormData({...formData, industryType: e.target.value})}
                      >
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Target Audience Profile *</label>
                    <div className="relative group">
                      <Target className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none text-slate-900 font-bold text-lg" 
                        placeholder="e.g. Health-conscious Gen Z and Millennials" 
                        value={formData.audience} 
                        onChange={e => setFormData({...formData, audience: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
                <button onClick={nextStep} disabled={!formData.companyName || !formData.audience} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-slate-900/20">
                  Continue Setup <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Physical Address *</label>
                    <div className="relative group">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-indigo-500/5 outline-none text-slate-900 font-bold" placeholder="Corporate or Store Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Official Contact *</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-indigo-500/5 outline-none text-slate-900 font-bold" placeholder="+91 XXXXX XXXXX" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Website (Optional)</label>
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-indigo-500/5 outline-none text-slate-900 font-bold" placeholder="www.example.com" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tax ID / GSTIN</label>
                    <div className="relative group">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-indigo-500/5 outline-none text-slate-900 font-bold" placeholder="27XXXXX0000X1Z5" value={formData.gstNo} onChange={e => setFormData({...formData, gstNo: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">FSSAI Number</label>
                    <div className="relative group">
                      <FileText className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-indigo-500/5 outline-none text-slate-900 font-bold" placeholder="14-digit number" value={formData.fssaiNo} onChange={e => setFormData({...formData, fssaiNo: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={prevStep} className="px-10 py-5 rounded-[1.5rem] font-black border border-slate-200 text-slate-400 hover:bg-slate-50 flex items-center gap-3 transition-all">
                    <ArrowLeft className="h-5 w-5" /> Back
                  </button>
                  <button onClick={nextStep} disabled={!formData.address || !formData.contactNumber} className="flex-1 bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group shadow-xl shadow-indigo-500/20">
                    Next Step <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Primary Brand Palette *</label>
                    <div className="flex flex-wrap gap-5">
                      {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#1e293b', '#22c55e', '#7c3aed', '#000000'].map(c => (
                        <button 
                          key={c} 
                          onClick={() => setFormData({...formData, brandColors: [c]})} 
                          className={`h-14 w-14 rounded-full border-4 transition-all duration-300 relative group ${formData.brandColors[0] === c ? 'border-indigo-600 scale-125 shadow-2xl' : 'border-white hover:scale-110 shadow-lg'}`} 
                          style={{ backgroundColor: c }}
                        >
                          {formData.brandColors[0] === c && <div className="absolute inset-0 flex items-center justify-center"><Check className={`h-6 w-6 ${c === '#ffffff' ? 'text-slate-900' : 'text-white'}`} /></div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Typography Archetype *</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {FONT_STYLES.map(f => (
                        <button 
                          key={f.id} 
                          onClick={() => setFormData({...formData, brandFontStyle: f.id})}
                          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-500 group ${formData.brandFontStyle === f.id ? 'bg-indigo-50 border-indigo-600 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                        >
                          <span className={`text-2xl font-bold transition-transform group-hover:scale-110 ${f.id === 'modern' ? 'font-sans' : f.id === 'classic' ? 'font-serif' : 'font-mono'}`}>Aa</span>
                          <div className="text-center">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${formData.brandFontStyle === f.id ? 'text-indigo-600' : 'text-slate-900'}`}>{f.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium italic text-center mt-2">Selected style: {FONT_STYLES.find(f => f.id === formData.brandFontStyle)?.desc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Brand Personality</label>
                      <select className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none text-slate-900 font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer" value={formData.personality} onChange={e => setFormData({...formData, personality: e.target.value})}>
                        {PERSONALITIES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Brand Tagline</label>
                      <input className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none text-slate-900 font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all" placeholder="e.g. Quality You Can Taste" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={prevStep} className="px-10 py-5 rounded-[1.5rem] font-black border border-slate-200 text-slate-400 hover:bg-slate-50 flex items-center gap-3 transition-all">
                    <ArrowLeft className="h-5 w-5" /> Back
                  </button>
                  <button onClick={nextStep} className="flex-1 bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 group shadow-xl shadow-indigo-500/20">
                    Define Identity <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group h-full">
                    <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} />
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="w-full h-full flex flex-col items-center justify-center p-12 rounded-[2.5rem] border-4 border-dashed border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-400 hover:shadow-2xl transition-all group"
                    >
                      <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                        <Upload className="h-10 w-10 text-slate-300 group-hover:text-indigo-600" />
                      </div>
                      <p className="font-black text-slate-900 text-lg mb-1">Import Existing Logo</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">SVG, PNG or High-Res JPG</p>
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsWizardOpen(true)} 
                    className="w-full flex flex-col items-center justify-center p-12 rounded-[2.5rem] border-2 border-indigo-100 bg-indigo-50/20 hover:bg-white hover:border-indigo-400 hover:shadow-2xl transition-all group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 group-hover:rotate-12 transition-all duration-1000">
                      <Sparkles className="h-24 w-24 text-indigo-600" />
                    </div>
                    <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                      <Sparkles className="h-10 w-10 text-indigo-600" />
                    </div>
                    <p className="font-black text-indigo-900 text-lg mb-1">Imagen 3 Studio</p>
                    <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">Free Generative Design</p>
                  </button>
                </div>

                {selectedLogo && (
                  <div className="bg-slate-900 rounded-[3rem] p-10 flex items-center justify-between animate-in zoom-in-95 duration-500 shadow-2xl shadow-indigo-500/20">
                    <div className="flex items-center gap-8">
                      <div className="h-24 w-24 bg-white rounded-2xl p-4 flex items-center justify-center shadow-inner ring-4 ring-white/10">
                        <img src={selectedLogo} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <p className="text-white font-black text-2xl tracking-tight">Active Brand Identity</p>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Synced & Verified</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedLogo(null)} className="h-12 w-12 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"><X className="h-6 w-6" /></button>
                  </div>
                )}

                <div className="flex gap-4 pt-10 border-t border-slate-100">
                  <button onClick={prevStep} className="px-10 py-5 rounded-[1.5rem] font-black border border-slate-200 text-slate-400 hover:bg-slate-50 flex items-center gap-3 transition-all">
                    <ArrowLeft className="h-5 w-5" /> Back
                  </button>
                  <button 
                    onClick={handleComplete} 
                    disabled={!selectedLogo}
                    className="flex-1 bg-indigo-600 text-white py-6 rounded-3xl font-black text-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-5 shadow-2xl shadow-indigo-500/30 disabled:opacity-50"
                  >
                    Launch Studio <CheckCircle2 className="h-8 w-8" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: LOGO STUDIO */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white w-full max-w-5xl rounded-[4rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20 relative">
            <div className="px-12 py-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4"><Sparkles className="text-indigo-600 h-10 w-10" /> Identity Architect</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Free Imagen 3 Generation</p>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="p-4 hover:bg-slate-200 rounded-full transition-colors"><X className="h-8 w-8 text-slate-300" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 lg:p-16 custom-scrollbar">
              {keyError && (
                <div className="mb-10 p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex flex-col gap-6 animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-4 text-rose-600">
                    <AlertTriangle className="h-8 w-8" />
                    <div>
                      <p className="font-black text-lg">Billing Key Required</p>
                      <p className="text-sm font-medium opacity-80">Imagen 3 generation requires a paid API Key from your Google AI Studio project.</p>
                    </div>
                  </div>
                  <button onClick={async () => { await window.aistudio.openSelectKey(); setKeyError(null); }} className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20">Link Paid Key</button>
                </div>
              )}

              {generatedLogos.length > 0 ? (
                <div className="space-y-12 animate-in zoom-in-95 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {generatedLogos.map((logo, idx) => (
                      <div key={idx} className="group relative">
                        <div 
                          onClick={() => { setSelectedLogo(logo); setIsWizardOpen(false); }} 
                          className="aspect-square bg-slate-50 border-4 border-slate-100 rounded-[3rem] p-12 cursor-pointer hover:border-indigo-600 hover:shadow-2xl transition-all duration-700 flex items-center justify-center overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
                        >
                          <img src={logo} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors pointer-events-none"></div>
                        </div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                          <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">Select Design</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-6">
                    <button onClick={handleGenerateLogos} disabled={isGenerating} className="flex items-center gap-3 text-indigo-600 font-black hover:gap-6 transition-all uppercase tracking-widest text-xs">
                      Generate More Iterations <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Icon Aesthetic</label>
                        <select className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-slate-800 outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all" value={formData.iconStyle} onChange={e => setFormData({...formData, iconStyle: e.target.value})}>
                          {ICON_STYLES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Vibe</label>
                        <div className="px-6 py-5 bg-indigo-50/50 border border-indigo-100 rounded-[1.5rem] flex items-center justify-between">
                          <span className="font-bold text-indigo-900">{formData.personality}</span>
                          <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                   </div>
                   
                   <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 flex gap-6 items-start">
                     <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><Gift className="h-6 w-6 text-emerald-500" /></div>
                     <div className="space-y-1">
                       <p className="font-black text-sm uppercase tracking-widest text-emerald-900">Enterprise AI Unlocked</p>
                       <p className="text-emerald-700 font-medium text-base leading-relaxed">
                         We use the world's most advanced image synthesis model, <span className="font-black">Imagen 3</span>, to construct a vector-style brand identity that matches your aesthetic profile.
                       </p>
                     </div>
                   </div>
                </div>
              )}
            </div>

            {!generatedLogos.length && (
              <div className="p-16 border-t border-slate-50 bg-slate-50/30">
                <button 
                  onClick={handleGenerateLogos} 
                  disabled={isGenerating} 
                  className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-black transition-all flex items-center justify-center gap-6 disabled:opacity-50 shadow-2xl shadow-slate-900/40 active:scale-95"
                >
                  {isGenerating ? <><Loader2 className="animate-spin h-8 w-8" /> Synthesizing Brand Identity...</> : <><Sparkles className="h-8 w-8 text-emerald-400" /> Construct Design Variations</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
