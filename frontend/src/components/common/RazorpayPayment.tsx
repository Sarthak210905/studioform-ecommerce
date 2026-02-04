import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';

interface RazorpayPaymentProps {
  orderId: string;
  amount: number;
  orderNumber: string;
  userEmail: string;
  userPhone: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (reason: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  orderId,
  amount,
  orderNumber,
  userEmail,
  userPhone,
  onSuccess,
  onFailure,
}: RazorpayPaymentProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setLoading(false);
      // Automatically open payment modal
      handlePayment();
    };
    script.onerror = () => {
      setLoading(false);
      onFailure('Failed to load payment gateway');
      toast({
        title: 'Error',
        description: 'Failed to load Razorpay gateway',
        variant: 'destructive',
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!window.Razorpay) {
      onFailure('Razorpay not loaded');
      return;
    }

    try {
      // Create payment order on backend
      const response = await api.post('/payment/create-order', {
        order_id: orderId,
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
      });

      const { razorpay_order_id } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Rx1amIQ75nnrH6',
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Studioform',
        description: `Order #${orderNumber}`,
        order_id: razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await api.post('/payment/verify-payment', {
              order_id: orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              onSuccess(response.razorpay_payment_id);
              toast({
                title: 'Payment Successful!',
                description: 'Your order has been confirmed.',
              });
            } else {
              onFailure('Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            onFailure(error.response?.data?.detail || 'Payment verification failed');
            toast({
              title: 'Payment Verification Failed',
              description: error.response?.data?.detail || 'Failed to verify payment',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            onFailure('Payment cancelled by user');
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment',
              variant: 'destructive',
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      onFailure(error.response?.data?.detail || 'Failed to initialize payment');
      toast({
        title: 'Payment Error',
        description: error.response?.data?.detail || 'Failed to initialize payment gateway',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-4" />
          <p className="text-sm text-muted-foreground">Loading payment gateway...</p>
        </div>
      </div>
    );
  }

  return null;
}
