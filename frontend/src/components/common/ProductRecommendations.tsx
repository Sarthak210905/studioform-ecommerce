import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  final_price: number;
  main_image: string;
  category: string;
}

interface ProductRecommendationsProps {
  currentProductId: string;
  category: string;
}

export default function ProductRecommendations({ currentProductId, category }: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [currentProductId, category]);

  const loadRecommendations = async () => {
    try {
      const response = await api.get('/products/', {
        params: {
          category,
          limit: 4,
        },
      });
      
      // Filter out current product
      const filtered = response.data.filter((p: Product) => p.id !== currentProductId);
      setProducts(filtered.slice(0, 4));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => {
          const hasDiscount = product.price > product.final_price;
          const discountPercent = hasDiscount
            ? Math.round(((product.price - product.final_price) / product.price) * 100)
            : 0;

          return (
            <Link key={product.id} to={`/products/${product.id}`}>
              <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.main_image && (
                    <img
                      src={product.main_image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  {hasDiscount && (
                    <Badge className="absolute top-2 right-2">
                      {discountPercent}% OFF
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3 space-y-1">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">₹{product.final_price.toLocaleString()}</span>
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
