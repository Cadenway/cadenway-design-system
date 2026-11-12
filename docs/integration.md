# Domain and integration

[Documentation index](README.md) · [Repository instructions](../AGENTS.md)

**Status:** This page records the target design from repository instructions and skills. Its behavior has not been verified as implemented in this snapshot.

## Consumer contract

The design system owns tokens, icons, reusable Angular bricks and Storybook. The app and public site consume published packages; application domain logic and API calls stay outside the design system. [The mockup copy](maquette/README.md) is a read-only reference. APIs and visual values below are design targets and need verification against the implementation and mockup before release.

## Tokens And Theme

Source: `cw-tokens-and-theme` ([Claude](../.claude/skills/cw-tokens-and-theme/SKILL.md), [Codex](../.codex/skills/cw-tokens-and-theme/SKILL.md)).

- Theme by `data-theme="light|dark"` on the root, never a class.
- Text 13 px base; `text-xs` 12/16, `text-sm` 13/20, `text-base` 14/20, `text-lg` 16/24, `text-2xl` 20/28.
- Radius base 6 px (`rounded-md` 4, `rounded-lg` 6, `rounded-xl` 8); 4 px grid; controls 32 px (28 px dense).
- Primary action `bg-foreground text-background`; amethyst (`primary`) for choice, focus and links only.
- Full values: integration guide, section "Fondations".

## Brick Recipes

Source: `cw-brick-recipes` ([Claude](../.claude/skills/cw-brick-recipes/SKILL.md), [Codex](../.codex/skills/cw-brick-recipes/SKILL.md)).

| Brick                                             | API                                                                             | Primitive                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------- |
| `button[cwButton]`                                | `variant`: primary, outline, ghost, destructive; `size`: sm (28 px), md (32 px) | —                                  |
| `cw-split-button`                                 | `label`, `next`, `advance` output, projected menu                               | Aria Menu                          |
| `cw-select`                                       | `value = model()`, `options`, `placeholder`                                     | Aria Select (Combobox + Listbox)   |
| `cw-combobox`                                     | `value = model()`, `suggest: (text) => T[]`                                     | Aria Combobox                      |
| `cw-menu`, `[cwMenuTrigger]`, `[cwContextMenu]`   | items, separators, submenus, checkbox and radio items                           | Aria Menu                          |
| `cw-popover`                                      | projected content, non-modal dialog                                             | CDK Overlay                        |
| `cw-dialog`                                       | `size`: md, lg, 2xl; `title`                                                    | CDK Dialog                         |
| `cw-confirm-dialog`                               | `title`, `text`, `cta`, `items?`, `typeName?`                                   | CDK Dialog (alertdialog)           |
| `cw-toast`                                        | `title`, `desc`, `undo?`, `openId?`; 6 s                                        | —                                  |
| `cw-tabs`                                         | `selected = model()`                                                            | Aria Tabs                          |
| `cw-choice-chips`, `cw-switch`, `cw-checkbox`     | `value`/`checked = model()`; checkbox `indeterminate`                           | Aria Listbox / —                   |
| `cw-date-picker`                                  | `value = model<string \| null>()`, `shortcuts`                                  | Aria Grid                          |
| `cw-avatar`, `cw-avatar-stack`                    | `person`, `size`, `presence?`; `max` (5 then "+ n")                             | —                                  |
| `cw-meter`                                        | `value`, `max`, `segments?`; warning ≥ 80 %, critical ≥ 90 %                    | —                                  |
| `cw-skeleton`, `cw-empty-state`, `cw-error-panel` | shape; icon, title, text; title, text, code, `retry`                            | —                                  |
| `cw-block-editor`, `cw-markdown`                  | `value = model<string>()` (Markdown); `source`                                  | Aria Toolbar                       |
| `cw-status-icon`                                  | `status`, `from?`, `milestone`, `size` (3, 3.5, 4, 5)                           | SVG layers animated between states |
| `cw-priority-icon`                                | `priority`, `from?`, `size`                                                     | SVG bars                           |

## References

[Interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE), [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et), and [repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N). Use [AGENTS.md](../AGENTS.md) as the local source for ownership and hard limits.
