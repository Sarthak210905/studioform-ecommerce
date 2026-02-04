import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import type { Review } from '@/services/review.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReviewCardProps {
  review: Review;
  onMarkHelpful?: (reviewId: string) => void;
}

export default function ReviewCard({ review, onMarkHelpful }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{review.user_name}</span>
              {review.is_verified_purchase && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified Purchase
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>

        {review.title && (
          <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
        )}

        {review.comment && (
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>
        )}

        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkHelpful?.(review.id)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Helpful ({review.helpful_count})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
