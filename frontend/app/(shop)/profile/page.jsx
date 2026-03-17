'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, MapPin, Plus, Trash2, Eye, EyeOff, Loader2, Check, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { addressSchema } from '@/lib/validators';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import useAuth from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [addingAddress, setAddingAddress] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const profileForm = useForm({ defaultValues: { name: user?.name || '', phone: user?.phone || '' } });
  const passwordForm = useForm();
  const addressForm = useForm({ resolver: zodResolver(addressSchema) });

  const onProfileSave = async (data) => {
    setSavingProfile(true);
    await updateProfile(data);
    setSavingProfile(false);
  };

  const onPasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) { toast.error('Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      await api.patch('/users/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally { setChangingPassword(false); }
  };

  const onAddAddress = async (data) => {
    try {
      const res = await api.post('/users/addresses', data);
      setAddresses(res.data.data.addresses);
      toast.success('Address added');
      addressForm.reset();
      setAddingAddress(false);
    } catch { toast.error('Failed to add address'); }
  };

  const onDeleteAddress = async (index) => {
    try {
      const res = await api.delete(`/users/addresses/${index}`);
      setAddresses(res.data.data.addresses);
      toast.success('Address removed');
    } catch { toast.error('Failed to delete address'); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await api.patch('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Avatar updated');
    } catch { toast.error('Avatar upload failed'); }
    finally { setAvatarUploading(false); }
  };

  return (
    <div className="container-custom py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

      {/* Avatar */}
      <div className="bg-white rounded-xl border p-6 mb-6 flex items-center gap-5">
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user?.avatar?.url} />
            <AvatarFallback className="bg-primary-700 text-white text-xl">{user?.name?.slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 shadow">
            {avatarUploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Edit2 className="w-3.5 h-3.5 text-white" />}
            <input type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={avatarUploading} />
          </label>
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <Badge className="mt-1 capitalize text-xs">{user?.role}</Badge>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />Profile</TabsTrigger>
          <TabsTrigger value="password" className="gap-2"><Lock className="w-4 h-4" />Password</TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2"><MapPin className="w-4 h-4" />Addresses</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <div className="bg-white rounded-xl border p-6">
            <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input className="mt-1" {...profileForm.register('name', { required: true })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input className="mt-1" value={user?.email} disabled />
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1" {...profileForm.register('phone')} placeholder="+91 9999988888" />
              </div>
              <Button type="submit" disabled={savingProfile} className="gap-2">
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Password */}
        <TabsContent value="password">
          <div className="bg-white rounded-xl border p-6">
            <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
              {[
                { name: 'currentPassword', label: 'Current Password' },
                { name: 'newPassword', label: 'New Password' },
                { name: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ name, label }) => (
                <div key={name}>
                  <Label>{label}</Label>
                  <div className="relative mt-1">
                    <Input type={passwordVisible ? 'text' : 'password'} {...passwordForm.register(name, { required: true })} className="pr-10" />
                    <button type="button" onClick={() => setPasswordVisible(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <Button type="submit" disabled={changingPassword} className="gap-2">
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Change Password
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Addresses */}
        <TabsContent value="addresses">
          <div className="space-y-3">
            {addresses.map((addr, i) => (
              <div key={i} className="bg-white rounded-xl border p-4 flex items-start justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">{addr.fullName} {addr.isDefault && <Badge className="ml-2 text-xs">Default</Badge>}</p>
                  <p className="text-slate-500">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                  <p className="text-slate-400">{addr.phone}</p>
                </div>
                <button onClick={() => onDeleteAddress(i)} className="text-slate-300 hover:text-red-500 mt-0.5 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {!addingAddress ? (
              <Button variant="outline" className="w-full gap-2" onClick={() => setAddingAddress(true)}>
                <Plus className="w-4 h-4" />Add New Address
              </Button>
            ) : (
              <div className="bg-white rounded-xl border p-5">
                <h3 className="font-semibold text-slate-900 mb-4">New Address</h3>
                <form onSubmit={addressForm.handleSubmit(onAddAddress)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['fullName','phone','street','city','state','zipCode'].map(name => (
                    <div key={name} className={name === 'street' ? 'sm:col-span-2' : ''}>
                      <Label className="capitalize">{name.replace(/([A-Z])/g,' $1')}</Label>
                      <Input className="mt-1" {...addressForm.register(name)} />
                    </div>
                  ))}
                  <div className="sm:col-span-2 flex gap-2">
                    <Button type="submit">Save Address</Button>
                    <Button type="button" variant="outline" onClick={() => setAddingAddress(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
