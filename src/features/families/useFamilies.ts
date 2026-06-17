import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Family, FamilyMember, FamilyInvite } from './types';
import { useAuth } from '../auth/AuthContext';

export function useFamilies() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const familiesQuery = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Family[];
    },
    enabled: !!user,
  });

  const createFamily = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('families')
        .insert([{ name, created_by: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Family;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });

  return {
    families: familiesQuery.data || [],
    isLoading: familiesQuery.isLoading,
    createFamily: createFamily.mutateAsync,
    isCreating: createFamily.isPending,
  };
}

export function useFamilyMembers(familyId: string | null) {
  return useQuery({
    queryKey: ['family_members', familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          profiles:user_id (id, full_name)
        `)
        .eq('family_id', familyId);
      
      if (error) throw error;
      return data as FamilyMember[];
    },
    enabled: !!familyId,
  });
}

export function useFamilyInvites(familyId?: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch pending invites for a specific family (for owners to manage)
  // or fetch all invites for the current user's email
  const invitesQuery = useQuery({
    queryKey: ['family_invites', familyId || 'my_invites'],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('family_invites')
        .select(`
          *,
          families:family_id (name),
          profiles:invited_by (full_name)
        `)
        .eq('status', 'pending');

      if (familyId) {
        query = query.eq('family_id', familyId);
      } else {
        query = query.eq('email', user?.email || '');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FamilyInvite[];
    },
    enabled: !!user,
  });

  const inviteMember = useMutation({
    mutationFn: async ({ familyId, email }: { familyId: string; email: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('family_invites')
        .insert([{ family_id: familyId, email, invited_by: user.id }])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family_invites'] });
    },
  });

  const respondToInvite = useMutation({
    mutationFn: async ({ inviteId, status, familyId }: { inviteId: string; status: 'accepted' | 'rejected', familyId: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      // 1. Update invite status
      const { error: updateError } = await supabase
        .from('family_invites')
        .update({ status })
        .eq('id', inviteId);
      
      if (updateError) throw updateError;

      // 2. If accepted, add to family_members
      if (status === 'accepted') {
        const { error: memberError } = await supabase
          .from('family_members')
          .insert([{ family_id: familyId, user_id: user.id, role: 'member' }]);
        
        if (memberError) throw memberError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family_invites'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });

  return {
    invites: invitesQuery.data || [],
    isLoading: invitesQuery.isLoading,
    inviteMember: inviteMember.mutateAsync,
    isInviting: inviteMember.isPending,
    respondToInvite: respondToInvite.mutateAsync,
    isResponding: respondToInvite.isPending,
  };
}
