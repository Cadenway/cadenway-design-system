# cadenway-design-system: Claude Code tooling

This `.claude/` folder ships the Claude Code tooling of cadenway-design-system: **12 agents**,
13 slash commands, 9 rules, 12 skills, 3 hooks, the project
settings and launch configuration. The application launch requires the planned package scripts.

Start from [AGENTS.md](../AGENTS.md) (the rules every assistant follows) and [CLAUDE.md](../CLAUDE.md)
(the Claude entry point).

## Settings (`settings.json`)

- **Hooks** are wired through `${CLAUDE_PROJECT_DIR}` so they resolve from any working directory:
  `guard.mjs` before every `Write` / `Edit` / `MultiEdit`, `guard-git.mjs` before every `Bash` /
  `PowerShell` command, and `format.mjs` after matching edit events for supported files.
  Apply the repository rules across tools.
- **Permissions** allow specific repository commands and read-only Git commands. The project
  denies `Read` on `.env` and `.env.*`. Follow the repository secret-handling rules across tools.
  The project does not pre-approve `git push`, `gh` writes or arbitrary shell commands.
- **Fast mode is off** (`fastMode: false` and `CLAUDE_CODE_DISABLE_FAST_MODE=1`). Agent models and
  efforts are explicit in each agent's frontmatter; do not silently substitute a model.
- **MCP**: `enabledMcpjsonServers` enables `angular`, `playwright`, `context7` from the root `.mcp.json`.
- **No plugins** are enabled (`enabledPlugins: {}`). The folder is itself a plugin
  (`.claude-plugin/plugin.json`, `hooks/hooks.json`) for installations outside this checkout.

## Working with the sibling repositories

Start from this checkout and attach the peers you need, for example:

```powershell
claude --add-dir ../cadenway-webapp ../cadenway-website
```

Their `.claude/agents/` are discovered too, so their `cw-*` roles become available. Peer checkouts
are **read-only** from a cadenway-design-system session (the guard refuses edits there): change them in their
own session and pull request.

## Agents

Builders write only assigned files, inherit permissions and preserve concurrent work. Reviewers are
read-only: their tools exclude `Edit` and `Write`, and they ask the parent for the output of any
check that writes files. No agent delegates further.

| Agent | Responsibility | Model | Effort | Mode |
| --- | --- | --- | --- | --- |
| `cw-ds-component-builder` | A brick of @cadenway/ui. | opus | high | Assigned writes |
| `cw-ds-story-writer` | Stories and interaction tests. | sonnet | high | Assigned writes |
| `cw-ds-theme-maintainer` | Tokens, themes, Tailwind @theme. | sonnet | high | Assigned writes |
| `cw-ds-icon-maintainer` | The registered icon set. | sonnet | medium | Assigned writes |
| `cw-ds-unit-test-writer` | Unit tests of bricks. | sonnet | high | Assigned writes |
| `cw-ds-release-manager` | Changesets and release notes. | sonnet | medium | Assigned writes |
| `cw-ds-a11y-auditor` | Roles, keyboard, focus, contrast. | sonnet | high | Read-only |
| `cw-ds-motion-reviewer` | Timings and easings. | sonnet | medium | Read-only |
| `cw-ds-design-reviewer` | Fidelity to the mockup. | sonnet | high | Read-only |
| `cw-ds-package-reviewer` | Exports, peer dependencies, bundle. | sonnet | high | Read-only |
| `cw-ds-architecture-reviewer` | Generic bricks, tokens only. | opus | xhigh | Read-only |
| `cw-ds-github-maintainer` | Workflows, templates and community files in .github/. | sonnet | medium | Assigned writes |

## Commands

| Command | What it does | Runs |
| --- | --- | --- |
| `/cw-component` | Build or change a brick. | `cw-ds-component-builder` |
| `/cw-story` | Write stories for a brick. | `cw-ds-story-writer` |
| `/cw-theme` | Change tokens or themes. | `cw-ds-theme-maintainer` |
| `/cw-icons` | Add or remove registered icons. | `cw-ds-icon-maintainer` |
| `/cw-test` | Write unit tests. | `cw-ds-unit-test-writer` |
| `/cw-release` | Prepare changesets and release notes. | `cw-ds-release-manager` |
| `/cw-a11y` | Audit accessibility. | `cw-ds-a11y-auditor` |
| `/cw-motion-review` | Review animations. | `cw-ds-motion-reviewer` |
| `/cw-design-review` | Compare with the mockup. | `cw-ds-design-reviewer` |
| `/cw-package-review` | Review exports and dependencies. | `cw-ds-package-reviewer` |
| `/cw-arch-review` | Review boundaries. | `cw-ds-architecture-reviewer` |
| `/cw-github` | Change workflows, templates or community files in .github/. | `cw-ds-github-maintainer` |
| `/cw-quality` | Run the local quality gate, stopping at the first failure. | runs the commands itself |

## Rules

| File | Subject | Loads for |
| --- | --- | --- |
| `bricks.md` | Bricks | `packages/ui/src/lib/**` |
| `tokens.md` | Tokens | `packages/tokens/**` |
| `public-api.md` | Public API | `packages/**/public-api.ts`, `packages/**/index.ts`, `packages/**/package.json` |
| `stories.md` | Stories | `apps/storybook/**`, `packages/**/*.stories.ts` |
| `testing.md` | Tests | `packages/**/*.spec.ts` |
| `language.md` | Language | always |
| `git-and-commits.md` | Git and commits | always |
| `comments.md` | Comments and docblocks | `packages/**/*.ts`, `packages/**/*.html`, `packages/**/*.css`, `apps/storybook/**/*.ts` |
| `github.md` | GitHub files | `.github/**` |

## Skills

See [skills/](skills/) for the complete inventory, including the technology guides.

| Skill | Use |
| --- | --- |
| `cw-context` | What Cadenway is, where the mockup, the integration guide and the repository map live, the product vocabulary (spaces, lists, sprints, tasks, statuses, milestones) and the multi-repository ownership rules. |
| `cw-brick-recipes` | The API and behavior of each @cadenway/ui brick as the integration guide defines it, with the Angular Aria or CDK primitive underneath. |
| `cw-tokens-and-theme` | The color, typography, radius and shadow tokens of the mockup in light and dark, and how the Tailwind 4 theme maps them. |
| `cw-motion-tokens` | The animation timings and easings of the mockup and how reduced motion disables them. |
| `cw-release-flow` | How cadenway-design-system versions and publishes its three packages with Changesets, and the deprecation rule. |

## Hooks

| Hook | When | What it refuses or does |
| --- | --- | --- |
| `guard.mjs` | before `Write`, `Edit` or `MultiEdit` | Sibling checkouts, generated trees, lockfiles, `.git/`, secrets and tokens, hard-coded colors outside the tokens, `export *` in the public API and edits of the mockup copy, unpinned third-party actions and `pull_request_target` in workflows. |
| `guard-git.mjs` | before `Bash` or `PowerShell` | Pushes to `main`, tag pushes, force-pushes, rewrites of pushed commits, hook bypasses, destructive resets, registry publishing, branch names outside `<type>/<kebab>`. Adapted from the dentalstock guard. |
| `format.mjs` | after a successful `Write`, `Edit` or `MultiEdit` | Formats supported files with the repository's Prettier; a no-op until the formatter is installed. |
