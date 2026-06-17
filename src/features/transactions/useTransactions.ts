import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamilyContext } from '../families/FamilyContext';
import type { Database } from '@/types/database.types';


type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

export function useTransactions() {
  const { user } = useAuth();
  const { activeFamilyId } = useFamilyContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', user?.id, activeFamilyId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      let q = supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, color, icon_name),
          profiles:user_id(full_name)
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (activeFamilyId) {
        q = q.eq('family_id', activeFamilyId);
      } else {
        q = q.eq('user_id', user.id).is('family_id', null);
      }

      const { data, error } = await q;

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (newTransaction: TransactionInsert) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...newTransaction, family_id: activeFamilyId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  return {
    ...query,
    createTransaction: createMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
