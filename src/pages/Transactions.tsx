import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useFamilyContext } from '@/features/families/FamilyContext';
import { useTransactions } from '@/features/transactions/useTransactions';
import { useCategories } from '@/features/categories/useCategories';

import { AIAssistant } from '@/features/transactions/components/AIAssistant';
import {
  TransactionForm,
  type EditingTransaction,
} from '@/features/transactions/components/TransactionForm';
import { TransactionsFilter } from '@/features/transactions/components/TransactionsFilter';
import { TransactionsList } from '@/features/transactions/components/TransactionsList';

export default function Transactions() {
  const { activeFamilyId } = useFamilyContext();
  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useCategories();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<EditingTransaction | null>(null);

  // Filter States
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  // Derived Filter Options
  const uniqueUsers = useMemo(() => {
    if (!transactions) return [];
    return Array.from(
      new Map(
        transactions
          .filter((t) => t.user_id && t.profiles)
          .map((t) => [t.user_id, (t.profiles as any).full_name]),
      ).entries(),
    );
  }, [transactions]);

  const filterableCategories =
    categories?.filter((c) => filterType === 'all' || c.type === filterType) || [];

  // Derived Filtered List
  const filteredTransactionsList = useMemo(() => {
    return transactions?.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category_id !== filterCategory) return false;
      if (filterUser !== 'all' && t.user_id !== filterUser) return false;
      if (filterStartDate && t.date < filterStartDate) return false;
      if (filterEndDate && t.date > filterEndDate) return false;
      return true;
    });
  }, [
    transactions,
    filterType,
    filterCategory,
    filterUser,
    filterStartDate,
    filterEndDate,
  ]);

  const handleEdit = (transaction: any) => {
    setEditingTransaction({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      category_id: transaction.category_id,
      date: new Date(transaction.date).toISOString().split('T')[0],
      notes: transaction.notes,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Giao dịch
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">
            Quản lý thu nhập và chi tiêu của bạn 💸
          </p>
        </div>
        <button
          onClick={() => {
            if (isFormOpen) {
              closeForm();
            } else {
              setIsFormOpen(true);
              setEditingTransaction(null);
            }
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
        >
          <Plus
            className={`h-5 w-5 transition-transform duration-300 ${isFormOpen ? 'rotate-45' : ''}`}
          />
          {isFormOpen ? 'Đóng form' : 'Thêm giao dịch'}
        </button>
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={closeForm}
        editingTransaction={editingTransaction}
      />

      <AIAssistant />

      <TransactionsFilter
        filterStartDate={filterStartDate}
        setFilterStartDate={setFilterStartDate}
        filterEndDate={filterEndDate}
        setFilterEndDate={setFilterEndDate}
        filterType={filterType}
        setFilterType={setFilterType}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterUser={filterUser}
        setFilterUser={setFilterUser}
        activeFamilyId={activeFamilyId}
        uniqueUsers={uniqueUsers}
        filterableCategories={filterableCategories}
      />

      <TransactionsList
        transactions={filteredTransactionsList || []}
        isLoading={isLoading}
        activeFamilyId={activeFamilyId}
        onEdit={handleEdit}
      />
    </div>
  );
}
