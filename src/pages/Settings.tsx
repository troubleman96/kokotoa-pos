import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, storesApi, accountsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  User, Lock, Bell, Palette, Save, Store, Edit2
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const SettingsPage = () => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'store' | 'notifications' | 'appearance'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [storeData, setStoreData] = useState<{
    id: number;
    name: string;
    location: string;
    phone_number: string;
    details: string;
  } | null>(null);

  const handleUpdateProfile = async () => {
    if (!profileData.first_name || !profileData.last_name) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Tafadhali jaza taarifa zote' : 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await accountsApi.changeName({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      });
      toast({
        title: language === 'sw' ? 'Imefanikiwa!' : 'Success!',
        description: language === 'sw' ? 'Taarifa zimesasishwa' : 'Profile updated successfully',
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

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Nenosiri hazifanani' : 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Nenosiri liwe na angalau herufi 8' : 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.new_password_confirm,
      });
      toast({
        title: language === 'sw' ? 'Imefanikiwa!' : 'Success!',
        description: language === 'sw' ? 'Nenosiri limebadilishwa' : 'Password changed successfully',
      });
      setPasswordData({ old_password: '', new_password: '', new_password_confirm: '' });
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

  // Fetch store data on component mount
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!user?.store) return;

      try {
        const response = await storesApi.get(user.store);
        if (response.data) {
          setStoreData({
            id: response.data.id,
            name: response.data.name,
            location: response.data.location,
            phone_number: response.data.phone_number,
            details: response.data.details || '',
          });
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      }
    };

    fetchStoreData();
  }, [user?.store]);

  const handleUpdateStore = async () => {
    if (!storeData || !storeData.name || !storeData.location) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Tafadhali jaza taarifa zote' : 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await storesApi.update(storeData.id, {
        name: storeData.name,
        location: storeData.location,
        phone_number: storeData.phone_number,
        details: storeData.details,
      });
      toast({
        title: language === 'sw' ? 'Imefanikiwa!' : 'Success!',
        description: language === 'sw' ? 'Taarifa za duka zimesasishwa' : 'Store information updated successfully',
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

  const tabs = [
    { id: 'profile', label: language === 'sw' ? 'Wasifu' : 'Profile', icon: User },
    { id: 'password', label: language === 'sw' ? 'Nenosiri' : 'Password', icon: Lock },
    { id: 'store', label: language === 'sw' ? 'Duka' : 'Store', icon: Store },
    { id: 'notifications', label: language === 'sw' ? 'Arifa' : 'Notifications', icon: Bell },
    { id: 'appearance', label: language === 'sw' ? 'Muonekano' : 'Appearance', icon: Palette },
  ];

  return (
    <DashboardLayout
      title={language === 'sw' ? 'Mipangilio' : 'Settings'}
      subtitle={language === 'sw' ? 'Dhibiti akaunti yako' : 'Manage your account'}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={activeTab === tab.id ? 'btn-kokotoa' : ''}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {language === 'sw' ? 'Taarifa za Wasifu' : 'Profile Information'}
              </CardTitle>
              <CardDescription>
                {language === 'sw' ? 'Sasisha taarifa yako ya kibinafsi' : 'Update your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-display font-bold text-2xl">
                    {profileData.first_name[0]}{profileData.last_name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profileData.first_name} {profileData.last_name}</h3>
                  <p className="text-muted-foreground">{user?.role_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Jina la Kwanza' : 'First Name'}
                  </label>
                  <Input
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {language === 'sw' ? 'Jina la Mwisho' : 'Last Name'}
                  </label>
                  <Input
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    className="bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                </label>
                <Input value={profileData.phone} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'sw' ? 'Namba haiwezi kubadilishwa' : 'Phone number cannot be changed'}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdateProfile} className="btn-kokotoa" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? (language === 'sw' ? 'Inahifadhi...' : 'Saving...') : (language === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {language === 'sw' ? 'Badilisha Nenosiri' : 'Change Password'}
              </CardTitle>
              <CardDescription>
                {language === 'sw' ? 'Usalama wa akaunti yako' : 'Secure your account'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Nenosiri la Zamani' : 'Current Password'}
                </label>
                <Input
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Nenosiri Mpya' : 'New Password'}
                </label>
                <Input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {language === 'sw' ? 'Thibitisha Nenosiri' : 'Confirm New Password'}
                </label>
                <Input
                  type="password"
                  value={passwordData.new_password_confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
                  className="bg-background"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleChangePassword} className="btn-kokotoa" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? (language === 'sw' ? 'Inabadilisha...' : 'Changing...') : (language === 'sw' ? 'Badilisha Nenosiri' : 'Change Password')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                {language === 'sw' ? 'Taarifa za Duka' : 'Store Information'}
              </CardTitle>
              <CardDescription>
                {language === 'sw' ? 'Sasisha taarifa za duka lako' : 'Update your store information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {storeData ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Store className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{storeData.name}</h3>
                      <p className="text-muted-foreground">{storeData.location}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {language === 'sw' ? 'Jina la Duka *' : 'Store Name *'}
                    </label>
                    <Input
                      value={storeData.name}
                      onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {language === 'sw' ? 'Mahali *' : 'Location *'}
                    </label>
                    <Input
                      value={storeData.location}
                      onChange={(e) => setStoreData({ ...storeData, location: e.target.value })}
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                    </label>
                    <Input
                      value={storeData.phone_number}
                      onChange={(e) => setStoreData({ ...storeData, phone_number: e.target.value })}
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {language === 'sw' ? 'Maelezo' : 'Description'}
                    </label>
                    <textarea
                      value={storeData.details}
                      onChange={(e) => setStoreData({ ...storeData, details: e.target.value })}
                      className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={language === 'sw' ? 'Maelezo mafupi kuhusu duka lako' : 'Brief description about your store'}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleUpdateStore} className="btn-kokotoa" disabled={isLoading}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      {isLoading ? (language === 'sw' ? 'Inahifadhi...' : 'Saving...') : (language === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {language === 'sw' ? 'Hakuna taarifa za duka' : 'No store information'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'sw' ? 'Tafadhali tengeneza duka kwanza' : 'Please create a store first'}
                  </p>
                  <Link to="/create-store">
                    <Button className="btn-kokotoa">
                      <Store className="w-4 h-4 mr-2" />
                      {language === 'sw' ? 'Unda Duka' : 'Create Store'}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {language === 'sw' ? 'Arifa' : 'Notifications'}
              </CardTitle>
              <CardDescription>
                {language === 'sw' ? 'Dhibiti arifa unazopokea' : 'Manage notifications you receive'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'low_stock', sw: 'Arifa za bidhaa zinazokwisha', en: 'Low stock alerts' },
                { key: 'sales', sw: 'Arifa za mauzo', en: 'Sales notifications' },
                { key: 'reports', sw: 'Ripoti za kila siku', en: 'Daily reports' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <span className="font-medium">{language === 'sw' ? item.sw : item.en}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                {language === 'sw' ? 'Muonekano' : 'Appearance'}
              </CardTitle>
              <CardDescription>
                {language === 'sw' ? 'Dhibiti jinsi programu inavyoonekana' : 'Customize how the app looks'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  {language === 'sw' ? 'Lugha' : 'Language'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={language === 'sw' ? 'default' : 'outline'}
                    onClick={() => setLanguage('sw')}
                    className={language === 'sw' ? 'flex-1 btn-kokotoa' : 'flex-1'}
                  >
                    🇹🇿 Kiswahili
                  </Button>
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    onClick={() => setLanguage('en')}
                    className={language === 'en' ? 'flex-1 btn-kokotoa' : 'flex-1'}
                  >
                    🇬🇧 English
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
