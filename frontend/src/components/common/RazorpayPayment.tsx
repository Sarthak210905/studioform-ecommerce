import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import { resilientApiCall, startCriticalKeepAlive, wakeUpBackend, pingBackend } from '@/utils/keepAlive';

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
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Start aggressive keep-alive for payment flow (20s intervals)
    const stopCriticalPing = startCriticalKeepAlive();

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
      // Stop critical keep-alive
      stopCriticalPing();
      
      // Clean up script
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

      if (!razorpay_order_id) {
        throw new Error('Failed to create Razorpay order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Rx1amIQ75nnrH6',
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Studioform',
        description: `Order #${orderNumber}`,
        order_id: razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Show verification screen
            setVerifying(true);
            
            // Ensure backend is awake before verification (user may have spent minutes in Razorpay modal)
            const isAlive = await pingBackend();
            if (!isAlive) {
              console.log('Backend asleep after payment, waking up for verification...');
              await wakeUpBackend(8); // Up to ~40s for full cold start
            }
            
            // Verify payment on backend with extended timeout and retries
            const verifyResponse = await resilientApiCall(() =>
              api.post(
                '/payment/verify-payment',
                {
                  order_id: orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                { timeout: 90000 } // 90s timeout for payment verification after cold start
              ),
              4, // 4 retries for payment-critical operation
              3000,
            );

            if (verifyResponse.data.success) {
              // Payment verified successfully - call success handler
              onSuccess(response.razorpay_payment_id);
            } else {
              setVerifying(false);
              onFailure('Payment verification failed');
              toast({
                title: 'Payment Verification Failed',
                description: 'Payment verification failed. Please contact support.',
                variant: 'destructive',
              });
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            setVerifying(false);
            
            // Check if this is a timeout/network issue (payment may have actually succeeded at Razorpay)
            const isNetworkIssue =
              error.code === 'ECONNABORTED' ||
              error.message?.includes('timeout') ||
              error.message?.includes('Network Error') ||
              !error.response;
            
            if (isNetworkIssue) {
              // Payment was captured by Razorpay — only backend verification timed out
              onFailure('Payment was processed but verification timed out. Your order will be confirmed shortly — please check your email.');
              toast({
                title: 'Verification Delayed',
                description: 'Your payment was received. We\'re confirming it — check your email or contact support if not confirmed in 10 minutes.',
                variant: 'default',
                duration: 15000,
              });
            } else {
              onFailure(error.response?.data?.detail || 'Payment verification failed');
              toast({
                title: 'Payment Verification Failed',
                description: error.response?.data?.detail || 'Failed to verify payment. Contact support with your payment ID.',
                variant: 'destructive',
              });
            }
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
      
      // Provide specific error messages
      let errorMessage = 'Failed to initialize payment gateway';
      
      if (error.response?.status === 500) {
        errorMessage = 'Payment service temporarily unavailable. Please try again or use COD.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onFailure(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Show verification screen while verifying payment
  if (verifying) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Verifying Payment</h3>
          <p className="text-muted-foreground mb-4">
            Please wait while we confirm your payment with the bank...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            This may take up to 90 seconds. Please do not close this window.
          </p>
        </div>
      </div>
    );
  }

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
