# Development and verification

[Documentation index](README.md) · [Repository overview](../.github/README.md) · [Repository instructions](../AGENTS.md)

## Status

The workspace is bootstrapped: `package.json` scripts, the three package skeletons, Storybook and the CI and release workflows exist. The packages are being filled from the Design System artifact and the mockup: `@cadenway/tokens` and `@cadenway/icons` first, then the `@cadenway/ui` bricks in waves.

The commands below are the scripts of `package.json`. Report a check you did not run as not run. Run Git, pnpm, build, and test commands with this repository as the working directory, never from the parent workspace.

## Before making a change

- The brick's sheet in the [Design System artifact](https://claude.ai/artifact/Xrfx4ccwixnRpFgVYvrCcZ) (`project/components/<Name>/README.md`): it is the source of truth
  for values, variants and APIs.
- The mockup screens in `docs/maquette/source/` that use the brick: behavior, states and copy.
- The existing brick closest to the one you touch, and its stories.
- `package.json` for versions and scripts once the repository is bootstrapped. Do not restate
  versions elsewhere: a copy goes stale.

## Planned setup

Requirements: Node.js LTS and pnpm (versions in `package.json`).

```bash
pnpm install
pnpm storybook              # http://localhost:6006
```

Consumers install the published packages; never link this folder into another repository.

## Minimum checks by change

Start with the [checks by change](../AGENTS.md#commands-and-quality-gates).

## Full local quality gate

Use [`/cw-quality`](../.claude/commands/cw-quality.md) in Claude Code or
[`$cw-quality`](../.codex/skills/cw-quality/SKILL.md) in Codex.

- With a spec glob, run only `pnpm test --include "<spec-glob>"`, passing the glob as one argument.
  When no tests execute, report `0 tests executed` and mark the behavior as unverified.
- Without a glob, run `pnpm quality` from this checkout. Its steps are declared in
  [package.json](../package.json) and stop at the first failure.
  The gate includes Storybook interaction tests, library builds and package validation. For package changes,
  run `pnpm changeset status` after the gate passes.

Report the commands and their results, including checks that did not run or are unavailable.

## Collaboration and release

- Trunk-based: work branches come from `main`, named `<type>/<lowercase-kebab-description>` with a
  type among `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
  `revert`; put the Cadenway task id first when there is one (`feat/cad-482-sso-screen`). Never an
  agent name as a prefix. Validate with `git check-ref-format --branch <name>`.
- Commits and PR titles follow Conventional Commits: `type(scope): subject`, English, imperative,
  lowercase subject, no trailing period, at most 100 characters; `!` only for a breaking change.
- Pull requests target `main` and are squash-merged after review and green CI. Changesets: each PR adds a changeset; the "Version Packages" pull request bumps versions; its merge publishes to the npm registry from CI.
- Stage only the files of your task; preserve other people's changes in the working tree.

Keep credentials, private keys, decrypted environment files and Terraform state out of documentation and logs. Follow the hard limits in [AGENTS.md](../AGENTS.md); setup instructions do not authorize deployments or changes to real infrastructure.
