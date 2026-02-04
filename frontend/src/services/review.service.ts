import { api } from '@/lib/axios';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface ReviewCreate {
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ProductRatingStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
}

const reviewService = {
  createReview: async (data: ReviewCreate): Promise<Review> => {
    const response = await api.post('/reviews/', data);
    return response.data;
  },

  getProductReviews: async (productId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  getProductRatingStats: async (productId: string): Promise<ProductRatingStats> => {
    const response = await api.get(`/reviews/product/${productId}/stats`);
    return response.data;
  },

  updateReview: async (reviewId: string, data: Partial<ReviewCreate>): Promise<Review> => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },

  markHelpful: async (reviewId: string): Promise<Review> => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },
};

export default reviewService;
