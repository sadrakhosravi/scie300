export type JokeRow = {
  joke_id: string;
  text: string;
  group_true?: 'H' | 'AI_N' | 'AI_T' | string; // hidden from users, used in export
  theme?: string;
  attention_check?: string | boolean; // true/false
};

export type ResponseRow = {
  respondent_id: string;
  joke_order: number;
  joke_id: string;
  group_true?: string;
  funniness_1_5: number;
  human_likeness_1_5: number;
  guess_source: 'Human' | 'AI' | "Can't tell";
  humor_type: 'Pun/Wordplay' | 'Observational' | 'Situational/Narrative' | 'Absurd/Surreal' | 'One-liner/Anti-joke' | 'Unsure';
  device_tags: string; // semicolon-separated
  theme: string;
  appropriateness_class: 'Yes' | 'No';
  offensiveness_0_2: 0 | 1 | 2;
  attention_check_pass: 'Yes' | 'No' | 'NA';
  time_to_answer_ms: number;
  comments_optional?: string;
};

export const HUMOR_TYPES = [
  'Pun/Wordplay',
  'Observational',
  'Situational/Narrative',
  'Absurd/Surreal',
  'One-liner/Anti-joke',
  'Unsure',
] as const;

export const DEVICE_TAGS = [
  'Observational',
  'One-liner',
  'Situational',
  'Pun',
  'Absurdism',
] as const;

export const THEMES = ['Animal', 'School/Work', 'Everyday life', 'Relationships', 'Food'] as const;