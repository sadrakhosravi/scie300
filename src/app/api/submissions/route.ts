import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import type { ResponseRow } from '@/types';

export const runtime = 'nodejs';

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
  'device_tags',
  'theme',
  'appropriateness_class',
  'offensiveness_0_2',
  'attention_check_pass',
  'time_to_answer_ms',
  'comments_optional',
] as const;

type SubmissionRequest = {
  sessionId?: unknown;
  responses?: unknown;
};

type GitHubContentResponse = {
  content?: {
    html_url?: string;
  } | null;
  commit?: {
    sha?: string;
    html_url?: string;
  } | null;
};

type GitHubError = {
  message?: string;
  documentation_url?: string;
};

function sanitizeSessionId(sessionId: string): string {
  return sessionId
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9\-_]/g, '_');
}

function coerceValue(value: unknown): string | number {
  if (value == null) return '';
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function normalizeResponses(responses: ResponseRow[]): Record<string, string | number>[] {
  return responses.map((row) => {
    const record: Record<string, string | number> = {};
    const source = row as Record<string, unknown>;

    for (const column of RESPONSE_COLUMNS) {
      record[column] = coerceValue(source[column]);
    }

    return record;
  });
}

export async function POST(request: Request) {
  let body: SubmissionRequest;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
  const rawResponses = Array.isArray(body.responses)
    ? (body.responses as unknown[]).filter((item): item is ResponseRow => !!item && typeof item === 'object')
    : [];

  if (!sessionId.trim()) {
    return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
  }

  if (!rawResponses.length) {
    return NextResponse.json({ error: 'No responses were provided.' }, { status: 400 });
  }

  const sanitizedSessionId = sanitizeSessionId(sessionId);
  if (!sanitizedSessionId) {
    return NextResponse.json({ error: 'Session ID could not be sanitized.' }, { status: 400 });
  }

  const githubToken =
    process.env.GITHUB_TOKEN ?? process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? process.env.GITHUB_PAT ?? '';

  if (!githubToken) {
    console.error('Missing GitHub token environment variable.');
    return NextResponse.json({ error: 'Server is not configured for GitHub uploads.' }, { status: 500 });
  }

  const repoSlug = process.env.GITHUB_REPOSITORY ?? process.env.GITHUB_REPO ?? '';

  if (!repoSlug || !repoSlug.includes('/')) {
    console.error('Invalid GITHUB_REPOSITORY configuration. Expected `owner/repo`.');
    return NextResponse.json({ error: 'Server repository configuration is invalid.' }, { status: 500 });
  }

  const [owner, repo] = repoSlug.split('/', 2);
  if (!owner || !repo) {
    return NextResponse.json({ error: 'Unable to resolve GitHub repository owner or name.' }, { status: 500 });
  }

  const branch = process.env.GITHUB_BRANCH ?? 'main';

  const normalizedRows = normalizeResponses(rawResponses);
  const csv = Papa.unparse(normalizedRows, { columns: RESPONSE_COLUMNS as unknown as string[] });
  const content = Buffer.from(csv, 'utf8').toString('base64');

  const filePath = `submissions/${sanitizedSessionId}.csv`;
  const encodedPath = filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const baseHeaders: HeadersInit = {
    Authorization: `Bearer ${githubToken}`,
    'User-Agent': 'scie300-survey-app',
    Accept: 'application/vnd.github+json',
  };

  try {
    const checkResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`, {
      headers: baseHeaders,
      cache: 'no-store',
    });

    if (checkResponse.ok) {
      return NextResponse.json({ error: 'A submission for this session already exists.' }, { status: 409 });
    }

    if (checkResponse.status !== 404) {
      const errorBody = (await checkResponse.json().catch(() => ({}))) as GitHubError;
      console.error('Failed to verify file availability on GitHub:', checkResponse.status, errorBody);
      return NextResponse.json(
        { error: `Unable to verify existing submission (GitHub ${checkResponse.status}).` },
        { status: 502 }
      );
    }

    const uploadResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`, {
      method: 'PUT',
      headers: {
        ...baseHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add survey submission for ${sanitizedSessionId}`,
        content,
        branch,
      }),
    });

    if (!uploadResponse.ok) {
      const errorBody = (await uploadResponse.json().catch(() => ({}))) as GitHubError;
      console.error('GitHub upload failed:', uploadResponse.status, errorBody);
      return NextResponse.json(
        { error: errorBody.message ?? 'Failed to upload submission to GitHub.' },
        { status: 502 }
      );
    }

    const responseBody = (await uploadResponse.json()) as GitHubContentResponse;

    return NextResponse.json(
      {
        ok: true,
        path: filePath,
        html_url: responseBody.content?.html_url ?? responseBody.commit?.html_url ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error uploading submission:', error);
    return NextResponse.json({ error: 'Unexpected error uploading to GitHub.' }, { status: 500 });
  }
}
