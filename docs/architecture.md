# Architecture and ownership

[Documentation index](README.md) · [Repository instructions](../AGENTS.md)

## Status

At the time this documentation was written, this checkout has no `package.json`, application source tree, or GitHub workflow files. The target architecture, scripts, and workflows in this guide must be created and verified during bootstrap.

The following architecture is the target recorded in [AGENTS.md](../AGENTS.md). Paths and integrations are design boundaries, not evidence that files or services already exist.

## Purpose and target structure

waypoint-design-system is the Angular design system taken from the mockup. It publishes `@waypoint/tokens`, `@waypoint/icons` and `@waypoint/ui` (pnpm monorepo, Changesets) and hosts Storybook as the visual reference. Consumers: waypoint-webapp and waypoint-website.

```text
packages/
├─ tokens/   → @waypoint/tokens (tokens.css, theme.css)
├─ icons/    → @waypoint/icons (provideWaypointIcons)
└─ ui/       → @waypoint/ui (src/lib/<brick>/, public-api.ts)
apps/storybook/
```

## Architectural ownership

- `packages/tokens`: colors (light and dark), typography, radii, shadows, motion variables and keyframes.
- `packages/icons`: the Phosphor, svgl and flag icons the apps use.
- `packages/ui`: generic bricks and the two business icons; one folder per brick.
- `apps/storybook`: stories, interaction tests, accessibility checks.

## Boundaries

- No business logic, no API call, no knowledge of tasks beyond the display contracts of `wp-status-icon` and `wp-priority-icon`.
- Consumers never restyle a brick from outside: variants are inputs.
- Tokens are the only source of colors, radii, shadows and timings.
- `docs/maquette/` is a read-only reference.

## Cross-repository changes

Each checkout owns its implementation and release. Use published `@waypoint/*` packages instead of sibling source imports or local dependency links. For contract changes, make the contract and generated package available first, then update the producing service, gateways and listeners, and finally the webapp. Each step should remain deployable independently.
