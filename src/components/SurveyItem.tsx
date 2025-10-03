import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { JokeRow, ResponseRow, HUMOR_TYPES, DEVICE_TAGS, THEMES } from '@/types';
import { Likert } from './Likert';
import { Tag } from './Tag';

interface SurveyItemProps {
  index: number;
  total: number;
  joke: JokeRow;
  respondentId: string;
  onSubmit: (row: Omit<ResponseRow, 'respondent_id' | 'joke_order' | 'joke_id' | 'joke_text' | 'group_true' | 'attention_check_pass' | 'time_to_answer_ms'>) => void;
}

export function SurveyItem({
  index,
  total,
  joke,
  respondentId,
  onSubmit,
}: SurveyItemProps) {
  const [funniness, setFunniness] = useState<number | null>(null);
  const [humanLike, setHumanLike] = useState<number | null>(null);
  const [guess, setGuess] = useState<'Human' | 'AI' | "Can't tell" | null>(null);
  const [humorType, setHumorType] = useState<typeof HUMOR_TYPES[number] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [theme, setTheme] = useState<string | null>(null);
  const [appropriate, setAppropriate] = useState<'Yes' | 'No' | null>(null);
  const [offensive, setOffensive] = useState<0 | 1 | 2 | null>(0);
  const [comments, setComments] = useState('');
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!showDeviceInfo) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDeviceInfo(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDeviceInfo]);

  const ready = Boolean(funniness && humanLike && guess && humorType && theme && appropriate !== null && offensive !== null);

  const pct = Math.round(((index) / total) * 100);

  const optionBase =
    'relative w-full overflow-hidden rounded-2xl border px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto dark:focus-visible:ring-offset-slate-900';
  const optionSelected =
    'border-transparent bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 text-white shadow-[0_12px_30px_rgba(56,189,248,0.35)]';
  const optionIdle =
    'border-white/60 bg-white/55 text-slate-700 backdrop-blur-xl hover:border-sky-300/60 hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-sky-300/40';

  return (
  <section className="relative overflow-hidden rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 md:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.08)_0%,rgba(129,140,248,0.08)_55%,rgba(236,72,153,0.1)_100%)]" />
      </div>

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-slate-500 dark:text-slate-400">Item {index + 1} of {total}</p>
            {/* <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{joke.theme || 'Humor prompt'}</p> */}
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/60 backdrop-blur sm:max-w-sm md:w-52 dark:bg-slate-800/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 shadow-[0_0_18px_rgba(56,189,248,0.45)] transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

    <blockquote className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-5 text-base leading-relaxed text-slate-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] backdrop-blur-xl sm:p-6 sm:text-lg dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_70%)] opacity-80" />
          <span className="relative z-10 block">{joke.text}</span>
        </blockquote>

  <div className="grid gap-6">
          <Likert label="1) Funniness" value={funniness} setValue={setFunniness} />
          <Likert label="2) Human-likeness" value={humanLike} setValue={setHumanLike} />

          <div className="space-y-3">
            <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">3) Guess the source</label>
            <div className="grid gap-2.5 sm:flex sm:flex-wrap">
              {['Human', 'AI', "Can't tell"].map((v) => (
                <button
                  key={v}
                  onClick={() => setGuess(v as any)}
                  className={`${optionBase} ${guess === v ? optionSelected : optionIdle}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">4) Humor type (choose one)</label>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {HUMOR_TYPES.map((v) => (
                <button
                  key={v}
                  onClick={() => setHumorType(v)}
                  className={`${optionBase} text-left ${humorType === v ? optionSelected : optionIdle}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">Pick the dominant mechanism. Use "Unsure" only if nothing fits after a re‑read.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <label className="flex-1 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">5) Device tags (select all that apply)</label>
              <button
                type="button"
                onClick={() => setShowDeviceInfo(true)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200/70 bg-white/70 text-slate-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-slate-300 dark:focus-visible:ring-offset-slate-900"
              >
                <span className="sr-only">What do the joke types mean?</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                  <circle cx="12" cy="12" r="10" className="opacity-20" />
                  <path d="M12 11a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0v-4a1 1 0 0 0-1-1Zm0-4a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {DEVICE_TAGS.map((t) => (
                <Tag
                  key={t}
                  label={t}
                  selected={tags.includes(t)}
                  onToggle={() => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">6) Theme</label>
            <div className="grid gap-2.5 sm:flex sm:flex-wrap">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`${optionBase} ${theme === t ? optionSelected : optionIdle}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">7) Appropriate for class?</label>
              <div className="flex flex-wrap gap-2.5">
                {(['Yes', 'No'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setAppropriate(v)}
                    className={`${optionBase} ${appropriate === v ? optionSelected : optionIdle}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">8) Offensiveness</label>
              <div className="flex flex-wrap gap-2.5">
                {[0, 1, 2].map((v) => (
                  <button
                    key={v}
                    onClick={() => setOffensive(v as 0 | 1 | 2)}
                    className={`${optionBase} ${offensive === v ? optionSelected : optionIdle}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">9) Optional comment</label>
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                maxLength={120}
                className="h-32 w-full resize-none rounded-3xl bg-transparent px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 sm:h-28"
                placeholder="Max 120 characters"
              />
            </div>
          </div>
        </div>

  <div className="flex flex-col items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Respondent: <span className="font-mono text-slate-800 dark:text-slate-200">{respondentId}</span>
          </div>
          <button
            disabled={!ready}
            onClick={() => {
              if (!ready) return;
              onSubmit({
                funniness_1_5: funniness!,
                human_likeness_1_5: humanLike!,
                guess_source: guess!,
                humor_type: humorType!,
                device_tags: tags.join(';'),
                theme: theme!,
                appropriateness_class: appropriate!,
                offensiveness_0_2: offensive!,
                comments_optional: comments || undefined,
              });
            }}
            className={`w-full rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto dark:focus-visible:ring-offset-slate-900 ${
              ready
                ? 'bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 text-white shadow-[0_15px_35px_rgba(56,189,248,0.35)] hover:shadow-[0_20px_40px_rgba(56,189,248,0.45)]'
                : 'cursor-not-allowed border border-slate-200/70 bg-white/60 text-slate-500 backdrop-blur md:border-slate-200/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
            }`}
          >
            {index + 1 === total ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
      {isClient && showDeviceInfo
        ? createPortal(
            <div
              className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-8 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="device-tag-dialog-title"
              onClick={() => setShowDeviceInfo(false)}
            >
              <div
                className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-6 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.35)] backdrop-blur-3xl dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-200"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p id="device-tag-dialog-title" className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                      Joke type quick guide
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Understanding the tags</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeviceInfo(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-300 dark:focus-visible:ring-offset-slate-900"
                    aria-label="Close dialog"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M6.343 6.343a1 1 0 0 1 1.414 0L12 10.586l4.243-4.243a1 1 0 1 1 1.414 1.414L13.414 12l4.243 4.243a1 1 0 0 1-1.414 1.414L12 13.414l-4.243 4.243a1 1 0 0 1-1.414-1.414L10.586 12 6.343 7.757a1 1 0 0 1 0-1.414Z" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-relaxed">
                  <p><span className="font-semibold text-slate-800 dark:text-slate-100">Observational:</span> Points out funny, relatable things from everyday life that we’ve all noticed.</p>
                  <p><span className="font-semibold text-slate-800 dark:text-slate-100">One-liner:</span> A very short joke—usually one sentence—that delivers a quick punchline.</p>
                  <p><span className="font-semibold text-slate-800 dark:text-slate-100">Situational:</span> Humor that comes from a specific scenario or awkward moment and how people react in it.</p>
                  <p><span className="font-semibold text-slate-800 dark:text-slate-100">Pun:</span> A joke that plays with words that sound alike or have double meanings.</p>
                  <p><span className="font-semibold text-slate-800 dark:text-slate-100">Absurdism:</span> Comedy that’s funny because it’s weird, illogical, or wildly unexpected.</p>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}