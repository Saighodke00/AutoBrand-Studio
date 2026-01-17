
export type UserRole = 'USER' | 'ADMIN' | 'CREATOR';

export interface BrandConfig {
  companyName: string;
  logoUrl?: string;
  website?: string;
  tagline?: string;
  contactNumber: string;
  address: string;
  gstNo?: string;
  fssaiNo?: string;
  brandColors: string[];
  brandFontStyle: 'modern' | 'classic' | 'playful' | 'luxury' | 'minimal';
  industryType: string;
  personality: string;
  targetAudience: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  brand?: BrandConfig;
  credits: {
    images: number;
    videos: number;
  };
  generationHistory?: GeneratedAsset[];
}

export interface MonthlyAsset {
  id: string;
  title: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  month: number; // 0-11
  language: 'en' | 'hi' | 'mr';
  source?: 'global' | 'local' | 'ai' | 'marketplace';
  availability?: 'anytime' | 'seasonal';
}

export interface MarketplaceAsset {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  price: number;
  url: string;
  thumbnail: string;
  type: 'image' | 'video' | 'audio';
  tags: string[];
}

export interface GeneratedAsset {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  type: 'image' | 'video';
}

export interface BrandingPlacement {
  x: number;
  y: number;
  width: number;
  opacity: number;
  alignment: 'left' | 'right' | 'center';
}
