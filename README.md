## SCIE 300 Humor Survey

A Next.js application for running the SCIE 300 humor perception study. Participants rate short-form jokes, and completed sessions can be exported as CSV locally or pushed directly to the project repository for centralized collection.

## Quick start

```powershell
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and follow the onboarding card to start the survey.

## GitHub submission workflow

When a participant finishes the survey, the completion card now includes a **Submit responses to GitHub** button. Clicking it will:

1. Serialize the captured responses into a CSV with deterministic columns.
2. POST the payload to `/api/submissions`.
3. The server route commits the CSV to `submissions/<session-id>.csv` in this repository (default branch `main`).

Duplicate session IDs are rejected (HTTP 409) to preserve one file per anonymous respondent.

## Environment variables

Create a `.env.local` file in the project root before using the upload button:

```dotenv
# Required: GitHub Personal Access Token with `repo` scope (or appropriate fine-grained access)
GITHUB_TOKEN=ghp_yourTokenGoesHere

# Required: target repository in owner/name format
GITHUB_REPOSITORY=sadrakhosravi/scie300

# Optional: override the target branch (defaults to "main")
# GITHUB_BRANCH=main
```

Restart the dev server after changing environment variables so the server route can pick them up.

## Data files

- `public/jokes.csv` — source material presented to participants.
- `submissions/` — destination folder for committed survey exports.

## Testing

```powershell
npm test
```

Vitest covers shared utilities (e.g., ID generation and CSV helpers). Add tests alongside the relevant files under `src/lib` as new logic is introduced.
