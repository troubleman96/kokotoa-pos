import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart, Package, BarChart3, Settings, LogOut, Menu, X, Home,
  User, Lock, Bell, Palette, Globe, Shield, Save, XCircle
} from 'lucide-react';

const SettingsPage = () => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'appearance'>('profile');
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

  const navItems = [
    { path: '/dashboard', icon: Home, label: language === 'sw' ? 'Dashibodi' : 'Dashboard' },
    { path: '/pos', icon: ShoppingCart, label: language === 'sw' ? 'Mauzo' : 'Sales' },
    { path: '/inventory', icon: Package, label: language === 'sw' ? 'Hesabu' : 'Inventory' },
    { path: '/reports', icon: BarChart3, label: language === 'sw' ? 'Ripoti' : 'Reports' },
    { path: '/settings', icon: Settings, label: language === 'sw' ? 'Mipangilio' : 'Settings' },
  ];

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
      await authApi.changeName({
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

  const tabs = [
    { id: 'profile', label: language === 'sw' ? 'Wasifu' : 'Profile', icon: User },
    { id: 'password', label: language === 'sw' ? 'Nenosiri' : 'Password', icon: Lock },
    { id: 'notifications', label: language === 'sw' ? 'Arifa' : 'Notifications', icon: Bell },
    { id: 'appearance', label: language === 'sw' ? 'Muonekano' : 'Appearance', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-xl">K</span>
                </div>
                <span className="font-display font-bold text-lg text-foreground">KOKOTOA</span>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{user?.store_name || 'My Store'}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Button variant={language === 'sw' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('sw')} className={language === 'sw' ? 'flex-1 btn-kokotoa' : 'flex-1'}>🇹🇿 SW</Button>
              <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')} className={language === 'en' ? 'flex-1 btn-kokotoa' : 'flex-1'}>🇬🇧 EN</Button>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span>{language === 'sw' ? 'Ondoka' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {language === 'sw' ? 'Mipangilio' : 'Settings'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === 'sw' ? 'Dhibiti akaunti yako' : 'Manage your account'}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
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
        </main>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default SettingsPage;
