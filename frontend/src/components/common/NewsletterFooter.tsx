// src/components/common/NewsletterFooter.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';

export default function NewsletterFooter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      
      setIsSubscribed(true);
      toast({
        title: 'Successfully Subscribed! 🎉',
        description: 'Check your email for a welcome gift',
      });
      
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000);
    } catch (error: any) {
      toast({
        title: 'Subscription Failed',
        description: error.response?.data?.detail || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-primary text-primary-foreground py-8 sm:py-12">
      <div className="container px-4 sm:px-6 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary-foreground/10 rounded-full mb-4">
            <Mail className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            Get Exclusive Deals
          </h2>
          
          {/* Subheading */}
          <p className="text-sm sm:text-base text-primary-foreground/80 mb-6 sm:mb-8">
            Subscribe to our newsletter and get <span className="font-bold">10% off</span> your first order!
            <br className="hidden sm:block" />
            Plus early access to new products and special promotions.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 text-base bg-background text-foreground border-0"
                disabled={isSubscribed || isSubmitting}
                required
                aria-label="Email address for newsletter"
              />
              <Button
                type="submit"
                className="h-12 px-6 sm:px-8 bg-background text-primary hover:bg-background/90"
                disabled={isSubscribed || isSubmitting}
              >
                {isSubscribed ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Subscribed!
                  </>
                ) : isSubmitting ? (
                  'Subscribing...'
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>
          </form>

          {/* Fine print */}
          <p className="text-xs text-primary-foreground/60 mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
