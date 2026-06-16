import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Resolve the actual current theme including system preference
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-zinc-200/50 bg-white/50 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 transition-all hover:scale-110 active:scale-95"
      aria-label="Toggle theme"
      title="Đổi giao diện Sáng/Tối"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-indigo-400" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
