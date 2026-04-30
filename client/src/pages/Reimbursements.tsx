// Phase 9.2 Tweak + Phase 9.3 — Reimbursements page connected to Supabase real data.
// Fix: Used = personal_flex_approved (not eom_flex_paid). Remaining = cap - used, allow negative.
// Fix: Submit URL → https://forms.airfoil.studio/internal
// Fix: View receipt → in-dashboard modal (60% viewport), signed URL, PDF/image preview.
// Phase 9.3: Owner/Admin can view any member's data via ?user_id query param.

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as SelectPrimitive from '@radix-ui/react-select';
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
  Package,
  X,
  ExternalLink,
  FileText,
  Download,
} from 'lucide-react';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
// Cast to any to query tables not yet in generated types (flex_monthly_ledgers, reimbursement_*)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = supabaseTyped as any;
import { useCurrentUserId } from '@/contexts/UserContext';
import { useIsAdmin } from '@/hooks/useRoles';

// ─── Constants ───────────────────────────────────────────────────────────────

const SUBMIT_URL = 'https://forms.airfoil.studio/internal';

// Month display → month_key mapping
const MONTHS: { label: string; key: string }[] = [
  { label: 'April 2026', key: '2026-04' },
  { label: 'March 2026', key: '2026-03' },
  { label: 'February 2026', key: '2026-02' },
  { label: 'January 2026', key: '2026-01' },
];

// ─── Category icon map ────────────────────────────────────────────────────────

const CATEGORY_ICON_MAP: Record<string, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  'Internet (not phone)': { icon: Wifi,             iconBg: 'bg-blue-100 dark:bg-blue-900/40',     iconColor: 'text-blue-500' },
  'Internet':             { icon: Wifi,             iconBg: 'bg-blue-100 dark:bg-blue-900/40',     iconColor: 'text-blue-500' },
  'Gym':                  { icon: Dumbbell,         iconBg: 'bg-green-100 dark:bg-green-900/40',   iconColor: 'text-green-500' },
  'Health/Mental Health': { icon: Heart,            iconBg: 'bg-red-100 dark:bg-red-900/40',       iconColor: 'text-red-500' },
  'Health':               { icon: Heart,            iconBg: 'bg-red-100 dark:bg-red-900/40',       iconColor: 'text-red-500' },
  'Co-Working':           { icon: Monitor,          iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-500' },
  'Travel':               { icon: Plane,            iconBg: 'bg-blue-100 dark:bg-blue-900/40',     iconColor: 'text-blue-500' },
  'Midjourney':           { icon: Image,            iconBg: 'bg-slate-100 dark:bg-slate-800',      iconColor: 'text-slate-500' },
  'Crypto Stipend':       { icon: CircleDollarSign, iconBg: 'bg-amber-100 dark:bg-amber-900/40',   iconColor: 'text-amber-500' },
  'Equipment':            { icon: Package,          iconBg: 'bg-teal-100 dark:bg-teal-900/40',     iconColor: 'text-teal-500' },
  'Manager/Business/Other': { icon: Receipt,        iconBg: 'bg-slate-100 dark:bg-slate-800',      iconColor: 'text-slate-500' },
  'Client Expense Claim': { icon: Receipt,          iconBg: 'bg-slate-100 dark:bg-slate-800',      iconColor: 'text-slate-500' },
};

function getCategoryIcon(name: string | null) {
  if (!name) return { icon: Receipt, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-500' };
  return CATEGORY_ICON_MAP[name] ?? { icon: Receipt, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-500' };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ledger {
  flex_cap_usd: number;
  eom_flex_paid: number;
  off_cycle_owed: number;
  total_payout_usd: number;
  personal_flex_approved: number;
  midjourney_used: number;
  manager_claim_used: number;
  approved_travel_used: number;
  client_expense_claim_used: number;
  crypto_stipend: number;
  equipment_eligible: number;
  others: number;
}

interface ReimbRequest {
  id: string;
  source_submission_id: string | null;
  spend_date: string | null;
  spend_amount: number;
  approved_amount: number | null;
  approval_status: string;
  payout_month_key: string | null;
  category_name_snapshot: string | null;
  category_name: string | null;
  is_standalone: boolean | null;
  attachment_file_name: string | null;
  attachment_storage_path: string | null;
  attachment_storage_bucket: string | null;
}

interface ReceiptModal {
  fileName: string;
  bucket: string;
  storagePath: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  const val = n ?? 0;
  if (val < 0) return `-$${Math.abs(val).toFixed(2)}`;
  return `$${val.toFixed(2)}`;
}

function formatDate(d: string | null) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split('-');
  const dt = new Date(Number(year), Number(month) - 1, 1);
  return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

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
  const s = status.toLowerCase();
  if (s === 'approved') return <Badge className="bg-green-500 hover:bg-green-500 text-white border-0 font-medium px-2.5">Approved</Badge>;
  if (s === 'approved_off_cycle') return <Badge className="bg-purple-500 hover:bg-purple-500 text-white border-0 font-medium px-2.5">Approved Off-Cycle</Badge>;
  if (s === 'pending' || s === 'pending_review') return <Badge className="bg-blue-500 hover:bg-blue-500 text-white border-0 font-medium px-2.5">Pending</Badge>;
  if (s === 'rejected') return <Badge className="bg-red-500 hover:bg-red-500 text-white border-0 font-medium px-2.5">Rejected</Badge>;
  return <Badge variant="outline" className="capitalize">{status.replace(/_/g, ' ')}</Badge>;
}

// ─── Receipt Preview Modal ────────────────────────────────────────────────────

function ReceiptPreviewModal({
  modal,
  onClose,
}: {
  modal: ReceiptModal;
  onClose: () => void;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [fetching, setFetching] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  const ext = modal.fileName.split('.').pop()?.toLowerCase() ?? '';
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
  const isPdf = ext === 'pdf';
  const isPreviewable = isImage || isPdf;

  useEffect(() => {
    async function fetchSignedUrl() {
      setFetching(true);
      setLoadError(false);
      const { data, error } = await supabaseTyped.storage
        .from(modal.bucket)
        .createSignedUrl(modal.storagePath, 300); // 5-minute expiry for modal viewing
      if (error || !data?.signedUrl) {
        setLoadError(true);
      } else {
        setSignedUrl(data.signedUrl);
      }
      setFetching(false);
    }
    fetchSignedUrl();
  }, [modal.bucket, modal.storagePath]);

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '60vw', maxWidth: '900px', height: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate">{modal.fileName}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in new tab
              </a>
            )}
            <button
              onClick={onClose}
              className="ml-2 rounded-lg p-1.5 hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted/30">
          {fetching ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30 border-t-blue-500 animate-spin" />
              <span className="text-sm">Loading receipt…</span>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground px-8 text-center">
              <FileText className="h-10 w-10 opacity-40" />
              <p className="text-sm">Could not load receipt. The link may have expired.</p>
              <button
                onClick={() => { setLoadError(false); setFetching(true); }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : !isPreviewable ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground px-8 text-center">
              <Download className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium text-foreground">{modal.fileName}</p>
              <p className="text-xs">This file type cannot be previewed directly.</p>
              {signedUrl && (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download / Open
                </a>
              )}
            </div>
          ) : isImage && signedUrl ? (
            <img
              src={signedUrl}
              alt={modal.fileName}
              className="max-w-full max-h-full object-contain p-4"
            />
          ) : isPdf && signedUrl ? (
            <iframe
              src={signedUrl}
              title={modal.fileName}
              className="w-full h-full border-0"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Reimbursements() {
  const loggedInUserId = useCurrentUserId();
  const isAdminOrOwner = useIsAdmin();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // If ?user_id is present and viewer is admin/owner, show that member's data
  const queryUserId = searchParams.get('user_id');
  const isViewingOther = isAdminOrOwner && !!queryUserId && queryUserId !== loggedInUserId;
  const userId = isViewingOther ? queryUserId : loggedInUserId;

  const [selectedMonthKey, setSelectedMonthKey] = useState('2026-04');
  const [viewedMemberName, setViewedMemberName] = useState<string | null>(null);

  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [requests, setRequests] = useState<ReimbRequest[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [receiptModal, setReceiptModal] = useState<ReceiptModal | null>(null);

  const selectedMonthLabel = MONTHS.find(m => m.key === selectedMonthKey)?.label ?? selectedMonthKey;

  // Fetch the viewed member's name when in admin-view-other mode
  useEffect(() => {
    if (!isViewingOther || !queryUserId) {
      setViewedMemberName(null);
      return;
    }
    supabase
      .from('profiles')
      .select('name')
      .eq('user_id', queryUserId)
      .maybeSingle()
      .then(({ data }: { data: { name: string | null } | null }) => {
        setViewedMemberName(data?.name ?? null);
      });
  }, [isViewingOther, queryUserId]);

  // ── Fetch ledger + requests ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // 1. Ledger row
    const { data: ledgerData } = await supabase
      .from('flex_monthly_ledgers')
      .select('flex_cap_usd, eom_flex_paid, off_cycle_owed, total_payout_usd, personal_flex_approved, midjourney_used, manager_claim_used, approved_travel_used, client_expense_claim_used, crypto_stipend, equipment_eligible, others')
      .eq('user_id', userId)
      .eq('month_key', selectedMonthKey)
      .maybeSingle();

    setLedger(ledgerData as Ledger | null);

    // 2. Reimbursement requests + category join
    const { data: reqData } = await supabase
      .from('reimbursement_requests')
      .select(`
        id,
        source_submission_id,
        spend_date,
        spend_amount,
        approved_amount,
        approval_status,
        payout_month_key,
        category_name_snapshot,
        reimbursement_categories!category_id (
          name,
          is_standalone
        )
      `)
      .eq('user_id', userId)
      .eq('payout_month_key', selectedMonthKey)
      .order('spend_date', { ascending: true });

    // 3. Attachments for this user
    const { data: attachDataRaw } = await supabase
      .from('reimbursement_request_attachments')
      .select('request_id, file_name, storage_bucket, storage_path')
      .eq('user_id', userId);

    const attachData = attachDataRaw as Array<{ request_id: string; file_name: string; storage_bucket: string; storage_path: string }> | null;
    const attachMap = new Map<string, { file_name: string; storage_bucket: string; storage_path: string }>();
    (attachData ?? []).forEach(a => attachMap.set(a.request_id, a));

    const rows: ReimbRequest[] = (reqData ?? []).map((r: any) => {
      const cat = r.reimbursement_categories;
      const att = attachMap.get(r.id);
      return {
        id: r.id,
        source_submission_id: r.source_submission_id,
        spend_date: r.spend_date,
        spend_amount: Number(r.spend_amount),
        approved_amount: r.approved_amount != null ? Number(r.approved_amount) : null,
        approval_status: r.approval_status,
        payout_month_key: r.payout_month_key,
        category_name_snapshot: r.category_name_snapshot,
        category_name: cat?.name ?? r.category_name_snapshot,
        is_standalone: cat?.is_standalone ?? false,
        attachment_file_name: att?.file_name ?? null,
        attachment_storage_path: att?.storage_path ?? null,
        attachment_storage_bucket: att?.storage_bucket ?? null,
      };
    });

    setRequests(rows);

    // 4. Pending total
    const pending = rows
      .filter(r => r.approval_status === 'pending' || r.approval_status === 'pending_review')
      .reduce((sum, r) => sum + r.spend_amount, 0);
    setPendingTotal(pending);

    setLoading(false);
  }, [userId, selectedMonthKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Open receipt modal ───────────────────────────────────────────────────
  function handleViewReceipt(bucket: string | null, path: string | null, fileName: string | null) {
    if (!bucket || !path || !fileName) return;
    setReceiptModal({ fileName, bucket, storagePath: path });
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const flexCap = ledger?.flex_cap_usd ?? 0;
  // Used = personal_flex_approved (actual submitted amount, may exceed cap)
  const flexUsed = ledger?.personal_flex_approved ?? 0;
  // Remaining = cap - used (allow negative to show overrun)
  const flexRemaining = flexCap - flexUsed;
  // Progress bar: clamp to 100% visually but show overrun in text
  const flexPct = flexCap > 0 ? Math.min(100, Math.round((flexUsed / flexCap) * 100)) : 0;
  const isOverCap = flexRemaining < 0;

  // Personal flex categories
  const personalFlexCategories = [
    { name: 'Internet (not phone)', display: 'Internet (not phone)' },
    { name: 'Health/Mental Health', display: 'Health/Mental Health' },
    { name: 'Gym', display: 'Gym' },
    { name: 'Co-Working', display: 'Co-Working' },
  ];

  const flexByCategory = personalFlexCategories.map(cat => {
    const total = requests
      .filter(r => !r.is_standalone && r.category_name === cat.name && r.approval_status === 'approved')
      .reduce((sum, r) => sum + (r.approved_amount ?? r.spend_amount), 0);
    return { ...cat, amount: total };
  });

  // Standalone claims from ledger (hide zero-value rows)
  const standaloneClaims = [
    { name: 'Midjourney',           icon: Image,            iconBg: 'bg-slate-100 dark:bg-slate-800',    iconColor: 'text-slate-500',   amount: ledger?.midjourney_used ?? 0 },
    { name: 'Manager Claim',        icon: Receipt,          iconBg: 'bg-slate-100 dark:bg-slate-800',    iconColor: 'text-slate-500',   amount: ledger?.manager_claim_used ?? 0 },
    { name: 'Travel',               icon: Plane,            iconBg: 'bg-blue-100 dark:bg-blue-900/40',   iconColor: 'text-blue-500',    amount: ledger?.approved_travel_used ?? 0 },
    { name: 'Client Expense Claim', icon: Receipt,          iconBg: 'bg-slate-100 dark:bg-slate-800',    iconColor: 'text-slate-500',   amount: ledger?.client_expense_claim_used ?? 0 },
    { name: 'Crypto Stipend',       icon: CircleDollarSign, iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-500',   amount: ledger?.crypto_stipend ?? 0 },
    { name: 'Equipment',            icon: Package,          iconBg: 'bg-teal-100 dark:bg-teal-900/40',   iconColor: 'text-teal-500',    amount: ledger?.equipment_eligible ?? 0 },
  ].filter(c => c.amount > 0);

  // Summary cards
  const summaryCards = [
    { label: 'Monthly Flex Cap',    value: fmt(ledger?.flex_cap_usd),    helper: 'Monthly cap',           icon: DollarSign,    iconBg: 'bg-blue-100 dark:bg-blue-900/40',    iconColor: 'text-blue-500' },
    { label: 'Approved This Month', value: fmt(ledger?.eom_flex_paid),   helper: 'Total approved amount', icon: TrendingUp,    iconBg: 'bg-green-100 dark:bg-green-900/40',  iconColor: 'text-green-500' },
    { label: 'Pending Review',      value: fmt(pendingTotal),            helper: 'Awaiting approval',     icon: Clock,         iconBg: 'bg-amber-100 dark:bg-amber-900/40',  iconColor: 'text-amber-500' },
    { label: 'Off-Cycle Owed',      value: fmt(ledger?.off_cycle_owed),  helper: 'To be paid off-cycle',  icon: RefreshCw,     iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-500' },
    { label: 'Total Paid',          value: fmt(ledger?.total_payout_usd), helper: 'Paid this Month',      icon: CheckCircle2,  iconBg: 'bg-teal-100 dark:bg-teal-900/40',    iconColor: 'text-teal-500' },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-5">

        {/* ── 1. Header ── */}
        {/* Back to Team Directory link — only shown when admin is viewing another member */}
        {isViewingOther && (
          <button
            onClick={() => navigate('/team')}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -mt-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Team Directory
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">Reimbursements</h1>
            {isViewingOther ? (
              <p className="text-muted-foreground text-sm mt-0.5">
                Viewing <strong className="text-foreground">{viewedMemberName ?? 'team member'}</strong>'s reimbursement data
              </p>
            ) : (
              <p className="text-muted-foreground text-sm mt-0.5">
                Track your submissions, payout status, and monthly flex usage.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 border border-border rounded-md px-3 h-9 bg-background">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={selectedMonthKey} onValueChange={setSelectedMonthKey}>
                <SelectTrigger className="border-0 shadow-none h-auto p-0 text-sm w-32 focus:ring-0">
                  <SelectValue>{selectedMonthLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectPrimitive.Item
                      key={m.key}
                      value={m.key}
                      className="relative flex w-full cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                    >
                      <SelectPrimitive.ItemText>{m.label}</SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="gap-1.5" asChild>
              <a href={SUBMIT_URL} target="_blank" rel="noopener noreferrer">
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
              <CardContent className="py-5 px-4 flex items-center gap-3.5">
                {loading ? (
                  <Skeleton className="w-11 h-11 rounded-full" />
                ) : (
                  <IconCircle icon={card.icon} bg={card.iconBg} color={card.iconColor} size="md" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground leading-tight mb-1 whitespace-nowrap">{card.label}</p>
                  {loading ? (
                    <Skeleton className="h-6 w-20 mt-1" />
                  ) : (
                    <p className="text-xl font-bold font-heading tracking-tight leading-none">{card.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 leading-tight whitespace-nowrap">{card.helper}</p>
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
            Submissions after the 25th will be processed as off-cycle and paid along with the next regular payout.
          </span>
        </div>

        {/* ── 4 & 5. Flex Breakdown + Standalone Claims side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Flex Breakdown */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="font-heading font-semibold text-base">{selectedMonthLabel} Flex Breakdown</h2>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2.5 w-full rounded-full" />
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Used: <strong className="text-foreground">{fmt(flexUsed)}</strong> / {fmt(flexCap)}
                    </span>
                    <span className="text-muted-foreground">
                      Remaining:{' '}
                      <strong className={isOverCap ? 'text-red-500' : 'text-foreground'}>
                        {fmt(flexRemaining)}
                      </strong>
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOverCap ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${flexPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{flexPct}% used</span>
                    {isOverCap && (
                      <span className="text-red-500 font-medium">Exceeded cap by {fmt(Math.abs(flexRemaining))}</span>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {flexByCategory.map((row) => {
                    const ci = getCategoryIcon(row.name);
                    return (
                      <div key={row.name} className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2.5">
                          <IconCircle icon={ci.icon} bg={ci.iconBg} color={ci.iconColor} />
                          <span className="text-sm">{row.display}</span>
                        </div>
                        <span className="text-sm font-medium">{fmt(row.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Standalone Claims */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-heading font-semibold text-base mb-4">Standalone Claims</h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : standaloneClaims.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No standalone claims this month.</p>
            ) : (
              <div className="divide-y divide-border">
                {standaloneClaims.map((claim) => (
                  <div key={claim.name} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2.5">
                      <IconCircle icon={claim.icon} bg={claim.iconBg} color={claim.iconColor} />
                      <span className="text-sm">{claim.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{fmt(claim.amount)}</span>
                      <StatusBadge status="approved" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 6. Submission History table ── */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold text-base">Submission History</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No submissions found for this month.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="text-xs text-muted-foreground">
                    <TableHead className="pl-5 font-normal">Date</TableHead>
                    <TableHead className="font-normal">Category</TableHead>
                    <TableHead className="font-normal">Ref</TableHead>
                    <TableHead className="font-normal">Amount</TableHead>
                    <TableHead className="font-normal">Status</TableHead>
                    <TableHead className="font-normal">Payout Month</TableHead>
                    <TableHead className="font-normal">Receipt</TableHead>
                    <TableHead className="pr-5 font-normal text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((row) => {
                    const ci = getCategoryIcon(row.category_name);
                    return (
                      <TableRow key={row.id} className="text-sm">
                        <TableCell className="pl-5 text-muted-foreground whitespace-nowrap">
                          {formatDate(row.spend_date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconCircle icon={ci.icon} bg={ci.iconBg} color={ci.iconColor} />
                            <span className="whitespace-nowrap">{row.category_name ?? row.category_name_snapshot ?? '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {row.source_submission_id ?? '—'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {fmt(row.approved_amount ?? row.spend_amount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={row.approval_status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {row.payout_month_key ? formatMonthLabel(row.payout_month_key) : '—'}
                        </TableCell>
                        <TableCell>
                          {row.attachment_file_name ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="text-xs truncate max-w-[120px]">{row.attachment_file_name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          {row.attachment_storage_path ? (
                            <button
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              onClick={() => handleViewReceipt(
                                row.attachment_storage_bucket,
                                row.attachment_storage_path,
                                row.attachment_file_name
                              )}
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
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

      {/* ── Receipt Preview Modal ── */}
      {receiptModal && (
        <ReceiptPreviewModal
          modal={receiptModal}
          onClose={() => setReceiptModal(null)}
        />
      )}

    </DashboardLayout>
  );
}
