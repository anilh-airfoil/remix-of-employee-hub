import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'owner' | 'admin' | 'member' | 'contractor';
type AppStatus = 'active' | 'not_active';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  /** Supabase auth.users.id */
  authUserId: string | null;
  /** public.users.id (database user) */
  dbUserId: string | null;
  role: AppRole | null;
  status: AppStatus | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRecord = async (authId: string) => {
    const { data } = await supabase
      .from('users')
      .select('id, role, status')
      .eq('auth_id', authId)
      .single();
    if (data) {
      setDbUserId(data.id);
      setRole(data.role as AppRole);
      setStatus(data.status as AppStatus);
    } else {
      setDbUserId(null);
      setRole('member');
      setStatus(null);
    }
  };

  const clearUserState = () => {
    setDbUserId(null);
    setRole(null);
    setStatus(null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchUserRecord(session.user.id), 0);
        } else {
          clearUserState();
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRecord(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      session, user,
      authUserId: user?.id ?? null,
      dbUserId, role, status, loading,
      signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
