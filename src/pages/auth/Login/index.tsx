import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { TANZANIA_PHONE_PREFIX, extractTanzaniaPhoneLocalPart, normalizeTanzaniaPhone } from '@/lib/phone';
import { ArrowRight, Lock, Phone, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: extractTanzaniaPhoneLocalPart(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const normalizedPhone = normalizeTanzaniaPhone(formData.phone);

    console.log('[Login] Attempting login with phone:', normalizedPhone);
    try {
      console.log('[Login] Calling login function...');
      await login(normalizedPhone, formData.password);
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
          navigate('/verify-phone', { state: { phone: normalizedPhone } });
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
    <div className="flex min-h-[100svh] items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">

        <Card className="card-kokotoa rounded-2xl">
          <CardHeader className="px-4 pb-1 pt-4 text-center sm:px-6 sm:pb-2 sm:pt-6">
            <div className="flex items-center justify-center gap-3">
              <Link to="/">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-transparent transition-opacity hover:opacity-80 sm:h-12 sm:w-12">
                  <img src="/pos-kokotoa_faviconupdate/favicon.svg" alt="KOKOTOA Logo" className="w-full h-full object-contain" />
                </div>
              </Link>
              <CardTitle className="font-display text-xl sm:text-2xl">{language === 'sw' ? 'Ingia Ukae' : 'Sign In'}</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              {language === 'sw' ? 'Ingia kwenye akaunti yako ya Kokotoa' : 'Log in to your Kokotoa account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground sm:mb-2">
                  {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5" />
                  <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground sm:left-12 sm:text-base">
                    {TANZANIA_PHONE_PREFIX}
                  </span>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="xxx xxx xxx"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="h-11 bg-background pl-[5.6rem] text-sm sm:h-12 sm:pl-[6.2rem]"
                    required
                  />
                </div>
                <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                  {language === 'sw' ? 'Ingiza namba, +255 itaongezwa moja kwa moja' : 'Enter the number and we will add +255 automatically'}
                </p>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    {language === 'sw' ? 'Nenosiri' : 'Password'}
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="current-password"
                    className="h-11 bg-background pl-11 pr-11 text-sm sm:h-12 sm:pl-12 sm:pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none sm:right-4"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-background/60 px-2.5 py-1.5 text-muted-foreground">
                    <input type="checkbox" className="rounded border-border accent-primary" />
                    <span>{language === 'sw' ? 'Nikumbuke' : 'Remember me'}</span>
                  </label>
                  <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                    {language === 'sw' ? 'Umesahau?' : 'Forgot password?'}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="h-11 w-full border-primary/30 bg-background/70 text-sm hover:bg-muted sm:h-12 sm:text-base"
                >
                  <Link to="/register">
                    {language === 'sw' ? 'Jisajili' : 'Register'}
                  </Link>
                </Button>
                <Button type="submit" className="h-11 w-full text-base btn-kokotoa sm:h-12 sm:text-lg" isLoading={isLoading}>
                  {language === 'sw' ? 'Ingia' : 'Sign In'}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
