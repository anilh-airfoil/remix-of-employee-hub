import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileText } from 'lucide-react';

export default function Invoices() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage invoice-related submissions and payment records.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No invoices yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Invoice submissions and payment records will appear here once the feature is live.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
