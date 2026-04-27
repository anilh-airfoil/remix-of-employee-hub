import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Lock, User, ImageIcon, Moon, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ViewingAsBanner from '@/components/layout/ViewingAsBanner';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!user?.email) return;
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      setChangingPassword(false);
      toast.error('Current password is incorrect');
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (updateError) {
      toast.error(updateError.message);
    } else {
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <ViewingAsBanner />

        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account preferences</p>
        </div>

        {/* ── ACCOUNT ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Change Name — disabled */}
            <div className="space-y-2 opacity-50 select-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Change Name</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Profile updates are managed by your administrator.</p>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <Input
                disabled
                placeholder="Your name"
                className="cursor-not-allowed"
              />
              <Button disabled size="sm" variant="outline">Save Name</Button>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Upload Profile Picture — disabled */}
            <div className="space-y-2 opacity-50 select-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Profile Picture</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Avatar updates are managed by your administrator.</p>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <Button disabled size="sm" variant="outline" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── SECURITY ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm font-medium">Change Password</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Current Password</p>
                  <div className="relative">
                    <Input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">New Password</p>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Confirm New Password</p>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  size="sm"
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {changingPassword ? 'Updating…' : 'Update Password'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── APPEARANCE ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {theme === 'dark' ? 'Dark mode is on' : 'Light mode is on'}
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
