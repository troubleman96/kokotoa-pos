import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { storesApi, api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Store, MapPin, Phone, ArrowRight, CheckCircle } from 'lucide-react';

const CreateStore = () => {
  const { language } = useLanguage();
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone_number: '',
    details: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      logout && logout();
      navigate('/login');
      return;
    }
    // Allow access whether profile is complete or not
    // If not complete: creating Master Store
    // If complete: creating additional store
  }, [user, navigate, logout, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!user) {
        logout && logout();
        navigate('/login');
        return;
      }

      const isCreatingMasterStore = !user.is_profile_complete;

      console.log('[CreateStore] Creating store with data:', formData);
      console.log('[CreateStore] Is creating master store:', isCreatingMasterStore);

      // Use the new /stores/create/ endpoint
      const response = await storesApi.create({
        ...formData,
        phone_number: formData.phone_number || user.phone || '',
      });

      console.log('[CreateStore] Response received:', response);

      if (response.success) {
        // Update user in localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (isCreatingMasterStore && response.data.user) {
          // Master Store creation - update profile completion and role
          userData.is_profile_complete = response.data.user.is_profile_complete;
          userData.role = response.data.user.role;
          userData.store = response.data.store.id;
          userData.store_name = response.data.store.name;
          localStorage.setItem('user', JSON.stringify(userData));

          toast({
            title: language === 'sw' ? 'Duka limeundwa!' : 'Store created!',
            description: language === 'sw' ? 'Karibu kwa mfumo wako wa mauzo' : 'Welcome to your POS system',
          });
          navigate('/dashboard');
        } else {
          // Additional store creation
          toast({
            title: language === 'sw' ? 'Duka limeundwa!' : 'Store created!',
            description: language === 'sw' ? `Duka "${response.data.store.name}" limeundwa kwa mafanikio` : `Store "${response.data.store.name}" created successfully`,
          });
          // Optionally navigate to stores management or stay on page
          navigate('/settings');
        }
      }
    } catch (error: any) {
      console.error('[CreateStore] Error caught:', error);
      console.error('[CreateStore] Error details:', JSON.stringify(error, null, 2));

      let errorMessage = language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again';

      if (error?.errors) {
        if (error.errors.non_field_errors) {
          errorMessage = error.errors.non_field_errors[0];
        } else if (error.errors.detail) {
          errorMessage = error.errors.detail;
        } else {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-5 md:mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1.5 flex items-center justify-center gap-2">
            <Store className="w-6 h-6 text-primary shrink-0" />
            <span>
              {!user?.is_profile_complete
                ? (language === 'sw' ? 'Unda Duka Lako' : 'Create Your Store')
                : (language === 'sw' ? 'Ongeza Duka Jipya' : 'Add New Store')
              }
            </span>
          </h1>
          <p className="text-muted-foreground">
            {!user?.is_profile_complete
              ? (language === 'sw'
                ? 'Inaunganisha! Unda duka lako la kwanza ili kuanza kufanya biashara.'
                : 'Congratulations! Create your first store to start doing business.'
              )
              : (language === 'sw'
                ? 'Ongeza duka lingine kwa biashara yako.'
                : 'Add another store to your business.'
              )
            }
          </p>
        </div>

        <Card className="card-kokotoa">
          <CardContent className="pt-4 md:pt-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Jina la Duka *' : 'Store Name *'}
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={language === 'sw' ? 'Mama Maria Shop' : 'Mama Maria Shop'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-11 bg-background"
                      required
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Mahali *' : 'Location *'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={language === 'sw' ? 'Kariakoo' : 'Kariakoo'}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-10 h-11 bg-background"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+255 xxx xxx xxx"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="pl-10 h-11 bg-background"
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
                  className="w-full h-20 px-4 py-2.5 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
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

              <Button type="submit" className="w-full btn-kokotoa h-11 text-base" disabled={isLoading}>
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
    </div>
  );
};

export default CreateStore;
