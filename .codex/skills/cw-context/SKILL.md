---
name: cw-context
description: "Resolve product and cross-repository decisions using Cadenway's sources, vocabulary and ownership rules."
---

# Cadenway context

Read this before deciding anything that depends on the product or another repository.
Read [product vocabulary and fixtures](references/product.md) for terms, demo dates or fixture data.

## Sources of truth

| Source | What it settles |
| --- | --- |
| [Design System artifact](https://claude.ai/artifact/Xrfx4ccwixnRpFgVYvrCcZ) (tokens v17, 82 component sheets) | Token values, the Tailwind 4 theme, and each brick's API, variants, sizes, states, keyboard and accessibility. When it and the mockup or the guide disagree on a value or an API, the artifact wins (decision of 2026-11-13). |
| [Interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE) (19 artboards) | Every screen, state and interaction. When this repository and the mockup disagree on behavior, the mockup wins until a decision says otherwise. |
| [Integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et) | Data shapes, screen components (`cw-*`), behaviors, Angular 22 mapping, what the mockup only simulates. Its color table and base-component APIs predate tokens v17: use the artifact for those. |
| [Repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N) | The 18 repositories, their data, APIs, events, deployment (Docker Compose, Traefik, Ansible, Terraform, GitOps agent) and open decisions. |
| `../cadenway-api-contracts` | The only definition of public routes (OpenAPI) and events (AsyncAPI). |

## Ownership across repositories

- Each repository owns its data and decisions; the others reach it only through
  `cadenway-api-contracts` (routes, events) and the published `@cadenway/*` packages.
- Coordinate producer contracts, generated packages and consumers **in that order**; every step only
  adds, so each repository ships alone.
- Sibling checkouts are read-only from here. A need in another repository is written as a request
  for its owner (its `cw-*` agents), never as an edit from this session.
- Use published package versions. No `npm link`, no `file:` dependency, no TypeScript alias into a
  sibling's sources, no copied implementation.
