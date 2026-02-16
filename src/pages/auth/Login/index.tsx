import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowRight, Lock, Phone, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { language, t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: '+255', password: '' });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+255')) {
      if (value.startsWith('+25') || value.startsWith('+2') || value.startsWith('+')) {
        value = '+255';
      } else {
        value = '+255' + value.replace(/^\+?\d*/, '');
      }
    }
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('[Login] Attempting login with phone:', formData.phone);
    try {
      console.log('[Login] Calling login function...');
      await login(formData.phone, formData.password);
      console.log('[Login] Login function completed successfully');
      toast({
        title: language === 'sw' ? 'Karibu tena!' : 'Welcome back!',
        description: language === 'sw' ? 'Umeshotumia kwa mafanikio.' : 'You have logged in successfully.',
      });
    } catch (error: any) {
      console.error('[Login] Login failed with error:', error);
      console.error('[Login] Error structure:', JSON.stringify(error, null, 2));

      // If it's a redirection case (handled in AuthContext), don't show generic error toast
      if (error?.errors?.requires_phone_verification) {
        return;
      }

      let errorMessage = language === 'sw' ? 'Imeshindikana kuingia' : 'Login failed';

      // Check for specific error structure from backend
      if (error?.errors) {
        if (error.errors.requires_phone_verification) {
          navigate('/verify-phone', { state: { phone: formData.phone } });
          return;
        }

        // Handle field-specific errors
        if (error.errors.detail) {
          errorMessage = error.errors.detail;
        } else if (error.errors.non_field_errors) {
          errorMessage = error.errors.non_field_errors[0];
        } else if (error.errors.subscription) {
          errorMessage = error.errors.subscription[0];
        } else if (typeof error.errors === 'string') {
          errorMessage = error.errors;
        } else {
          // Try to find the first error message from any field
          const firstError = Object.values(error.errors)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0] as string;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-start pt-16 md:items-center md:pt-0 justify-center p-4">
      <div className="w-full max-w-md">

        <Card className="card-kokotoa">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-3">
              <Link to="/">
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-transparent hover:opacity-80 transition-opacity">
                  <img src="/pos-kokotoa_favicon/favicon.svg" alt="KOKOTOA Logo" className="w-full h-full object-contain" />
                </div>
              </Link>
              <CardTitle className="font-display text-2xl">{language === 'sw' ? 'Ingia Ukae' : 'Sign In'}</CardTitle>
            </div>
            <CardDescription>{language === 'sw' ? 'Ingia kwenye akaunti yako ya Kokotoa' : 'Log in to your Kokotoa account'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+255xxxxxxxxx"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="pl-12 h-12 bg-background"
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {language === 'sw' ? 'Hakikisha unaanza na +255' : 'Make sure to start with +255'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground block">
                    {language === 'sw' ? 'Nenosiri' : 'Password'}
                  </label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    {language === 'sw' ? 'Umesahau nenosiri?' : 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 pr-12 h-12 bg-background"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>


              <Button type="submit" className="w-full btn-kokotoa h-12 text-lg" isLoading={isLoading}>
                {language === 'sw' ? 'Ingia' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">{language === 'sw' ? 'Nikumbuke' : 'Remember me'}</span>
              </label>

              <div>
                <span className="text-muted-foreground mr-1">
                  {language === 'sw' ? 'Huna akaunti?' : "No account?"}
                </span>
                <Link to="/register" className="text-primary font-medium hover:underline">
                  {language === 'sw' ? 'Jisajili' : 'Register'}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
