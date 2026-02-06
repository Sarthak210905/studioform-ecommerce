import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SEOHead from '@/components/common/SEOHead';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
      <SEOHead
        title="Terms of Service"
        description="Terms of Service for Premium Desk Accessories - Read our terms and conditions for using our services"
        keywords="terms of service, terms and conditions, user agreement, legal"
      />

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-2xl sm:text-3xl">Terms of Service</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">Last updated: January 17, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-4 sm:space-y-5 md:space-y-6">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">1. Agreement to Terms</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              By accessing or using Premium Desk Accessories website and services, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using 
              or accessing this site.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">2. Use License</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
              Permission is granted to temporarily access the materials on Premium Desk Accessories' website for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-4 sm:pl-5 md:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or public display</li>
              <li>Attempt to decompile or reverse engineer any software on our website</li>
              <li>Remove any copyright or proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Account Registration</h2>
            <p className="text-muted-foreground mb-2">To use certain features, you must register for an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate and current</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept all responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Product Information and Pricing</h2>
            <p className="text-muted-foreground">
              We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, 
              pricing, or other content is accurate, complete, reliable, current, or error-free. We reserve the right to correct 
              any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Orders and Payment</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Order Acceptance:</strong> All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason.</p>
              <p><strong>Payment:</strong> Payment must be made at the time of purchase through our approved payment methods (Razorpay, Cash on Delivery).</p>
              <p><strong>Pricing:</strong> All prices are in Indian Rupees (₹) and include applicable taxes unless otherwise stated.</p>
              <p><strong>Platform Fee:</strong> A 2% platform fee is applied to all orders to maintain our services and infrastructure.</p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Shipping and Delivery</h2>
            <p className="text-muted-foreground mb-2">
              Shipping charges and delivery times vary based on location and order value:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Free shipping on orders above ₹1,499</li>
              <li>Standard shipping charges apply for orders below ₹1,499</li>
              <li>Estimated delivery time: 5-7 business days</li>
              <li>Actual delivery time may vary based on location and product availability</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Returns and Refunds</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Return Period:</strong> You may return products within 7 days of delivery.</p>
              <p><strong>Conditions:</strong> Products must be unused, in original packaging, and in resalable condition.</p>
              <p><strong>Refund Processing:</strong> Refunds will be processed within 7-10 business days after receiving and inspecting the returned product.</p>
              <p><strong>Non-Returnable Items:</strong> Customized or personalized products cannot be returned unless defective.</p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Cancellation Policy</h2>
            <p className="text-muted-foreground">
              Orders can be cancelled before shipment. Once shipped, cancellation is not possible, but you may return the product 
              as per our return policy. Refunds for cancelled orders will be processed within 5-7 business days.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. User Conduct</h2>
            <p className="text-muted-foreground mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the website for any unlawful purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Submit false or misleading information</li>
              <li>Interfere with or disrupt the website or servers</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Use automated systems to access the website without permission</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on this website, including text, graphics, logos, images, and software, is the property of Premium Desk 
              Accessories or its content suppliers and is protected by Indian and international copyright laws. Unauthorized use of 
              any content may violate copyright, trademark, and other laws.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Reviews and Comments</h2>
            <p className="text-muted-foreground">
              You may post reviews and comments on products. By posting content, you grant us a non-exclusive, royalty-free, 
              perpetual license to use, reproduce, and publish such content. Reviews must be honest, relevant, and not contain 
              offensive or inappropriate content.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Premium Desk Accessories shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of or inability to use the website or products. Our total liability shall not exceed the amount 
              paid by you for the product in question.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">13. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold Premium Desk Accessories harmless from any claims, damages, losses, liabilities, and 
              expenses arising from your use of the website, violation of these terms, or infringement of any rights of another party.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">14. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes shall be 
              subject to the exclusive jurisdiction of the courts in Indore, Madhya Pradesh.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">15. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your 
              continued use of the website after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">16. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-3 text-muted-foreground">
              <p><strong>Email:</strong> support@premiumdeskaccessories.com</p>
              <p><strong>Phone:</strong> +91 1234567890</p>
              <p><strong>Address:</strong> 123 Business Street, Indore, MP 452001, India</p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
