# waypoint-design-system: agent instructions

These instructions are mandatory for every AI assistant working in this repository, whatever the
vendor. [CLAUDE.md](CLAUDE.md) imports them for Claude Code. Explicit user instructions take
precedence over procedures, never over the hard limits below.

This file states the **rules**. See the tooling guides for [Claude Code](.claude/README.md)
and [Codex](.codex/README.md) for agents, skills, commands and hooks.

## First read

- The mockup bricks in `docs/maquette/source/` and their section in the [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et).
- The existing brick closest to the one you touch, and its stories.
- `package.json` for versions and scripts once the repository is bootstrapped. Do not restate
  versions elsewhere: a copy goes stale.

## What this repository is

The structure and workflows below describe the bootstrap target. Check the checkout for available files and commands.

waypoint-design-system is the Angular design system taken from the mockup. It publishes `@waypoint/tokens`, `@waypoint/icons` and `@waypoint/ui` (pnpm monorepo, Changesets) and hosts Storybook as the visual reference. Consumers: waypoint-webapp and waypoint-website.

```text
packages/
├─ tokens/   → @waypoint/tokens (tokens.css, theme.css)
├─ icons/    → @waypoint/icons (provideWaypointIcons)
└─ ui/       → @waypoint/ui (src/lib/<brick>/, public-api.ts)
apps/storybook/
```

## Language

- Everything written in the repository is **English**: code, comments, docs, agent prompts, rules,
  skills, commit messages, branch names, PR titles and descriptions.
- User-facing copy is **French**, word for word from the mockup; keep it out of logic so a later
  `@angular/localize` extraction is mechanical.
- Follow the user's language in the conversation only. No emojis.
- Never invent facts about the product, the contracts, the mockup or the tooling: cite the file or
  the document. When something does not exist yet, say so and say which step of the start-up plan
  brings it.

## Architectural ownership

- `packages/tokens`: colors (light and dark), typography, radii, shadows, motion variables and keyframes.
- `packages/icons`: the Phosphor, svgl and flag icons the apps use.
- `packages/ui`: generic bricks and the two business icons; one folder per brick.
- `apps/storybook`: stories, interaction tests, accessibility checks.

## Boundaries (hard rules)

- No business logic, no API call, no knowledge of tasks beyond the display contracts of `wp-status-icon` and `wp-priority-icon`.
- Consumers never restyle a brick from outside: variants are inputs.
- Tokens are the only source of colors, radii, shadows and timings.
- `docs/maquette/` is a read-only reference.

## GitHub files (`.github/`)

This repository carries everything GitHub reads from it; Waypoint has no organization `.github`
repository and nothing is inherited.

- [`.github/README.md`](.github/README.md) is the repository home page; `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/` and
  `CODEOWNERS` sit next to it.
- `.github/workflows/` holds this repository's complete CI, release workflows: no reusable
  workflow from another repository. The Renovate configuration is complete here too, with no shared
  preset.
- The parts shared with the other repositories are duplicated on purpose; a change to them is repeated
  in each repository through its own pull request.

## Commands and quality gates

The scripts below are this repository's contract. While the repository is being bootstrapped,
create them with these exact names; afterwards, use them and never an ad-hoc equivalent. Run the
narrowest check that covers the change first, then widen:

| Changed                         | Minimum check                                              |
| ------------------------------- | ---------------------------------------------------------- |
| A brick                         | `pnpm test -- <brick>`, its stories, `pnpm test:storybook` |
| Tokens                          | `pnpm build`, the token stories in light and dark          |
| Public API                      | `pnpm build` and `wp-ds-package-reviewer`                  |
| Any change to a package         | a changeset (`pnpm changeset`)                             |
| Docs or agent instructions only | Scoped formatting and link review                          |

Report the commands you actually ran and their results; a check you did not run is reported as not
run.

## Git and branch flow

- Trunk-based: work branches come from `main`, named `<type>/<lowercase-kebab-description>` with a
  type among `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
  `revert`; put the Waypoint task id first when there is one (`feat/way-482-sso-screen`). Never an
  agent name as a prefix. Validate with `git check-ref-format --branch <name>`.
- Commits and PR titles follow Conventional Commits: `type(scope): subject`, English, imperative,
  lowercase subject, no trailing period, at most 100 characters; `!` only for a breaking change.
- Pull requests target `main` and are squash-merged after review and green CI. Changesets: each PR adds a changeset; the "Version Packages" pull request bumps versions; its merge publishes to the npm registry from CI.
- Stage only the files of your task; preserve other people's changes in the working tree.

## Hard limits (never without the user's explicit request in this conversation)

- Never push to `main`, merge into it locally, create or push Git tags, or bump a version by hand.
- Never run a registry publish (`npm publish`, `pnpm publish`): the release workflow publishes.
- Never force-push, and never amend or rebase commits that are already pushed.
- Never bypass the Git hooks (`--no-verify`, `core.hooksPath` overrides, `ALLOW_MAIN_PUSH=1`,
  `WP_SKIP_PUSH_CHECKS=1`).
- Never write a token, password or private key anywhere; `.npmrc` keeps `${NODE_AUTH_TOKEN}`. Do
  not read or write secret environment files; new variables are documented in `.env.example`.
- Never edit generated trees (`dist/`, `node_modules/`, `coverage/`) or lockfiles by hand.
- Never modify a sibling checkout (`../waypoint-*`) from a task in this repository.

The agent hooks enforce most of these mechanically; a refused command is a signal to stop and ask,
not to find another way around it.

## Agent tooling

- **Claude Code**: [CLAUDE.md](CLAUDE.md) and [.claude/README.md](.claude/README.md): the
  `wp-ds-*` agents, the `/wp-*` commands (`/wp-quality` runs the whole local gate),
  path-scoped rules and hooks.
- **Codex**: [.codex/README.md](.codex/README.md) covers the specialists, `$wp-*` skills, rules and hooks.
- **Builders** (assigned writes): `wp-ds-component-builder`, `wp-ds-story-writer`, `wp-ds-theme-maintainer`, `wp-ds-icon-maintainer`, `wp-ds-unit-test-writer`, `wp-ds-release-manager`, `wp-ds-github-maintainer`.
- **Reviewers** (read-only): `wp-ds-a11y-auditor`, `wp-ds-motion-reviewer`, `wp-ds-design-reviewer`, `wp-ds-package-reviewer`, `wp-ds-architecture-reviewer`.
- Specialists are available, not mandatory. Delegate a bounded responsibility with explicit files and
  checks, assign disjoint files to parallel agents and integrate their results yourself.

## Repository hygiene

- Reuse existing commands, tools and test infrastructure before adding files.
- Prefer inline commands or a task-specific temporary directory for one-off diagnostics; clean up
  disposable files before delivery.
- Keep a permanent script only when it provides a reusable capability that existing tooling cannot.
- Add permanent tests for meaningful behavior or regressions, in the existing test structure.
- Before delivery, inspect untracked files and remove only the disposable artifacts of the current
  task. Report every new permanent tooling file and why it needs to stay.
- Report material failures, skipped checks and limitations, including non-blocking ones. Ask for
  user input only when a missing decision or authorization blocks the dependent work.

## References

- [Interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE), [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et) and
  [repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N) (living documents).
