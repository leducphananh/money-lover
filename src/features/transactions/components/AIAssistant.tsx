import { useState, useRef, useEffect } from 'react';
import { Loader2, Mic, Sparkles, X, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useCategories } from '@/features/categories/useCategories';
import { useTransactions } from '@/features/transactions/useTransactions';
import { type AIParsedTransaction } from '@/lib/gemini';
import { AlertModal } from '@/components/ui/AlertModal';

export function AIAssistant() {
  const { user } = useAuth();
  const { data: categories } = useCategories();
  const { createTransaction } = useTransactions();

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
      // Wait, is success alert native or modal?
      // "chỉ thay alert modal khi AI phân tích lỗi" -> success can be native alert
      alert(`Thành công\nĐã lưu ${pendingAiTransactions.length} giao dịch!`);
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

  return (
    <div className="rounded-[2rem] border-2 border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 p-6 md:p-8 animate-in slide-in-from-top-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-inner">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            Trợ lý AI siêu tốc
          </h3>
        </div>
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
          className="shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 h-[60px] w-[140px] text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300"
        >
          {isAiLoading ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
            </div>
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
                  <Trash2 className="w-5 h-5" />
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
