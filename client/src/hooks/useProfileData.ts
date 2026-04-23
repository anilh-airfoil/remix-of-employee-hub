import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  /** True when viewing another user via ?userId= query param */
  isViewingOtherViaParam: boolean;
}

export function useProfileData(): ProfileData {
  const [searchParams] = useSearchParams();
  const paramUserId = searchParams.get('userId');
  const { selectedUserId } = useUserContext();
  const { dbUserId } = useAuth();

  // URL query param takes priority over context selectedUserId
  const effectiveUserId = paramUserId ?? selectedUserId;
  const isViewingOtherViaParam = !!paramUserId && paramUserId !== dbUserId;

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
    isViewingOtherViaParam: false,
  });

  useEffect(() => {
    if (!dbUserId || !effectiveUserId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    let cancelled = false;

    async function fetchAll() {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const [profileRes, employmentRes, compensationRes, benefitsRes, documentsRes, reviewsRes, userRes] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', effectiveUserId as string).maybeSingle(),
          supabase.from('employment').select('*').eq('user_id', effectiveUserId as string).maybeSingle(),
          supabase.from('compensation').select('*').eq('user_id', effectiveUserId as string).maybeSingle(),
          supabase.from('benefits').select('*').eq('user_id', effectiveUserId as string).maybeSingle(),
          supabase.from('documents').select('*').eq('user_id', effectiveUserId as string).order('created_at', { ascending: false }),
          supabase.from('reviews').select('*').eq('user_id', effectiveUserId as string).order('review_date', { ascending: false }).limit(1),
          supabase.from('users').select('status').eq('id', effectiveUserId as string).maybeSingle(),
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
        isViewingOtherViaParam,
      });
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [effectiveUserId, dbUserId]);

  return data;
}
