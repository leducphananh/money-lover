import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function AlertModal({ isOpen, title, message, type = 'info', onClose }: AlertModalProps) {
  if (!isOpen) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-white/20 dark:border-zinc-800/50 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-2xl mb-4 animate-bounce-soft ${
            isError ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' :
            isSuccess ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500' :
            'bg-blue-100 dark:bg-blue-900/30 text-blue-500'
          }`}>
            {isSuccess ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">{title}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-6">
            {message}
          </p>
          <button
            onClick={onClose}
            className={`w-full py-3 px-4 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${
              isError ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' :
              isSuccess ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' :
              'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'
            }`}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
