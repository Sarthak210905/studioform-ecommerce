import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-9xl font-bold text-muted-foreground/20">404</div>
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        <p className="text-lg text-muted-foreground">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/products">
              <Search className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
