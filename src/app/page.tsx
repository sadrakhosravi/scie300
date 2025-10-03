'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { JokeRow, ResponseRow, HUMOR_TYPES } from '@/types';
import { randomId, csvToJokes, shuffle } from '@/lib/utils';
import { SurveyItem } from '@/components/SurveyItem';
import LoadingScreen from '@/components/LoadingScreen';

const PROGRESS_STORAGE_KEY = 'survey_progress_v1';

const RESPONSE_COLUMNS = [
  'respondent_id',
  'joke_order',
  'joke_id',
  'joke_text',
  'group_true',
  'funniness_1_5',
  'human_likeness_1_5',
  'guess_source',
  'humor_type',
  'theme',
  'appropriateness_class',
  'offensiveness_0_2',
  'attention_check_pass',
  'time_to_answer_ms',
  'comments_optional',
] as const;

export default function Page() {
  // Initialize with a stable default value to prevent hydration mismatch
  const [initialLoading, setInitialLoading] = useState(true);
  const [respondentId, setRespondentId] = useState<string>('');
  const [jokes, setJokes] = useState<JokeRow[]>([]);
  const [jokesLoading, setJokesLoading] = useState(true);
  const [jokesError, setJokesError] = useState<string | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState<string | null>(null);
  const itemStartRef = useRef<number>(0);
  const jokeSignature = useMemo(() => {
    if (!jokes.length) return '';
    const ids = jokes.map((j) => String(j.joke_id ?? '')).sort((a, b) => a.localeCompare(b));
    return ids.join('|');
  }, [jokes]);
  const hasProgress = started || finished || responses.length > 0 || order.length > 0;

  // Set respondent ID after component mounts to avoid hydration mismatch
  useEffect(() => {
    const storedId = localStorage.getItem('respondent_id');
    const id = storedId || randomId();
    setRespondentId(id);
    localStorage.setItem('respondent_id', id);
  }, []);

  useEffect(() => {
    if (progressLoaded) return;
    if (!respondentId) return;
    if (jokesLoading) return;

    const rawProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!rawProgress) {
      setProgressLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(rawProgress) ?? {};
      const storedSignature = typeof parsed.jokeSignature === 'string' ? parsed.jokeSignature : null;
      if (storedSignature && jokeSignature && storedSignature !== jokeSignature) {
        throw new Error('Stored progress does not match current dataset.');
      }

      let restoredOrder: number[] = [];
      if (Array.isArray(parsed.orderIds) && parsed.orderIds.length) {
        const idToIndex = new Map(jokes.map((j, index) => [j.joke_id, index]));
        const mapped = (parsed.orderIds as unknown[]).map((id) => {
          if (id == null) return undefined;
          const key = typeof id === 'string' ? id : String(id);
          return idToIndex.get(key);
        });
        if (mapped.every((num) => typeof num === 'number')) {
          restoredOrder = mapped as number[];
        } else {
          throw new Error('Failed to reconcile stored order with current jokes.');
        }
      } else if (Array.isArray(parsed.order) && parsed.order.every((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < jokes.length)) {
        restoredOrder = parsed.order as number[];
      }

      if (restoredOrder.length) {
        setOrder(restoredOrder);
      }

      const storedIdx = typeof parsed.idx === 'number' && parsed.idx >= 0 ? parsed.idx : 0;
      setIdx(restoredOrder.length ? Math.min(storedIdx, restoredOrder.length - 1) : 0);

      const sanitizedResponses = Array.isArray(parsed.responses)
        ? (parsed.responses as unknown[])
            .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
            .map((r) => {
              const base = { ...r, respondent_id: respondentId } as Record<string, unknown>;
              const jokeId = typeof base.joke_id === 'string' ? base.joke_id : null;
              if (typeof base.joke_text !== 'string') {
                const match = jokeId ? jokes.find((j) => String(j.joke_id ?? '') === jokeId) : undefined;
                base.joke_text = match?.text ?? '';
              }
              if (typeof base.joke_text !== 'string') {
                base.joke_text = '';
              }
              if ('device_tags' in base) {
                delete (base as Record<string, unknown>).device_tags;
              }
              const humorTypeRaw = typeof base.humor_type === 'string' ? base.humor_type : '';
              if (!HUMOR_TYPES.includes(humorTypeRaw as (typeof HUMOR_TYPES)[number])) {
                base.humor_type = HUMOR_TYPES[0];
              } else {
                base.humor_type = humorTypeRaw;
              }
              return base;
            })
        : [];

      setResponses(sanitizedResponses as ResponseRow[]);

  const storedFinished = Boolean(parsed.finished);
  setFinished(storedFinished);
  const shouldResume = !storedFinished && restoredOrder.length > 0 && (typeof parsed.started === 'boolean' ? parsed.started : sanitizedResponses.length > 0);
  setStarted(shouldResume);
    } catch (error) {
      console.warn('Failed to restore survey progress:', error);
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } finally {
      setProgressLoaded(true);
    }
  }, [progressLoaded, respondentId, jokesLoading, jokes, jokeSignature]);

  // Load default jokes.csv on first load
  useEffect(() => {
    const loadJokes = async () => {
      setJokesLoading(true);
      setJokesError(null);
      try {
        const res = await fetch('/jokes.csv');
        if (!res.ok) {
          throw new Error(`Failed to load jokes.csv: ${res.status} ${res.statusText}`);
        }
        const text = await res.text();
        const rows = csvToJokes(text).filter((j: JokeRow) => j.text.length > 0);
        const randomizedRows = shuffle(rows);
        if (rows.length === 0) {
          throw new Error('No valid jokes found in jokes.csv');
        }
        setJokes(randomizedRows);
        console.log(`Loaded ${rows.length} jokes from jokes.csv`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setJokesError(errorMessage);
        console.error('Error loading jokes:', error);
      } finally {
        setJokesLoading(false);
      }
    };
    loadJokes();
  }, []);

  // Initial loading screen for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!progressLoaded) return;
    if (!respondentId) return;

    if (!hasProgress) {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      return;
    }

    const orderIds = order.map((index) => jokes[index]?.joke_id ?? null);
    const payload = {
      respondentId,
      order,
      orderIds,
      idx,
      responses,
      started,
      finished,
      jokeSignature,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to persist survey progress:', error);
    }
  }, [progressLoaded, respondentId, hasProgress, order, idx, responses, started, finished, jokes, jokeSignature]);

  const resetSurvey = useCallback(
    (withConfirm: boolean = true) => {
      if (withConfirm) {
        const confirmed = window.confirm('This will clear your current progress and responses. Continue?');
        if (!confirmed) return;
      }

      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      setStarted(false);
      setFinished(false);
      setResponses([]);
      setOrder([]);
      setIdx(0);
      setSubmitState('idle');
      setSubmitError(null);
      setSubmissionUrl(null);
      itemStartRef.current = 0;
    },
    []
  );

  // Start timing when a new item is shown
  useEffect(() => {
    if (started && !finished) {
      itemStartRef.current = performance.now();
    }
  }, [idx, started, finished]);

  const startSurvey = () => {
    if (!jokes.length) return alert('No jokes available. Please check that jokes.csv is properly loaded.');
    const ord = shuffle(Array.from({ length: jokes.length }, (_, i) => i));
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    setOrder(ord);
    setIdx(0);
    setResponses([]);
    setStarted(true);
    setFinished(false);
    setSubmitState('idle');
    setSubmitError(null);
    setSubmissionUrl(null);
  };

  const current = useMemo(() => {
    if (!started || finished) return undefined;
    const i = order[idx];
    return jokes[i];
  }, [order, idx, started, finished, jokes]);

  function downloadCSV() {
    const rows = responses.map((r: ResponseRow) => ({ ...r }));
    const csv = Papa.unparse(rows, { columns: RESPONSE_COLUMNS as unknown as string[] });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses_${respondentId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const submitToGitHub = useCallback(async () => {
    if (submitState === 'uploading' || submitState === 'success') {
      return;
    }

    if (!respondentId) {
      setSubmitState('error');
      setSubmitError('Missing session identifier. Please refresh and try again.');
      return;
    }

    if (!responses.length) {
      setSubmitState('error');
      setSubmitError('No responses found to submit.');
      return;
    }

    setSubmitState('uploading');
    setSubmitError(null);
    setSubmissionUrl(null);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: respondentId, responses }),
      });

      let data: unknown = null;
      try {
        data = await res.json();
      } catch (error) {
        // ignore json parse errors
      }

      if (!res.ok) {
        const message = typeof (data as any)?.error === 'string' ? (data as any).error : `Unable to submit survey (status ${res.status}).`;
        throw new Error(message);
      }

      const payload = (data ?? {}) as { html_url?: string | null };
      if (payload.html_url) {
        setSubmissionUrl(payload.html_url);
      }
      setSubmitState('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error submitting survey.';
      setSubmitState('error');
      setSubmitError(message);
    }
  }, [respondentId, responses, submitState]);

  return (
    <>
      {initialLoading && (
        <LoadingScreen 
          title="SCIE 300 Humor Survey"
          caption="Loading jokes and preparing survey…"
          tips={[
            "Created by the SASsy research group",
            "This survey examines humor perception and source detection.",
            "You'll rate jokes on funniness and guess if they're human or AI-generated.",
            "Please answer honestly - there are no right or wrong responses.",
            "The survey takes approximately 10 minutes to complete.",
            "All responses are completely anonymous."
          ]}
        />
      )}
      
  <main className="relative min-h-screen overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-sky-50/35 to-slate-100 px-3 pb-4 pt-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
        <div className="pointer-events-none fixed inset-0" aria-hidden />
        <button
          type="button"
          onClick={() => resetSurvey(true)}
          disabled={!hasProgress || !progressLoaded}
          className="fixed right-4 top-[calc(1rem+env(safe-area-inset-top,0px))] z-50 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-all duration-200 hover:border-sky-300/60 hover:bg-white/85 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/10 dark:text-slate-200 dark:hover:border-sky-300/40 dark:hover:text-white dark:focus-visible:ring-offset-slate-900 sm:right-6"
          aria-disabled={!hasProgress || !progressLoaded}
        >
          Reset Survey
        </button>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_70%)]" />
          <div className="loading-float absolute -top-40 left-1/3 h-80 w-80 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-500/25" />
          <div className="loading-float absolute -bottom-48 right-1/4 h-96 w-96 rounded-full bg-fuchsia-200/40 blur-3xl dark:bg-fuchsia-500/20" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col gap-8">
          <header className="relative overflow-hidden rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_22px_55px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 md:p-8">
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_70%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.06)_0%,rgba(129,140,248,0.08)_50%,rgba(236,72,153,0.08)_100%)]" />
            </div>
            <div className="relative space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.36em] text-slate-500 dark:text-slate-400">SCIE 300 Research Study</p>
              <h1 className="text-3xl font-semibold tracking-tight text-transparent md:text-4xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text">
                Humor Perception & Source Detection Survey
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-300">
                by the <span className="font-semibold text-sky-600 dark:text-sky-300">SASsy</span> research group • anonymous ratings for human vs AI jokes (thinking vs non-thinking) • ~10 minutes total
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Session ID: <span className="font-mono text-slate-800 dark:text-slate-200">{respondentId || 'Loading…'}</span>
              </p>
            </div>
          </header>

          {!started && !finished && (
            <div className="flex flex-col gap-6">
              <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 md:p-8">
                <div className="pointer-events-none absolute inset-0 opacity-80">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_70%)]" />
                </div>
                <div className="relative space-y-5">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Study Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">Study title</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Human-Likeness and Funniness in AI Jokes: Comparing "Thinking" vs "Non-Thinking" LLMs to Human Short-Form Humor
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">Participants</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">SCIE 300 students (voluntary, anonymous)</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">What you'll do</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Rate ~12–15 short jokes and answer follow-up questions (~10 minutes).</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">Data collected</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Ratings, guesses, and optional comments. No personal identifiers.</p>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-white/15 dark:bg-white/10">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),rgba(129,140,248,0.12),rgba(236,72,153,0.12))] opacity-40" />
                    <div className="relative flex items-start gap-3">
                      <input type="checkbox" id="consent" className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400" required />
                      <label htmlFor="consent" className="text-sm text-slate-700 dark:text-slate-200">
                        <strong>Consent (required):</strong> I am 18+ and consent to participate.
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 md:p-8">
                <div className="pointer-events-none absolute inset-0 opacity-80">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.12),transparent_70%)]" />
                </div>
                <div className="relative space-y-5">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">General Instructions</h2>
                  <div className="space-y-4">
                    {[
                      'Work independently. Avoid web searches or discussing responses.',
                      'Some jokes may feel odd or edgy—still rate them and flag offensiveness.',
                      'Answer every question unless marked optional.',
                      'Watch for an attention-check prompt and follow it closely.',
                    ].map((text) => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-fuchsia-500" />
                        <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 md:p-8">
                <div className="pointer-events-none absolute inset-0 opacity-80">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.08),transparent_75%)]" />
                </div>
                <div className="relative space-y-5">
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dataset Status</h2>
                    {jokesLoading && (
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400/80 border-t-transparent" />
                        Loading jokes from jokes.csv…
                      </div>
                    )}
                    {jokesError && (
                      <div className="rounded-2xl border border-red-200/70 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
                        <p>Error loading jokes: {jokesError}</p>
                        <p className="mt-1 text-xs opacity-80">Ensure jokes.csv lives in public/ with columns: joke_id, text, group_true, theme, attention_check</p>
                      </div>
                    )}
                    {!jokesLoading && !jokesError && (
                      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/90 p-4 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:text-emerald-200">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white">✓</span>
                        Successfully loaded <strong>{jokes.length}</strong> jokes from jokes.csv
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ready to begin?</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Items randomize automatically and we track per-item timing.</p>
                    <button
                      onClick={() => {
                        const consentCheckbox = document.getElementById('consent') as HTMLInputElement;
                        if (!consentCheckbox?.checked) {
                          alert('Please check the consent checkbox to continue.');
                          return;
                        }
                        startSurvey();
                      }}
                      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(56,189,248,0.35)] transition-all duration-300 hover:shadow-[0_24px_50px_rgba(56,189,248,0.45)] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={jokesLoading || jokesError !== null || !jokes.length}
                    >
                      {jokesLoading ? 'Loading…' : 'Start survey'}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

      {/* Survey card */}
      {started && !finished && current && (
        <SurveyItem
          key={current.joke_id}
          index={idx}
          total={order.length}
          joke={current}
          respondentId={respondentId}
          onSubmit={(row) => {
            const elapsed = Math.max(0, Math.round(performance.now() - itemStartRef.current));
            const att = String(current.attention_check) === 'true';
            const pass = att
              ? row.funniness_1_5 === 3 && row.guess_source === 'AI' ? 'Yes' : 'No'
              : 'NA';
            const complete: ResponseRow = {
              ...row,
              respondent_id: respondentId,
              joke_order: idx + 1,
              joke_id: current.joke_id,
              joke_text: current.text,
              group_true: current.group_true ?? '',
              attention_check_pass: pass,
              time_to_answer_ms: elapsed,
            };
            setResponses(prev => [...prev, complete]);
            if (idx + 1 < order.length) {
              setIdx(idx + 1);
            } else {
              setFinished(true);
              setSubmitState('idle');
              setSubmitError(null);
              setSubmissionUrl(null);
            }
          }}
        />
      )}

      {/* Finish card */}
      {finished && (
        <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 md:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_70%)]" />
          </div>
          <div className="relative space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">All done — thank you! 🎉</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">You completed <strong>{responses.length}</strong> items.</p>

            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={submitToGitHub}
                disabled={submitState === 'uploading' || submitState === 'success'}
                className="inline-flex min-w-[12rem] items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 px-8 py-3 text-base font-semibold text-white shadow-[0_18px_40px_rgba(56,189,248,0.35)] transition-all duration-300 hover:shadow-[0_24px_50px_rgba(56,189,248,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitState === 'uploading'
                  ? 'Submitting…'
                  : submitState === 'success'
                  ? 'Submitted!'
                  : 'Submit'}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={downloadCSV}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/50 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-xl transition-colors duration-200 hover:border-sky-300/50 hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-sky-300/40"
                >
                  Download CSV
                </button>
                {submitState === 'success' && (
                  <button
                    type="button"
                    onClick={() => resetSurvey(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-emerald-200/60 bg-emerald-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 transition-colors duration-200 hover:border-emerald-300/70 hover:bg-emerald-100 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200"
                  >
                    Restart
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-center" aria-live="polite">
              {submitState === 'uploading' && (
                <p className="text-sm text-slate-600 dark:text-slate-300">Uploading your responses to GitHub…</p>
              )}
              {submitState === 'error' && submitError && (
                <p className="text-sm text-red-600 dark:text-red-300">{submitError}</p>
              )}
              {submitState === 'success' && (
                <p className="text-sm text-emerald-600 dark:text-emerald-300">
                  Submission saved to GitHub
                  {submissionUrl ? (
                    <>
                      {' '}
                      <a
                        href={submissionUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline decoration-emerald-400 decoration-2 underline-offset-4 hover:decoration-emerald-500"
                      >
                        View file
                      </a>
                    </>
                  ) : null}
                  .
                </p>
              )}
            </div>

            <details className="mt-2 text-sm text-slate-600/90 dark:text-slate-300/80">
              <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200">CSV columns</summary>
              <code className="mt-2 block overflow-x-auto whitespace-pre rounded-3xl border border-white/60 bg-white/70 p-4 text-xs text-slate-700 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] backdrop-blur-xl dark:border-white/15 dark:bg-white/5 dark:text-slate-200">
                respondent_id, joke_order, joke_id, joke_text, group_true, funniness_1_5, human_likeness_1_5, guess_source, humor_type, theme, appropriateness_class, offensiveness_0_2, attention_check_pass, time_to_answer_ms, comments_optional
              </code>
            </details>
          </div>
        </section>
      )}
        </div>

        <footer className="relative mx-auto mt-12 flex max-w-5xl items-center justify-center rounded-3xl border border-white/60 bg-white/70 px-4 py-6 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-[0_15px_35px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
          <a
            href="https://sadrakhosravi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 text-center transition-colors duration-200 hover:text-sky-500 dark:text-sky-300 dark:hover:text-sky-200"
          >
            Designed and developed by Sadra Khosravi for SCIE 300 Class
          </a>
        </footer>
    </main>
    </>
  );
}