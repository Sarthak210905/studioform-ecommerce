import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trackingService } from '@/services/tracking.service';
import type { RecentlyViewedProduct } from '@/services/tracking.service';
import { Clock } from 'lucide-react';

export default function RecentlyViewed() {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      const data = await trackingService.getRecentlyViewed(6);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Recently Viewed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <Link
                key={product.product_id}
                to={`/products/${product.product_id}`}
                className="group"
              >
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {product.product_image && (
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  )}
                  <div className="p-2">
                    <h3 className="text-sm font-medium truncate">{product.product_name}</h3>
                    <p className="text-sm font-bold text-primary">₹{product.product_price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
