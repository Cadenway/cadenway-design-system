# cadenway-design-system: agent instructions

These instructions are mandatory for every AI assistant working in this repository, whatever the
vendor. [CLAUDE.md](CLAUDE.md) imports them for Claude Code. Explicit user instructions take
precedence over procedures, never over the hard limits below.

This file states the **rules**. See the tooling guides for [Claude Code](.claude/README.md)
and [Codex](.codex/README.md) for agents, skills, commands and hooks.

## First read

- The brick's sheet in the [Design System artifact](https://claude.ai/artifact/Xrfx4ccwixnRpFgVYvrCcZ) (`project/components/<Name>/README.md`): it is the source of truth
  for values, variants and APIs.
- The mockup screens in `docs/maquette/source/` that use the brick: behavior, states and copy.
- The existing brick closest to the one you touch, and its stories.
- `package.json` for versions and scripts once the repository is bootstrapped. Do not restate
  versions elsewhere: a copy goes stale.

## What this repository is

The structure and workflows below describe the bootstrap target. Check the checkout for available files and commands.

cadenway-design-system is the Angular design system taken from the mockup. It publishes `@cadenway/tokens`, `@cadenway/icons` and `@cadenway/ui` (pnpm monorepo, Changesets) and hosts Storybook as the visual reference. Consumers: cadenway-webapp and cadenway-website.

```text
packages/
├─ tokens/   → @cadenway/tokens: tokens.css and theme.css (entry files) importing src/ partials
│              (fonts, scale, light, dark; theme/ colors, easing, elevation, motion, base), fonts/
├─ icons/    → @cadenway/icons: provideCadenwayIcons(), one icon family per file in src/lib/sets/
└─ ui/       → @cadenway/ui
   ├─ core/          @cadenway/ui/core: shared internals (a11y, dates, format, motion, overlay, styles)
   └─ components/    @cadenway/ui/components/<brick>: one entry point per brick, its main declaration
                     at the root of its folder, one subfolder per other declaration
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
- `packages/ui`: generic bricks and the two business icons; one folder per brick, each its own
  secondary entry point (`@cadenway/ui/components/<brick>`, folder `packages/ui/components/<brick>/`),
  shared internals in `core/` (`@cadenway/ui/core`).
- `apps/storybook`: stories, interaction tests, accessibility checks.
- `tests/architecture`: checks of the design system's library boundaries, using
  `@cadenway/angular-testing` from cadenway-tooling.

## Boundaries (hard rules)

- No business logic, no API call, no knowledge of tasks beyond the display contracts of `cw-status-icon` and `cw-priority-icon`.
- Consumers never restyle a brick from outside: variants are inputs.
- Tokens are the only source of colors, radii, shadows and timings.
- `docs/maquette/` is a read-only reference.

## GitHub files (`.github/`)

This repository carries everything GitHub reads from it; Cadenway has no organization `.github`
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

| Changed                         | Minimum check                                                     |
| ------------------------------- | ----------------------------------------------------------------- |
| A brick                         | `pnpm test --include <brick>`, its stories, `pnpm test:storybook` |
| Tokens                          | `pnpm build`, the token stories in light and dark                 |
| Public API                      | `pnpm build` and `cw-ds-package-reviewer`                         |
| Any change to a package         | a changeset (`pnpm changeset`)                                    |
| Docs or agent instructions only | Scoped formatting and link review                                 |

For `packages/ui`, apply the comment convention in the matching `.codex/rules/comments.md` or
`.claude/rules/comments.md`, including explicit types, member access and regions. Run
`pnpm lint:ui` and `pnpm format:ui:check`; when editing the UI lint rules or configuration, also run
`pnpm test:ui-lint`. These checks validate structure, so review the meaning of comments separately.

Report the commands you actually ran and their results; a check you did not run is reported as not
run.

Run `pnpm test:architecture` after changing entry points, test layout or architecture checks once
the [published checker is installed](docs/architecture.md#architecture-check-rollout).

## Git and branch flow

- Trunk-based: work branches come from `main`, named `<type>/<lowercase-kebab-description>` with a
  type among `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
  `revert`; put the Cadenway task id first when there is one (`feat/cad-482-sso-screen`). Never an
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
  `CW_SKIP_PUSH_CHECKS=1`).
- Never write a token, password or private key anywhere; `.npmrc` keeps `${NODE_AUTH_TOKEN}`. Do
  not read or write secret environment files; new variables are documented in `.env.example`.
- Never edit generated trees (`dist/`, `node_modules/`, `coverage/`) or lockfiles by hand.
- Never modify a sibling checkout (`../cadenway-*`) from a task in this repository.

The agent hooks enforce most of these mechanically; a refused command is a signal to stop and ask,
not to find another way around it.

## Agent tooling

- **Claude Code**: [CLAUDE.md](CLAUDE.md) and [.claude/README.md](.claude/README.md): the
  `cw-ds-*` agents, the `/cw-*` commands (`/cw-quality` runs the whole local gate),
  path-scoped rules and hooks.
- **Codex**: [.codex/README.md](.codex/README.md) covers the specialists, `$cw-*` skills, rules and hooks.
- **Builders** (assigned writes): `cw-ds-component-builder`, `cw-ds-story-writer`, `cw-ds-theme-maintainer`, `cw-ds-icon-maintainer`, `cw-ds-unit-test-writer`, `cw-ds-release-manager`, `cw-ds-github-maintainer`.
- **Reviewers** (read-only): `cw-ds-a11y-auditor`, `cw-ds-motion-reviewer`, `cw-ds-design-reviewer`, `cw-ds-package-reviewer`, `cw-ds-architecture-reviewer`.
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

- [Design System artifact](https://claude.ai/artifact/Xrfx4ccwixnRpFgVYvrCcZ), [interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE), [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et) and
  [repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N) (living documents).
