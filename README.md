# Agents for Your Travel Business

An interactive, one-to-one crash course on AI agents for an independent travel agent who also runs a network marketing business. It's a static site: no backend, no accounts, no analytics. Everything the learner types (her week, quiz answers, saved agents) stays in her own browser.

**Modules:** Your week · What is an agent? · Building blocks · Good at, bad at · Ideas gallery · Safety and the rules · Choosing your platform · Agent Builder · Your first 30 days. Also: My agents library, printable cheat sheet (`#/cheat-sheet`) and facilitator notes (`#/facilitator`).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Needs Node 20+.

## The learner's name (kept out of the repo)

The repo is public, so the learner's name isn't in the code. It's injected at build time:

- **Locally:** create `.env.local` (git-ignored) containing `VITE_LEARNER_NAME=FirstName`.
- **GitHub Pages:** go to Settings → Secrets and variables → Actions → Variables → `LEARNER_NAME`. The deploy workflow passes it to the build.
- Without a name, the site addresses "you" and agent instructions say "me".

You can also put the name in `content/site.json` (`learnerName`), but it will then be public.

## Deploy (GitHub Pages)

**Automatic (recommended):** push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes to GitHub Pages. One-time setup: in the repo, go to Settings → Pages → Source and choose "GitHub Actions".

**Manual alternative:** `npm run deploy` builds and pushes `dist/` to a `gh-pages` branch (then set Pages to deploy from that branch).

The build uses relative paths, so it also works on Netlify or Vercel (build command `npm run build`, publish directory `dist`).

**Unlisted:** every page has `<meta name="robots" content="noindex, nofollow">` and `robots.txt` disallows crawling, so it won't appear in search results. Anyone with the link can still open it. Note that the *repository* is public if the repo is public.

## Edit the content

All copy lives in `content/`. You can edit it without touching any components.

| File | What's in it |
|---|---|
| `site.json` | Learner's name, course title, business defaults (agency, host agency, network company, sign-off), "last checked" date |
| `modules.json` | Module order, titles, minutes |
| `glossary.json` | Glossary terms (shown in the drawer and as underlined terms) |
| `week.json` | Module 01: warm-up questions, tasks, illustrative hours and savings |
| `agent.json` | Module 02: chatbot/automation/agent progression and the agent loop steps |
| `anatomy.json` | Module 03: the six building blocks |
| `fit.json` | Module 04: sorter tasks, the correct pile and the explanation |
| `usecases.json` | Module 05: gallery cards |
| `safety.json` | Module 06: NHS separation, topics, traffic lights, quiz, privacy checklist |
| `platforms.json` | Module 07: platform facts, prices, connections, pros/cons, sources and the filter's scoring |
| `builder.json` | Module 08: templates, tools, guardrails, tones and per-platform setup steps |
| `plan.json` | Module 09 and the cheat sheet |
| `facilitator.md` | Facilitator notes (rendered at `#/facilitator`) |

**Inline markup** in JSON strings:
- `**bold**`
- `[[term]]` links to a glossary entry by its term or alias.
- `[[label|glossaryId]]` shows custom text for a glossary entry.
- `{name}` is replaced with the learner's name.

**Updating platform prices:** edit `platforms.json` (each platform's `cost`, `connects`, `cons` and `sources`), then update `lastChecked` there and in `site.json`. The filter's scoring lives in `filter.questions[].options[].scores` (points per platform) and `reasons` (the explanation shown).

**Reusing for another learner:** change the `LEARNER_NAME` variable and `site.json`'s `businessDefaults`, and review `safety.json`'s NHS section and any travel- or network-marketing-specific copy.

## Tech notes

- Vite + React + TypeScript; Framer Motion for animation (loaded lazily via `LazyMotion`; respects `prefers-reduced-motion`).
- Hash routing (`#/module`), so it works on any static host.
- Fonts are self-hosted (Fraunces, Instrument Sans, IBM Plex Mono via Fontsource): no requests to Google.
- Browser storage is wrapped in try/catch (`src/lib/storage.ts`); the site still works if storage is blocked.
- No secrets, no API calls. The Agent Builder generates text packs; it never runs agents.

## Checked before hand-over

- Playwright screenshots at 375px and 1280px for every route; no horizontal scroll and no console errors.
- Interaction tests: week toggle, agent loop, glossary, drag and tap sorting, platform filter, builder template → pack → save → download, My agents duplicate/export/import, gallery → builder deep link.
- axe (WCAG 2 A/AA) is clean in light and dark mode. Lighthouse (mobile): accessibility 100, best practices 100, performance 93–97.
- The cheat sheet prints on one A4 page.
