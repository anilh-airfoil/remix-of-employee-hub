// Phase 8.1 — Reimbursement Page UI Placeholder
// Static sample data only. No Supabase connection yet.
// Design: matches HRHub dashboard card/badge/table language.

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  RefreshCw,
  CreditCard,
  Info,
  Paperclip,
  Wifi,
  Dumbbell,
  Heart,
  Building2,
  ExternalLink,
} from 'lucide-react';

// ─── Static placeholder data ───────────────────────────────────────────────

const TALLY_FORM_URL = 'https://tally.so';

const MONTHS = [
  'January 2026', 'February 2026', 'March 2026', 'April 2026',
  'May 2026', 'June 2026',
];

const summaryCards = [
  {
    label: 'Monthly Flex Cap',
    value: '$300.00',
    helper: 'Your total monthly flex allowance',
    icon: DollarSign,
    color: 'text-blue-500',
  },
  {
    label: 'Approved This Month',
    value: '$164.50',
    helper: 'Flex claims approved in April',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  {
    label: 'Pending Review',
    value: '$82.00',
    helper: 'Awaiting admin approval',
    icon: Clock,
    color: 'text-amber-500',
  },
  {
    label: 'Off-Cycle Owed',
    value: '$25.00',
    helper: 'Processed outside regular payout',
    icon: RefreshCw,
    color: 'text-purple-500',
  },
  {
    label: 'Total Paid',
    value: '$271.00',
    helper: 'Cumulative payouts received',
    icon: CreditCard,
    color: 'text-teal-500',
  },
];

const flexBreakdown = [
  { category: 'Internet', icon: Wifi, amount: 30.0 },
  { category: 'Gym', icon: Dumbbell, amount: 45.0 },
  { category: 'Health', icon: Heart, amount: 20.0 },
  { category: 'Co-Working', icon: Building2, amount: 69.5 },
];

const flexUsed = 164.5;
const flexCap = 300.0;
const flexRemaining = flexCap - flexUsed;
const flexPct = Math.round((flexUsed / flexCap) * 100);

const standaloneClaims = [
  { name: 'Midjourney', amount: '$10.00', status: 'Approved' },
  { name: 'Travel', amount: '$120.00', status: 'Pending' },
  { name: 'Client Expense Claim', amount: '$45.00', status: 'Approved' },
  { name: 'Crypto Stipend', amount: '$60.00', status: 'Approved' },
];

const historyRows = [
  {
    date: 'Apr 23, 2026',
    category: 'Internet',
    description: 'Monthly home internet',
    amount: '$30.00',
    status: 'Approved',
    payout: 'Apr 2026',
    method: 'MuralPay',
    receipt: 'internet_apr.pdf',
  },
  {
    date: 'Apr 21, 2026',
    category: 'Gym',
    description: 'April membership',
    amount: '$45.00',
    status: 'Approved',
    payout: 'Apr 2026',
    method: 'MuralPay',
    receipt: 'gym_apr_receipt.jpg',
  },
  {
    date: 'Apr 18, 2026',
    category: 'Health',
    description: 'Massage claim',
    amount: '$37.00',
    status: 'Pending Review',
    payout: 'May 2026',
    method: 'Rippling',
    receipt: 'massage_receipt.pdf',
  },
  {
    date: 'Apr 15, 2026',
    category: 'Co-Working',
    description: 'WeWork day pass',
    amount: '$32.50',
    status: 'Approved',
    payout: 'Apr 2026',
    method: 'MuralPay',
    receipt: 'wework_apr15.pdf',
  },
  {
    date: 'Apr 10, 2026',
    category: 'Travel',
    description: 'Client meeting taxi',
    amount: '$120.00',
    status: 'Pending',
    payout: 'May 2026',
    method: 'Rippling',
    receipt: 'taxi_receipt.pdf',
  },
];

// ─── Status badge helper ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'Approved') {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
        Approved
      </Badge>
    );
  }
  if (status === 'Pending Review') {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
        Pending Review
      </Badge>
    );
  }
  if (status === 'Pending') {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
        Pending
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

// ─── Page component ─────────────────────────────────────────────────────────

export default function Reimbursements() {
  const [selectedMonth, setSelectedMonth] = useState('April 2026');

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── 1. Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">Reimbursements</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your submissions, payout status, and monthly flex usage.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" asChild>
              <a href={TALLY_FORM_URL} target="_blank" rel="noopener noreferrer">
                Submit Reimbursement
              </a>
            </Button>
          </div>
        </div>

        {/* ── 2. Summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${card.color}`} />
                    <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                  </div>
                  <p className="text-xl font-semibold font-heading tracking-tight">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.helper}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── 3. Cut-off banner ── */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Submission cut-off: 25th.</strong> Submission after 25th will be processed as off-cycle and paid along next regular payout.
          </span>
        </div>

        {/* ── 4 & 5. Flex Breakdown + Standalone Claims ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Flex Breakdown */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{selectedMonth} Flex Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">${flexUsed.toFixed(2)} / ${flexCap.toFixed(2)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${flexPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{flexPct}% used</span>
                  <span>${flexRemaining.toFixed(2)} remaining</span>
                </div>
              </div>

              <div className="divide-y divide-border">
                {flexBreakdown.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.category} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{row.category}</span>
                      </div>
                      <span className="text-sm font-medium">${row.amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Standalone Claims */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Standalone Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {standaloneClaims.map((claim) => (
                  <div key={claim.name} className="flex items-center justify-between py-2.5">
                    <span className="text-sm">{claim.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{claim.amount}</span>
                      <StatusBadge status={claim.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── 6. Submission History table ── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Submission History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payout Month</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead className="pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyRows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6 text-sm text-muted-foreground whitespace-nowrap">{row.date}</TableCell>
                      <TableCell className="text-sm">{row.category}</TableCell>
                      <TableCell className="text-sm">{row.description}</TableCell>
                      <TableCell className="text-sm font-medium">{row.amount}</TableCell>
                      <TableCell><StatusBadge status={row.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.payout}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.method}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{row.receipt}</span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ── 7. Footer note ── */}
        <p className="text-center text-xs text-muted-foreground pb-2">
          Your data is secure and private.{' '}
          Need help?{' '}
          <span className="font-medium text-foreground">Contact Airfoil Operations Team</span>
        </p>

      </div>
    </DashboardLayout>
  );
}
