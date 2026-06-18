import { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useCategories } from '@/features/categories/useCategories';
import { useTransactions } from '@/features/transactions/useTransactions';

export interface EditingTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  date: string;
  notes?: string;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: EditingTransaction | null;
}

export function TransactionForm({ isOpen, onClose, editingTransaction }: TransactionFormProps) {
  const { user } = useAuth();
  const { data: categories } = useCategories();
  const { createTransaction, updateTransaction, isCreating, isUpdating } = useTransactions();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Populate form when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategoryId(editingTransaction.category_id);
      setDate(new Date(editingTransaction.date).toISOString().split('T')[0]);
      setNotes(editingTransaction.notes || '');
    } else {
      setAmount('');
      setType('expense');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [editingTransaction, isOpen]);

  // Reset category selection when changing type if the current category is not of the new type
  useEffect(() => {
    if (categoryId && categories) {
      const selectedCat = categories.find((c) => c.id === categoryId);
      if (selectedCat && selectedCat.type !== type) {
        setCategoryId('');
      }
    }
  }, [type, categories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !categoryId || !date) return;

    if (editingTransaction?.id) {
      await updateTransaction({
        id: editingTransaction.id,
        updates: {
          amount: parseFloat(amount),
          type,
          category_id: categoryId,
          date,
          notes,
        },
      });
    } else {
      await createTransaction({
        user_id: user.id,
        amount: parseFloat(amount),
        type,
        category_id: categoryId,
        date,
        notes,
      });
    }

    onClose();
  };

  const filteredCategories = categories?.filter((c) => c.type === type) || [];
  const isLoading = isCreating || isUpdating;

  return (
    <div className="rounded-[2rem] border border-white/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-8 shadow-xl animate-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-extrabold mb-6 text-zinc-900 dark:text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 w-fit">
        {editingTransaction ? 'Chỉnh sửa giao dịch ✏️' : 'Thêm giao dịch mới ✨'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">
              Loại giao dịch
            </label>
            <div className="flex gap-4 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategoryId('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${type === 'expense' ? 'bg-white dark:bg-zinc-700 shadow-sm text-rose-500' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                <ArrowDownRight className="w-4 h-4" /> Chi tiêu
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategoryId('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${type === 'income' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-500' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                <ArrowUpRight className="w-4 h-4" /> Thu nhập
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">
              Số tiền
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="VD: 50000"
                className="w-full rounded-2xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-5 py-3 pr-12 text-zinc-900 dark:text-zinc-100 font-bold focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                đ
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">
              Danh mục
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-2xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-5 py-3 text-zinc-900 dark:text-zinc-100 font-medium focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all cursor-pointer appearance-none"
            >
              <option value="">-- Chọn danh mục --</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">
              Ngày giao dịch
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-5 py-3 text-zinc-900 dark:text-zinc-100 font-medium focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">
            Ghi chú
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ghi chú thêm..."
            className="w-full rounded-2xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-5 py-3 text-zinc-900 dark:text-zinc-100 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 text-sm font-bold text-zinc-600 bg-zinc-200 hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-2xl transition-all"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-4 text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-2xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isLoading ? 'Đang xử lý...' : editingTransaction ? 'Cập nhật' : 'Thêm giao dịch'}
          </button>
        </div>
      </form>
    </div>
  );
}
