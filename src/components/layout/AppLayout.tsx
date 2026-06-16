import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/features/auth/AuthContext';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Loader2,
  LogOut,
  Receipt,
  Tags,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

export function AppLayout() {
  const { signOut, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    navigate({ to: '/login', replace: true });
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0a0514] overflow-hidden transition-colors duration-500 font-sans p-2 md:p-4 gap-4">
      {/* Sidebar - Floating style */}
      <aside className="w-64 flex-col rounded-[2rem] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hidden md:flex overflow-hidden">
        <div className="flex h-20 items-center justify-between px-6 border-b border-zinc-100/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-pink-500 to-violet-500 p-2 rounded-xl shadow-md shadow-pink-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 tracking-tight">
              MoneyLover
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-pink-50 dark:hover:bg-fuchsia-900/30 hover:text-pink-600 dark:hover:text-fuchsia-300 [&.active]:bg-pink-100 dark:[&.active]:bg-fuchsia-900/50 [&.active]:text-pink-700 dark:[&.active]:text-fuchsia-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LayoutDashboard className="h-5 w-5" />
            Tổng quan
          </Link>
          <Link
            to="/transactions"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-300 [&.active]:bg-violet-100 dark:[&.active]:bg-violet-900/50 [&.active]:text-violet-700 dark:[&.active]:text-violet-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Receipt className="h-5 w-5" />
            Giao dịch
          </Link>
          <Link
            to="/categories"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-300 [&.active]:bg-amber-100 dark:[&.active]:bg-amber-900/50 [&.active]:text-amber-700 dark:[&.active]:text-amber-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Tags className="h-5 w-5" />
            Danh mục
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-100/50 dark:border-zinc-800/50">
          <div className="mb-4 px-3 text-xs font-medium text-zinc-400 dark:text-zinc-500 truncate">
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoggingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            {isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 rounded-[2rem] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden relative">
        {/* Decorative background blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-pink-400/20 dark:bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-4 md:hidden z-10">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-pink-500" />
            <div className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
              MoneyLover
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        {/* Topbar for Desktop (Just for ThemeToggle basically) */}
        <div className="hidden md:flex justify-end p-4 absolute top-0 right-0 z-20">
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-10 z-10 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
