import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SEOHead from '@/components/common/SEOHead';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      <SEOHead
        title="Privacy Policy"
        description="Privacy Policy for Premium Desk Accessories - Learn how we collect, use, and protect your personal information"
        keywords="privacy policy, data protection, personal information, GDPR"
      />

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-2xl sm:text-3xl">Privacy Policy</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">Last updated: January 17, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-4 sm:space-y-5 md:space-y-6">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">1. Introduction</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Welcome to Premium Desk Accessories. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website and 
              tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">2. Information We Collect</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">We may collect, use, store and transfer different kinds of personal data about you:</p>
            <ul className="list-disc pl-4 sm:pl-5 md:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><strong>Identity Data:</strong> First name, last name, username</li>
              <li><strong>Contact Data:</strong> Email address, telephone number, billing and delivery addresses</li>
              <li><strong>Transaction Data:</strong> Details about payments and products purchased</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
              <li><strong>Usage Data:</strong> Information about how you use our website, products and services</li>
              <li><strong>Marketing Data:</strong> Your preferences in receiving marketing communications</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">We use your personal data for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To process and deliver your orders</li>
              <li>To manage payments, fees and charges</li>
              <li>To send you service-related communications</li>
              <li>To provide customer support</li>
              <li>To improve our website, products and services</li>
              <li>To send you marketing communications (with your consent)</li>
              <li>To detect and prevent fraud</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost, 
              used or accessed in an unauthorized way. We use SSL encryption for all transactions and store passwords using 
              industry-standard hashing algorithms.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Payment Security</h2>
            <p className="text-muted-foreground">
              All payment transactions are processed through our secure payment gateway provider (Razorpay). We do not store 
              complete credit card information on our servers. Payment information is encrypted and transmitted directly to 
              our payment processor.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, 
              including for the purposes of satisfying any legal, accounting, or reporting requirements. Order information 
              is retained for 7 years for tax and legal purposes.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Your Legal Rights</h2>
            <p className="text-muted-foreground mb-2">Under data protection laws, you have rights including:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Right to access:</strong> Request copies of your personal data</li>
              <li><strong>Right to rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to restrict processing:</strong> Request restriction of processing your data</li>
              <li><strong>Right to data portability:</strong> Request transfer of your data</li>
              <li><strong>Right to object:</strong> Object to processing of your personal data</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you 
              do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Third-Party Services</h2>
            <p className="text-muted-foreground mb-2">We may share your data with:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Payment processors (Razorpay) for transaction processing</li>
              <li>Shipping partners for order delivery</li>
              <li>Email service providers for communications</li>
              <li>Analytics providers to improve our services</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not directed to children under 18. We do not knowingly collect personal information from 
              children under 18. If you become aware that a child has provided us with personal data, please contact us.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-3 text-muted-foreground">
              <p><strong>Email:</strong> privacy@premiumdeskaccessories.com</p>
              <p><strong>Phone:</strong> +91 1234567890</p>
              <p><strong>Address:</strong> 123 Business Street, Indore, MP 452001, India</p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
