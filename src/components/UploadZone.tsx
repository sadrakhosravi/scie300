import React, { useRef } from 'react';

interface UploadZoneProps {
  onFile: (file: File) => void;
}

export function UploadZone({ onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="flex items-center gap-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="group relative flex-1 cursor-pointer overflow-hidden rounded-3xl border border-dashed border-white/60 bg-white/50 px-6 py-6 text-sm text-slate-600 backdrop-blur-xl transition-all duration-300 hover:border-sky-300/70 hover:bg-white/75 dark:border-white/15 dark:bg-white/10 dark:text-slate-200"
        onClick={() => inputRef.current?.click()}
      >
        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-[1px] rounded-[1.45rem] bg-gradient-to-r from-sky-400/25 via-indigo-500/20 to-fuchsia-500/20" />
        </div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Upload jokes</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">
              Drag & drop your <span className="font-mono">jokes.csv</span> here or click to browse.
            </p>
          </div>
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/80 via-indigo-500/80 to-fuchsia-500/80 text-white shadow-[0_10px_25px_rgba(56,189,248,0.32)]">
            ⬆️
          </span>
        </div>
      </div>
      <input 
        ref={inputRef} 
        type="file" 
        accept=".csv" 
        className="hidden" 
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }} 
      />
    </div>
  );
}