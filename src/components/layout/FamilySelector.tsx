import { useFamilies, useFamilyInvites } from '@/features/families/useFamilies';
import { useFamilyContext } from '@/features/families/FamilyContext';
import { Users, User as UserIcon, Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function FamilySelector() {
  const { families } = useFamilies();
  const { invites } = useFamilyInvites();
  const { activeFamilyId, setActiveFamilyId } = useFamilyContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFamily = families.find(f => f.id === activeFamilyId);
  const pendingCount = invites.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 px-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-colors border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm"
      >
        {activeFamilyId ? (
          <Users className="w-4 h-4 text-violet-500" />
        ) : (
          <UserIcon className="w-4 h-4 text-pink-500" />
        )}
        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 max-w-[100px] truncate">
          {activeFamilyId ? activeFamily?.name : 'Cá nhân'}
        </span>
        {pendingCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {pendingCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                setActiveFamilyId(null);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                activeFamilyId === null
                  ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Cá nhân
              </div>
              {activeFamilyId === null && <Check className="w-4 h-4" />}
            </button>

            {families.length > 0 && (
              <div className="my-2 border-t border-zinc-100 dark:border-zinc-800" />
            )}

            {families.map(family => (
              <button
                key={family.id}
                onClick={() => {
                  setActiveFamilyId(family.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                  activeFamilyId === family.id
                    ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
                    : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Users className="w-4 h-4 min-w-4" />
                  <span className="truncate">{family.name}</span>
                </div>
                {activeFamilyId === family.id && <Check className="w-4 h-4 min-w-4" />}
              </button>
            ))}

            <div className="my-2 border-t border-zinc-100 dark:border-zinc-800" />

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/families');
              }}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30 transition-colors"
            >
              Quản lý Nhóm
              {pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
