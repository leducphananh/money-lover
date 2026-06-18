import { useAuth } from '@/features/auth/AuthContext';
import { useCategories } from '@/features/categories/useCategories';
import { useFamilyContext } from '@/features/families/FamilyContext';
import { useTransactions } from '@/features/transactions/useTransactions';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Filter,
  Frown,
  Loader2,
  Mic,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AlertModal } from '@/components/ui/AlertModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { type AIParsedTransaction } from '@/lib/gemini';

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

  // AI & Voice States
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  // Refs for audio visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [volumes, setVolumes] = useState<number[]>([]);
  const [pendingAiTransactions, setPendingAiTransactions] = useState<
    AIParsedTransaction[] | null
  >(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(56, scrollHeight)}px`;
    }
  }, [aiInput]);

  const showAlert = (
    title: string,
    message: string,
    type: 'error' | 'success' | 'info' = 'info',
  ) => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

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

  // --- Audio Visualizer Logic ---
  const startVisualizerLoop = () => {
    if (visualizerIntervalRef.current)
      clearInterval(visualizerIntervalRef.current);

    visualizerIntervalRef.current = setInterval(() => {
      if (!analyserRef.current) return;
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;

      const height = Math.min(24, Math.max(4, (average / 128) * 20));

      setVolumes((prev) => {
        const next = [...prev, height];
        if (next.length > 40) return next.slice(next.length - 40);
        return next;
      });
    }, 75);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (visualizerIntervalRef.current) {
      clearInterval(visualizerIntervalRef.current);
      visualizerIntervalRef.current = null;
    }
  };

  const cancelListening = () => {
    stopListening();
    setAiInput('');
  };

  const acceptListening = () => {
    stopListening();
  };

  // --- AI Logic ---
  const startListening = async () => {
    setVolumes([]);
    setAiInput('');
    setPendingAiTransactions(null);
    // @ts-ignore
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showAlert(
        'Lỗi',
        'Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!',
        'error',
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'vi-VN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const fullTranscript = Array.from(event.results)
        .map((res: any) => res[0].transcript)
        .join('');

      setAiInput(fullTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };

    recognition.start();

    // Start audio visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      startVisualizerLoop();
    } catch (err) {
      console.error('Không thể truy cập microphone cho visualizer:', err);
    }
  };

  const handleAiSubmit = async () => {
    if (!aiInput.trim() || !categories || !user) return;
    setIsAiLoading(true);
    try {
      const { parseTransactionsWithAI } = await import('@/lib/gemini');
      const mappedCategories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
      }));
      const parsed = await parseTransactionsWithAI(aiInput, mappedCategories);

      if (parsed.length > 0) {
        setPendingAiTransactions(parsed);
      }
    } catch (err: any) {
      showAlert('Lỗi', err.message, 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSavePendingAi = async () => {
    if (!pendingAiTransactions || !user) return;
    setIsAiLoading(true);
    try {
      await Promise.all(
        pendingAiTransactions.map((tx) =>
          createTransaction({
            user_id: user.id,
            amount: tx.amount,
            type: tx.type,
            category_id: tx.category_id,
            date: tx.date,
            notes: tx.notes,
          }),
        ),
      );
      setAiInput('');
      setPendingAiTransactions(null);
      showAlert(
        'Thành công',
        `Đã lưu ${pendingAiTransactions.length} giao dịch!`,
        'success',
      );
    } catch (err: any) {
      showAlert('Lỗi', err.message, 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdatePendingTx = (index: number, field: string, value: any) => {
    if (!pendingAiTransactions) return;
    const newPending = [...pendingAiTransactions];
    newPending[index] = { ...newPending[index], [field]: value };
    setPendingAiTransactions(newPending);
  };

  const handleRemovePendingTx = (index: number) => {
    if (!pendingAiTransactions) return;
    const newPending = pendingAiTransactions.filter((_, i) => i !== index);
    if (newPending.length === 0) {
      setPendingAiTransactions(null);
      setAiInput('');
    } else {
      setPendingAiTransactions(newPending);
    }
  };
  // --- End AI Logic ---

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

      {/* Nhập nhanh bằng AI */}
      <div className="rounded-[2rem] border border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-br from-white/80 to-amber-50/50 dark:from-zinc-900/80 dark:to-amber-950/20 backdrop-blur-xl p-6 shadow-lg shadow-amber-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">
            Trợ lý AI siêu tốc
          </h3>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 items-end">
          <div className="relative flex-1 min-h-[60px] w-full">
            {isListening && (
              <div className="absolute inset-0 z-20 flex items-center justify-between px-4 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-400 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={cancelListening}
                  className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-rose-500 rounded-xl transition-all shrink-0"
                  title="Hủy nghe"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="flex items-center gap-[3px] h-8 ml-2 flex-1 overflow-hidden justify-center">
                    {volumes.map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-rose-400 dark:bg-rose-500 rounded-full shrink-0 transition-all duration-75"
                        style={{
                          height: `${h}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={acceptListening}
                  className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-all shrink-0"
                  title="Đồng ý"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            )}
            <div
              className={`flex items-end w-full min-h-[60px] rounded-2xl border-2 bg-white/60 dark:bg-zinc-900/60 transition-all border-amber-100 dark:border-amber-900/50 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/20 focus-within:bg-white dark:focus-within:bg-zinc-900 ${
                isListening ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <textarea
                ref={textareaRef}
                value={aiInput}
                rows={1}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder='VD: "Hôm nay đổ xăng 50k và ăn bún bò hết 45k"'
                className="flex-1 min-h-[56px] max-h-[160px] resize-none bg-transparent pl-5 pr-2 py-[16px] text-base text-zinc-900 dark:text-zinc-100 font-medium leading-normal focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiSubmit();
                  }
                }}
              />
              <div className="shrink-0 pb-[10px] pr-2.5">
                <button
                  onClick={startListening}
                  className="p-2 rounded-xl transition-all text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-500"
                  title="Nhập bằng giọng nói"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleAiSubmit}
            disabled={isAiLoading || !aiInput.trim()}
            className="shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 h-[60px] text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300"
          >
            {isAiLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Phân tích <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Pending AI Transactions Review UI */}
        {pendingAiTransactions && pendingAiTransactions.length > 0 && (
          <div className="mt-6 p-5 bg-white dark:bg-zinc-900/80 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-inner">
            <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Xác nhận {pendingAiTransactions.length} giao dịch
            </h4>
            <div className="space-y-3 mb-5">
              {pendingAiTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700/50"
                >
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <div className="flex gap-2 w-full">
                      <input
                        type="number"
                        value={tx.amount}
                        onChange={(e) =>
                          handleUpdatePendingTx(
                            index,
                            'amount',
                            Number(e.target.value),
                          )
                        }
                        className="w-32 bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg text-sm font-bold text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                      />
                      <select
                        value={tx.category_id}
                        onChange={(e) =>
                          handleUpdatePendingTx(
                            index,
                            'category_id',
                            e.target.value,
                          )
                        }
                        className="flex-1 bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                      >
                        {categories?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 w-full">
                      <input
                        type="date"
                        value={tx.date}
                        onChange={(e) =>
                          handleUpdatePendingTx(index, 'date', e.target.value)
                        }
                        className="w-32 bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg text-sm text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                      />
                      <input
                        type="text"
                        value={tx.notes}
                        onChange={(e) =>
                          handleUpdatePendingTx(index, 'notes', e.target.value)
                        }
                        placeholder="Ghi chú..."
                        className="flex-1 bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePendingTx(index)}
                    className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg shrink-0 self-end sm:self-auto"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <button
                onClick={() => setPendingAiTransactions(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSavePendingAi}
                disabled={isAiLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 hover:shadow-rose-500/40 transition-all flex items-center gap-2"
              >
                {isAiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Lưu tất cả'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

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
        isOpen={deleteId !== null}
        title="Xóa giao dịch"
        message="Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
