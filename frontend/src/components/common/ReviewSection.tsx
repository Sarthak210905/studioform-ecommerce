import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import reviewService, { type Review, type ProductRatingStats } from '@/services/review.service';
import ReviewCard from './ReviewCard';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ProductRatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const data = await reviewService.getProductReviews(productId);
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await reviewService.getProductRatingStats(productId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load rating stats:', error);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewService.markHelpful(reviewId);
      loadReviews();
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been recorded.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark review as helpful',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Rating Stats */}
      {stats && stats.total_reviews > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{stats.average_rating.toFixed(1)}</div>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(stats.average_rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{stats.total_reviews} reviews</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.rating_distribution[rating] || 0;
                  const percentage = stats.total_reviews > 0 
                    ? (count / stats.total_reviews) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating}★</span>
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm text-gray-600 w-12">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-2xl font-bold mb-4">
          Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h3>
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reviews yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Purchase and receive this product to write the first review!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onMarkHelpful={handleMarkHelpful}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
