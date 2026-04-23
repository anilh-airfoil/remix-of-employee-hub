import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'owner' | 'admin' | 'member';

/** Check if current user has one of the given roles */
export function useHasRole(...roles: AppRole[]): boolean {
  const { role } = useAuth();
  return role !== null && roles.includes(role);
}

/** Check if current user is admin or owner */
export function useIsAdmin(): boolean {
  return useHasRole('admin', 'owner');
}

/** Check if current user is the owner */
export function useIsOwner(): boolean {
  return useHasRole('owner');
}
