import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { api } from '@/lib/axios';

interface Product {
  id: string;
  name: string;
  price: number;
  compare_price?: number;
  main_image: string;
  category: string;
  rating?: number;
  is_featured?: boolean;
}

interface FeaturedProductsProps {
  title?: string;
  limit?: number;
}

export default function FeaturedProducts({ title = 'Featured Products', limit = 8 }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, [limit]);

  const loadFeaturedProducts = async () => {
    try {
      const response = await api.get(`/products/?limit=${limit}&sort_by=sales_count&sort_order=desc`);
      const featured = response.data.products.filter((p: Product) => p.is_featured);
      setProducts(featured.length > 0 ? featured : response.data.products.slice(0, limit));
    } catch (error) {
      console.error('Failed to load featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (comparePrice && comparePrice > price) {
      return Math.round(((comparePrice - price) / comparePrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const discount = calculateDiscount(product.price, product.compare_price);
          
          return (
            <Link to={`/products/${product.id}`} key={product.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.main_image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {discount > 0 && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      {discount}% OFF
                    </Badge>
                  )}
                  {product.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      ⭐ Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2">
                    {product.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= Math.floor(product.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      {(product.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.compare_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
