import React from 'react';

interface TagProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function Tag({ label, selected, onToggle }: TagProps) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
  className={`relative w-full overflow-hidden rounded-2xl border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto dark:focus-visible:ring-offset-slate-900 ${
        selected
          ? 'border-transparent bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 text-white shadow-[0_10px_25px_rgba(56,189,248,0.32)]'
          : 'border-white/60 bg-white/55 text-slate-700 backdrop-blur-xl hover:border-sky-300/60 hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-sky-300/40'
      }`}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
}