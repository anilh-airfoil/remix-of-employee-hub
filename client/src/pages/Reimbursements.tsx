import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCurrentUserId } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ExternalLink, DollarSign, Calendar, FileText } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import ViewingAsBanner from '@/components/layout/ViewingAsBanner';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function billingLabel(month: number, year: number) {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `26 ${MONTHS[prevMonth - 1].slice(0, 3)} ${prevYear} – 25 ${MONTHS[month - 1].slice(0, 3)} ${year}`;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  approved: 'default',
  pending: 'secondary',
  rejected: 'destructive',
};

export default function Reimbursements() {
  const navigate = useNavigate();
  const userId = useCurrentUserId();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [reimbursement, setReimbursement] = useState<Tables<'reimbursements'> | null>(null);
  const [receipts, setReceipts] = useState<Tables<'receipts'>[]>([]);
  const [history, setHistory] = useState<{ month: number; year: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      const { data: reimb } = await supabase
        .from('reimbursements')
        .select('*')
        .eq('user_id', userId as string)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      let recs: Tables<'receipts'>[] = [];
      if (reimb) {
        const { data } = await supabase
          .from('receipts')
          .select('*')
          .eq('reimbursement_id', reimb.id)
          .order('date', { ascending: false });
        recs = data ?? [];
      }
      if (!cancelled) {
        setReimbursement(reimb);
        setReceipts(recs);
        setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [userId, month, year]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('reimbursements')
      .select('month, year')
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .then(({ data }) => {
        setHistory((data ?? []).map(d => ({ month: d.month, year: d.year })));
      });
  }, [userId]);

  const used = useMemo(
    () => receipts.filter(r => r.status !== 'rejected').reduce((s, r) => s + Number(r.amount), 0),
    [receipts]
  );
  const cap = Number(reimbursement?.cap ?? 0);
  const remaining = Math.max(cap - used, 0);
  const pct = cap > 0 ? Math.min((used / cap) * 100, 100) : 0;
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <ViewingAsBanner />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" className="mb-1 -ml-2 gap-1 w-fit" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4" /> Back to Profile
            </Button>
            <h1 className="text-2xl font-heading font-bold tracking-tight">Reimbursements</h1>
          </div>
          <Button variant="outline" className="gap-2 w-full sm:w-auto" asChild>
            <a href="https://tally.so" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Submit Reimbursement
            </a>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Billing Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                  <div className="space-y-1 flex-1 w-full sm:w-auto">
                    <label className="text-xs text-muted-foreground">Month</label>
                    <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 w-full sm:w-auto">
                    <label className="text-xs text-muted-foreground">Year</label>
                    <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
                      <SelectTrigger className="w-full sm:w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {years.map(y => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {billingLabel(month, year)}
                </p>
              </CardContent>
            </Card>

            {loading ? (
              <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ) : !reimbursement ? (
              <Card><CardContent className="pt-6 py-8 text-center"><p className="text-sm text-muted-foreground">No reimbursement record for this period</p></CardContent></Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      Summary
                    </span>
                    {cap > 0 && <Badge variant="outline" className="ml-auto text-xs">Cap: {formatCurrency(cap)}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cap > 0 && <Progress value={pct} className="h-2" />}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold">{formatCurrency(used)}</p>
                      <p className="text-xs text-muted-foreground">Used</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{formatCurrency(remaining)}</p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{formatCurrency(cap)}</p>
                      <p className="text-xs text-muted-foreground">Monthly Cap</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Receipts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : receipts.length === 0 ? (
                  <div className="p-6 py-8 text-center"><p className="text-sm text-muted-foreground">No receipts for this period</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Date</TableHead>
                          <TableHead className="whitespace-nowrap">Category</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                          <TableHead className="whitespace-nowrap">Attachment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receipts.map(r => (
                          <TableRow key={r.id}>
                            <TableCell className="whitespace-nowrap">{formatDate(r.date)}</TableCell>
                            <TableCell className="capitalize whitespace-nowrap">{r.category}</TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">{formatCurrency(Number(r.amount))}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant={statusVariant[r.status] ?? 'outline'} className="capitalize">{r.status}</Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {r.attachment_url ? (
                                <a href={r.attachment_url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" className="gap-1 h-7">
                                    <ExternalLink className="h-3 w-3" /> View
                                  </Button>
                                </a>
                              ) : '—'}
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

          <Card className="lg:w-48 shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">History</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">No history</p>
              ) : (
                <div className="space-y-1">
                  {history.map(h => {
                    const active = h.month === month && h.year === year;
                    return (
                      <Button
                        key={`${h.year}-${h.month}`}
                        variant={active ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => { setMonth(h.month); setYear(h.year); }}
                      >
                        {MONTHS[h.month - 1].slice(0, 3)} {h.year}
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
