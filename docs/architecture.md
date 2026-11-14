# Architecture and ownership

[Documentation index](README.md) · [Repository instructions](../AGENTS.md)

## Status

At the time this documentation was written, this checkout has no `package.json`, application source tree, or GitHub workflow files. The target architecture, scripts, and workflows in this guide must be created and verified during bootstrap.

The following architecture is the target recorded in [AGENTS.md](../AGENTS.md). Paths and integrations are design boundaries, not evidence that files or services already exist.

## Purpose and target structure

cadenway-design-system is the Angular design system taken from the mockup. It publishes `@cadenway/tokens`, `@cadenway/icons` and `@cadenway/ui` (pnpm monorepo, Changesets) and hosts Storybook as the visual reference. Consumers: cadenway-webapp and cadenway-website.

```text
packages/
├─ tokens/   → @cadenway/tokens (tokens.css, theme.css)
├─ icons/    → @cadenway/icons (provideCadenwayIcons)
└─ ui/       → @cadenway/ui (src/lib/<brick>/, public-api.ts)
apps/storybook/
```

## Architectural ownership

- `packages/tokens`: colors (light and dark), typography, radii, shadows, motion variables and keyframes.
- `packages/icons`: the Phosphor, svgl and flag icons the apps use.
- `packages/ui`: generic bricks and the two business icons; one folder per brick.
- `apps/storybook`: stories, interaction tests, accessibility checks.

- `tests/architecture`: design-system entry point, test layout and dependency checks. The shared
  verifier and its reference fixtures live in
  [cadenway-tooling](https://github.com/Cadenway/cadenway-tooling/tree/main/packages/angular-testing).

### Architecture check rollout

The design system's `pnpm test:architecture` script consumes the published
`@cadenway/angular-testing/architecture` entry point. After the first cadenway-tooling release,
grant this repository read access to the package in GitHub Packages, install the dependency
with `pnpm add -Dw @cadenway/angular-testing`, and commit the updated lockfile.

Run `pnpm install --frozen-lockfile` and `pnpm test:architecture`. In the same change, add that
script to `quality` and the CI quality job. Set `packages: read` on that
job, configure `setup-node` with the `@cadenway` scope and GitHub Packages registry, and provide
the workflow `GITHUB_TOKEN` to pnpm as `NODE_AUTH_TOKEN` at install. The remaining quality checks
run throughout the transfer.

## Boundaries

- No business logic, no API call, no knowledge of tasks beyond the display contracts of `cw-status-icon` and `cw-priority-icon`.
- Consumers never restyle a brick from outside: variants are inputs.
- Tokens are the only source of colors, radii, shadows and timings.
- `docs/maquette/` is a read-only reference.

## Cross-repository changes

Each checkout owns its implementation and release. Use published `@cadenway/*` packages instead of sibling source imports or local dependency links. For contract changes, make the contract and generated package available first, then update the producing service, gateways and listeners, and finally the webapp. Each step should remain deployable independently.
