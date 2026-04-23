import { useUserContext } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';

export default function ViewingAsBanner() {
  const { isViewingSelf, resetSelectedUser } = useUserContext();

  if (isViewingSelf) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
        <Eye className="h-4 w-4" />
        You are viewing another user's data
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-amber-700 hover:text-amber-900 hover:bg-amber-500/20"
        onClick={resetSelectedUser}
      >
        <ArrowLeft className="h-3 w-3" /> Back to my profile
      </Button>
    </div>
  );
}
