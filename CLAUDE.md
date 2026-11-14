# cadenway-design-system: Claude Code instructions

> **Source of truth.** This file is the entry point for Claude Code. The normative rules live in
> [AGENTS.md](AGENTS.md), imported below: read it, do not paraphrase it from memory.

@AGENTS.md

> **Read on demand, deliberately not `@`-imported**: `docs/maquette/source/StatutTache.dc.html`, `PrioriteTache.dc.html` and `styles/app.css`, the [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et), sections "Fondations", "Composants de base", "Composants métier", "Comportements transverses". Importing them would
> cost context in every session. The path-scoped rules in `.claude/rules/` load automatically when
> you open a matching file and carry the few things that must never be got wrong there.

## TL;DR for every task

1. Three packages: `@cadenway/tokens` (CSS variables and the Tailwind 4 `@theme`), `@cadenway/icons` (`provideCadenwayIcons()`), `@cadenway/ui` (Angular bricks).
2. Bricks reproduce the mockup exactly; behaviors (keyboard, ARIA, placement) come from Angular Aria and the CDK, styling stays ours.
3. Angular 22 conventions: no suffix, `cw-` selectors, signal inputs, outputs and models.
4. Every brick has stories for each state, in light and dark, and passes the accessibility checks.
5. Public API through explicit `public-api.ts` exports; a removal or rename is a major version with a deprecation first.
6. Changesets describe every change; the release workflow publishes.

## Boundaries (hard rules)

- No business logic, no API call, no knowledge of tasks beyond the display contracts of `cw-status-icon` and `cw-priority-icon`.
- Consumers never restyle a brick from outside: variants are inputs.
- Tokens are the only source of colors, radii, shadows and timings.
- `docs/maquette/` is a read-only reference.

## Target quality gate

Use the [minimum checks by change](docs/development.md#minimum-checks-by-change) first.
Run `/cw-quality` without arguments for the full local gate when applicable. Report unavailable
checks during bootstrap.

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:architecture
pnpm test:coverage
pnpm storybook:build
pnpm test:storybook           # interaction and accessibility checks
pnpm build                    # every package
pnpm changeset status
```

## Tooling: this repository ships its own `.claude/`

Open `cadenway-design-system/` as the workspace root to activate it. The `cw-ds-*` agents, the `/cw-*`
commands, the skills and the hooks are described in [.claude/README.md](.claude/README.md). Two things
the session listing does not tell you:

- **Rules** in `.claude/rules/` load at session start unless they declare `paths`. Scoped rules
  load when Claude reads a matching file.
- **Hooks** cover the edit and shell tool events matched in `.claude/settings.json`.
  `guard.mjs` refuses edits that break a hard rule
  (generated trees, lockfiles, secrets, sibling checkouts, hard-coded colors outside the tokens, `export *` in the public API and edits of the mockup copy, unpinned third-party actions and `pull_request_target` in workflows), `guard-git.mjs`
  refuses pushes to `main`, tag pushes, force-pushes, rewrites of pushed commits, hook bypasses and
  registry publishing, and `format.mjs` formats supported files when its formatter is available.
  Apply the repository rules across tools. Resolve a refusal without bypassing the hook.

The sibling repositories (`../cadenway-webapp`, `../cadenway-website`) are read-only references
from here; add them to the session (`--add-dir`) when a task needs to read them.
