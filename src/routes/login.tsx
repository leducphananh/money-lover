import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/features/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/login')({
  component: LoginRoute,
});

function LoginRoute() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { session } = useAuth();

  // Chuyển hướng khi có session mới
  useEffect(() => {
    if (session) {
      navigate({ to: '/', replace: true });
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Nếu thành công, useEffect bên trên sẽ tự động navigate khi session được cập nhật!
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0],
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setError('Vui lòng kiểm tra email để xác nhận tài khoản!');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 dark:from-indigo-950 dark:via-purple-900 dark:to-fuchsia-950 p-4 transition-colors duration-500">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 rounded-[2rem] bg-white/60 dark:bg-zinc-950/40 p-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/40 dark:border-white/10 animate-in fade-in zoom-in duration-500">
        <div className="text-center flex flex-col items-center">
          <div className="bg-gradient-to-tr from-pink-500 to-violet-500 p-4 rounded-[1.5rem] shadow-lg shadow-pink-500/30 mb-6 animate-bounce-soft">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            MoneyLover
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-300 font-medium">
            Quản lý tài chính thật vui vẻ! ✨
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-100/80 dark:bg-red-900/50 p-4 text-sm font-medium text-red-800 dark:text-red-200 border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 ml-1"
              >
                Địa chỉ email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 block w-full rounded-2xl border-2 border-white/50 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/20 dark:focus:border-fuchsia-500 dark:focus:ring-fuchsia-500/20 transition-all shadow-sm"
                placeholder="hello@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-zinc-700 dark:text-zinc-200 ml-1"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 block w-full rounded-2xl border-2 border-white/50 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/20 dark:focus:border-fuchsia-500 dark:focus:ring-fuchsia-500/20 transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              🚀 Đăng nhập ngay
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border-2 border-transparent hover:border-pink-200 dark:hover:border-fuchsia-800 px-4 py-3.5 text-base font-bold text-zinc-700 dark:text-zinc-200 shadow-sm hover:bg-white dark:hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              Tạo tài khoản mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
