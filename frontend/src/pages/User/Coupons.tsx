import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import couponService, { type Coupon } from '@/services/coupon.service';
import { Copy, Tag, Calendar, TrendingUp, Loader2 } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await couponService.getActiveCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to load coupons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available coupons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: `Coupon code "${code}" copied to clipboard`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else {
      return `₹${coupon.discount_value} OFF`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Coupons</h1>
        <p className="text-gray-600">
          Save more on your purchases with these exclusive offers
        </p>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Active Coupons</h3>
            <p className="text-gray-600">
              Check back later for exciting offers and discounts!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <Card
              key={coupon.id}
              className="overflow-hidden border-2 hover:border-primary transition-colors"
            >
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-1">
                      {getDiscountText(coupon)}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                  </div>
                  <Tag className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 px-3 py-2 rounded font-mono font-bold text-lg text-center border-2 border-dashed">
                    {coupon.code}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopyCode(coupon.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Minimum order: ₹{coupon.min_order_amount}</span>
                  </div>
                  
                  {coupon.max_discount_amount && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Max discount: ₹{coupon.max_discount_amount}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Valid until {formatDate(coupon.expires_at)}</span>
                  </div>

                  {coupon.usage_limit && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Uses: {coupon.usage_count}/{coupon.usage_limit}</span>
                      <Badge variant="secondary">
                        {coupon.usage_limit - coupon.usage_count} left
                      </Badge>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleCopyCode(coupon.code)}
                >
                  Copy Code & Shop Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
