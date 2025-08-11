import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useRealtime, useMutation } from './useDatabase';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact: string;
  timeline: string;
  savingsPotential?: number;
  status: 'active' | 'completed' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

interface DatabaseAIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact: string;
  timeline: string;
  savings_potential: number | null;
  status: 'active' | 'completed' | 'dismissed';
  created_at: string;
  updated_at: string;
}

function transformDbRecommendation(dbRec: DatabaseAIRecommendation): AIRecommendation {
  return {
    id: dbRec.id,
    title: dbRec.title,
    description: dbRec.description,
    priority: dbRec.priority,
    category: dbRec.category,
    impact: dbRec.impact,
    timeline: dbRec.timeline,
    savingsPotential: dbRec.savings_potential || undefined,
    status: dbRec.status,
    createdAt: dbRec.created_at,
    updatedAt: dbRec.updated_at,
  };
}

export function useRealAIRecommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [activeRecommendations, setActiveRecommendations] = useState<AIRecommendation[]>([]);

  const fetchRecommendations = useCallback(async () => {
    return supabase
      .from('ai_recommendations')
      .select('*')
      .order('created_at', { ascending: false });
  }, []);

  const { data, loading, error, refetch } = useQuery<DatabaseAIRecommendation[]>(
    fetchRecommendations,
    [],
    {
      onSuccess: (data) => {
        if (data) {
          const transformedRecs = data.map(transformDbRecommendation);
          setRecommendations(transformedRecs);
          setActiveRecommendations(transformedRecs.filter(rec => rec.status === 'active'));
        }
      }
    }
  );

  const updateRecommendationStatus = useMutation(
    async ({ id, status }: { id: string; status: 'active' | 'completed' | 'dismissed' }) => {
      return supabase
        .from('ai_recommendations')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: (data) => {
        const updated = transformDbRecommendation(data as DatabaseAIRecommendation);
        setRecommendations(prev => 
          prev.map(rec => rec.id === updated.id ? updated : rec)
        );
        setActiveRecommendations(prev => {
          if (updated.status === 'active') {
            const filtered = prev.filter(rec => rec.id !== updated.id);
            return [...filtered, updated];
          } else {
            return prev.filter(rec => rec.id !== updated.id);
          }
        });
      }
    }
  );

  // Real-time updates
  useRealtime('ai_recommendations', undefined, (payload) => {
    if (payload.eventType === 'INSERT' && payload.new) {
      const newRec = transformDbRecommendation(payload.new as DatabaseAIRecommendation);
      setRecommendations(prev => [newRec, ...prev]);
      
      if (newRec.status === 'active') {
        setActiveRecommendations(prev => [newRec, ...prev]);
      }
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      const updatedRec = transformDbRecommendation(payload.new as DatabaseAIRecommendation);
      setRecommendations(prev => 
        prev.map(rec => rec.id === updatedRec.id ? updatedRec : rec)
      );
      
      setActiveRecommendations(prev => {
        const filtered = prev.filter(rec => rec.id !== updatedRec.id);
        if (updatedRec.status === 'active') {
          return [...filtered, updatedRec];
        }
        return filtered;
      });
    } else if (payload.eventType === 'DELETE' && payload.old) {
      setRecommendations(prev => prev.filter(rec => rec.id !== payload.old.id));
      setActiveRecommendations(prev => prev.filter(rec => rec.id !== payload.old.id));
    }
  });

  return {
    recommendations,
    activeRecommendations,
    loading,
    error,
    refetch,
    updateStatus: updateRecommendationStatus.mutate,
    updating: updateRecommendationStatus.loading,
  };
}