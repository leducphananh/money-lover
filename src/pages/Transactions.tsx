import { useAuth } from '@/features/auth/AuthContext';
import { useCategories } from '@/features/categories/useCategories';
import { useFamilyContext } from '@/features/families/FamilyContext';
import { useTransactions } from '@/features/transactions/useTransactions';
import {
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Frown,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function Transactions() {
  const { user } = useAuth();
  const { activeFamilyId } = useFamilyContext();
  const {
    data: transactions,
    isLoading,
    deleteTransaction,
  } = useTransactions();
  const { data: categories } = useCategories();
  const { createTransaction, updateTransaction, isCreating, isUpdating } =
    useTransactions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Filter States
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !categoryId || !date) return;

    if (editingId) {
      await updateTransaction({
        id: editingId,
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

    setIsFormOpen(false);
    setEditingId(null);
    setAmount('');
    setNotes('');
  };

  const openEditForm = (transaction: any) => {
    setEditingId(transaction.id);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setCategoryId(transaction.category_id);
    setDate(new Date(transaction.date).toISOString().split('T')[0]);
    setNotes(transaction.notes || '');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setAmount('');
    setNotes('');
  };

  const filteredCategories = categories?.filter((c) => c.type === type) || [];

  // Reset category selection when changing type if the current category is not of the new type
  useEffect(() => {
    if (categoryId) {
      const selectedCat = categories?.find((c) => c.id === categoryId);
      if (selectedCat && selectedCat.type !== type) {
        setCategoryId('');
      }
    }
  }, [type, categories, categoryId]);

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
    categories?.filter((c) => filterType === 'all' || c.type === filterType) ||
    [];

  // Derived Filtered List
  const filteredTransactionsList = useMemo(() => {
    return transactions?.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category_id !== filterCategory)
        return false;
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              setEditingId(null);
              setAmount('');
              setNotes('');
              setDate(new Date().toISOString().split('T')[0]);
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

      {isFormOpen && (
        <div className="rounded-[2rem] border border-white/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-8 shadow-xl animate-in zoom-in-95 duration-300">
          <h2 className="text-2xl font-extrabold mb-6 text-zinc-900 dark:text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 w-fit">
            {editingId ? 'Chỉnh sửa giao dịch ✏️' : 'Thêm giao dịch mới ✨'}
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
                  Danh mục
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full rounded-2xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Chọn danh mục
                  </option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-bold text-lg focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">
                  Ngày
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all cursor-pointer"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">
                  Ghi chú (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-2xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all"
                  placeholder="Chi tiết giao dịch vui vẻ..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4">
              <button
                type="button"
                onClick={closeForm}
                className="px-6 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-1 active:translate-y-0 rounded-2xl disabled:opacity-50 transition-all"
              >
                {isCreating || isUpdating
                  ? 'Đang lưu...'
                  : editingId
                    ? 'Cập nhật 🚀'
                    : 'Lưu giao dịch 🚀'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/50 dark:border-zinc-800/50 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2 text-zinc-700 dark:text-zinc-200 font-extrabold">
          <Filter className="w-5 h-5 text-violet-500" /> Bộ lọc
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Từ ngày
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-3 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Đến ngày
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-3 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Loại
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterCategory('all');
              }}
              className="w-full rounded-xl border border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-3 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="expense">Chi tiêu</option>
              <option value="income">Thu nhập</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Danh mục
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-3 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all cursor-pointer"
            >
              <option value="all">Tất cả</option>
              {filterableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {activeFamilyId && (
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Người tạo
              </label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full rounded-xl border border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-3 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all cursor-pointer"
              >
                <option value="all">Tất cả</option>
                {uniqueUsers.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 font-bold animate-pulse">
            Đang tải dữ liệu...
          </div>
        ) : filteredTransactionsList?.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 dark:text-zinc-400 flex flex-col items-center">
            <Frown className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="font-bold text-lg">Chưa có giao dịch nào.</p>
            <p className="text-sm mt-1">
              Hãy thử thay đổi bộ lọc hoặc thêm giao dịch mới nhé!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactionsList?.map((t) => (
              <div
                key={t.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/40 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 gap-4"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}
                  >
                    {t.type === 'income' ? (
                      <ArrowUpRight className="w-6 h-6" />
                    ) : (
                      <ArrowDownRight className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100 truncate">
                      {/* @ts-ignore */}
                      {t.category?.name || 'Không xác định'}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-bold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('vi-VN')}
                      </span>
                      {t.notes && (
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] sm:max-w-[200px]">
                          {t.notes}
                        </span>
                      )}
                      {activeFamilyId && (
                        <>
                          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">
                            •
                          </span>
                          <span className="text-xs font-bold text-violet-500 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded-lg truncate max-w-[120px]">
                            {/* @ts-ignore */}
                            {t.profiles?.full_name || 'Thành viên'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto w-full mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-zinc-100 dark:border-white/5 sm:border-0">
                  <div
                    className={`font-black text-xl ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'} truncate`}
                  >
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </div>
                  {t.user_id && (
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all flex-shrink-0">
                      <button
                        onClick={() => openEditForm(t)}
                        className="p-3 text-zinc-300 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-xl transition-all"
                        title="Sửa giao dịch"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                        title="Xóa giao dịch"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Xóa giao dịch này?"
        message="Dữ liệu sau khi xóa sẽ không thể khôi phục lại được đâu nhé!"
        onConfirm={() => {
          if (deleteId) deleteTransaction(deleteId);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
