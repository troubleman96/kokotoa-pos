import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Smartphone, RefreshCw, CheckCircle, Clock } from 'lucide-react';

const PhoneVerification = () => {
    const { language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOtp, requestPhoneVerification, user, updateUser } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [canResend, setCanResend] = useState(true);
    const [countdown, setCountdown] = useState(30);
    const [otpRequested, setOtpRequested] = useState(false);

    const phone = (location.state as { phone?: string })?.phone || user?.phone || '';

    useEffect(() => {
        if (!phone) {
            navigate('/login');
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

    const handleRequestOTP = async () => {
        setIsResending(true);
        try {
            await requestPhoneVerification(phone);
            setOtpRequested(true);
            setCanResend(false);
            setCountdown(30);
            toast({
                title: language === 'sw' ? 'OTP imetumwa!' : 'OTP sent!',
                description: language === 'sw' ? 'Tafadhali angalia simu yako' : 'Please check your phone',
            });
        } catch (error: any) {
            toast({
                title: language === 'sw' ? 'Kosa!' : 'Error!',
                description: error.message || (language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again'),
                variant: 'destructive',
            });
        } finally {
            setIsResending(false);
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
            const response = await verifyOtp(phone, otpCode);
            updateUser({ is_phone_verified: true });

            toast({
                title: language === 'sw' ? 'Namba imethibitishwa!' : 'Number verified!',
                description: language === 'sw'
                    ? 'Namba yako imethibitishwa kwa mafanikio.'
                    : 'Your phone number has been successfully verified.',
            });

            // After verification, redirect to dashboard or subscription upgrade
            // The TrialBanner will handle the upgrade prompt if needed
            navigate('/dashboard');
        } catch (error: any) {
            toast({
                title: language === 'sw' ? 'Kosa!' : 'Error!',
                description: error.message || (language === 'sw' ? 'OTP si sahihi' : 'Invalid OTP'),
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
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
                </div>

                <Card className="card-kokotoa">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Smartphone className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="font-display text-2xl">{language === 'sw' ? 'Thibitisha Namba' : 'Verify Phone'}</CardTitle>
                        <CardDescription>
                            {otpRequested
                                ? (language === 'sw' ? `Tumetumia OTP kwa namba ${phone}` : `We've sent an OTP to ${phone}`)
                                : (language === 'sw' ? 'Tafadhali thibitisha namba yako ya simu ili kuendelea.' : 'Please verify your phone number to continue.')
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!otpRequested ? (
                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-muted/50 text-center">
                                    <span className="text-lg font-mono font-bold">{phone}</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={handleRequestOTP}
                                        className="w-full btn-kokotoa h-12 text-lg"
                                        isLoading={isResending}
                                    >
                                        {language === 'sw' ? 'Tuma OTP' : 'Request OTP'}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full h-12"
                                    >
                                        {language === 'sw' ? 'Ruka kwa sasa' : 'Skip for now'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
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
                                            autoComplete="one-time-code"
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
                                        onClick={handleRequestOTP}
                                        disabled={!canResend || isResending}
                                        className="text-primary"
                                    >
                                        {!canResend ? (
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
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

                                <Button type="submit" className="w-full btn-kokotoa h-12 text-lg" isLoading={isLoading}>
                                    {language === 'sw' ? 'Thibitisha' : 'Verify OTP'}
                                </Button>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full h-12"
                                    >
                                        {language === 'sw' ? 'Ruka kwa sasa' : 'Skip for now'}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setOtpRequested(false)}
                                        className="w-full h-12"
                                    >
                                        {language === 'sw' ? 'Tumia namba nyingine' : 'Use different number'}
                                    </Button>
                                </div>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {language === 'sw' ? 'Rudi kuingia' : 'Back to login'}
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PhoneVerification;
