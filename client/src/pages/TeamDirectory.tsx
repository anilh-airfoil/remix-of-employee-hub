import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Users, UserCheck, UserX, X, ChevronDown, User, Receipt } from 'lucide-react';
import ViewingAsBanner from '@/components/layout/ViewingAsBanner';
import { useIsAdmin } from '@/hooks/useRoles';

// Session storage key for preserving list state
const STATE_KEY = 'teamdir_state';

interface TeamMember {
  id: string;
  auth_id: string;
  role: string;
  status: string;
  name: string | null;
  department: string | null;
  contract_type: string | null;
  email: string | null;
}

type StatusFilter = 'all' | 'active' | 'not_active';

export default function TeamDirectory() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [scrollRestored, setScrollRestored] = useState(false);

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

      const [{ data: profiles }, { data: compensations }] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, name, department, email')
          .in('user_id', userIds),
        supabase
          .from('compensation')
          .select('user_id, contract_type')
          .in('user_id', userIds),
      ]);

      const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]));
      const compMap = new Map((compensations ?? []).map(c => [c.user_id, c]));

      const merged: TeamMember[] = users.map(u => {
        const p = profileMap.get(u.id);
        const c = compMap.get(u.id);
        return {
          id: u.id,
          auth_id: u.auth_id,
          role: u.role,
          status: u.status,
          name: p?.name ?? null,
          department: p?.department ?? null,
          contract_type: (c as any)?.contract_type ?? null,
          email: (p as any)?.email ?? null,
        };
      });

      setMembers(merged);
      setLoading(false);
    }

    fetchTeam();
  }, []);

  // Restore scroll position and filter state after data loads
  useEffect(() => {
    if (!loading && members.length > 0 && !scrollRestored) {
      try {
        const saved = sessionStorage.getItem(STATE_KEY);
        if (saved) {
          const { search: savedSearch, statusFilter: savedFilter, scrollY } = JSON.parse(saved);
          if (savedSearch !== undefined) setSearch(savedSearch);
          if (savedFilter !== undefined) setStatusFilter(savedFilter as StatusFilter);
          sessionStorage.removeItem(STATE_KEY);
          // Restore scroll after a tick to allow render
          requestAnimationFrame(() => {
            window.scrollTo({ top: scrollY ?? 0, behavior: 'instant' });
          });
        }
      } catch {
        // ignore parse errors
      }
      setScrollRestored(true);
    }
  }, [loading, members, scrollRestored]);

  const filtered = useMemo(() => {
    let result = members;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(m => m.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        (m.name?.toLowerCase().includes(q)) ||
        (m.email?.toLowerCase().includes(q)) ||
        (m.department?.toLowerCase().includes(q)) ||
        (m.contract_type?.toLowerCase().includes(q)) ||
        (m.role.toLowerCase().includes(q))
      );
    }

    // Alphabetical sort A–Z, nulls/empty to end
    return result.sort((a, b) =>
      (a.name ?? '\uFFFF').localeCompare(b.name ?? '\uFFFF')
    );
  }, [members, search, statusFilter]);

  const activeCount = members.filter(m => m.status === 'active').length;
  const inactiveCount = members.filter(m => m.status === 'not_active').length;

  function saveState() {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({
      search,
      statusFilter,
      scrollY: window.scrollY,
    }));
  }

  function handleViewProfile(userId: string) {
    saveState();
    navigate(`/profile?userId=${userId}`);
  }

  function handleViewReimbursements(userId: string) {
    saveState();
    navigate(`/reimbursements?user_id=${userId}`);
  }

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Not Active', value: 'not_active' },
  ];

  const isAdminOrOwner = useIsAdmin();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <ViewingAsBanner />
        {/* isAdminOrOwner used to conditionally show dropdown vs plain View */}

        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">View all team members and access their profiles</p>
        </div>

        {/* Stats cards */}
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

        {/* Search + Status filter row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`pl-9 w-full ${search ? 'pr-9' : ''}`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {filterButtons.map(btn => (
              <Button
                key={btn.value}
                size="sm"
                variant={statusFilter === btn.value ? 'default' : 'outline'}
                onClick={() => setStatusFilter(btn.value)}
                className="text-xs"
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
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
                      <TableHead className="whitespace-nowrap hidden lg:table-cell">Contract Type</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(member => (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer"
                        onClick={() => handleViewProfile(member.id)}
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
                            {member.status === 'active' ? 'Active' : 'Not Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap hidden md:table-cell">{member.department ?? '—'}</TableCell>
                        <TableCell className="whitespace-nowrap hidden lg:table-cell capitalize">{member.contract_type ?? '—'}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {isAdminOrOwner ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={e => e.stopPropagation()}
                                >
                                  View <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer"
                                  onClick={e => { e.stopPropagation(); handleViewProfile(member.id); }}
                                >
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer"
                                  onClick={e => { e.stopPropagation(); handleViewReimbursements(member.id); }}
                                >
                                  <Receipt className="h-4 w-4 text-muted-foreground" />
                                  Reimbursements
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => { e.stopPropagation(); handleViewProfile(member.id); }}
                            >
                              View
                            </Button>
                          )}
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
