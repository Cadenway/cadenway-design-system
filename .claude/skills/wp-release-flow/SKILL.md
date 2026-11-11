---
name: wp-release-flow
description: "How waypoint-design-system versions and publishes its three packages with Changesets, and the deprecation rule. Load it before preparing a release."
---

# Release flow

1. Each PR adds a changeset (`pnpm changeset`) per changed package with its level.
2. Merges accumulate in the "Version Packages" pull request opened by the Changesets action.
3. Its merge bumps versions and the release workflow publishes; Renovate then opens update PRs in
   the webapp and the website.
4. Breaking: deprecate in a minor (JSDoc `@deprecated` and a console warning in dev), remove in the
   next major.
