import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { initGA, trackPageView } from '@/utils/analytics';
import { startKeepAlive, stopKeepAlive } from '@/utils/keepAlive';
import { Loader2 } from 'lucide-react';

// Eager load critical pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';

// Lazy load non-critical pages
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Wishlist = lazy(() => import('./pages/User/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/User/Orders'));
const OrderDetail = lazy(() => import('./pages/User/OrderDetail'));
const ReturnsList = lazy(() => import('./pages/User/ReturnsList'));
const Coupons = lazy(() => import('./pages/User/Coupons'));
const Addresses = lazy(() => import('./pages/User/Addresses'));
const Notifications = lazy(() => import('./pages/User/Notifications'));

// Auth Pages - lazy load
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Admin Pages - lazy load
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/EditProduct'));
const AdminCoupons = lazy(() => import('./pages/admin/CouponsManagement'));
const AdminReturns = lazy(() => import('./pages/admin/ReturnsManagement'));
const ShippingZones = lazy(() => import('./pages/admin/ShippingZones'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminBanners = lazy(() => import('./pages/admin/BannersManagement'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminNewsletter = lazy(() => import('./pages/admin/Newsletter'));

// Other Pages - lazy load
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Shipping = lazy(() => import('./pages/Shipping'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Analytics tracker component
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  useEffect(() => {
    // Initialize Google Analytics on app load
    initGA();
    // Start keep-alive pings to prevent Render free-tier spin-down
    startKeepAlive();
    
    return () => {
      stopKeepAlive();
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsTracker />
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:id" element={<OrderSuccess />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/returns" element={<ReturnsList />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/addresses" element={<Addresses />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/add" element={<AddProduct />} />
                <Route path="/admin/products/edit/:id" element={<EditProduct />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/coupons" element={<AdminCoupons />} />
                <Route path="/admin/shipping" element={<ShippingZones />} />
                <Route path="/admin/returns" element={<AdminReturns />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/banners" element={<AdminBanners />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/newsletter" element={<AdminNewsletter />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      <Toaster />
    </BrowserRouter>
  </ErrorBoundary>
  );
}

export default App;
