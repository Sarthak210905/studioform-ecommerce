import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/common/SEOHead';
import { Shield, ChevronRight, Mail, MapPin } from 'lucide-react';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'information', title: 'Information We Collect' },
    { id: 'usage', title: 'How We Use Your Information' },
    { id: 'security', title: 'Data Security' },
    { id: 'payment', title: 'Payment Security' },
    { id: 'retention', title: 'Data Retention' },
    { id: 'rights', title: 'Your Legal Rights' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'third-party', title: 'Third-Party Services' },
    { id: 'children', title: 'Children\'s Privacy' },
    { id: 'changes', title: 'Changes to This Policy' },
    { id: 'contact', title: 'Contact Us' },
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
        title="Privacy Policy"
        description="Privacy Policy for Premium Desk Accessories - Learn how we collect, use, and protect your personal information"
        keywords="privacy policy, data protection, personal information, GDPR"
      />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Privacy Policy
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
            <section id="introduction" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Welcome to Studioform. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit our website and 
                tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            {/* Section 2 */}
            <section id="information" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                We may collect, use, store and transfer different kinds of personal data about you:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {[
                  { label: 'Identity Data', desc: 'First name, last name, username' },
                  { label: 'Contact Data', desc: 'Email address, telephone number, billing and delivery addresses' },
                  { label: 'Transaction Data', desc: 'Details about payments and products purchased' },
                  { label: 'Technical Data', desc: 'IP address, browser type, device information, operating system' },
                  { label: 'Usage Data', desc: 'Information about how you use our website, products and services' },
                  { label: 'Marketing Data', desc: 'Your preferences in receiving marketing communications' }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">
                      <strong className="text-foreground">{item.label}:</strong> {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 3 */}
            <section id="usage" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                We use your personal data for the following purposes:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {[
                  'To process and deliver your orders',
                  'To manage payments, fees and charges',
                  'To send you service-related communications',
                  'To provide customer support',
                  'To improve our website, products and services',
                  'To send you marketing communications (with your consent)',
                  'To detect and prevent fraud'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4 */}
            <section id="security" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We have implemented appropriate security measures to prevent your personal data from being accidentally lost, 
                used or accessed in an unauthorized way. We use SSL encryption for all transactions and store passwords using 
                industry-standard hashing algorithms.
              </p>
            </section>

            {/* Section 5 */}
            <section id="payment" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">5. Payment Security</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                All payment transactions are processed through our secure payment gateway provider (Razorpay). We do not store 
                complete credit card information on our servers. Payment information is encrypted and transmitted directly to 
                our payment processor.
              </p>
            </section>

            {/* Section 6 */}
            <section id="retention" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, 
                including for the purposes of satisfying any legal, accounting, or reporting requirements. Order information 
                is retained for 7 years for tax and legal purposes.
              </p>
            </section>

            {/* Section 7 */}
            <section id="rights" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">7. Your Legal Rights</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                Under data protection laws, you have rights including:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {[
                  { label: 'Right to access', desc: 'Request copies of your personal data' },
                  { label: 'Right to rectification', desc: 'Request correction of inaccurate data' },
                  { label: 'Right to erasure', desc: 'Request deletion of your personal data' },
                  { label: 'Right to restrict processing', desc: 'Request restriction of processing your data' },
                  { label: 'Right to data portability', desc: 'Request transfer of your data' },
                  { label: 'Right to object', desc: 'Object to processing of your personal data' }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">
                      <strong className="text-foreground">{item.label}:</strong> {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 8 */}
            <section id="cookies" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">8. Cookies</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you 
                do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </section>

            {/* Section 9 */}
            <section id="third-party" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">9. Third-Party Services</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                We may share your data with:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {[
                  'Payment processors (Razorpay) for transaction processing',
                  'Shipping partners for order delivery',
                  'Email service providers for communications',
                  'Analytics providers to improve our services'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 10 */}
            <section id="children" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Our services are not directed to children under 18. We do not knowingly collect personal information from 
                children under 18. If you become aware that a child has provided us with personal data, please contact us.
              </p>
            </section>

            {/* Section 11 */}
            <section id="changes" className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            {/* Section 12 - Contact */}
            <section id="contact" className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 border border-primary/20">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
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