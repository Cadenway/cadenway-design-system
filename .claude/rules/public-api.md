---
paths:
  - 'packages/**/public-api.ts'
  - 'packages/**/index.ts'
  - 'packages/**/package.json'
  - 'packages/**/ng-package.json'
---

# Public API

- Explicit named exports only; nothing internal, no testing helper.
- `@cadenway/ui`: one secondary entry point per brick (`@cadenway/ui/components/<brick>`), each with its own
  `public-api.ts` and a spec pinning its exports. Helpers shared across entry points live in
  `@cadenway/ui/core`; those that are not public API carry the `ɵ` prefix.
- Angular and the CDK are peer dependencies.
- Removing or renaming an export: deprecate in a minor, remove in the next major.
