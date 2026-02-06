import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    if (errors[id as keyof typeof errors]) {
      setErrors({ ...errors, [id]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {
      username: '',
      email: '',
      full_name: '',
      password: '',
      confirmPassword: '',
    };

    if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
      });
      
      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      
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
        } else if (typeof validationErrors === 'string') {
          toast({
            title: 'Validation Error',
            description: validationErrors,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Validation Error',
            description: 'Please check your input and try again',
            variant: 'destructive',
          });
        }
      } else if (error.response?.status === 400) {
        toast({
          title: 'Registration Failed',
          description: error.response.data.detail || 'Email or username already exists',
          variant: 'destructive',
        });
      } else {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.detail 
          || error.message 
          || 'Registration failed. Please try again.';
        
        toast({
          title: 'Registration Failed',
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
            <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
            <p className="text-muted-foreground">
              Enter your details to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                className="h-11"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                className="h-11"
                value={formData.full_name}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="name"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="h-11 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password"
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
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
              {!errors.password && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="h-11 pr-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked: boolean) => setAgreedToTerms(checked)}
                disabled={loading}
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
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

          {/* Login Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link 
              to="/login" 
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
      

      {/* Right Side - Register Form */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover  opacity-60"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/sitesv/APaQ0STZcxSbrVWDnZSef90T92_6tYWbGUoBGnFxrfEJ1yK6pluhTpAJAVKPb1NILN6qLPSlxTl47gBHgPudTMJq4lWwoaial7crRWHs1eHaZLWUangyhTwKvfIkTLm2MRUTib-6hd_fFhdQqjboW8qv93_VXoEsF_m6dJcEQ3pqzzp5j1aVrZkrfesS=w16383')"
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
              Start your journey<br />with us today
            </h1>
            <p className="text-lg text-gray-300 max-w-md">
              Join thousands of happy customers and experience shopping like never before.
            </p>
          </div>

          {/* Footer */}
          <div className="text-sm text-gray-400">
            
          </div>
        </div>
      </div>
    </div>
  );
}