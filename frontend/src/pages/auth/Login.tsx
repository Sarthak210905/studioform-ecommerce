import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const login = useAuthStore((state) => state.login);
  const { loadAndMergeCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const from = (location.state as any)?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('password', formData.password);

      const response = await api.post('/auth/login', formDataToSend, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      login(response.data.user, response.data.access_token);
      await loadAndMergeCart();
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });

      if (response.data.user.is_superuser) {
        navigate('/');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.detail;
        
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map((err: any) => {
            const field = err.loc?.[1] || 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          
          toast({
            title: 'Validation Error',
            description: errorMessages,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Invalid Input',
            description: 'Please check your username and password',
            variant: 'destructive',
          });
        }
      } else if (error.response?.status === 401) {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
      } else {
        const errorMessage = error.response?.data?.detail 
          || error.message 
          || 'Login failed. Please try again.';
        
        toast({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/sitesv/APaQ0STny5nrZUeq6Fjt-k0Ss05Yp7oUg7U9XL8fWXOhm5LEmkhkJyDDTH5RH9BJG_qEVVIlSi0vo0SL31myU1__OV-QAh7zJTDZwx4s0SIw4QZe75-GDUqf-yAfqzG263YOCDcg6CPILl1r_J1fwhL9OQQ149viwN4EJEnYHRuEBQVPyXemhi0gMiPmT9I=w16383')"
          }}
        />
        
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo/Brand */}
          <div>
            <Link to="/" className="text-2xl font-bold tracking-tight">
              Studioform
            </Link>
          </div>

          {/* Center Content */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Welcome back to<br />Studioform
            </h1>
            <p className="text-lg text-gray-300 max-w-md">
              Discover amazing products and exclusive deals tailored just for you.
            </p>
          </div>

          {/* Footer */}
          <div className="text-sm text-gray-400">
            
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="text-2xl font-bold">
              YourBrand
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="h-11"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="h-11 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 group" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link 
              to="/register" 
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}