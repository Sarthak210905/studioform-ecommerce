import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/common/SEOHead';
import { FileText, ChevronRight, Mail, MapPin } from 'lucide-react';

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'agreement', title: 'Agreement to Terms' },
    { id: 'license', title: 'Use License' },
    { id: 'registration', title: 'Account Registration' },
    { id: 'products', title: 'Product Information' },
    { id: 'orders', title: 'Orders & Payment' },
    { id: 'shipping', title: 'Shipping & Delivery' },
    { id: 'returns', title: 'Returns & Refunds' },
    { id: 'cancellation', title: 'Cancellation Policy' },
    { id: 'conduct', title: 'User Conduct' },
    { id: 'ip', title: 'Intellectual Property' },
    { id: 'reviews', title: 'Reviews & Comments' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'indemnification', title: 'Indemnification' },
    { id: 'law', title: 'Governing Law' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact Information' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <SEOHead
        title="Terms of Service"
        description="Terms of Service for Premium Desk Accessories - Read our terms and conditions for using our services"
        keywords="terms of service, terms and conditions, user agreement, legal"
      />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Last updated: January 17, 2026
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 sm:gap-8">
          {/* Table of Contents - Sidebar */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
              <nav className="space-y-1">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{index + 1}. {section.title}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      activeSection === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`} />
                  </button>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Section 1 */}
            <section id="agreement" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                By accessing or using Premium Desk Accessories website and services, you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using 
                or accessing this site.
              </p>
            </section>

            {/* Section 2 */}
            <section id="license" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                Permission is granted to temporarily access the materials on Premium Desk Accessories' website for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {[
                  'Modify or copy the materials',
                  'Use the materials for any commercial purpose or public display',
                  'Attempt to decompile or reverse engineer any software on our website',
                  'Remove any copyright or proprietary notations from the materials',
                  'Transfer the materials to another person or "mirror" the materials on any other server'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 3 */}
            <section id="registration" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">3. Account Registration</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                To use certain features, you must register for an account. You agree to:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {[
                  'Provide accurate, current, and complete information',
                  'Maintain and update your information to keep it accurate and current',
                  'Maintain the security of your password and account',
                  'Accept all responsibility for all activities that occur under your account',
                  'Notify us immediately of any unauthorized use of your account'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4 */}
            <section id="products" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">4. Product Information and Pricing</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, 
                pricing, or other content is accurate, complete, reliable, current, or error-free. We reserve the right to correct 
                any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.
              </p>
            </section>

            {/* Section 5 */}
            <section id="orders" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">5. Orders and Payment</h2>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Order Acceptance:</p>
                  <p className="leading-relaxed">All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Payment:</p>
                  <p className="leading-relaxed">Payment must be made at the time of purchase through our approved payment methods (Razorpay, Cash on Delivery).</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Pricing:</p>
                  <p className="leading-relaxed">All prices are in Indian Rupees (₹) and include applicable taxes unless otherwise stated.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Platform Fee:</p>
                  <p className="leading-relaxed">A 2% platform fee is applied to all orders to maintain our services and infrastructure.</p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="shipping" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">6. Shipping and Delivery</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                Shipping charges and delivery times vary based on location and order value:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {[
                  'Free shipping on orders above ₹1,499',
                  'Standard shipping charges apply for orders below ₹1,499',
                  'Estimated delivery time: 5-7 business days',
                  'Actual delivery time may vary based on location and product availability'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 7 */}
            <section id="returns" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">7. Returns and Refunds</h2>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Return Period:</p>
                  <p className="leading-relaxed">You may return products within 7 days of delivery.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Conditions:</p>
                  <p className="leading-relaxed">Products must be unused, in original packaging, and in resalable condition.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Refund Processing:</p>
                  <p className="leading-relaxed">Refunds will be processed within 7-10 business days after receiving and inspecting the returned product.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Non-Returnable Items:</p>
                  <p className="leading-relaxed">Customized or personalized products cannot be returned unless defective.</p>
                </div>
              </div>
            </section>

            {/* Sections 8-15 (Condensed for brevity) */}
            <section id="cancellation" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">8. Cancellation Policy</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Orders can be cancelled before shipment. Once shipped, cancellation is not possible, but you may return the product 
                as per our return policy. Refunds for cancelled orders will be processed within 5-7 business days.
              </p>
            </section>

            <section id="conduct" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">9. User Conduct</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">You agree not to:</p>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {[
                  'Use the website for any unlawful purpose',
                  'Harass, abuse, or harm other users',
                  'Submit false or misleading information',
                  'Interfere with or disrupt the website or servers',
                  'Attempt to gain unauthorized access to any systems',
                  'Use automated systems to access the website without permission'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="ip" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">10. Intellectual Property</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the property of Premium Desk 
                Accessories or its content suppliers and is protected by Indian and international copyright laws. Unauthorized use of 
                any content may violate copyright, trademark, and other laws.
              </p>
            </section>

            <section id="reviews" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">11. Reviews and Comments</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                You may post reviews and comments on products. By posting content, you grant us a non-exclusive, royalty-free, 
                perpetual license to use, reproduce, and publish such content. Reviews must be honest, relevant, and not contain 
                offensive or inappropriate content.
              </p>
            </section>

            <section id="liability" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Premium Desk Accessories shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                resulting from your use of or inability to use the website or products. Our total liability shall not exceed the amount 
                paid by you for the product in question.
              </p>
            </section>

            <section id="indemnification" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">13. Indemnification</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                You agree to indemnify and hold Premium Desk Accessories harmless from any claims, damages, losses, liabilities, and 
                expenses arising from your use of the website, violation of these terms, or infringement of any rights of another party.
              </p>
            </section>

            <section id="law" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">14. Governing Law</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes shall be 
                subject to the exclusive jurisdiction of the courts in Indore, Madhya Pradesh.
              </p>
            </section>

            <section id="changes" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">15. Changes to Terms</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your 
                continued use of the website after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            {/* Section 16 - Contact */}
            <section id="contact" className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 border border-primary/20">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">16. Contact Information</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href="mailto:contact.studioform@gmail.com" className="text-primary hover:underline">
                    contact.studioform@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Indore, Madhya Pradesh, India</span>
                </div>
              </div>
            </section>

            {/* Back to Top Button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to Top
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}