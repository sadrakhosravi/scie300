import { describe, it, expect } from 'vitest';
import { csvToJokes, shuffle, randomId } from '@/lib/utils';

const SAMPLE_CSV = `joke_id,text,group_true,theme,attention_check
H1,"A horse walks into a bar. Bartender says: Why the long face?",H,Other,false
A1,"I would tell you a UDP joke but you might not get it.",AI_N,Technology,false
ATT,"(Attention check)",AI_N,Other,true`;

describe('csvToJokes', () => {
  it('parses rows and boolean attention flags', () => {
    const rows = csvToJokes(SAMPLE_CSV);
    expect(rows).toHaveLength(3);
    expect(rows[0].joke_id).toBe('H1');
    expect(rows[2].attention_check).toBe(true);
  });
  
  it('assigns default theme when missing', () => {
    const rows = csvToJokes('joke_id,text\nJ1,"Hi"');
    expect(rows[0].theme).toBe('Other');
  });
});

describe('shuffle', () => {
  it('keeps same elements and length', () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffle(src);
    expect(out).toHaveLength(src.length);
    expect(out.sort()).toEqual(src.sort());
  });
});

describe('randomId', () => {
  it('generates ID with correct format', () => {
    const id = randomId();
    expect(id).toMatch(/^S300-[A-Z2-9]{6}$/);
  });
});