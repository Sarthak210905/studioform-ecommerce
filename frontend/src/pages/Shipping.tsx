import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Truck, 
  Clock, 
  Package, 
  MapPin, 
  ShieldCheck, 
  IndianRupee,
  Info
} from 'lucide-react';

export default function Shipping() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Shipping & Delivery</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Everything you need to know about our shipping policies
        </p>
      </div>

      {/* Shipping Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-4">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">Free Shipping</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">On orders above ₹1499</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-4">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">Fast Delivery</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">5-7 business days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-4">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">Secure Packaging</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Safe & protected delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Rates */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
            Shipping Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs flex-shrink-0">FREE</Badge>
                <span className="text-xs sm:text-sm">Orders above ₹1499</span>
              </div>
              <span className="font-semibold text-green-600 text-sm sm:text-base flex-shrink-0">₹0</span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Badge variant="outline" className="text-xs flex-shrink-0">Standard</Badge>
                <span className="text-xs sm:text-sm">Orders below ₹1499</span>
              </div>
              <span className="font-semibold text-sm sm:text-base flex-shrink-0">₹150</span>
            </div>

          
          </div>
        </CardContent>
      </Card>

      {/* Delivery Timeline */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            Delivery Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 border rounded-lg">
                <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 flex items-center gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  Metro Cities
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                  Delhi NCR, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad
                </p>
                <Badge variant="secondary" className="text-xs">3-5 Business Days</Badge>
              </div>

              <div className="p-3 sm:p-4 border rounded-lg">
                <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 flex items-center gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  Tier 2 Cities
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                  Pune, Ahmedabad, Jaipur, Lucknow, and other major cities
                </p>
                <Badge variant="secondary" className="text-xs">4-6 Business Days</Badge>
              </div>

              <div className="p-3 sm:p-4 border rounded-lg">
                <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 flex items-center gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  Other Locations
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                  Tier 3 cities and rural areas
                </p>
                <Badge variant="secondary" className="text-xs">5-7 Business Days</Badge>
              </div>

              <div className="p-3 sm:p-4 border rounded-lg">
                <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 flex items-center gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  Remote Areas
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                  Northeast, J&K, and island territories
                </p>
                <Badge variant="secondary" className="text-xs">7-10 Business Days</Badge>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Delivery times are estimates and may vary during peak seasons, 
                  holidays, or due to unforeseen circumstances. You'll receive tracking information 
                  once your order is shipped.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Tracking */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Once your order is shipped, you can track its progress through the following ways:
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive automatic updates at each stage of delivery
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">My Orders Page</p>
                  <p className="text-sm text-muted-foreground">
                    Visit your orders page to see real-time status updates
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Carrier Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Use the tracking number provided to track on the carrier's website
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Partners */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Our Shipping Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['BlueDart', 'Delhivery', 'DTDC', 'India Post'].map((partner) => (
              <div key={partner} className="p-4 border rounded-lg text-center">
                <p className="font-medium">{partner}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            We partner with trusted logistics providers to ensure safe and timely delivery of your orders.
          </p>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Can I change my delivery address after placing an order?</h4>
              <p className="text-sm text-muted-foreground">
                You can change the delivery address before the order is shipped by contacting our support team.
                Once shipped, address changes are not possible.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">What happens if I'm not available to receive the package?</h4>
              <p className="text-sm text-muted-foreground">
                Our delivery partners will make multiple attempts. If unsuccessful, the package will be held at 
                the nearest facility for pickup or returned to us.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Do you ship internationally?</h4>
              <p className="text-sm text-muted-foreground">
                Currently, we only ship within India. International shipping will be available soon.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">My order shows delivered but I haven't received it?</h4>
              <p className="text-sm text-muted-foreground">
                Please check with neighbors or building security. If still not found, contact our support team 
                within 48 hours with your order details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
