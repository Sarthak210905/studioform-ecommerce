import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, MapPin, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import TrustBadges from '@/components/common/TrustBadges';
import NewsletterSignup from '@/components/common/NewsletterSignup';

export default function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-muted/30 to-muted/60  p-4">
      <div className="container py-16 sm:py-20">
        {/* Trust Badges */}
        <div className="mb-12">
          <TrustBadges />
        </div>
        
        <Separator className="my-10" />
        
        {/* Newsletter */}
        <div className="mb-16">
          <NewsletterSignup />
        </div>
        
        <Separator className="my-10" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-2">
            <Link to="/" className="inline-block group">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all">
                Studioform
              </h3>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
              Premium desk accessories for the modern workspace. Handcrafted quality meets contemporary design.
            </p>
            
            {/* Social Links */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Follow Us
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://www.instagram.com/studio_form__/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center h-10 w-10 rounded-xl border bg-background hover:bg-primary hover:border-primary transition-all shadow-sm hover:shadow-md"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </a>
                <a 
                  href="https://twitter.com/studioform" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center h-10 w-10 rounded-xl border bg-background hover:bg-primary hover:border-primary transition-all shadow-sm hover:shadow-md"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </a>
                <a 
                  href="https://facebook.com/studioform" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center h-10 w-10 rounded-xl border bg-background hover:bg-primary hover:border-primary transition-all shadow-sm hover:shadow-md"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Get in Touch
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a 
                  href="mailto:contact.studioform@gmail.com" 
                  className="flex items-center gap-2 hover:text-foreground transition-colors group"
                >
                  <Mail className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span>contact.studioform@gmail.com</span>
                </a>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">Indore, Madhya Pradesh, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-base mb-5 flex items-center gap-2">
              Shop
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/products" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>All Products</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                {/* <Link 
                  to="/special-editions" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Special Editions</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link> */}
              </li>
              <li>
                <Link 
                  to="/products?featured=true" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Featured</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?sale=true" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Sale</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-base mb-5 flex items-center gap-2">
              Support
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/contact" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Shipping Info</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Returns</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>FAQ</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-base mb-5 flex items-center gap-2">
              Company
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/about" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>About Us</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Privacy Policy</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Terms of Service</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="font-medium">© 2026 Studioform. All rights reserved.</p>
            <span className="hidden sm:inline text-muted-foreground/50">•</span>
            <div className="flex items-center gap-4 text-xs">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link to="/sitemap" className="hover:text-foreground transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-sm">
            Made with 
            <span className="text-red-500 animate-pulse inline-block">♥</span> 
            in India
          </p>
        </div>
      </div>
    </footer>
  );
}