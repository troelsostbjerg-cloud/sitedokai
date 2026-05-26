# SiteDokAILab build notes

## Stack detected

- Astro 5 static site
- Tailwind CSS 3 via `@astrojs/tailwind`
- Cloudflare Pages functions under `functions/`
- No React, Next.js or extra UI dependencies added

## Commands

Run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Pages created or changed

- `/` - rebuilt as the SiteDokAILab landing page
- `/submit` - workflow submission form
- `/cases` - filterable case library
- `/method` - Mess -> Map -> Simplify -> Assist -> Approve -> Measure
- `/about` - Troels profile
- `/hire` - role-fit and contact page
- `/privacy` - plain-language privacy and case handling
- `/admin` - local preview backlog for browser-stored test submissions, noindex and not linked in main nav

## Components created

- `src/components/lab/LabHeroVisual.astro`
- `src/components/lab/WorkflowTypeSelector.astro`
- `src/components/lab/AIFitChecker.astro`
- `src/components/lab/CaseLibrary.astro`
- `src/components/lab/MethodStepper.astro`
- `src/components/lab/SubmitWorkflowForm.astro`

## Form handling status

- Local preview on `localhost` stores test submissions in browser `localStorage` under `sitedokailab.workflowSubmissions`.
- Production form posts to `/api/submit-workflow`.
- `/api/submit-workflow` is a Cloudflare Pages Function.
- Production storage uses `WORKFLOW_SUBMISSIONS_DB` if configured, otherwise `LEADS_DB` or `ORDERS_DB`.
- The function creates a `workflow_submissions` table if the configured D1 database is available.
- Email notification is not implemented because no SMTP or provider configuration was found in this stack.

## Known limitations

- CV PDF is not present in the repo. `/hire` labels this clearly and uses the role-fit page as the proof profile for now.
- `/admin` only reads local browser storage from development QA submissions. It does not read production D1 data.
- Old service pages still exist in source, but public navigation and redirects now point to the Lab journeys.

## Suggested next steps before launch

- Configure a Cloudflare D1 binding named `WORKFLOW_SUBMISSIONS_DB` or reuse the existing lead database binding intentionally.
- Add `WORKFLOW_SUBMISSIONS_SYNC_TOKEN` if production submission export is needed.
- Decide whether old paid-service routes should remain as hidden archive pages or be removed later.
- Add a real CV PDF if the `View CV` CTA should open a document.
- Submit one real safe test case and publish it as the first anonymized case once permission is clear.

## How to publish a case

1. Confirm the submitter's permission choice.
2. Remove company names, person names, customer details, prices, internal systems and sensitive facts.
3. Convert the review into the `CaseStudy` shape in `src/data/labContent.ts`.
4. Set `status` to `reviewed` or `published`.
5. Keep examples labelled as examples and real cases labelled honestly.
