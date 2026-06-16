import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id);

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
        { balance: 0, income: 0, expense: 0 }
      );

      return stats;
    },
    enabled: !!user,
  });
}
