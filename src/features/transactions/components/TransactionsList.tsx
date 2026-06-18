import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Frown, Pencil, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useTransactions } from '@/features/transactions/useTransactions';

interface TransactionsListProps {
  transactions: any[];
  isLoading: boolean;
  activeFamilyId: string | null;
  onEdit: (transaction: any) => void;
}

export function TransactionsList({
  transactions,
  isLoading,
  activeFamilyId,
  onEdit,
}: TransactionsListProps) {
  const { deleteTransaction } = useTransactions();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 font-bold animate-pulse">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-16 text-center text-zinc-500 dark:text-zinc-400 flex flex-col items-center">
        <Frown className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
        <p className="font-bold text-lg">Chưa có giao dịch nào.</p>
        <p className="text-sm mt-1">Hãy thử thay đổi bộ lọc hoặc thêm giao dịch mới nhé!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {transactions.map((t) => (
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
                      <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
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
                    onClick={() => onEdit(t)}
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

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Xóa giao dịch"
        message="Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
