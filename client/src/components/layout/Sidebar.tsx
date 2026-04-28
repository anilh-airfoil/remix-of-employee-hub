import { User, Receipt, FileText, Users, Settings, LogOut, SlidersHorizontal, FileBadge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Profile is visible to all roles
const coreItems = [
  { label: 'Profile', icon: User, path: '/profile' },
];

// Reimbursements + Reviews: visible to owner, admin, member — NOT contractor
const memberItems = [
  { label: 'Reimbursements', icon: Receipt, path: '/reimbursements' },
  { label: 'Reviews', icon: FileText, path: '/reviews' },
];

// Invoices: visible to owner, admin, contractor — NOT member
const invoiceItems = [
  { label: 'Invoices', icon: FileBadge, path: '/invoices' },
];

// Team Directory + Team Settings: visible to owner, admin only
const adminItems = [
  { label: 'Team Directory', icon: Users, path: '/team' },
  { label: 'Team Settings', icon: Settings, path: '/team-settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { role, signOut } = useAuth();

  const isAdminOrOwner = role === 'admin' || role === 'owner';
  const isContractor = role === 'contractor';
  const isMember = role === 'member';

  const navItems = [
    ...coreItems,
    // Reimbursements + Reviews: owner, admin, member (not contractor)
    ...(isAdminOrOwner || isMember ? memberItems : []),
    // Invoices: owner, admin, contractor (not member)
    ...(isAdminOrOwner || isContractor ? invoiceItems : []),
    // Team Directory + Team Settings: owner, admin only
    ...(isAdminOrOwner ? adminItems : []),
  ];

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col bg-sidebar lg:flex">
      <div className="p-6">
        <h1 className="text-xl font-heading font-bold text-sidebar-primary-foreground tracking-tight">
          HR<span className="text-sidebar-active">Hub</span>
        </h1>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
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
      <div className="px-3 mb-4 space-y-1">
        <Link
          to="/settings"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/settings'
              ? 'bg-sidebar-active/15 text-sidebar-active'
              : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Settings
        </Link>
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
