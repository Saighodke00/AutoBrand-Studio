
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, MonthlyAsset, MarketplaceAsset, GeneratedAsset, UserRole } from '../types';

interface AppState {
  user: User | null;
  assets: MonthlyAsset[];
  marketplace: MarketplaceAsset[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  setAssets: (assets: MonthlyAsset[]) => void;
  addAsset: (asset: MonthlyAsset) => void;
  removeAsset: (id: string) => void;
  bulkRemoveAssets: (ids: string[]) => void;
  setMarketplace: (assets: MarketplaceAsset[]) => void;
  addMarketplaceAsset: (asset: MarketplaceAsset) => void;
  updateCredits: (type: 'images' | 'videos', amount: number) => void;
  addToHistory: (asset: GeneratedAsset) => void;
}

const MASTER_ADMIN_EMAIL = 'admin@autobrand.studio';

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      assets: [],
      marketplace: [],
      isLoading: false,
      setUser: (user) => set({ user }),
      login: (email: string, role: UserRole) => {
        // Hardcoded Master Admin Logic
        const finalRole = email.toLowerCase() === MASTER_ADMIN_EMAIL ? 'ADMIN' : role;
        
        set({
          user: {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            role: finalRole,
            credits: { images: 100, videos: 100 }, // Admins get more credits for testing
            brand: finalRole === 'ADMIN' ? {
              companyName: 'AutoBrand Studio HQ',
              logoUrl: 'https://cdn-icons-png.flaticon.com/512/3176/3176363.png',
              contactNumber: '+91 00000 00000',
              address: 'Master Control Center, Silicon Valley',
              brandColors: ['#4f46e5'],
              brandFontStyle: 'modern',
              industryType: 'SaaS',
              personality: 'Powerful & Precise',
              targetAudience: 'Business Owners',
              tagline: 'Orchestrating Brand Excellence'
            } : undefined
          }
        });
      },
      logout: () => set({ user: null }),
      setAssets: (assets) => set({ assets }),
      addAsset: (asset) => set((state) => ({
        assets: [asset, ...state.assets]
      })),
      removeAsset: (id) => set((state) => ({
        assets: state.assets.filter(a => a.id !== id)
      })),
      bulkRemoveAssets: (ids) => set((state) => ({
        assets: state.assets.filter(a => !ids.includes(a.id))
      })),
      setMarketplace: (marketplace) => set({ marketplace }),
      addMarketplaceAsset: (asset) => set((state) => ({
        marketplace: [asset, ...state.marketplace]
      })),
      updateCredits: (type, amount) => set((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            credits: {
              ...state.user.credits,
              [type]: state.user.credits[type] + amount
            }
          }
        };
      }),
      addToHistory: (asset) => set((state) => {
        if (!state.user) return state;
        const history = state.user.generationHistory || [];
        return {
          user: {
            ...state.user,
            generationHistory: [asset, ...history].slice(0, 10)
          }
        };
      }),
    }),
    {
      name: 'autobrand-studio-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
