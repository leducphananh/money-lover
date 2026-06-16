import { AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-white/20 dark:border-zinc-800/50 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl mb-4 text-rose-500 animate-bounce-soft">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">{title}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-6">
            {message}
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl transition-all active:scale-95"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/30 active:scale-95"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
