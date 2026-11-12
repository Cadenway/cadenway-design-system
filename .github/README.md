# waypoint-design-system

waypoint-design-system is the Angular design system taken from the mockup. It publishes `@waypoint/tokens`, `@waypoint/icons` and `@waypoint/ui` (pnpm monorepo, Changesets) and hosts Storybook as the visual reference. Consumers: waypoint-webapp and waypoint-website.

```text
packages/
├─ tokens/   → @waypoint/tokens (tokens.css, theme.css)
├─ icons/    → @waypoint/icons (provideWaypointIcons)
└─ ui/       → @waypoint/ui (src/lib/<brick>/, public-api.ts)
apps/storybook/
```

## Getting started

Requirements: Node.js LTS and pnpm (versions in `package.json`).

```bash
pnpm install
pnpm storybook              # http://localhost:6006
```

Consumers install the published packages; never link this folder into another repository.

## Checks

Run the narrowest check first; CI runs them all on every pull request.

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test --include packages/ui/src/lib/<brick>
pnpm test:coverage
pnpm storybook:build
pnpm test:storybook           # interaction and accessibility checks
pnpm build                    # every package
pnpm changeset status
```

## Contributing

- [Contributing guide](CONTRIBUTING.md): branches, commits, pull requests, releases.
- [Code of conduct](CODE_OF_CONDUCT.md), [security policy](SECURITY.md), [getting help](SUPPORT.md).
- AI assistants follow [AGENTS.md](../AGENTS.md); Claude Code also reads [CLAUDE.md](../CLAUDE.md) and the
  tooling described in [.claude/README.md](../.claude/README.md).

## License

This repository is proprietary. See [LICENSE](../LICENSE) for the rights and restrictions that apply.

## References

- [Interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE): every screen, state and interaction.
- [Integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et): tokens, data shapes, component names.
- [Repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N): what each repository owns, deployment.
