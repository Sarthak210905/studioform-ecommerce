import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/common/Breadcrumb';
import {  Search, HelpCircle, Package, CreditCard, RefreshCcw, Shield, Mail } from 'lucide-react';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Ordering & Payment',
      icon: CreditCard,
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
      icon: Package,
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
      icon: RefreshCcw,
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
      icon: HelpCircle,
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
      icon: Shield,
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

  // Filter FAQs based on search query
  const filteredFaqs = faqs.map(section => ({
    ...section,
    questions: section.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section => section.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-5xl">
        <Breadcrumb />

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
        
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            How can we help you?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about ordering, shipping, returns, and more
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers..."
              className="pl-12 h-12 sm:h-14 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-muted-foreground">
              Found {filteredFaqs.reduce((acc, section) => acc + section.questions.length, 0)} results
            </p>
          )}
        </div>

        {/* FAQ Categories */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {filteredFaqs.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={index} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border">
                  {/* Category Header */}
                  <div className="border-b px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold">{section.category}</h2>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="p-4 sm:p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {section.questions.map((faq, qIndex) => (
                        <AccordionItem 
                          key={qIndex} 
                          value={`item-${index}-${qIndex}`}
                          className="border-b last:border-0"
                        >
                          <AccordionTrigger className="text-left text-sm sm:text-base py-4 hover:no-underline hover:text-primary transition-colors">
                            <span className="font-medium">{faq.q}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground pb-4 pt-1 leading-relaxed">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try searching with different keywords or browse all categories
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </div>
        )}

        {/* Contact Support Card */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 overflow-hidden">
          <div className="p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Still need help?</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
              Can't find the answer you're looking for? Our customer support team is here to assist you.
            </p>
            <Button size="lg" asChild>
              <a href="/contact">
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}