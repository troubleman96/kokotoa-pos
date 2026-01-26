import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { storesApi, api, subscriptionApi, SubscriptionStatus } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, Store, MapPin, Phone, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import UpgradeModal from '@/components/subscription/UpgradeModal';

const CreateStore = () => {
  const { language } = useLanguage();
  const { user, logout, updateUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone_number: '',
    details: '',
  });

  // Subscription State
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      logout && logout();
      navigate('/login');
      return;
    }
    if (user.is_profile_complete) {
      navigate('/dashboard');
    }

    // Check subscription status
    const checkSubscription = async () => {
      try {
        const response = await subscriptionApi.getStatus();
        if (response.success) {
          setSubscriptionStatus(response.data);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };
    checkSubscription();
  }, [user, navigate, logout, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user can create store based on subscription
    // Since this is likely their first store (profile incomplete), this check might be redundant if we assume 1 store is always allowed on trial/free.
    // However, if we want to enforce limits strictly or if they somehow have a store already but are here:
    if (subscriptionStatus) {
      // Example check: if they have reached max stores (logic depends on how many stores they currently have, which might be 0 here)
      // Since this page is for "Create Your Store" (implying first store or additional), 
      // but the redirection logic `if (user.is_profile_complete) navigate('/dashboard')` implies this is for the FIRST store setup.
      // So we likely don't need to block them here for the *first* store unless trial is expired and we block *all* access.

      if (subscriptionStatus.status === 'EXPIRED') {
        setShowUpgradeModal(true);
        return;
      }
    }

    setIsLoading(true);
    try {
      if (!user) {
        logout && logout();
        navigate('/login');
        return;
      }

      const response = await storesApi.create({
        ...formData,
        phone_number: formData.phone_number || user.phone || '',
      });

      if (response.success) {
        // Update user context immediately to trigger state sync and redirect
        updateUser({
          is_profile_complete: true,
          store: response.data.id,
          store_name: response.data.name,
        });

        toast({
          title: language === 'sw' ? 'Duka limeundwa!' : 'Store created!',
          description: language === 'sw' ? 'Karibu kwa mfumo wako wa mauzo' : 'Welcome to your POS system',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: language === 'sw' ? 'Kosa!' : 'Error!',
          description: response.message || (language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again'),
          variant: 'destructive',
        });
      }
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {language === 'sw' ? 'Unda Duka Lako' : 'Create Your Store'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'sw'
              ? 'Inaunganisha! Unda duka lako la kwanza ili kuanza kufanya biashara.'
              : 'Congratulations! Create your first store to start doing business.'
            }
          </p>
        </div>

        <Card className="card-kokotoa">
          <CardContent className="pt-6">
            {/* Show warning if expired */}
            {subscriptionStatus?.status === 'EXPIRED' && (
              <div className="mb-6 bg-destructive/10 p-4 rounded-xl border border-destructive/20 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive mb-1">
                    {language === 'sw' ? 'Usajili Umeisha' : 'Subscription Expired'}
                  </h4>
                  <p className="text-sm text-foreground/80 mb-2">
                    {language === 'sw'
                      ? 'Tafadhali lipia kifurushi ili kuendelea kuunda duka.'
                      : 'Please renew your subscription to proceed with store creation.'
                    }
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    {language === 'sw' ? 'Lipia Sasa' : 'Pay Now'}
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Jina la Duka *' : 'Store Name *'}
                </label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={language === 'sw' ? 'Mfano: Mama Maria Shop' : 'e.g., Mama Maria Shop'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-12 h-12 bg-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Mahali *' : 'Location *'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={language === 'sw' ? 'Mfano: Kariakoo, Dar es Salaam' : 'e.g., Kariakoo, Dar es Salaam'}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-12 h-12 bg-background"
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
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="pl-12 h-12 bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Maelezo (si lazima)' : 'Description (optional)'}
                </label>
                <textarea
                  placeholder={language === 'sw' ? 'Maelezo mafupi kuhusu duka lako' : 'Brief description about your store'}
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  {language === 'sw' ? 'Ushirikiano wa moja kwa moja' : 'What you get'}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {language === 'sw' ? 'Mfumo wa mauzo (POS) wa kushika' : 'Touch-friendly POS system'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {language === 'sw' ? 'Usimamizi wa hesabu wa wakati halisi' : 'Real-time inventory management'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {language === 'sw' ? 'Ripoti za kina na takwimu' : 'Detailed reports and analytics'}
                  </li>
                </ul>
              </div>

              <Button type="submit" className="w-full btn-kokotoa h-14 text-lg" disabled={isLoading || subscriptionStatus?.status === 'EXPIRED'}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {language === 'sw' ? 'Inaunda...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {language === 'sw' ? 'Unda Duka' : 'Create Store'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        subscriptionInfo={subscriptionStatus || undefined}
      />
    </div>
  );
};

export default CreateStore;
