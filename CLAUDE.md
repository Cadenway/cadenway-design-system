# cadenway-design-system: Claude Code instructions

@AGENTS.md

Open this checkout as the project root to load its Claude tooling. The [tooling guide](.claude/README.md)
lists agents, commands and skills. Rules in `.claude/rules/` without `paths` load at startup.
Rules with `paths` load when Claude reads matching files. Open linked task references on demand.

Hooks apply to events matched in `.claude/settings.json`. Follow the repository rules across
tools and resolve refusals without bypassing hooks. See the [hook inventory](.claude/README.md#hooks)
for coverage. Use [`/cw-quality`](.claude/commands/cw-quality.md) for the shared quality procedure.

Use `--add-dir` when you need read-only access to `../cadenway-webapp` and `../cadenway-website`.
