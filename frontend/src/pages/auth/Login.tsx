import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import { Loader2, User, Lock, Eye, EyeOff } from 'lucide-react';

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
      // Send as form-urlencoded with 'username' field
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('password', formData.password);

      const response = await api.post('/auth/login', formDataToSend, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Store user and token in the store
      login(response.data.user, response.data.access_token);
      
      // Load and merge cart from backend
      await loadAndMergeCart();
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });

      // Redirect based on user role or to the intended page
      if (response.data.user.is_superuser) {
        navigate('/');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle validation errors from server (422)
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.detail;
        
        if (Array.isArray(validationErrors)) {
          // FastAPI validation errors format
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
        // Unauthorized - wrong credentials
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
      } else {
        // Handle other errors
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  className="pl-10"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            asChild
            disabled={loading}
          >
            <Link to="/register">Create Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
