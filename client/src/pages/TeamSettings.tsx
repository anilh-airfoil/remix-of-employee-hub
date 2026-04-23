import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Users, User, UserPlus } from 'lucide-react';
import ViewingAsBanner from '@/components/layout/ViewingAsBanner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type AppRole = 'owner' | 'admin' | 'member';

interface Member {
  id: string;
  role: AppRole;
  status: string;
  name: string | null;
  email: string | null;
}

const roles = [
  {
    name: 'Owner',
    icon: Shield,
    variant: 'default' as const,
    permissions: [
      'Full system access',
      'View all user profiles, reimbursements, and reviews',
      'Access Team Directory and Team Settings',
      'Manage team member roles',
    ],
  },
  {
    name: 'Admin',
    icon: Users,
    variant: 'secondary' as const,
    permissions: [
      'View all user profiles, reimbursements, and reviews',
      'Access Team Directory and Team Settings',
      'Manage team member roles',
    ],
  },
  {
    name: 'Member',
    icon: User,
    variant: 'outline' as const,
    permissions: [
      'View own profile',
      'View own reimbursements',
      'View own reviews',
      'Edit own name',
    ],
  },
];

export default function TeamSettings() {
  const { dbUserId, role: currentRole } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollPassword, setEnrollPassword] = useState('');
  const [enrollRole, setEnrollRole] = useState<AppRole>('member');
  const [enrolling, setEnrolling] = useState(false);

  const canManage = currentRole === 'admin' || currentRole === 'owner';

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollEmail || !enrollPassword) {
      toast({ title: 'Missing fields', description: 'Email and password are required.', variant: 'destructive' });
      return;
    }
    if (enrollPassword.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setEnrolling(true);
    const { data, error } = await supabase.functions.invoke('enroll-member', {
      body: { email: enrollEmail, password: enrollPassword, name: enrollName, role: enrollRole },
    });
    setEnrolling(false);
    if (error || (data && (data as any).error)) {
      const msg = (data as any)?.error || error?.message || 'Failed to enroll member';
      toast({ title: 'Enrollment failed', description: msg, variant: 'destructive' });
      return;
    }
    toast({ title: 'Member enrolled', description: `${enrollEmail} can now sign in.` });
    setEnrollName('');
    setEnrollEmail('');
    setEnrollPassword('');
    setEnrollRole('member');
    fetchMembers();
  }

  async function fetchMembers() {
    setLoading(true);
    const { data: users } = await supabase
      .from('users')
      .select('id, role, status');

    if (!users) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const ids = users.map(u => u.id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, email')
      .in('user_id', ids);

    const map = new Map((profiles ?? []).map(p => [p.user_id, p]));
    setMembers(users.map(u => ({
      id: u.id,
      role: u.role as AppRole,
      status: u.status,
      name: map.get(u.id)?.name ?? null,
      email: map.get(u.id)?.email ?? null,
    })));
    setLoading(false);
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  async function handleRoleChange(memberId: string, newRole: AppRole) {
    setUpdatingId(memberId);
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      toast({ title: 'Failed to update role', description: error.message, variant: 'destructive' });
    } else {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      toast({ title: 'Role updated', description: `Member is now ${newRole}.` });
    }
    setUpdatingId(null);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <ViewingAsBanner />

        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Team Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Role definitions and team member access management
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <role.icon className="h-4 w-4 text-muted-foreground" />
                  {role.name}
                  <Badge variant={role.variant} className="ml-auto text-xs capitalize">
                    {role.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.permissions.map((perm, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {canManage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                Enroll New Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEnroll} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="enroll-name">Name</Label>
                  <Input id="enroll-name" value={enrollName} onChange={e => setEnrollName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enroll-email">Email *</Label>
                  <Input id="enroll-email" type="email" required value={enrollEmail} onChange={e => setEnrollEmail(e.target.value)} placeholder="jane@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enroll-password">First-time Password *</Label>
                  <Input id="enroll-password" type="text" required minLength={6} value={enrollPassword} onChange={e => setEnrollPassword(e.target.value)} placeholder="At least 6 characters" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enroll-role">Role</Label>
                  <Select value={enrollRole} onValueChange={(v) => setEnrollRole(v as AppRole)}>
                    <SelectTrigger id="enroll-role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {currentRole === 'owner' && <SelectItem value="owner">Owner</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" disabled={enrolling}>
                    {enrolling ? 'Enrolling...' : 'Enroll Member'}
                  </Button>
                </div>
              </form>
              <p className="text-xs text-muted-foreground mt-3">
                The new member can sign in immediately with this email and password. Share these credentials securely.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage Member Roles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : members.length === 0 ? (
              <div className="p-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">No team members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[180px]">Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map(m => {
                      const isSelf = m.id === dbUserId;
                      const canEdit = !isSelf && currentRole !== null && (currentRole === 'owner' || (currentRole === 'admin' && m.role !== 'owner'));
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {m.name || <span className="text-muted-foreground italic">No name</span>}
                            {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell whitespace-nowrap">{m.email ?? '—'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={m.status === 'active' ? 'default' : 'destructive'}
                              className="capitalize"
                            >
                              {m.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {canEdit ? (
                              <Select
                                value={m.role}
                                disabled={updatingId === m.id}
                                onValueChange={(v) => handleRoleChange(m.id, v as AppRole)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  {currentRole === 'owner' && (
                                    <SelectItem value="owner">Owner</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="capitalize">{m.role}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              You cannot change your own role. Admins can promote members to admin but cannot change owners. Only owners can assign the owner role.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
