import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { usersApi, User } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  ShoppingCart, Package, BarChart3, Settings, LogOut, Menu, X, Home,
  Plus, Edit2, Trash2, Users as UsersIcon, Phone, Shield
} from 'lucide-react';

const Users = () => {
  const { language, setLanguage } = useLanguage();
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    role: 'STAFF',
  });

  const navItems = [
    { path: '/dashboard', icon: Home, label: language === 'sw' ? 'Dashibodi' : 'Dashboard' },
    { path: '/pos', icon: ShoppingCart, label: language === 'sw' ? 'Mauzo' : 'Sales' },
    { path: '/inventory', icon: Package, label: language === 'sw' ? 'Hesabu' : 'Inventory' },
    { path: '/reports', icon: BarChart3, label: language === 'sw' ? 'Ripoti' : 'Reports' },
    { path: '/settings', icon: Settings, label: language === 'sw' ? 'Mipangilio' : 'Settings' },
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.list();
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Imeshindwa kupata orodha ya watumiaji' : 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ first_name: '', last_name: '', phone: '', password: '', role: 'STAFF' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone.replace('+', ''),
      password: '',
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Tafadhali jaza taarifa zote' : 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!editingUser && !formData.password) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Nenosiri linahitajika kwa mtumiaji mpya' : 'Password is required for new users',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
        });
        toast({
          title: language === 'sw' ? 'Imefanikiwa!' : 'Success!',
          description: language === 'sw' ? 'Mtumiajiamesasishwa' : 'User updated successfully',
        });
      } else {
        await usersApi.add({
          phone: formData.phone,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
        });
        toast({
          title: language === 'sw' ? 'Imefanikiwa!' : 'Success!',
          description: language === 'sw' ? 'Mtumiaji mpyaameongezwa' : 'New user added successfully',
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await usersApi.delete(userToDelete.id);
      toast({
        title: language === 'sw' ? 'Imefutwa!' : 'Deleted!',
        description: language === 'sw' ? 'Mtumeiaji amefutwa' : 'User deleted successfully',
      });
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again'),
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-primary/10 text-primary';
      case 'MANAGER': return 'bg-blue-500/10 text-blue-500';
      case 'STAFF': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
            <p className="text-xs text-muted-foreground mt-2">{currentUser?.store_name || 'My Store'}</p>
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
            <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span>{language === 'sw' ? 'Ondoka' : 'Logout'}</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-foreground">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {language === 'sw' ? 'Usimamizi wa Watumiaji' : 'User Management'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw' ? `Jumla: ${users.length} watumiaji` : `Total: ${users.length} users`}
                </p>
              </div>
            </div>
            
            <Button onClick={openAddModal} className="btn-kokotoa">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'sw' ? 'Ongeza Mtumiaji' : 'Add User'}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto block" />
            </div>
          ) : users.length > 0 ? (
            <Card className="card-kokotoa">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Mtumiaji' : 'User'}</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Simu' : 'Phone'}</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Jukumu' : 'Role'}</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Hali' : 'Status'}</th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Vitendo' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold">{user.first_name[0]}{user.last_name[0]}</span>
                            </div>
                            <div>
                              <p className="font-medium">{user.first_name} {user.last_name}</p>
                              <p className="text-xs text-muted-foreground">{user.store_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{user.phone}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role_name}
                          </span>
                        </td>
                        <td className="p-4">
                          {user.is_phone_verified ? (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                              {language === 'sw' ? 'Imethibitishwa' : 'Verified'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium">
                              {language === 'sw' ? 'Haijathibitishwa' : 'Unverified'}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {user.id !== currentUser?.id && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} className="hover:bg-primary/10 hover:text-primary">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }} className="hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="card-kokotoa">
              <CardContent className="text-center py-12">
                <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {language === 'sw' ? 'Hakuna watumiaji' : 'No users found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'sw' ? 'Ongeza watumiaji wako wa kwanza' : 'Add your first users'}
                </p>
                <Button onClick={openAddModal} className="btn-kokotoa">
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'sw' ? 'Ongeza Mtumiaji' : 'Add User'}
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingUser ? (language === 'sw' ? 'Hariri Mtumiaji' : 'Edit User') : (language === 'sw' ? 'Ongeza Mtumiaji Mpya' : 'Add New User')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {language === 'sw' ? 'Jina la Kwanza' : 'First Name'}
                </label>
                <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="bg-background" required />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {language === 'sw' ? 'Jina la Mwisho' : 'Last Name'}
                </label>
                <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="bg-background" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
              </label>
              <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-background" required disabled={!!editingUser} />
            </div>

            {!editingUser && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {language === 'sw' ? 'Nenosiri' : 'Password'}
                </label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-background" required />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {language === 'sw' ? 'Jukumu' : 'Role'}
              </label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANAGER">{language === 'sw' ? 'Meneja' : 'Manager'}</SelectItem>
                  <SelectItem value="STAFF">{language === 'sw' ? 'Mfanyakazi' : 'Staff'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} className="btn-kokotoa">
              {editingUser ? (language === 'sw' ? 'Hifadhi' : 'Save') : (language === 'sw' ? 'Ongeza' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              {language === 'sw' ? 'Futa Mtumiaji?' : 'Delete User?'}
            </DialogTitle>
            <DialogDescription>
              {language === 'sw' ? 'Hatua hii haiwezi kutenduliwa.' : 'This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          
          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">{userToDelete.first_name[0]}{userToDelete.last_name[0]}</span>
                </div>
                <div>
                  <h4 className="font-semibold">{userToDelete.first_name} {userToDelete.last_name}</h4>
                  <p className="text-sm text-muted-foreground">{userToDelete.phone}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              {language === 'sw' ? 'Futa' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default Users;
