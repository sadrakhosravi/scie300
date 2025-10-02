import React, { useState } from 'react';
import { JokeRow, ResponseRow, HUMOR_TYPES, DEVICE_TAGS, THEMES } from '@/types';
import { Likert } from './Likert';
import { Tag } from './Tag';

interface SurveyItemProps {
  index: number;
  total: number;
  joke: JokeRow;
  respondentId: string;
  onSubmit: (row: Omit<ResponseRow, 'respondent_id' | 'joke_order' | 'joke_id' | 'group_true' | 'attention_check_pass' | 'time_to_answer_ms'>) => void;
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

  const ready = Boolean(funniness && humanLike && guess && humorType && theme && appropriate !== null && offensive !== null);

  const pct = Math.round(((index) / total) * 100);

  const optionBase =
    'relative overflow-hidden rounded-2xl border px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900';
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-slate-500 dark:text-slate-400">Item {index + 1} of {total}</p>
            {/* <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{joke.theme || 'Humor prompt'}</p> */}
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/60 backdrop-blur md:w-52 dark:bg-slate-800/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 shadow-[0_0_18px_rgba(56,189,248,0.45)] transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

  <blockquote className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 text-lg leading-relaxed text-slate-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_70%)] opacity-80" />
          <span className="relative z-10 block">{joke.text}</span>
        </blockquote>

        <div className="grid gap-6">
          <Likert label="1) Funniness" value={funniness} setValue={setFunniness} />
          <Likert label="2) Human-likeness" value={humanLike} setValue={setHumanLike} />

          <div className="space-y-3">
            <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">3) Guess the source</label>
            <div className="flex flex-wrap gap-2.5">
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
            <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">4) Humor type (choose one)</label>
            <div className="grid gap-2.5 md:grid-cols-3">
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
            <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">5) Device tags (select all that apply)</label>
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
            <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">6) Theme</label>
            <div className="flex flex-wrap gap-2.5">
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">7) Appropriate for class?</label>
              <div className="flex gap-2.5">
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
              <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">8) Offensiveness</label>
              <div className="flex gap-2.5">
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
            <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">9) Optional comment</label>
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                maxLength={120}
                className="h-28 w-full resize-none rounded-3xl bg-transparent px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="Max 120 characters"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 pt-2 sm:flex-row sm:items-center">
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
            className={`rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${
              ready
                ? 'bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 text-white shadow-[0_15px_35px_rgba(56,189,248,0.35)] hover:shadow-[0_20px_40px_rgba(56,189,248,0.45)]'
                : 'cursor-not-allowed border border-slate-200/70 bg-white/60 text-slate-500 backdrop-blur md:border-slate-200/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
            }`}
          >
            {index + 1 === total ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </section>
  );
}