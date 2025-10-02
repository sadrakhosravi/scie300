import React from 'react';

interface LikertProps {
  label: string;
  value: number | null;
  setValue: (n: number) => void;
}

export function Likert({ label, value, setValue }: LikertProps) {
  return (
    <div className="space-y-3">
      <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
        {label} (1–5)
      </label>
      <div className="flex flex-wrap gap-2.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              onClick={() => setValue(n)}
              className={`relative flex-1 overflow-hidden rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:flex-none dark:focus-visible:ring-offset-slate-900 ${
                selected
                  ? 'border-transparent bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 text-white shadow-[0_12px_30px_rgba(56,189,248,0.35)]'
                  : 'border-white/60 bg-white/55 text-slate-700 backdrop-blur-xl hover:border-sky-300/60 hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-sky-300/40'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      {label.toLowerCase().includes('funniness') && (
        <p className="mt-1 text-[0.7rem] text-slate-500 dark:text-slate-400">1 = Not funny · 3 = Moderately funny · 5 = Hilarious</p>
      )}
      {label.toLowerCase().includes('human') && (
        <p className="mt-1 text-[0.7rem] text-slate-500 dark:text-slate-400">1 = Clearly AI-like · 3 = Unsure · 5 = Clearly human-like</p>
      )}
    </div>
  );
}