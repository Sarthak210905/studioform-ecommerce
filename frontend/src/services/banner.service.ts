import { api } from '@/lib/axios';

export interface HeroBanner {
  id?: string;
  name: string;
  image_url: string;
  title: string;
  description: string;
  position: number;
  cta_text?: string;
  cta_link?: string;
  is_active?: boolean;
}

export const bannerService = {
  async getHeroBanners(): Promise<HeroBanner[]> {
    const { data } = await api.get('/banners/hero');
    return Array.isArray(data) ? data : data.banners || [];
  },

  async getHeroBanner(position: number): Promise<HeroBanner> {
    const { data } = await api.get(`/banners/hero/${position}`);
    return data;
  },

  async createBanner(banner: HeroBanner): Promise<HeroBanner> {
    const { data } = await api.post('/banners/hero', banner);
    return data;
  },

  async updateBanner(bannerId: string, updates: Partial<HeroBanner>): Promise<HeroBanner> {
    const { data } = await api.put(`/banners/hero/${bannerId}`, updates);
    return data;
  },

  async deleteBanner(bannerId: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/banners/hero/${bannerId}`);
    return data;
  },
};
