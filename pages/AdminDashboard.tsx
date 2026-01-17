
import React, { useState, useRef, useMemo } from 'react';
import { 
  Database, Activity, RefreshCw, 
  CheckCircle2, ShieldCheck, Video, Plus, Upload, X,
  FileVideo, Image as ImageIcon, Trash2, ExternalLink,
  Search, Globe, Calendar as CalendarIcon,
  BarChart3, Users, Settings, AlertCircle, Clock, ArrowLeft,
  ArrowRight, Square, CheckSquare
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const AdminDashboard: React.FC = () => {
  const { assets, removeAsset, addAsset, bulkRemoveAssets } = useStore();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Master Ingest State
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestUrl, setIngestUrl] = useState('');
  const [ingestMonth, setIngestMonth] = useState(new Date().getMonth());
  const [ingestAvailability, setIngestAvailability] = useState<'anytime' | 'seasonal'>('seasonal');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const stats = useMemo(() => {
    const globalCount = assets.filter(a => a.source === 'global').length;
    const anytimeCount = assets.filter(a => a.availability === 'anytime').length;
    const videoCount = assets.filter(a => a.type === 'video').length;
    const healthScore = Math.min(100, 85 + (assets.length * 0.5));

    return [
      { label: 'Master Assets', value: globalCount, icon: Database, color: 'indigo', subtitle: `${anytimeCount} Permanent` },
      { label: 'Cloud Health', value: `${healthScore}%`, icon: Activity, color: 'emerald', subtitle: 'System Optimized' },
      { label: 'Video Flux', value: videoCount, icon: FileVideo, color: 'amber', subtitle: 'Active Motion' },
      { label: 'User Nodes', value: '124', icon: Users, color: 'blue', subtitle: 'Active Sessions' },
    ];
  }, [assets]);

  const filteredLibrary = useMemo(() => 
    assets.filter(a => 
      a.source === 'global' && 
      (a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.toLowerCase().includes(searchTerm.toLowerCase()))
    ), 
  [assets, searchTerm]);

  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('done');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2000);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredLibrary.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLibrary.map(a => a.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Permanently decommission ${selectedIds.length} templates from the Master Repository?`)) {
      bulkRemoveAssets(selectedIds);
      setSelectedIds([]);
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('idle'), 1000);
    }
  };

  const handleDeleteTemplate = (id: string, title: string) => {
    if (window.confirm(`Permanently decommission "${title}" from the Master Repository?`)) {
      removeAsset(id);
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setIngestUrl(event.target?.result as string);
      reader.readAsDataURL(file);
      if (!ingestTitle) setIngestTitle(file.name.split('.')[0]);
    }
  };

  const saveMasterVideo = async () => {
    if (!ingestUrl || !ingestTitle) return;
    
    setIsDeploying(true);
    // Simulate high-security cloud synchronization
    await new Promise(resolve => setTimeout(resolve, 2000));

    addAsset({
      id: `mstr-${Math.random().toString(36).substr(2, 5)}`,
      title: ingestTitle,
      type: ingestUrl.startsWith('data:video') ? 'video' : 'image',
      url: ingestUrl,
      month: ingestAvailability === 'anytime' ? 0 : ingestMonth,
      language: 'en',
      source: 'global',
      availability: ingestAvailability
    });

    setIsDeploying(false);
    closeIngestModal();
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  const closeIngestModal = () => {
    setIngestTitle('');
    setIngestUrl('');
    setIngestMonth(new Date().getMonth());
    setIngestAvailability('seasonal');
    setIsDeploying(false);
    setIsIngestModalOpen(false);
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      {/* Admin Sub-Header */}
      <div className="bg-white border-b border-slate-200 px-8 lg:px-12 py-6 flex items-center justify-between sticky top-0 z-20 shadow-sm shadow-slate-200/50">
        <div className="flex items-center gap-6">
          <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-brand uppercase">Command Center</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Online: v2.8.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {selectedIds.length > 0 && (
             <button 
               onClick={handleBulkDelete}
               className="px-6 py-3 rounded-xl bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 transition-all border border-rose-200 animate-in slide-in-from-right-4"
             >
               <Trash2 className="h-3.5 w-3.5" /> Purge Selection ({selectedIds.length})
             </button>
           )}
           <button 
             onClick={handleSync}
             className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
           >
             <RefreshCw className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
             {syncStatus === 'syncing' ? 'Syncing Nodes...' : 'Verify Integrity'}
           </button>
           <button 
             onClick={() => setIsIngestModalOpen(true)}
             className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
           >
             <Plus className="h-4 w-4" /> Deploy Master Template
           </button>
        </div>
      </div>

      <div className="p-8 lg:p-12 space-y-12 max-w-[1600px] mx-auto w-full pb-32">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className={`h-12 w-12 rounded-2xl bg-${stat.color === 'indigo' ? 'indigo-50' : stat.color === 'emerald' ? 'emerald-50' : stat.color === 'amber' ? 'amber-50' : 'blue-50'} flex items-center justify-center text-${stat.color === 'indigo' ? 'indigo-600' : stat.color === 'emerald' ? 'emerald-600' : stat.color === 'amber' ? 'amber-600' : 'blue-600'} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-3">{stat.subtitle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Repository List */}
          <div className="lg:col-span-9 space-y-8">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-10 py-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/30">
                <div className="flex items-center gap-6">
                  <button onClick={selectAll} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors">
                    {selectedIds.length === filteredLibrary.length ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </button>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Database className="h-5 w-5 text-indigo-600" /> Master Asset Repository
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Foundational templates for all organization units</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Filter by ID or Name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all w-64"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">Select</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Identifier</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</th>
                      <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLibrary.length > 0 ? filteredLibrary.map((asset) => (
                      <tr 
                        key={asset.id} 
                        className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.includes(asset.id) ? 'bg-indigo-50/30' : ''}`}
                      >
                        <td className="px-10 py-6 text-center">
                           <button 
                             onClick={() => toggleSelection(asset.id)}
                             className={`h-6 w-6 rounded-lg border-2 mx-auto flex items-center justify-center transition-all ${selectedIds.includes(asset.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-transparent'}`}
                           >
                             <CheckCircle2 className="h-3.5 w-3.5" />
                           </button>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 relative">
                              {asset.type === 'video' ? (
                                <video src={asset.url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={asset.url} className="w-full h-full object-cover" />
                              )}
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{asset.title}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mt-1">{asset.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${asset.availability === 'anytime' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                             {asset.availability === 'anytime' ? <Globe className="h-3 w-3" /> : <CalendarIcon className="h-3 w-3" />}
                             {asset.availability === 'anytime' ? 'Anytime' : months[asset.month]}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                             {asset.type === 'video' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                             {asset.type.toUpperCase()}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleDeleteTemplate(asset.id, asset.title)}
                              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-10 py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No templates found in repository</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* System Side Panel */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl space-y-10 border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <ShieldCheck className="h-32 w-32" />
               </div>
               <div className="space-y-4 relative z-10">
                 <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                   <AlertCircle className="h-6 w-6 text-indigo-400" />
                 </div>
                 <h3 className="text-xl font-black tracking-tight uppercase">Security Audit</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                   System verified. All master templates are signed and encrypted via enterprise distribution nodes.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADVANCED MASTER DEPLOY */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 h-auto max-h-[90vh]">
            <div className="px-12 py-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
                  <Plus className="text-indigo-600 h-8 w-8" /> Orchestrate Deployment
                </h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Add Signed Template to Global Repository</p>
              </div>
              <button onClick={closeIngestModal} className="p-3 hover:bg-slate-200 rounded-full transition-colors">
                <X className="h-8 w-8 text-slate-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Identity</label>
                   <input 
                     type="text" 
                     value={ingestTitle}
                     onChange={e => setIngestTitle(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
                     placeholder="e.g. Q4 Corporate Anthem"
                   />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Logic</label>
                    <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                       <button 
                        onClick={() => setIngestAvailability('seasonal')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${ingestAvailability === 'seasonal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                       ><CalendarIcon className="h-3.5 w-3.5" /> Seasonal</button>
                       <button 
                        onClick={() => setIngestAvailability('anytime')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${ingestAvailability === 'anytime' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                       ><Globe className="h-3.5 w-3.5" /> Anytime</button>
                    </div>
                 </div>
               </div>

               {ingestAvailability === 'seasonal' && (
                 <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Distribution Period</label>
                   <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {months.map((m, i) => (
                        <button 
                          key={m}
                          onClick={() => setIngestMonth(i)}
                          className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${ingestMonth === i ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                        >
                          {m.substring(0, 3)}
                        </button>
                      ))}
                   </div>
                 </div>
               )}

               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Media Source</label>
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full aspect-video border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-white transition-all overflow-hidden relative group"
                 >
                   {ingestUrl ? (
                     <div className="w-full h-full relative">
                        {ingestUrl.startsWith('data:video') ? (
                          <video src={ingestUrl} className="w-full h-full object-cover" autoPlay muted loop />
                        ) : (
                          <img src={ingestUrl} className="w-full h-full object-contain p-8" alt="Preview" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <RefreshCw className="text-white h-10 w-10" />
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-4">
                       <Upload className="h-8 w-8 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                       <div className="text-center">
                         <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Upload Master Source</span>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Accepts MP4, PNG, JPG (Max 50MB)</span>
                       </div>
                     </div>
                   )}
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*,image/*" className="hidden" />
               </div>
            </div>

            <div className="p-12 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 shrink-0">
              <button 
                onClick={closeIngestModal}
                disabled={isDeploying}
                className="flex-1 px-10 py-6 rounded-3xl border border-slate-200 text-slate-400 font-black text-lg flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 disabled:opacity-50"
              >
                <ArrowLeft className="h-5 w-5" /> Back / Cancel
              </button>
              <button 
                onClick={saveMasterVideo}
                disabled={!ingestTitle || !ingestUrl || isDeploying}
                className="flex-[2] bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-black transition-all disabled:opacity-50 shadow-2xl shadow-slate-900/40 active:scale-95 flex items-center justify-center gap-4"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="h-6 w-6 animate-spin" /> 
                    <span className="animate-pulse">Deploying...</span>
                  </>
                ) : (
                  <>
                    Deploy {ingestAvailability === 'anytime' ? 'Global Master' : 'Seasonal Template'}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
