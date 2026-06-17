import { useDashboardStats } from '@/features/dashboard/useDashboardStats';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const chartData = [
    {
      name: 'Thu nhập',
      'số tiền': stats?.income || 0,
      fill: 'url(#colorIncome)',
    },
    {
      name: 'Chi tiêu',
      'số tiền': stats?.expense || 0,
      fill: 'url(#colorExpense)',
    },
  ];

  if (isLoading) {
    return (
      <div className="text-zinc-500 dark:text-zinc-400 font-medium">
        Đang tải dữ liệu, chờ chút nhé... 🚀
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 font-medium bg-red-50 dark:bg-red-900/30 p-4 rounded-2xl">
        Ôi hỏng! Đã xảy ra lỗi khi tải dữ liệu. 😥
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Tổng quan
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">
          Tóm tắt tình hình tài chính của bạn
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="group rounded-[2rem] border-2 border-transparent hover:border-violet-200 dark:hover:border-violet-800 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/40 dark:to-fuchsia-900/40 p-6 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300">
          <div className="text-sm font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wider">
            Tổng số dư 💰
          </div>
          <div className="mt-4 text-4xl font-black text-violet-900 dark:text-violet-50 group-hover:scale-105 origin-left transition-transform">
            {formatCurrency(stats?.balance || 0)}
          </div>
        </div>

        <div className="group rounded-[2rem] border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300">
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Tổng thu nhập 📈
          </div>
          <div className="mt-4 text-4xl font-black text-emerald-700 dark:text-emerald-50 group-hover:scale-105 origin-left transition-transform">
            +{formatCurrency(stats?.income || 0)}
          </div>
        </div>

        <div className="group rounded-[2rem] border-2 border-transparent hover:border-rose-200 dark:hover:border-rose-800 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/40 dark:to-pink-900/40 p-6 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300">
          <div className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Tổng chi tiêu 📉
          </div>
          <div className="mt-4 text-4xl font-black text-rose-700 dark:text-rose-50 group-hover:scale-105 origin-left transition-transform">
            -{formatCurrency(stats?.expense || 0)}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-6 shadow-sm mt-8 h-[400px]">
        <h2 className="text-xl font-extrabold mb-6 text-zinc-900 dark:text-zinc-100">
          Biểu đồ thu chi 📊
        </h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={1} />
                <stop offset="95%" stopColor="#fb7185" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#71717a"
              opacity={0.15}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontWeight: 'bold' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={60}
              tick={{ fill: '#71717a', fontWeight: 'bold' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${value / 1000000} Tr`;
                if (value >= 1000) return `${value / 1000} K`;
                return value.toString();
              }}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              contentStyle={{
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: '#09090b',
                fontWeight: 'bold',
                backdropFilter: 'blur(8px)',
              }}
              formatter={(value: any) => formatCurrency(Number(value))}
            />
            <Bar
              dataKey="số tiền"
              radius={[8, 8, 8, 8]}
              maxBarSize={80}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
