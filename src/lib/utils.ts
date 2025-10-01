import Papa from 'papaparse';
import { JokeRow } from '@/types';

export function randomId(): string {
  const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'S300-' + Array.from({ length: 6 }, () => s[Math.floor(Math.random() * s.length)]).join('');
}

export function csvToJokes(csvText: string): JokeRow[] {
  const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return (data as any[]).map((r, i) => ({
    joke_id: String(r.joke_id ?? `J${i + 1}`),
    text: String(r.text ?? '').trim(),
    group_true: r.group_true?.toString(),
    theme: r.theme?.toString() ?? 'Other',
    attention_check: (r.attention_check ?? 'false').toString().toLowerCase() === 'true',
  }));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}