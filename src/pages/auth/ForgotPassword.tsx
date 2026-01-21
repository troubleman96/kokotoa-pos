import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowLeft, Lock, Smartphone, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'phone' | 'reset'>('phone');
  const [phone, setPhone] = useState('');
  const [formData, setFormData] = useState({
    otp_code: '',
    new_password: '',
    new_password_confirm: '',
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.requestPasswordReset({ phone });
      setStep('reset');
      toast({
        title: language === 'sw' ? 'OTP imetumwa!' : 'OTP sent!',
        description: language === 'sw' ? 'Tafadhali angalia simu yako' : 'Please check your phone',
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password !== formData.new_password_confirm) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Nenosiri hazifanani' : 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.new_password.length < 8) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Nenosiri liwe na angalau herufi 8' : 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        phone,
        otp_code: formData.otp_code,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm,
      });
      toast({
        title: language === 'sw' ? 'Nenosiri limebadilishwa!' : 'Password changed!',
        description: language === 'sw' ? 'Tunaweza sasa kuingia kwa nenosiri jipya' : 'You can now sign in with your new password',
      });
      navigate('/login');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <CardTitle className="font-display text-2xl">
              {language === 'sw' ? 'Sahau Nenosiri' : 'Forgot Password'}
            </CardTitle>
            <CardDescription>
              {step === 'phone'
                ? (language === 'sw' ? 'Tutakutumia OTP kuhakiki namba yako' : 'We will send an OTP to verify your number')
                : (language === 'sw' ? 'Jaza OTP iliyotumwa kwa simu yako' : 'Enter the OTP sent to your phone')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+255xxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-12 h-12 bg-background"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full btn-kokotoa h-12 text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {language === 'sw' ? 'Inatuma...' : 'Sending...'}
                    </span>
                  ) : (
                    language === 'sw' ? 'Tuma OTP' : 'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                  </label>
                  <Input
                    value={phone}
                    disabled
                    className="h-12 bg-muted"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Namba ya OTP' : 'OTP Code'}
                  </label>
                  <Input
                    type="text"
                    placeholder="123456"
                    value={formData.otp_code}
                    onChange={(e) => setFormData({ ...formData, otp_code: e.target.value })}
                    className="h-12 bg-background text-center text-xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Nenosiri Mpya' : 'New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.new_password}
                      onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
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

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Thibitisha Nenosiri' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.new_password_confirm}
                      onChange={(e) => setFormData({ ...formData, new_password_confirm: e.target.value })}
                      className="pl-12 pr-12 h-12 bg-background"
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
                </div>

                <Button type="submit" className="w-full btn-kokotoa h-12 text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {language === 'sw' ? 'Inabadilisha...' : 'Changing...'}
                    </span>
                  ) : (
                    language === 'sw' ? 'Badilisha Nenosiri' : 'Change Password'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {language === 'sw' ? 'Rudi kwa kuingia' : 'Back to login'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
