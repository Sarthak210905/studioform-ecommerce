// src/components/common/Testimonials.tsx

import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

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
    comment: 'Absolutely love the desk organizer! The quality is outstanding and it has made my workspace efficient.',
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    role: 'Marketing Manager',
    image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=6366F1&color=fff',
    rating: 5,
    comment: 'Fast delivery and excellent customer service. The premium pen holder is exactly what I needed.',
  },
  {
    id: 3,
    name: 'Anita Desai',
    role: 'Graphic Designer',
    image: 'https://ui-avatars.com/api/?name=Anita+Desai&background=EC4899&color=fff',
    rating: 5,
    comment: 'The desk accessories are beautifully designed and very functional. Transformed my workspace completely.',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    role: 'Entrepreneur',
    image: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=F59E0B&color=fff',
    rating: 5,
    comment: 'Premium quality products at reasonable prices. The cable organizer is a game-changer for my setup.',
  },
  {
    id: 5,
    name: 'Sneha Patel',
    role: 'Content Writer',
    image: 'https://ui-avatars.com/api/?name=Sneha+Patel&background=10B981&color=fff',
    rating: 5,
    comment: 'Impressed with the attention to detail and packaging. Products look even better in person.',
  },
  {
    id: 6,
    name: 'Arjun Mehta',
    role: 'Data Analyst',
    image: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=8B5CF6&color=fff',
    rating: 5,
    comment: 'Great shopping experience from start to finish. The desk mat is of superior quality.',
  },
];

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const testimonialsPerSlide = 3;
  const totalSlides = Math.ceil(testimonials.length / testimonialsPerSlide);

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * testimonialsPerSlide;
    return testimonials.slice(startIndex, startIndex + testimonialsPerSlide);
  };

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            What Our Customers Say
          </h2>
          <p className="text-sm text-muted-foreground">
            Trusted by thousands of satisfied customers
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-6xl mx-auto relative">
          {/* Testimonials Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6">
            {getCurrentTestimonials().map((testimonial) => (
              <Card 
                key={testimonial.id} 
                className="hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-4">
                  {/* Rating */}
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3 min-h-[3rem]">
                    "{testimonial.comment}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{testimonial.name}</p>
                      {/* <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{testimonial.role}</p> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        {/* <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-10 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold">10,000+</div>
            <div className="text-xs text-muted-foreground">Happy Customers</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold">4.9/5</div>
            <div className="text-xs text-muted-foreground">Average Rating</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold">500+</div>
            <div className="text-xs text-muted-foreground">5-Star Reviews</div>
          </div>
        </div> */}
      </div>
    </section>
  );
}