# cadenway-design-system

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
pnpm test --include packages/ui/components/<brick>
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

- [Design System artifact](https://claude.ai/artifact/Xrfx4ccwixnRpFgVYvrCcZ): tokens, Tailwind theme, component sheets (source of truth for values and APIs).
- [Interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE): every screen, state and interaction.
- [Integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et): data shapes, screens, behaviors, Angular mapping.
- [Repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N): what each repository owns, deployment.
