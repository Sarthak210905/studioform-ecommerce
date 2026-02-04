import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trackingService } from '@/services/tracking.service';
import type { ProductRecommendation } from '@/services/tracking.service';
import { Sparkles, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface Props {
  productId: string;
}

export default function ProductRecommendations({ productId }: Props) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadRecommendations();
  }, [productId]);

  const loadRecommendations = async () => {
    try {
      const data = await trackingService.getRecommendations(productId, 6);
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ProductRecommendation) => {
    addItem({
      id: product.id,
      product_id: product.id,
      product_name: product.name,
      product_price: product.final_price,
      quantity: 1,
      image_url: product.images[0] || '',
      stock_quantity: 10,
      subtotal: product.final_price
    });
  };

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <CardTitle>You Might Also Like</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
                <Link to={`/products/${product.id}`}>
                  {product.images[0] && (
                    <div className="relative">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      {product.discount_percentage > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          -{product.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold">₹{product.final_price}</span>
                    {product.price !== product.final_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
