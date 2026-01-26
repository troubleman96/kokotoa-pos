import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowRight, Lock, Phone, User, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { language, t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '+255',
    password: '',
    password_confirm: '',
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Always ensure +255 is at the start
    if (!value.startsWith('+255')) {
      // If they tried to delete part of it, put it back
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

    if (formData.password !== formData.password_confirm) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Nenosiri hazifanani' : 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Nenosiri liwe na angalau herufi 8' : 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      toast({
        title: language === 'sw' ? 'Mnakaribishwa KOKOTOA!' : 'Welcome to KOKOTOA!',
        description: language === 'sw'
          ? 'Hongera! Akaunti yako imeundwa na umepewa siku 7 za kujaribu mfumo bure. Hebu tuanzishe duka lako!'
          : 'Congratulations! Your account has been created and you have a 7-day free trial. Let\'s set up your store!',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again';

      if (error?.errors) {
        if (error.errors.phone) {
          errorMessage = error.errors.phone[0];
        } else if (error.errors.non_field_errors) {
          errorMessage = error.errors.non_field_errors[0];
        } else if (error.errors.detail) {
          errorMessage = error.errors.detail;
        } else {
          // Generalize for other fields
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

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) return 'bg-destructive';
    if (strength <= 2) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-transparent">
              <img src="/pos-kokotoa_favicon/favicon.svg" alt="KOKOTOA Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-3xl text-foreground">KOKOTOA</span>
          </Link>
          <p className="text-muted-foreground mt-2">{language === 'sw' ? 'Mfumo wa kisasa wa mauzo' : 'Modern POS System'}</p>
        </div>

        <Card className="card-kokotoa">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">{language === 'sw' ? 'Jisajili Sasa' : 'Create Account'}</CardTitle>
            <CardDescription>{language === 'sw' ? 'Fungua akaunti yako ya KOKOTOA' : 'Open your KOKOTOA account'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Jina la Kwanza' : 'First Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="pl-12 h-12 bg-background"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Jina la Mwisho' : 'Last Name'}
                  </label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="h-12 bg-background"
                    required
                  />
                </div>
              </div>

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
                  {language === 'sw' ? 'Anza na +255 (Mfano: +255712345678)' : 'Start with +255 (e.g., +255712345678)'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Nenosiri' : 'Password'}
                </label>
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
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength() ? getStrengthColor() : 'bg-muted'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'sw' ? 'Nguvu ya nenosiri' : 'Password strength'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Thibitisha Nenosiri' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password_confirm}
                    onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                    className={`pl-12 pr-12 h-12 bg-background ${formData.password_confirm && formData.password !== formData.password_confirm ? 'border-destructive' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.password_confirm && formData.password === formData.password_confirm && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {language === 'sw' ? 'Nenosiri linakubalika' : 'Passwords match'}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" className="mt-1 rounded border-border" required />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  {language === 'sw' ? 'Nakubali na' : 'I agree to'}{' '}
                  <Link to="/terms" className="text-primary hover:underline">{language === 'sw' ? 'masharti ya huduma' : 'terms of service'}</Link>
                  {' '}{language === 'sw' ? 'na' : 'and'}{' '}
                  <Link to="/privacy" className="text-primary hover:underline">{language === 'sw' ? 'sera ya faragha' : 'privacy policy'}</Link>
                </label>
              </div>

              <Button type="submit" className="w-full btn-kokotoa h-12 text-lg" isLoading={isLoading}>
                {language === 'sw' ? 'Jisajili' : 'Register'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {language === 'sw' ? 'Tayari una akaunti?' : 'Already have an account?'}{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  {language === 'sw' ? 'Ingia' : 'Sign In'}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
