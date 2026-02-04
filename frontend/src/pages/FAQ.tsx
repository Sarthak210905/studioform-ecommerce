import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Breadcrumb from '@/components/common/Breadcrumb';
import { MessageCircle } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      category: 'Ordering & Payment',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept online payments only through Razorpay, which supports UPI, credit/debit cards, net banking, and popular wallets. We do not offer Cash on Delivery (COD).',
        },
        {
          q: 'Is online payment secure?',
          a: 'Yes, all online payments are processed through Razorpay with SSL encryption and PCI-DSS compliance, ensuring complete security of your payment information.',
        },
        {
          q: 'Can I use multiple coupons on one order?',
          a: 'No, only one coupon code can be applied per order. The system will automatically apply the best available discount for you.',
        },
        {
          q: 'How do I track my order?',
          a: 'After placing your order, you can track it from your Profile > Orders section. You will also receive email updates on your order status.',
        },
      ],
    },
    {
      category: 'Shipping & Delivery',
      questions: [
        {
          q: 'What are the shipping charges?',
          a: 'Shipping charges vary by location and order value. Orders above ₹1499 qualify for FREE shipping. Exact charges are shown at checkout.',
        },
        {
          q: 'How long does delivery take?',
          a: 'Delivery typically takes 3-7 business days depending on your location. You can see the estimated delivery time during checkout.',
        },
        {
          q: 'Do you ship internationally?',
          a: 'Currently, we only ship within India. International shipping will be available soon.',
        },
        {
          q: 'What if I\'m not available during delivery?',
          a: 'The delivery partner will attempt delivery 2-3 times. If unsuccessful, you can arrange a convenient time or pick up from the nearest facility.',
        },
      ],
    },
    {
      category: 'Exchange Policy',
      questions: [
        {
          q: 'What is your exchange policy?',
          a: 'We offer exchanges within 7 days of delivery for defective products only. We do not accept returns or provide refunds. Products must be in original packaging with all tags intact.',
        },
        {
          q: 'How do I request an exchange?',
          a: 'Go to Profile > Orders, select the order, and click "Request Exchange". Describe the defect or issue in detail. Our team will review your request within 24 hours and approve only if the product is defective.',
        },
        {
          q: 'Do you offer refunds?',
          a: 'No, we do not offer refunds. We only provide product exchanges for defective items. Please inspect your order carefully upon delivery.',
        },
        {
          q: 'What qualifies as a defective product?',
          a: 'Defective products include items with manufacturing defects, damage during shipping, missing parts, or products not functioning as described. Change of mind or wrong size/color selection are not valid reasons for exchange.',
        },
      ],
    },
    {
      category: 'Products & Stock',
      questions: [
        {
          q: 'How do I know if a product is in stock?',
          a: 'Stock availability is shown on each product page. If a product shows "Out of Stock", you can sign up for back-in-stock notifications.',
        },
        {
          q: 'Can I pre-order out of stock items?',
          a: 'Currently, pre-orders are not available. However, you can add items to your wishlist and get notified when they\'re back in stock.',
        },
        {
          q: 'Are product images accurate?',
          a: 'We strive to show accurate product images. However, colors may vary slightly due to screen settings. Check product descriptions for exact specifications.',
        },
        {
          q: 'Do you offer product warranties?',
          a: 'Warranty varies by product and manufacturer. Check the product description for specific warranty information.',
        },
      ],
    },
    {
      category: 'Account & Privacy',
      questions: [
        {
          q: 'Do I need an account to place an order?',
          a: 'Yes, you need to create an account to place orders. This helps us provide better service and allows you to track your orders.',
        },
        {
          q: 'How is my personal information protected?',
          a: 'We use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties without consent.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Contact our customer support team to request account deletion. Please note that this action is permanent and cannot be undone.',
        },
        {
          q: 'Can I change my email address?',
          a: 'Yes, you can update your email address from your Profile settings. You will receive a verification email at the new address.',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
      <Breadcrumb />

      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Find answers to common questions about ordering, shipping, returns, and more.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {faqs.map((section, index) => (
          <Card key={index}>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">{section.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((faq, qIndex) => (
                  <AccordionItem key={qIndex} value={`item-${index}-${qIndex}`}>
                    <AccordionTrigger className="text-left text-sm sm:text-base py-3 sm:py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-3 sm:pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 sm:mt-8 bg-muted/50">
        <CardContent className="p-4 sm:p-5 md:p-6 text-center">
          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Still have questions?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Can't find the answer you're looking for? Contact our customer support team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 sm:h-11 px-4 sm:px-6 py-2 touch-manipulation"
          >
            Contact Support
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
