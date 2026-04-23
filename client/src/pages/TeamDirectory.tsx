import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useUserContext } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, UserCheck, UserX } from 'lucide-react';
import ViewingAsBanner from '@/components/layout/ViewingAsBanner';

interface TeamMember {
  id: string;
  auth_id: string;
  role: string;
  status: string;
  name: string | null;
  department: string | null;
  location: string | null;
  email: string | null;
}

export default function TeamDirectory() {
  const navigate = useNavigate();
  const { setSelectedUserId } = useUserContext();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTeam() {
      setLoading(true);

      const { data: users } = await supabase
        .from('users')
        .select('id, auth_id, role, status');

      if (!users || users.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const userIds = users.map(u => u.id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, department, location, email')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profiles ?? []).map(p => [p.user_id, p])
      );

      const merged: TeamMember[] = users.map(u => {
        const p = profileMap.get(u.id);
        return {
          id: u.id,
          auth_id: u.auth_id,
          role: u.role,
          status: u.status,
          name: p?.name ?? null,
          department: p?.department ?? null,
          location: p?.location ?? null,
          email: (p as any)?.email ?? null,
        };
      });

      setMembers(merged);
      setLoading(false);
    }

    fetchTeam();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(m =>
      (m.name?.toLowerCase().includes(q)) ||
      (m.email?.toLowerCase().includes(q)) ||
      (m.department?.toLowerCase().includes(q)) ||
      (m.location?.toLowerCase().includes(q)) ||
      (m.role.toLowerCase().includes(q))
    );
  }, [members, search]);

  const activeCount = members.filter(m => m.status === 'active').length;
  const inactiveCount = members.filter(m => m.status === 'not_active').length;

  function handleViewUser(userId: string) {
    setSelectedUserId(userId);
    navigate('/profile');
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <ViewingAsBanner />
        
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">View all team members and access their profiles</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '—' : members.length}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '—' : activeCount}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <UserX className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '—' : inactiveCount}</p>
                  <p className="text-xs text-muted-foreground">Not Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap hidden sm:table-cell">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Role</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap hidden md:table-cell">Department</TableHead>
                      <TableHead className="whitespace-nowrap hidden lg:table-cell">Location</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(member => (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer"
                        onClick={() => handleViewUser(member.id)}
                      >
                        <TableCell className="font-medium whitespace-nowrap">
                          {member.name || <span className="text-muted-foreground italic">No name</span>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap hidden sm:table-cell">{member.email ?? '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="capitalize">{member.role}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant={member.status === 'active' ? 'default' : 'destructive'}
                            className="capitalize"
                          >
                            {member.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap hidden md:table-cell">{member.department ?? '—'}</TableCell>
                        <TableCell className="whitespace-nowrap hidden lg:table-cell">{member.location ?? '—'}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              handleViewUser(member.id);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
