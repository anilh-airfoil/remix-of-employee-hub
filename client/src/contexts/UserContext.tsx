import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UserContextType {
  /** The public.users.id of the authenticated user */
  dbUserId: string | null;
  /** The currently selected user id — defaults to dbUserId, admins/owners can change */
  selectedUserId: string | null;
  /** Update selectedUserId (only allowed for admin/owner) */
  setSelectedUserId: (id: string) => void;
  /** Reset selectedUserId back to dbUserId */
  resetSelectedUser: () => void;
  /** Whether the current user is viewing their own data */
  isViewingSelf: boolean;
  /** Whether current user can view other users' data */
  canViewOtherUsers: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { dbUserId, role } = useAuth();
  const [overrideUserId, setOverrideUserId] = useState<string | null>(null);
  const location = useLocation();

  // Auto-reset override when navigating away from the profile page
  useEffect(() => {
    if (location.pathname !== '/profile' && overrideUserId !== null) {
      setOverrideUserId(null);
    }
  }, [location.pathname, overrideUserId]);
  const canViewOtherUsers = role === 'admin' || role === 'owner';
  const selectedUserId = overrideUserId ?? dbUserId;
  const isViewingSelf = selectedUserId === dbUserId;

  const setSelectedUserId = useCallback(
    (id: string) => {
      if (!canViewOtherUsers) {
        console.warn('Members cannot switch user context');
        return;
      }
      setOverrideUserId(id);
    },
    [canViewOtherUsers]
  );

  const resetSelectedUser = useCallback(() => {
    setOverrideUserId(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        dbUserId,
        selectedUserId,
        setSelectedUserId,
        resetSelectedUser,
        isViewingSelf,
        canViewOtherUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUserContext must be used within a UserProvider');
  return context;
}

/** Convenience hook — returns the selectedUserId for data queries */
export function useCurrentUserId(): string | null {
  return useUserContext().selectedUserId;
}
