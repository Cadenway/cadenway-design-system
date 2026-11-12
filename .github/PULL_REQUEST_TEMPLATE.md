<!--
Title: Conventional Commits, for example `feat(tasks): add sprint burndown`. It becomes the squash
commit on main. See .github/CONTRIBUTING.md.
-->

## Task

Fixes: CAD-

<!-- Use `Refs: CAD-…` instead when this pull request does not complete the task. -->

## Summary

<!-- What changes and why, in a few lines. Link the mockup screen. -->

## Checks run

<!-- Tick what you ran locally. A check you did not run stays unticked, with the reason. -->

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test --include packages/ui/src/lib/<brick>`
- [ ] `pnpm test:coverage`
- [ ] `pnpm storybook:build`
- [ ] `pnpm test:storybook`
- [ ] `pnpm build`
- [ ] `pnpm changeset status`

## Release

- [ ] Changeset added (`pnpm changeset`)
- [ ] Public API unchanged, or deprecated before removal
- [ ] No release needed (docs, tests, CI only)

## Screenshots

<!-- Before and after, in light and dark themes, for any visual change. Delete this section otherwise. -->
