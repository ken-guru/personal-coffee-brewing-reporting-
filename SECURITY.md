# Security

This document describes the security posture of this project, documents known
good practices that must be maintained, and provides operational guidance for
keeping credentials and tokens secure.

---

## Input Validation (Issue #23 — positive finding)

The codebase already enforces comprehensive input validation at every trust
boundary. This standard **must be preserved** as the application grows.

### Front-end (Zod schema — `src/components/brewing/BrewingForm.tsx`)

- Enum validation for all categorical fields (`brewingMethod`, `grindCoarseness`,
  `waterSource`, etc.)
- Numeric range checks: coffee 1–1,000 g, water 1–10,000 ml, rating 1–5
- Required-field and minimum-length checks on all string inputs
- No use of `dangerouslySetInnerHTML`, `innerHTML`, or `eval()` — React's
  built-in escaping prevents XSS

### API (`api/brews/share.ts`)

- `Content-Type: application/json` is enforced (HTTP 415 if absent or wrong)
- Required-field presence and data-type checks before any storage access
- Rating validated as a number in the range 1–5

### Guidance for future changes

- All new API endpoints that accept a request body **must** validate
  `Content-Type` before reading `req.body`
- All new form fields **must** be added to the corresponding Zod schema
- Never write user-supplied strings directly to the DOM without React rendering

---

## GitHub Actions Token Security (Issue #22)

### Current state (already correct)

The deployment workflow (`.github/workflows/deploy.yml`) already follows best
practices:

- Secrets are stored in GitHub's encrypted secrets store — **no tokens are
  hard-coded** in any workflow file or source file
- Each job declares the **minimum required `permissions`**:
  - `contents: read` — needed to check out the repository
  - `pull-requests: write` — needed only to post the preview URL comment
- Tokens are passed only to the individual steps that need them; no workflow-
  level `env:` block exposes them to every step
- CODEOWNERS requires `@ken-guru` approval for all changes (`.github/CODEOWNERS`)

### Operational checklist

The items below are process controls and must be verified periodically:

- [ ] **Token rotation** — rotate `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and
      `VERCEL_PROJECT_ID` in the GitHub repository secrets at least every
      90 days.  Update the corresponding values in the Vercel dashboard at the
      same time.
- [ ] **Minimal Vercel token permissions** — confirm the Vercel token used in
      CI has only the `deploy` scope (no `admin`, `delete`, or team-management
      permissions).
- [ ] **Branch protection** — verify that the `main` branch requires:
      - All status checks (CI + CodeQL) to pass before merge
      - At least one approving review
      - Linear history / no force-pushes
- [ ] **Secret access audit** — periodically review which GitHub Actions
      workflows and which collaborators have access to the repository secrets.

### Guidance for future changes

- Never add `secrets.*` references to `run:` steps as plain inline strings —
  always pass them via `env:` on the specific step that needs them, as the
  current workflow already does
- If new deployment targets or external services are added, create a
  **dedicated token** with the narrowest scope possible rather than reusing an
  existing one
- Prefer short-lived OIDC federation tokens over long-lived static tokens
  wherever the target service supports it (e.g. the `aws-actions/configure-aws-credentials`
  action for AWS deployments)
