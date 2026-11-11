---
paths:
  - 'packages/**/public-api.ts'
  - 'packages/**/index.ts'
  - 'packages/**/package.json'
---

# Public API

- Explicit named exports only; nothing internal, no testing helper.
- Angular and the CDK are peer dependencies.
- Removing or renaming an export: deprecate in a minor, remove in the next major.
