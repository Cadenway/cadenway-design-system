# cadenway-design-system: agent instructions

Apply these instructions in every assistant. Explicit user instructions take precedence over
procedures, within the hard limits below. Follow the rules for the affected paths and load only
the skills relevant to the task.

## First read

- Before changing a brick, read its [Design System artifact](https://claude.ai/artifact/Xrfx4ccwixnRpFgVYvrCcZ)
  sheet (`project/components/<Name>/README.md`) for values, variants and APIs. Compare the closest
  existing brick, its stories and the mockup screens that use it for behavior, states and copy.
- For token or theme work, use `cw-tokens-and-theme` and consult `project/tokens.json`,
  `project/tailwind/cadenway.css` and `docs/maquette/source/styles/app.css` as relevant.
- For status or priority display, consult `docs/maquette/source/StatutTache.dc.html` or
  `docs/maquette/source/PrioriteTache.dc.html` and the integration guide sections
  “Composants métier” and “Comportements transverses”.
- For brick behavior, apply the brick, public API and story rules. Verify the accessibility checks.
- Get versions and scripts from `package.json`. Keep version declarations there.

## What this repository is

The Angular design system publishes `@cadenway/tokens`, `@cadenway/icons` and `@cadenway/ui`
for the webapp and public site. Storybook is its visual reference. See the
[target package layout](docs/architecture.md#purpose-and-target-structure) and check the
checkout for available files and commands.

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

Use the `github.md` rule for this checkout's [GitHub homepage](.github/README.md), community
files, templates, owners and workflows. Cadenway has no organization `.github` repository.
Keep complete CI and release workflows here, without reusable workflows from siblings.
Keep Renovate local without a shared preset. Apply common changes through a PR in each affected
repository.

## Code quality

- Read the affected entry point, its callers, and its relevant tests before editing.
  Preserve the behavior callers rely on unless the task changes it.
- Keep the diff focused. Use names that express intent and reuse existing code when
  it preserves the required behavior. Extract code when it clarifies a responsibility.
- Keep business decisions with their owning module. Validate external inputs at the
  boundary and use documented public interfaces across modules and repositories.
- For writes that can fail, overlap, or be retried, verify the resulting state.
  Check transaction boundaries, tenant scope, and repeated delivery where relevant.
- For collections and repeated work, check what grows with input size. Measure or
  inspect the bottleneck before adding an index, cache, worker, or replica.
- Run the repository checks that cover the affected behavior. Report the commands
  and their results, including checks that did not run and tests that selected zero cases.

## Commands and quality gates

Use the scripts declared in [package.json](package.json). Start with the narrowest check that
covers the change, then widen where needed.

| Changed                         | Minimum check                                                           |
| ------------------------------- | ----------------------------------------------------------------------- |
| A brick                         | `pnpm test --include "<spec-glob>"`, its stories, `pnpm test:storybook` |
| Tokens                          | `pnpm build`, the token stories in light and dark                       |
| Public API                      | `pnpm build`, `pnpm test:packaging` and `cw-ds-package-reviewer`        |
| Any change to a package         | a changeset (`pnpm changeset`)                                          |
| Docs or agent instructions only | Scoped formatting and link review                                       |

For `packages/ui`, apply the comment convention in the matching `.codex/rules/comments.md` or
`.claude/rules/comments.md`, including explicit types, member access and regions. Run
`pnpm lint:ui` and `pnpm format:ui:check`; when editing the UI lint rules or configuration, also run
`pnpm test:ui-lint`. These checks validate structure, so review the meaning of comments separately.

Run `pnpm test:architecture` after changing entry points, test layout or architecture checks. See the
[architecture check](docs/architecture.md#architecture-check).

See the [full local quality gate](docs/development.md#full-local-quality-gate) for the shared
Codex and Claude Code procedure.

## Git and branch flow

Use the `git-and-commits.md` rule for work off `main`, branch names and Conventional
Commits. Validate a branch name with `git check-ref-format --branch <name>`. Target `main` with
reviewed PRs and squash-merge after green CI. Changesets describes package changes, and CI publishes after the Version Packages PR merges. Stage only task files and
preserve existing changes.

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

Use the [Codex](.codex/README.md) and [Claude Code](.claude/README.md) guides for rules,
skills, hooks and the [specialist inventory](.claude/README.md#agents). Builders have
assigned write scopes and reviewers are read-only. Specialists are optional. When delegating,
assign disjoint files and explicit checks, then integrate the results yourself.

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
