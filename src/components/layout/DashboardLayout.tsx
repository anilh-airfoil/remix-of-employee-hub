import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, Receipt, FileText, Users, Settings, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Reimbursements', icon: Receipt, path: '/reimbursements' },
  { label: 'Reviews', icon: FileText, path: '/reviews' },
];

const adminItems = [
  { label: 'Team Directory', icon: Users, path: '/team' },
  { label: 'Team Settings', icon: Settings, path: '/team-settings' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  const isAdminOrOwner = role === 'admin' || role === 'owner';
  const allItems = [...navItems, ...(isAdminOrOwner ? adminItems : [])];

  const currentLabel =
    allItems.find(item => item.path === location.pathname)?.label ?? 'HR Hub';

  const roleBadgeVariant = role === 'owner' ? 'default' : role === 'admin' ? 'secondary' : 'outline';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Desktop topbar */}
      <header className="sticky top-0 z-20 hidden lg:flex h-14 items-center justify-end border-b bg-background/95 px-8 backdrop-blur lg:ml-64">
        <div className="flex items-center gap-3">
          {role && (
            <Badge variant={roleBadgeVariant} className="capitalize text-xs">
              {role}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {user?.email}
          </span>
        </div>
      </header>

      {/* Mobile topbar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold leading-tight">{currentLabel}</p>
          {role && (
            <Badge variant={roleBadgeVariant} className="capitalize text-[10px]">
              {role}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </Button>
      </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[270px] p-0">
          <div className="flex h-full flex-col bg-sidebar">
            <div className="p-6">
              <h1 className="text-xl font-heading font-bold tracking-tight text-sidebar-primary-foreground">
                HR<span className="text-sidebar-active">Hub</span>
              </h1>
            </div>
            <div className="px-4 mb-3">
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {allItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
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
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <main className="px-4 py-4 sm:px-6 lg:ml-64 lg:px-8 lg:py-6">{children}</main>
    </div>
  );
}
