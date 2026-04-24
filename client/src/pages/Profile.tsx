import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserContext } from '@/contexts/UserContext';
import { useProfileData } from '@/hooks/useProfileData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FileText, ExternalLink, Calendar, Shield, Briefcase, User, Star, Lock, Eye, EyeOff, Mail, MapPin, DollarSign, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ViewingAsBanner from '@/components/layout/ViewingAsBanner';

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? '—'}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground py-4">{message}</p>;
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/5" />
    </div>
  );
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount: number | null | undefined, currency?: string) {
  if (amount == null) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, status: ownStatus, dbUserId, loading: authLoading, role } = useAuth();
  const { isViewingSelf } = useUserContext();
  const { profile, employment, compensation, benefits, documents, latestReview, userStatus, loading, error, isViewingOtherViaParam } = useProfileData();
  const isEffectivelyViewingSelf = isViewingSelf && !isViewingOtherViaParam;
  const status = isEffectivelyViewingSelf ? ownStatus : userStatus;

  // Password change (only remaining editable action)
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
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <ViewingAsBanner />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {authLoading ? 'Loading...' : isEffectivelyViewingSelf ? 'Your personal and employment details' : "Viewing another user's profile"}
            </p>
          </div>
          {(role === 'owner' || role === 'admin') && !isEffectivelyViewingSelf && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/team')}
              className="flex items-center gap-1.5 flex-shrink-0 mt-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Team Directory
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load profile data: {error}
          </div>
        )}

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
          {/* Personal Profile Card — Identity + Details */}
          <Card className="sm:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Personal Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <SectionSkeleton /> : !profile ? (
                <EmptyState message="No profile data available" />
              ) : (
                <div className="space-y-6">
                  {/* ── IDENTITY BLOCK ── */}
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Avatar — display only, no upload */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.name ?? 'Avatar'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-semibold text-muted-foreground select-none">
                            {getInitials(profile.name)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Identity info */}
                    <div className="flex-1 space-y-3 min-w-0">
                      {/* Row 1: Name + AF ID | Manager */}
                      <div className="grid grid-cols-2 gap-4 items-start">
                        {/* Name + AF ID — read-only */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Name</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{profile.name ?? '—'}</p>
                            {profile.af_id && (
                              <Badge variant="secondary" className="font-mono text-xs shrink-0">
                                {profile.af_id}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* Manager — read-only */}
                        <Field label="Manager" value={profile.manager} />
                      </div>
                      {/* Row 2: Role Title + Department */}
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Role Title" value={profile.role_title} />
                        <Field label="Department" value={profile.department} />
                      </div>
                    </div>
                  </div>

                  {/* ── DETAILS BLOCK ── */}
                  <div className="border-t pt-5 space-y-5">
                    {/* Contact group */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Contact
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Work Email" value={profile.email ?? (isEffectivelyViewingSelf ? user?.email : null)} />
                        <Field label="Personal Email" value={profile.personal_email} />
                      </div>
                    </div>

                    {/* Location group */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> Location
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Location" value={profile.location} />
                        <Field label="Home Address" value={profile.home_address} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Compensation & Work Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <SectionSkeleton /> : !compensation ? (
                <EmptyState message="No compensation data available" />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Monthly Rate" value={formatCurrency(compensation.monthly_rate, compensation.currency)} />
                  <Field label="Hourly Rate" value={formatCurrency(compensation.hourly_rate, compensation.currency)} />
                  <Field label="Guaranteed Hours" value={compensation.guaranteed_hours} />
                  <Field label="Currency" value={compensation.currency} />
                  <Field label="Contract Type" value={compensation.contract_type_label ?? compensation.contract_type?.replace('_', ' ')} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Employment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <SectionSkeleton /> : !employment ? (
                <EmptyState message="No employment data available" />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={status === 'active' ? 'default' : 'destructive'} className="capitalize w-fit">
                      {status?.replace('_', ' ') ?? '—'}
                    </Badge>
                  </div>
                  <Field label="Employment Type" value={employment.employee_type_label ?? employment.type?.replace('_', ' ')} />
                  <Field label="Start Date" value={formatDate(employment.start_date)} />
                  <Field label="End Date" value={formatDate(employment.end_date)} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Flex & Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <SectionSkeleton /> : !benefits ? (
              <EmptyState message="No benefits data available" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Flex Cap" value={formatCurrency(benefits.flex_cap)} />
                <Field label="Crypto Stipend" value={formatCurrency(benefits.crypto_stipend)} />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Reimbursement Eligible</p>
                  <Badge variant={benefits.reimbursement_eligible ? 'default' : 'secondary'} className="w-fit">
                    {benefits.reimbursement_eligible ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <Field label="Equipment Status" value={benefits.equipment_status} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <SectionSkeleton /> : documents.length === 0 ? (
              <EmptyState message="No documents uploaded" />
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium capitalize">{doc.type}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="self-start sm:self-auto">
                      <Button variant="ghost" size="sm" className="gap-1 w-full sm:w-auto">
                        <ExternalLink className="h-3 w-3" /> View
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              Performance & Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <SectionSkeleton /> : !latestReview ? (
              <EmptyState message="No review data available" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Title" value={latestReview.title} />
                <Field label="Reviewer" value={latestReview.reviewer} />
                <Field label="Next Review Date" value={formatDate(latestReview.review_date)} />
                <Field label="Completed" value={formatDate(latestReview.completed_date)} />
                {latestReview.summary && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Summary</p>
                    <p className="text-sm">{latestReview.summary}</p>
                  </div>
                )}
                {latestReview.meeting_link && (
                  <div className="col-span-2">
                    <a href={latestReview.meeting_link} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Calendar className="h-3 w-3" /> Meeting Link
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isEffectivelyViewingSelf && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Current Password</p>
                  <div className="relative">
                    <Input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-9 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">New Password</p>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9"
                    placeholder="At least 6 characters"
                    minLength={6}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Confirm New Password</p>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9"
                    placeholder="Re-enter new password"
                    minLength={6}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    size="sm"
                    onClick={handleChangePassword}
                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
