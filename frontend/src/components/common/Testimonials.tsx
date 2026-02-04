// src/components/common/Testimonials.tsx

import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  comment: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Software Engineer',
    image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=0D8ABC&color=fff',
    rating: 5,
    comment: 'Absolutely love the desk organizer! The quality is outstanding and it has made my workspace so much more efficient. Highly recommend!',
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    role: 'Marketing Manager',
    image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=6366F1&color=fff',
    rating: 5,
    comment: 'Fast delivery and excellent customer service. The premium pen holder is exactly what I needed for my home office. Worth every rupee!',
  },
  {
    id: 3,
    name: 'Anita Desai',
    role: 'Graphic Designer',
    image: 'https://ui-avatars.com/api/?name=Anita+Desai&background=EC4899&color=fff',
    rating: 5,
    comment: 'The desk accessories are beautifully designed and very functional. They have completely transformed my workspace. Best purchase this year!',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    role: 'Entrepreneur',
    image: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=F59E0B&color=fff',
    rating: 5,
    comment: 'Premium quality products at reasonable prices. The cable organizer is a game-changer. Will definitely order more products soon!',
  },
  {
    id: 5,
    name: 'Sneha Patel',
    role: 'Content Writer',
    image: 'https://ui-avatars.com/api/?name=Sneha+Patel&background=10B981&color=fff',
    rating: 5,
    comment: 'Impressed with the attention to detail and packaging. The products arrived safely and look even better in person. Highly satisfied!',
  },
  {
    id: 6,
    name: 'Arjun Mehta',
    role: 'Data Analyst',
    image: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=8B5CF6&color=fff',
    rating: 5,
    comment: 'Great shopping experience from start to finish. The desk mat is of superior quality and the customer support was very helpful!',
  },
];

export default function Testimonials() {
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
      <div className="container px-3 sm:px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            What Our Customers Say
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who have transformed their workspaces with our premium desk accessories
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                {/* Rating */}
                <div className="flex gap-0.5 mb-3 sm:mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 line-clamp-4">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 bg-background rounded-lg border">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
              10,000+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-background rounded-lg border">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
              4.9/5
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-background rounded-lg border">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
              500+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">5-Star Reviews</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-background rounded-lg border">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
              95%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Repeat Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
}
