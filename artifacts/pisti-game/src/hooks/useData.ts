import { useState, useEffect } from 'react';
import { firestoreHelpers, PublicProfile } from '@/lib/firestore';

export function useLeaderboard(limit = 100) {
  const [leaders, setLeaders] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await firestoreHelpers.getLeaderboard(limit);
        setLeaders(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Bilinmeyen bir hata oluştu'));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  return { leaders, loading, error };
}

export function usePublicProfile(uid: string) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      try {
        setLoading(true);
        const data = await firestoreHelpers.getPublicProfile(uid);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  return { profile, loading };
}
