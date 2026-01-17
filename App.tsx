
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { Marketplace } from './pages/Marketplace';
import { AdminDashboard } from './pages/AdminDashboard';
import { AssetEditor } from './pages/AssetEditor';
import { Login } from './pages/Login';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MonthlyAsset } from './types';

const App: React.FC = () => {
  const { user, assets, setAssets } = useStore();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = () => {
      if (assets.length === 0) {
        const mockAssets: MonthlyAsset[] = [
          { id: 'a1', title: 'Global Brand Guidelines', type: 'image', url: 'https://picsum.photos/seed/brand-guide/800/1200', month: 0, language: 'en', source: 'global', availability: 'anytime' },
          { id: 'a2', title: 'Standard Motion Logo', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', month: 0, language: 'en', source: 'global', availability: 'anytime' },
          { id: 'a3', title: 'January Launch Video', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', month: 0, language: 'en', source: 'global', availability: 'seasonal' },
          { id: 'a4', title: 'February Theme', type: 'image', url: 'https://picsum.photos/seed/feb-theme/800/1200', month: 1, language: 'en', source: 'global', availability: 'seasonal' },
          { id: 'a5', title: 'March Motion Poster', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', month: 2, language: 'en', source: 'global', availability: 'seasonal' },
          { id: 'a6', title: 'October Highlights', type: 'image', url: 'https://picsum.photos/seed/oct-high/800/1200', month: 9, language: 'en', source: 'global', availability: 'seasonal' },
        ];
        setAssets(mockAssets);
      }
      setIsDataLoaded(true);
    };

    loadData();
  }, [setAssets, assets.length]);

  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white font-brand">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold tracking-widest uppercase text-xs">Synchronizing Core Engine...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  if (!user.brand && user.role === 'USER') {
    return (
      <Router>
        <Onboarding />
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/editor/:assetId" element={<AssetEditor />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
