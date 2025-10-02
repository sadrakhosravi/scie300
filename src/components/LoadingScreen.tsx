// components/LoadingScreen.tsx
'use client';

import React from 'react';

const FALLBACK_TIPS = [
  'Comedy scholars say the rule of three works because the third beat flips your expectations—watch for it in your favourite joke.',
  'We score each joke for wordplay, absurdity, and self-referential humor so you get a balanced punchline platter.',
  'A quick laugh break boosts focus by resetting your brain’s prediction loop—science has your back on this one.',
];

const STATUS_PILLS = [
  {
    icon: '✨',
    label: 'Humor Model',
    description: 'Balancing satire, dry wit, and wholesome chuckles for your session.',
  },
  {
    icon: '🧠',
    label: 'Context Sync',
    description: 'Personalizing topics with crowd feedback and recency tweaks.',
  },
  {
    icon: '📡',
    label: 'Laugh Link',
    description: 'Optimizing delivery cadence so punchlines land in under 200ms.',
  },
];

type LoadingScreenProps = {
  title?: string;
  caption?: string;
  /** 0–1 for a progress bar; leave undefined/null to show typing dots */
  progress?: number | null;
  /** Optional rotating tips (shown below the loader) */
  tips?: string[];
};

export default function LoadingScreen({
  title = 'SCIE 300 Humor Survey',
  caption = 'Loading jokes and settings…',
  progress = null,
  tips,
}: LoadingScreenProps) {
  const activeTips = tips && tips.length ? tips : FALLBACK_TIPS;
  const [tipIdx, setTipIdx] = React.useState(0);

  React.useEffect(() => {
    setTipIdx(0);
  }, [activeTips]);

  React.useEffect(() => {
    if (activeTips.length < 2) return;
    const id = setInterval(() => setTipIdx((i) => (i + 1) % activeTips.length), 2600);
    return () => clearInterval(id);
  }, [activeTips]);

  const tip = activeTips.length ? activeTips[tipIdx] : null;
  const clamped = progress == null ? null : Math.max(0, Math.min(1, progress));
  const percent = clamped == null ? null : Math.round(clamped * 100);

  const progressLabel = React.useMemo(() => {
    if (clamped == null) return 'Priming the punchlines';
    const pct = Math.round(clamped * 100);
    if (pct < 35) return 'Collecting crowd favourites';
    if (pct < 70) return 'Tuning comedic timing';
    if (pct < 95) return 'Polishing delivery cues';
    return 'Cycling through encore material';
  }, [clamped]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.32),transparent_70%)]" />
        <div className="absolute inset-0 opacity-80 mix-blend-screen loading-shimmer bg-[linear-gradient(120deg,rgba(56,189,248,0.18)_0%,rgba(99,102,241,0.14)_45%,rgba(236,72,153,0.18)_90%)] dark:bg-[linear-gradient(120deg,rgba(56,189,248,0.26)_0%,rgba(129,140,248,0.18)_45%,rgba(236,72,153,0.22)_90%)]" />
        <div className="loading-float absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-500/30" />
        <div className="loading-float absolute -bottom-36 right-1/4 h-80 w-80 rounded-full bg-fuchsia-200/40 blur-3xl dark:bg-fuchsia-500/25" style={{ animationDelay: '1.5s' }} />
      </div>

  <div className="relative w-full max-w-3xl px-4 sm:px-6">
        <div className="relative rounded-[36px]">
          <div className="pointer-events-none absolute inset-0 rounded-[36px] opacity-80 blur-2xl loading-shimmer bg-[conic-gradient(from_120deg_at_50%_50%,rgba(56,189,248,0.18),rgba(236,72,153,0.16),rgba(129,140,248,0.2),rgba(56,189,248,0.18))]" />

          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-[0_25px_55px_rgba(15,23,42,0.18)] backdrop-blur-3xl dark:border-white/10 dark:bg-slate-900/75">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),transparent_70%)]" />

	  	<div className="relative px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12">
              <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
                <div className="relative">
                  <div className="loading-glow absolute inset-0 -z-10 rounded-full bg-sky-400/30 blur-2xl dark:bg-sky-500/35" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/70 bg-white/30 backdrop-blur-xl shadow-inner dark:border-white/10 dark:bg-white/5">
                    <OrbitalLoader />
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-xs font-medium uppercase tracking-[0.44em] text-sky-600/80 dark:text-sky-300/80">Live status</p>
                  <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{title}</h2>
                  <p className="mt-4 max-w-xl text-sm text-slate-600 dark:text-slate-300 md:text-base">{caption}</p>
                </div>
              </div>

              <div className="mt-10 space-y-4" role="status" aria-live="polite">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{progressLabel}</span>
                  {percent != null && <span className="text-sm font-semibold text-slate-900 dark:text-white">{percent}%</span>}
                </div>

                {clamped == null ? (
                  <TypingDots />
                ) : (
                  <>
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/70">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 transition-[width] duration-700 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/70 to-transparent mix-blend-screen" aria-hidden />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Signal strength steady</span>
                      <span>{percent}% synched</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3" aria-hidden>
                {STATUS_PILLS.map((status) => (
                  <StatusPill key={status.label} {...status} />
                ))}
              </div>

              {tip && (
                <div className="mt-10 rounded-3xl border border-slate-200/70 bg-white/70 px-5 py-6 text-left backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Comedy insight</span>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200 md:text-base">{tip}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrbitalLoader() {
  return (
    <div className="relative h-16 w-16" aria-hidden>
      <span className="absolute inset-0 rounded-full border border-slate-200/70 dark:border-white/15" />
      <span className="absolute inset-[18%] rounded-full border border-slate-200/60 dark:border-white/10" />

      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute inset-0 animate-spin-slowest"
          style={{ animationDelay: `${i * 0.2}s`, animationDuration: `${3 + i * 0.4}s` }}
        >
          <span className="absolute -top-1.5 left-1/2 -ml-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500 shadow-[0_0_12px_rgba(56,189,248,0.55)]" />
        </span>
      ))}

      <span className="absolute inset-[38%] rounded-full bg-gradient-to-br from-sky-400/25 via-indigo-500/20 to-transparent blur-md" />
      <span className="absolute inset-[42%] rounded-full bg-white/70 mix-blend-screen dark:bg-white/40" />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-3" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span key={i} className="relative flex h-3 w-3 items-center justify-center">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500 animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
          <span
            className="absolute inset-0 rounded-full bg-sky-400/60 blur-lg opacity-60 animate-ping"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        </span>
      ))}
    </div>
  );
}

type StatusPillProps = (typeof STATUS_PILLS)[number];

function StatusPill({ icon, label, description }: StatusPillProps) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 px-4 py-4 backdrop-blur-xl shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-100">
        <span className="text-base">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}