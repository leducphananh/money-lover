import { Filter } from 'lucide-react';

interface TransactionsFilterProps {
  filterStartDate: string;
  setFilterStartDate: (val: string) => void;
  filterEndDate: string;
  setFilterEndDate: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterUser: string;
  setFilterUser: (val: string) => void;
  activeFamilyId: string | null;
  uniqueUsers: [string, string][];
  filterableCategories: any[];
}

export function TransactionsFilter({
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  filterUser,
  setFilterUser,
  activeFamilyId,
  uniqueUsers,
  filterableCategories,
}: TransactionsFilterProps) {
  return (
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
  );
}
