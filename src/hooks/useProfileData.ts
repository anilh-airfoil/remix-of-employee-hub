import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserContext } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

interface ProfileData {
  profile: Tables<'profiles'> | null;
  employment: Tables<'employment'> | null;
  compensation: Tables<'compensation'> | null;
  benefits: Tables<'benefits'> | null;
  documents: Tables<'documents'>[];
  latestReview: Tables<'reviews'> | null;
  userStatus: string | null;
  loading: boolean;
  error: string | null;
}

export function useProfileData(): ProfileData {
  const { selectedUserId } = useUserContext();
  const { dbUserId } = useAuth();
  const [data, setData] = useState<ProfileData>({
    profile: null,
    employment: null,
    compensation: null,
    benefits: null,
    documents: [],
    latestReview: null,
    userStatus: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!dbUserId || !selectedUserId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    let cancelled = false;

    async function fetchAll() {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const [profileRes, employmentRes, compensationRes, benefitsRes, documentsRes, reviewsRes, userRes] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', selectedUserId).maybeSingle(),
          supabase.from('employment').select('*').eq('user_id', selectedUserId).maybeSingle(),
          supabase.from('compensation').select('*').eq('user_id', selectedUserId).maybeSingle(),
          supabase.from('benefits').select('*').eq('user_id', selectedUserId).maybeSingle(),
          supabase.from('documents').select('*').eq('user_id', selectedUserId).order('created_at', { ascending: false }),
          supabase.from('reviews').select('*').eq('user_id', selectedUserId).order('review_date', { ascending: false }).limit(1),
          supabase.from('users').select('status').eq('id', selectedUserId).maybeSingle(),
        ]);

      if (cancelled) return;

      const err = [profileRes, employmentRes, compensationRes, benefitsRes, documentsRes, reviewsRes, userRes]
        .find(r => r.error)?.error;

      setData({
        profile: profileRes.data ?? null,
        employment: employmentRes.data ?? null,
        compensation: compensationRes.data ?? null,
        benefits: benefitsRes.data ?? null,
        documents: documentsRes.data ?? [],
        latestReview: reviewsRes.data?.[0] ?? null,
        userStatus: userRes.data?.status ?? null,
        loading: false,
        error: err ? err.message : null,
      });
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [selectedUserId]);

  return data;
}
