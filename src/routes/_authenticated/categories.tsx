import { createFileRoute } from '@tanstack/react-router';
import { useCategories } from '@/features/categories/useCategories';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Plus, Trash2, Tags, TrendingUp, TrendingDown } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export const Route = createFileRoute('/_authenticated/categories')({
  component: CategoriesRoute,
});

function CategoriesRoute() {
  const { user } = useAuth();
  const { data: categories, isLoading, createCategory, deleteCategory, isCreating } = useCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;

    await createCategory({
      user_id: user.id,
      name,
      type,
    });

    setIsFormOpen(false);
    setName('');
  };

  const incomeCategories = categories?.filter(c => c.type === 'income') || [];
  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Danh mục</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">Phân loại các khoản tiền của bạn 🏷️</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
        >
          <Plus className={`h-5 w-5 transition-transform duration-300 ${isFormOpen ? 'rotate-45' : ''}`} />
          {isFormOpen ? 'Đóng form' : 'Thêm danh mục'}
        </button>
      </div>

      {isFormOpen && (
        <div className="rounded-[2rem] border border-white/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-8 shadow-xl animate-in zoom-in-95 duration-300">
          <h2 className="text-2xl font-extrabold mb-6 text-zinc-900 dark:text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 w-fit">
            Tạo danh mục mới 🎨
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">Thuộc loại nào?</label>
                <div className="flex gap-4 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === 'expense' ? 'bg-white dark:bg-zinc-700 shadow-sm text-rose-500' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  >
                    <TrendingDown className="w-4 h-4" /> Chi tiêu
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === 'income' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-500' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  >
                    <TrendingUp className="w-4 h-4" /> Thu nhập
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">Tên danh mục</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-bold focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-amber-400/20 transition-all"
                  placeholder="Ví dụ: Ăn vặt, Mua sắm quần áo..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-1 active:translate-y-0 rounded-2xl disabled:opacity-50 transition-all"
              >
                {isCreating ? 'Đang lưu...' : 'Thêm danh mục 🚀'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 font-bold animate-pulse">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cột Chi tiêu */}
          <div className="rounded-[2rem] border-2 border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl">
                <TrendingDown className="w-6 h-6 text-rose-500 dark:text-rose-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">Chi tiêu</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {expenseCategories.length === 0 ? (
                <div className="text-rose-400/70 text-sm font-medium p-4">Chưa có danh mục nào.</div>
              ) : (
                expenseCategories.map(c => (
                  <div key={c.id} className="group flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-rose-100 dark:border-rose-900/50 hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700 transition-all">
                    <Tags className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">{c.name}</span>
                    {c.user_id ? (
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-1.5 ml-1 text-zinc-400 hover:text-white hover:bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <div className="w-6 ml-1"></div> // Placeholder cho alignment
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cột Thu nhập */}
          <div className="rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Thu nhập</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {incomeCategories.length === 0 ? (
                <div className="text-emerald-400/70 text-sm font-medium p-4">Chưa có danh mục nào.</div>
              ) : (
                incomeCategories.map(c => (
                  <div key={c.id} className="group flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-emerald-100 dark:border-emerald-900/50 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                    <Tags className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">{c.name}</span>
                    {c.user_id ? (
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-1.5 ml-1 text-zinc-400 hover:text-white hover:bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <div className="w-6 ml-1"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Xóa danh mục này?"
        message="Dữ liệu sau khi xóa sẽ không thể khôi phục lại được đâu nhé!"
        onConfirm={() => {
          if (deleteId) deleteCategory(deleteId);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
