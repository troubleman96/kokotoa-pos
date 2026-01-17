import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowLeft, Smartphone, RefreshCw } from 'lucide-react';

const VerifyOTP = () => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const phone = (location.state as { phone?: string })?.phone || '';

  useEffect(() => {
    if (!phone) {
      navigate('/register');
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
      setCountdown(30);
    }
  }, [countdown, canResend]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Tafadhali jaza nambari yote' : 'Please enter all 6 digits',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(phone, otpCode);
      toast({
        title: language === 'sw' ? 'Namba imethibitishwa!' : 'Number verified!',
        description: language === 'sw' ? 'Karibu KOKOTOA!' : 'Welcome to KOKOTOA!',
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? ' OTP si sahihi' : 'Invalid OTP'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOtp(phone);
      toast({
        title: language === 'sw' ? 'OTP imetumwa!' : 'OTP sent!',
        description: language === 'sw' ? 'Tafadhali angalia simu yako' : 'Please check your phone',
      });
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again'),
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-display font-bold text-2xl">K</span>
            </div>
            <span className="font-display font-bold text-3xl text-foreground">KOKOTOA</span>
          </Link>
        </div>

        <Card className="card-kokotoa">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">{language === 'sw' ? 'Thibitisha Namba' : 'Verify Number'}</CardTitle>
            <CardDescription>
              {language === 'sw' 
                ? `Tumetumia OTP kwa namba ${phone}. Angalia simu yako.`
                : `We sent an OTP to ${phone}. Check your phone.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-background"
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {language === 'sw' ? 'Hukupata OTP?' : "Didn't receive OTP?"}
                </p>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className="text-primary"
                >
                  {!canResend ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {language === 'sw' ? `Subiri ${countdown}s` : `Wait ${countdown}s`}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      {language === 'sw' ? 'Tuma tena' : 'Resend OTP'}
                    </span>
                  )}
                </Button>
              </div>

              <Button type="submit" className="w-full btn-kokotoa h-12 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {language === 'sw' ? 'Inathibitisha...' : 'Verifying...'}
                  </span>
                ) : (
                  language === 'sw' ? 'Thibitisha' : 'Verify'
                )}
              </Button>

              <div className="text-center">
                <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'sw' ? 'Rudi kwa usajili' : 'Back to registration'}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;
