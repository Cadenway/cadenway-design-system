---
description: Run the local quality gate or a focused Angular test check.
argument-hint: '<optional spec glob>'
allowed-tools: Bash(pnpm quality), Bash(pnpm test --include *), Bash(pnpm changeset status)
---

Run the [quality procedure](../../docs/development.md#full-local-quality-gate) yourself from this checkout.
Use a supplied spec glob as one argument for the focused check. Otherwise run the full gate.
