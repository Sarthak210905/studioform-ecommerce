import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, User, LogOut, Package, Settings, Menu, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import NotificationBell from '@/components/common/NotificationBell';
import { Input } from '@/components/ui/input';

export default function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Get user and token directly
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const { items, fetchCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Calculate authentication status
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Calculate cart item count from items array
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  {isAuthenticated && (
                    <div className="pb-4 border-b">
                      <p className="text-sm font-semibold">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  )}
                  <Link 
                    to="/products" 
                    className="text-base font-medium py-2 hover:text-primary transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Products
                  </Link>
                  {/* <Link 
                    to="/special-editions" 
                    className="text-base font-medium py-2 hover:text-primary transition-colors flex items-center gap-1.5"
                    onClick={closeMobileMenu}
                  >
                    
                    Special Editions
                  </Link> */}
                  <Link 
                    to="/about" 
                    className="text-base font-medium py-2 hover:text-primary transition-colors"
                    onClick={closeMobileMenu}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-base font-medium py-2 hover:text-primary transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Contact
                  </Link>
                  {isAuthenticated && (
                    <>
                      <div className="border-t pt-4 mt-2">
                        <Link 
                          to="/profile" 
                          className="flex items-center gap-3 py-2 text-base hover:text-primary"
                          onClick={closeMobileMenu}
                        >
                          <Settings className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          className="flex items-center gap-3 py-2 text-base hover:text-primary"
                          onClick={closeMobileMenu}
                        >
                          <Package className="h-4 w-4" />
                          Orders
                        </Link>
                        {user?.is_superuser && (
                          <Link 
                            to="/admin" 
                            className="flex items-center gap-3 py-2 text-base hover:text-primary"
                            onClick={closeMobileMenu}
                          >
                            <Settings className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <Button 
                        variant="destructive" 
                        className="w-full mt-4 touch-manipulation" 
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  )}
                  {!isAuthenticated && (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full touch-manipulation" 
                        asChild
                      >
                        <Link to="/login" onClick={closeMobileMenu}>Login</Link>
                      </Button>
                      <Button 
                        className="w-full touch-manipulation" 
                        asChild
                      >
                        <Link to="/register" onClick={closeMobileMenu}>Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link to="/" className="text-lg sm:text-2xl font-bold flex-shrink-0">
            Studioform
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Products
            </Link>
            {/* <Link to="/special-editions" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              
              Special Editions
            </Link> */}
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Icon */}
            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden touch-manipulation" asChild>
              <Link to="/products?search=">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            {isAuthenticated && <NotificationBell />}
            
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation" asChild>
              <Link to="/wishlist">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation hidden md:flex">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold">{user?.full_name || user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  {user?.is_superuser && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
