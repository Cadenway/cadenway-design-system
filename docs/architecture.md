# Architecture and ownership

[Documentation index](README.md) · [Repository instructions](../AGENTS.md)

## Status

The workspace is bootstrapped: `package.json` scripts, the three package skeletons, Storybook and the CI and release workflows exist. The packages are being filled from the Design System artifact and the mockup: `@cadenway/tokens` and `@cadenway/icons` first, then the `@cadenway/ui` bricks in waves.

The architecture below is recorded in [AGENTS.md](../AGENTS.md); check the checkout for the bricks that exist so far.

## Purpose and target structure

cadenway-design-system is the Angular design system taken from the mockup. It publishes `@cadenway/tokens`, `@cadenway/icons` and `@cadenway/ui` (pnpm monorepo, Changesets) and hosts Storybook as the visual reference. Consumers: cadenway-webapp and cadenway-website.

```text
packages/
├─ tokens/   → @cadenway/tokens (tokens.css, theme.css)
├─ icons/    → @cadenway/icons (provideCadenwayIcons)
└─ ui/       → @cadenway/ui (<brick>/ = entry point @cadenway/ui/<brick>, one subfolder per
                component or directive; core/ = a11y, motion, overlay, styles)
apps/storybook/
```

## Architectural ownership

- `packages/tokens`: colors (light and dark), typography, radii, shadows, motion variables and keyframes.
- `packages/icons`: the Phosphor, svgl and flag icons the apps use.
- `packages/ui`: generic bricks and the two business icons; one folder per brick, each its own
  secondary entry point (`@cadenway/ui/<brick>`), shared helpers in `core/`.
- `apps/storybook`: stories, interaction tests, accessibility checks.

## Boundaries

- No business logic, no API call, no knowledge of tasks beyond the display contracts of `cw-status-icon` and `cw-priority-icon`.
- Consumers never restyle a brick from outside: variants are inputs.
- Tokens are the only source of colors, radii, shadows and timings.
- `docs/maquette/` is a read-only reference.

## Cross-repository changes

Each checkout owns its implementation and release. Use published `@cadenway/*` packages instead of sibling source imports or local dependency links. For contract changes, make the contract and generated package available first, then update the producing service, gateways and listeners, and finally the webapp. Each step should remain deployable independently.
