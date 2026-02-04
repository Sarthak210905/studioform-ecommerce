import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Truck, HeartHandshake } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function About() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
      <Breadcrumb />
      <div className="text-center mb-8 sm:mb-12 md:mb-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">About Studioform</h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
          Premium desk accessories for the modern workspace
        </p>
      </div>

      <div className="prose prose-gray max-w-none mb-8 sm:mb-12 md:mb-16">
        <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
          Founded in 2020, Studioform has been at the forefront of creating premium desk accessories 
          that combine functionality with elegant design.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {[
          { icon: Award, title: 'Premium Quality', description: 'Only the finest materials' },
          { icon: Users, title: 'Customer First', description: 'Dedicated support' },
          { icon: Truck, title: 'Fast Delivery', description: 'Free shipping over ₹1499' },
          { icon: HeartHandshake, title: 'Sustainability', description: 'Eco-friendly practices' },
        ].map((feature, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 sm:p-5 md:p-6 flex gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
