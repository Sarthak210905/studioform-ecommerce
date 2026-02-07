import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Animated 404 */}
        <div className="relative">
          <div className="text-[12rem] sm:text-[16rem] font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary/20 to-primary/5 leading-none select-none">
            404
          </div>
          
        </div>

        {/* Content */}
        <div className="space-y-4 -mt-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Oops! Page not found
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to a new location.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" asChild className="group">
            <Link to="/">
              <Home className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Back to Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="group">
            <Link to="/products">
              <Search className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Browse Products
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">You might find these helpful:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link to="/faq" className="text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              FAQ
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/contact" className="text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Contact Support
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/categories" className="text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}