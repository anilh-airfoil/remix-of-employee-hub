import { User, Receipt, FileText, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Reimbursements', icon: Receipt, path: '/reimbursements' },
  { label: 'Reviews', icon: FileText, path: '/reviews' },
];

const adminItems = [
  { label: 'Team Directory', icon: Users, path: '/team' },
  { label: 'Team Settings', icon: Settings, path: '/team-settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { role, signOut } = useAuth();
  const isAdminOrOwner = role === 'admin' || role === 'owner';

  const allItems = [...navItems, ...(isAdminOrOwner ? adminItems : [])];

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col bg-sidebar lg:flex">
      <div className="p-6">
        <h1 className="text-xl font-heading font-bold text-sidebar-primary-foreground tracking-tight">
          HR<span className="text-sidebar-active">Hub</span>
        </h1>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {allItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-active/15 text-sidebar-active'
                  : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 mb-4">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
