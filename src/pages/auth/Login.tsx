import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowRight, Lock, Phone } from 'lucide-react';

const Login = () => {
  const { language, t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.phone, formData.password);
      toast({
        title: language === 'sw' ? 'Karibu tena!' : 'Welcome back!',
        description: language === 'sw' ? 'Umeshotumia kwa mafanikio.' : 'You have logged in successfully.',
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? 'Namba ya simu au nenosiri si sahihi' : 'Invalid phone number or password'),
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
          <p className="text-muted-foreground mt-2">{language === 'sw' ? 'Mfumo wa kisasa wa mauzo' : 'Modern POS System'}</p>
        </div>

        <Card className="card-kokotoa">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">{language === 'sw' ? 'Ingia Ukae' : 'Sign In'}</CardTitle>
            <CardDescription>{language === 'sw' ? 'Ingia kwa namba yako ya simu' : 'Enter your phone number to continue'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="255628587749"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-12 h-12 bg-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Nenosiri' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 h-12 bg-background"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">{language === 'sw' ? 'Nikumbuke' : 'Remember me'}</span>
                </label>
                <Link to="/forgot-password" className="text-primary hover:underline">
                  {language === 'sw' ? 'Umesahau nenosiri?' : 'Forgot password?'}
                </Link>
              </div>

              <Button type="submit" className="w-full btn-kokotoa h-12 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {language === 'sw' ? 'Inaingia...' : 'Signing in...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {language === 'sw' ? 'Ingia' : 'Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {language === 'sw' ? 'Huna akaunti?' : "Don't have an account?"}{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  {language === 'sw' ? 'Jisajili' : 'Register'}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
