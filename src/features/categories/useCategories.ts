import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamilyContext } from '../families/FamilyContext';
import type { Database } from '@/types/database.types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export function useCategories() {
  const { user } = useAuth();
  const { activeFamilyId } = useFamilyContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categories', user?.id, activeFamilyId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      let q = supabase
        .from('categories')
        .select('*')
        .order('name');

      if (activeFamilyId) {
        q = q.or(`family_id.eq.${activeFamilyId},and(user_id.is.null,family_id.is.null)`);
      } else {
        q = q.or(`user_id.eq.${user.id},user_id.is.null`).is('family_id', null);
      }

      const { data, error } = await q;

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (newCategory: CategoryInsert) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...newCategory, family_id: activeFamilyId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CategoryInsert> }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    ...query,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
