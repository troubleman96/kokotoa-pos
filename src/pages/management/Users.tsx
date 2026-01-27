import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Plus, Edit2, Trash2, Users as UsersIcon, Phone, Shield
} from 'lucide-react';
import { usersApi } from '@/services/api';
import type { User } from '@/services/api';
import MathLoader from '@/components/ui/MathLoader';

const Users = () => {
  const { language } = useLanguage();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    role: 'STAFF',
  });


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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+255')) {
      if (value.startsWith('+25') || value.startsWith('+2') || value.startsWith('+')) {
        value = '+255';
      } else {
        value = '+255' + value.replace(/^\+?\d*/, '');
      }
    }
    setFormData({ ...formData, phone: value });
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ first_name: '', last_name: '', phone: '+255', password: '', role: 'STAFF' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    const phone = user.phone.startsWith('+255') ? user.phone : `+255${user.phone.replace(/^\+/, '')}`;
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: phone,
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
    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-primary/10 text-primary';
      case 'CASHIER': return 'bg-blue-500/10 text-blue-500';
      case 'STAFF': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout
      title={language === 'sw' ? 'Usimamizi wa Watumiaji' : 'User Management'}
      subtitle={language === 'sw' ? `Jumla: ${users.length} watumiaji` : `Total: ${users.length} users`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-muted-foreground hidden lg:block">
            {language === 'sw' ? 'Orodha ya Watumiaji' : 'User List'}
          </h2>
          <Button onClick={openAddModal} className="btn-kokotoa">
            <Plus className="w-4 h-4 mr-2" />
            {language === 'sw' ? 'Ongeza Mtumiaji' : 'Add User'}
          </Button>
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {isLoading ? (
            <div className="flex text-center py-12 justify-center">
              <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
            </div>
          ) : users.length > 0 ? (
            <Card className="card-kokotoa">
              <div className="space-y-4">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Mtumiaji' : 'User'}</th>
                        <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Simu' : 'Phone'}</th>
                        <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Jukumu' : 'Role'}</th>
                        <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Hali' : 'Status'}</th>
                        <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider text-center">{language === 'sw' ? 'Vitendo' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {users.map((user) => (
                        <tr key={user.id} className="group hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-primary font-bold text-sm tracking-tighter">{user.first_name[0]}{user.last_name[0]}</span>
                              </div>
                              <div>
                                <p className="font-bold text-foreground text-sm leading-none mb-1">{user.first_name} {user.last_name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{user.store_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-medium text-muted-foreground font-mono">{user.phone}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                              {user.role_name}
                            </span>
                          </td>
                          <td className="p-4">
                            {user.is_phone_verified ? (
                              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {language === 'sw' ? 'Imethibitishwa' : 'Verified'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {language === 'sw' ? 'Haijathibitishwa' : 'Unverified'}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              {user.id !== currentUser?.id && (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
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

                {/* Mobile View */}
                <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 rounded-xl border border-border bg-card/50 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <span className="text-primary font-bold text-base">{user.first_name[0]}{user.last_name[0]}</span>
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{user.first_name} {user.last_name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{user.store_name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getRoleBadgeColor(user.role)}`}>
                            {user.role_name}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                        <div>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{language === 'sw' ? 'SIMU' : 'PHONE'}</p>
                          <p className="text-sm font-mono font-medium text-foreground">{user.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{language === 'sw' ? 'HALI' : 'STATUS'}</p>
                          {user.is_phone_verified ? (
                            <span className="text-emerald-500 font-bold text-xs uppercase tracking-tight">{language === 'sw' ? 'Imethibitishwa' : 'Verified'}</span>
                          ) : (
                            <span className="text-amber-500 font-bold text-xs uppercase tracking-tight">{language === 'sw' ? 'Haijathibitishwa' : 'Unverified'}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {user.id !== currentUser?.id && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-9 px-4 bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 text-[10px] font-bold uppercase tracking-wider"
                              onClick={() => openEditModal(user)}
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-2" />
                              {language === 'sw' ? 'HARIRI' : 'EDIT'}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-9 px-4 bg-destructive/5 text-destructive border-destructive/10 hover:bg-destructive/10 text-[10px] font-bold uppercase tracking-wider"
                              onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              {language === 'sw' ? 'FUTA' : 'DELETE'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
              <Input type="tel" value={formData.phone} onChange={handlePhoneChange} className="bg-background" required disabled={!!editingUser} />
              <p className="text-[10px] text-muted-foreground mt-1">
                {language === 'sw' ? 'Hakikisha unaanza na +255' : 'Make sure to start with +255'}
              </p>
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
                  <SelectItem value="CASHIER">{language === 'sw' ? 'Mhasibu' : 'Cashier'}</SelectItem>
                  <SelectItem value="STAFF">{language === 'sw' ? 'Mfanyakazi' : 'Staff'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} className="btn-kokotoa" isLoading={isLoading}>
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
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="relative"
            >
              {isDeleting ? (
                <>
                  <Plus className="w-4 h-4 mr-2 animate-spin rotate-45" />
                  {language === 'sw' ? 'Inafuta...' : 'Deleting...'}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === 'sw' ? 'Futa' : 'Delete'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Users;
