// Phase 8.1 — Reimbursement Page UI (reference-matched layout)
// Static sample data only. No Supabase connection yet.
// Icons: colored circle backgrounds per reference image.
// Status badges: inline with amount on right side.
// Block layout: summary cards row → banner → flex+standalone side-by-side → history table → footer.

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
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
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle2,
  Info,
  Paperclip,
  Wifi,
  Dumbbell,
  Heart,
  Monitor,
  Plane,
  Receipt,
  CircleDollarSign,
  Image,
  Calendar,
  Upload,
  Lock,
} from 'lucide-react';

// ─── Static placeholder data ───────────────────────────────────────────────

const TALLY_FORM_URL = 'https://tally.so';

const MONTHS = [
  'January 2026', 'February 2026', 'March 2026', 'April 2026',
  'May 2026', 'June 2026',
];

// Summary cards — icon, bg color, text color match reference
const summaryCards = [
  {
    label: 'Monthly Flex Cap',
    value: '$300.00',
    helper: 'Your monthly allowance',
    icon: DollarSign,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Approved This Month',
    value: '$164.50',
    helper: 'Total approved amount',
    icon: TrendingUp,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-500',
  },
  {
    label: 'Pending Review',
    value: '$82.00',
    helper: 'Awaiting approval',
    icon: Clock,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-500',
  },
  {
    label: 'Off-Cycle Owed',
    value: '$25.00',
    helper: 'To be paid off-cycle',
    icon: RefreshCw,
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-500',
  },
  {
    label: 'Total Paid',
    value: '$271.00',
    helper: 'Paid this month to date',
    icon: CheckCircle2,
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconColor: 'text-teal-500',
  },
];

// Flex breakdown — each category has a colored icon circle
const flexBreakdown = [
  { category: 'Internet', icon: Wifi,    iconBg: 'bg-blue-100 dark:bg-blue-900/40',   iconColor: 'text-blue-500',   amount: 30.0 },
  { category: 'Gym',      icon: Dumbbell, iconBg: 'bg-green-100 dark:bg-green-900/40', iconColor: 'text-green-500',  amount: 45.0 },
  { category: 'Health',   icon: Heart,   iconBg: 'bg-red-100 dark:bg-red-900/40',     iconColor: 'text-red-500',    amount: 20.0 },
  { category: 'Co-Working', icon: Monitor, iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-500', amount: 69.5 },
];

const flexUsed = 164.5;
const flexCap = 300.0;
const flexRemaining = flexCap - flexUsed;
const flexPct = Math.round((flexUsed / flexCap) * 100);

// Standalone claims — icon per category
const standaloneClaims = [
  { name: 'Midjourney',           icon: Image,           iconBg: 'bg-slate-100 dark:bg-slate-800',    iconColor: 'text-slate-500',   amount: '$10.00',  status: 'Approved' },
  { name: 'Travel',               icon: Plane,           iconBg: 'bg-blue-100 dark:bg-blue-900/40',   iconColor: 'text-blue-500',    amount: '$120.00', status: 'Pending' },
  { name: 'Client Expense Claim', icon: Receipt,         iconBg: 'bg-slate-100 dark:bg-slate-800',    iconColor: 'text-slate-500',   amount: '$45.00',  status: 'Approved' },
  { name: 'Crypto Stipend',       icon: CircleDollarSign, iconBg: 'bg-slate-100 dark:bg-slate-800',   iconColor: 'text-slate-500',   amount: '$60.00',  status: 'Approved' },
];

// History table — category icon mapping
const categoryIcon: Record<string, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  Internet:    { icon: Wifi,     iconBg: 'bg-blue-100 dark:bg-blue-900/40',    iconColor: 'text-blue-500' },
  Gym:         { icon: Dumbbell, iconBg: 'bg-green-100 dark:bg-green-900/40',  iconColor: 'text-green-500' },
  Health:      { icon: Heart,    iconBg: 'bg-red-100 dark:bg-red-900/40',      iconColor: 'text-red-500' },
  'Co-Working': { icon: Monitor, iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-500' },
  Travel:      { icon: Plane,    iconBg: 'bg-blue-100 dark:bg-blue-900/40',    iconColor: 'text-blue-500' },
};

const historyRows = [
  { date: 'Apr 23, 2026', category: 'Internet',    description: 'Monthly home internet', amount: '$30.00',  status: 'Approved',      payout: 'Apr 2026', method: 'MuralPay', receipt: 'internet_apr.pdf' },
  { date: 'Apr 21, 2026', category: 'Gym',         description: 'April membership',      amount: '$45.00',  status: 'Approved',      payout: 'Apr 2026', method: 'MuralPay', receipt: 'gym_apr_receipt.jpg' },
  { date: 'Apr 18, 2026', category: 'Health',      description: 'Massage claim',         amount: '$37.00',  status: 'Pending Review', payout: 'May 2026', method: 'Rippling', receipt: 'massage_receipt.pdf' },
  { date: 'Apr 15, 2026', category: 'Co-Working',  description: 'WeWork day pass',       amount: '$32.50',  status: 'Approved',      payout: 'Apr 2026', method: 'MuralPay', receipt: 'wework_apr15.pdf' },
  { date: 'Apr 10, 2026', category: 'Travel',      description: 'Client meeting taxi',   amount: '$120.00', status: 'Pending',       payout: 'May 2026', method: 'Rippling', receipt: 'taxi_receipt.pdf' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function IconCircle({ icon: Icon, bg, color, size = 'sm' }: { icon: React.ElementType; bg: string; color: string; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-11 h-11' : 'w-8 h-8';
  const iconDim = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <span className={`inline-flex items-center justify-center ${dim} rounded-full flex-shrink-0 ${bg}`}>
      <Icon className={`${iconDim} ${color}`} />
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Approved') {
    return <Badge className="bg-green-500 hover:bg-green-500 text-white border-0 font-medium px-2.5">Approved</Badge>;
  }
  if (status === 'Pending Review' || status === 'Pending') {
    return <Badge className="bg-blue-500 hover:bg-blue-500 text-white border-0 font-medium px-2.5">Pending</Badge>;
  }
  if (status === 'Rejected') {
    return <Badge className="bg-red-500 hover:bg-red-500 text-white border-0 font-medium px-2.5">Rejected</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function Reimbursements() {
  const [selectedMonth, setSelectedMonth] = useState('April 2026');

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-5">

        {/* ── 1. Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">Reimbursements</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Track your submissions, payout status, and monthly flex usage.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Month selector styled like reference: calendar icon + dropdown */}
            <div className="flex items-center gap-1.5 border border-border rounded-md px-3 h-9 bg-background">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="border-0 shadow-none h-auto p-0 text-sm w-32 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="gap-1.5" asChild>
              <a href={TALLY_FORM_URL} target="_blank" rel="noopener noreferrer">
                <Upload className="h-3.5 w-3.5" />
                Submit Reimbursement
              </a>
            </Button>
          </div>
        </div>

        {/* ── 2. Summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {summaryCards.map((card) => (
            <Card key={card.label} className="shadow-sm border border-border">
              <CardContent className="py-5 px-4 flex items-start gap-3.5 h-full">
                <div className="flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconCircle icon={card.icon} bg={card.iconBg} color={card.iconColor} size="md" />
                </div>
                <div className="min-w-0 flex flex-col">
                  <p className="text-xs text-muted-foreground leading-tight mb-1">{card.label}</p>
                  <p className="text-xl font-bold font-heading tracking-tight leading-none">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{card.helper}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── 3. Cut-off banner ── */}
        <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          <Info className="h-4 w-4 flex-shrink-0 text-blue-500" />
          <span>
            <strong className="text-blue-700 dark:text-blue-200">Submission cut-off: 25th.</strong>{' '}
            Submission after 25th will be process as off-cycle and paid along next regular payout
          </span>
        </div>

        {/* ── 4 & 5. Flex Breakdown + Standalone Claims side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Flex Breakdown */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="font-heading font-semibold text-base">{selectedMonth} Flex Breakdown</h2>

            {/* Progress row */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used: <strong className="text-foreground">${flexUsed.toFixed(2)}</strong> / ${flexCap.toFixed(2)}</span>
                <span className="text-muted-foreground">Remaining: <strong className="text-foreground">${flexRemaining.toFixed(2)}</strong></span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${flexPct}%` }}
                />
              </div>
            </div>

            {/* Category rows */}
            <div className="divide-y divide-border">
              {flexBreakdown.map((row) => (
                <div key={row.category} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <IconCircle icon={row.icon} bg={row.iconBg} color={row.iconColor} />
                    <span className="text-sm">{row.category}</span>
                  </div>
                  <span className="text-sm font-medium">${row.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Standalone Claims */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-heading font-semibold text-base mb-4">Standalone Claims</h2>
            <div className="divide-y divide-border">
              {standaloneClaims.map((claim) => (
                <div key={claim.name} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <IconCircle icon={claim.icon} bg={claim.iconBg} color={claim.iconColor} />
                    <span className="text-sm">{claim.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{claim.amount}</span>
                    <StatusBadge status={claim.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. Submission History table ── */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold text-base">Submission History</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted-foreground">
                  <TableHead className="pl-5 font-normal">Date</TableHead>
                  <TableHead className="font-normal">Category</TableHead>
                  <TableHead className="font-normal">Description</TableHead>
                  <TableHead className="font-normal">Amount</TableHead>
                  <TableHead className="font-normal">Status</TableHead>
                  <TableHead className="font-normal">Payout Month</TableHead>
                  <TableHead className="font-normal">Payment Method</TableHead>
                  <TableHead className="font-normal">Receipt</TableHead>
                  <TableHead className="pr-5 font-normal text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRows.map((row, i) => {
                  const cat = categoryIcon[row.category] ?? { icon: Receipt, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-500' };
                  const CatIcon = cat.icon;
                  return (
                    <TableRow key={i} className="text-sm">
                      <TableCell className="pl-5 text-muted-foreground whitespace-nowrap">{row.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconCircle icon={CatIcon} bg={cat.iconBg} color={cat.iconColor} />
                          <span>{row.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.description}</TableCell>
                      <TableCell className="font-medium">{row.amount}</TableCell>
                      <TableCell><StatusBadge status={row.status} /></TableCell>
                      <TableCell className="text-muted-foreground">{row.payout}</TableCell>
                      <TableCell className="text-muted-foreground">{row.method}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="text-xs truncate max-w-[110px]">{row.receipt}</span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── 7. Footer note ── */}
        <div className="flex items-center justify-center gap-3 py-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>Your data is secure and private.</span>
          <span className="text-muted-foreground/40">|</span>
          <span>
            Need help?{' '}
            <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
              Contact Airfoil Operations Team
            </span>
          </span>
        </div>

      </div>
    </DashboardLayout>
  );
}
