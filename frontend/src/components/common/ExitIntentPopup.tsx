// src/components/common/ExitIntentPopup.tsx

import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';

interface ExitIntentPopupProps {
  cartItemCount: number;
}

export default function ExitIntentPopup({ cartItemCount }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only show if user has items in cart
    if (cartItemCount === 0) return;

    // Check if user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('exitIntentShown');
    if (hasSeenPopup) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect when mouse leaves from top of viewport (trying to close tab/go back)
      if (e.clientY <= 0 && !hasSeenPopup) {
        setIsVisible(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Add event listener after a small delay to avoid showing immediately
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cartItemCount]);

  const handleSubscribe = async (e: React.FormEvent) => {
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
      // Subscribe to newsletter
      await api.post('/newsletter/subscribe', { email });
      
      toast({
        title: 'Discount Code Sent! 🎉',
        description: 'Check your email for your exclusive 10% off code',
      });
      
      setIsVisible(false);
      localStorage.setItem('exitIntentDiscount', 'true');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to send discount code',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-background rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-primary" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Wait! Don't Go Yet! 🎁
          </h2>
          
          {/* Subheading */}
          <p className="text-muted-foreground mb-6">
            Get <span className="text-primary font-bold">10% OFF</span> your order! 
            <br />
            Enter your email and we'll send you an exclusive discount code.
          </p>

          {/* Features */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <span>Valid on your current cart items</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <span>Instant delivery to your inbox</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <span>No minimum purchase required</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubscribe} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
              required
            />
            <Button
              type="submit"
              className="w-full h-12 text-base bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Get My 10% OFF Code'}
            </Button>
          </form>

          {/* Fine print */}
          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to receive marketing emails. You can unsubscribe anytime.
          </p>
        </div>

        {/* Alternative close */}
        <div className="border-t px-6 py-4 bg-muted/30">
          <button
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
}
