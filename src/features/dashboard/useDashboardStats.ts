import { useAuth } from '@/features/auth/AuthContext';
import { useFamilyContext } from '@/features/families/FamilyContext';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats() {
  const { user } = useAuth();
  const { activeFamilyId } = useFamilyContext();

  return useQuery({
    queryKey: ['dashboardStats', user?.id, activeFamilyId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      let query = supabase.from('transactions').select('amount, type');

      if (activeFamilyId) {
        query = query.eq('family_id', activeFamilyId);
      } else {
        query = query.eq('user_id', user.id).is('family_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = data.reduce(
        (acc, transaction) => {
          if (transaction.type === 'income') {
            acc.income += Number(transaction.amount);
            acc.balance += Number(transaction.amount);
          } else {
            acc.expense += Number(transaction.amount);
            acc.balance -= Number(transaction.amount);
          }
          return acc;
        },
        { balance: 0, income: 0, expense: 0 },
      );

      return stats;
    },
    enabled: !!user,
  });
}
