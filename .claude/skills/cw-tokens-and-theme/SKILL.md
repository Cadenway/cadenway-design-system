---
name: cw-tokens-and-theme
description: "The color, typography, radius and shadow tokens of the Design System artifact in light and dark, the mockup's extra hues, and how the Tailwind 4 theme maps them. Load it for any style decision."
---

# Tokens and theme

Source of truth: the [Design System artifact](https://claude.ai/artifact/Xrfx4ccwixnRpFgVYvrCcZ),
`project/tokens.json` (version 17) and `project/tailwind/cadenway.css`. The mockup embeds the same
`tokens.json`, but its compiled `docs/maquette/source/styles/app.css` predates version 17 (zinc
`#18181b` neutrals): when the two disagree on a value, the artifact wins.

## Theme

- `data-theme="light|dark"` on the root element, never a class. The `dark:` variant is
  `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`.
- Every color token has a light and a dark value; the primary theme is light.

## Colors (light / dark)

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `canvas` | `#f3f4f6` | `#0d0d10` | app background behind panels, Kanban columns |
| `surface` | `#ffffff` | `#151518` | panels, cards, sidebar (`background`, `card`, `sidebar`) |
| `surface-muted` | `#eff1f4` | `#1d1d22` | hollows: Kbd, Skeleton, read-only field (`muted`) |
| `surface-overlay` | `#ffffff` | `#1e1e23` | menus, Select, Command, toasts, dialogs (`popover`) |
| `stone` | `#e1e4e8` | `#27272d` | neutral fill: secondary button, initials (`secondary`) |
| `hover` | `#1118270a` | `#e6e8ff0b` | hover veil (`accent`, `sidebar-accent`) |
| `selected` | `#11182717` | `#e6e8ff18` | selected or active veil |
| `focus` | `#7c3aed` | `#a78bfa` | keyboard focus (`ring`, `sidebar-ring`) |
| `line` | `#1118270b` | `#e6e8ff0c` | separators, cards, menus (`border`) |
| `line-strong` | `#11182719` | `#e6e8ff18` | field and `outline` button borders (`input`) |
| `line-control` | `#11182734` | `#e6e8ff2c` | checkbox, radio, switch off |
| `track` | `#1118272d` | `#e6e8ff27` | Progress, Slider, scrollbar thumb |
| `shadow-contact` | `#11182714` | `#00000073` | short contact shadow |
| `shadow-ambient` | `#1118270d` | `#00000059` | wide ambient shadow |
| `shadow-edge` | `#ffffff00` | `#ffffff0f` | inner top edge of raised surfaces |
| `ink` | `#18181b` | `#ececee` | text (`foreground`) |
| `ink-muted` | `#5f616a` | `#9c9ea6` | secondary text (`muted-foreground`) |
| `grenat` | `#d92d33` | `#ff5c61` | Bloqué, urgent, destructive, errors (`destructive`) |
| `grenat-soft` | `#fde8e8` | `#3b1517` | error alert background, removed diff lines |
| `grenat-text` | `#b4232b` | `#ff9396` | error text on `canvas` and `surface-muted` |
| `amethyste` | `#7c3aed` | `#a78bfa` | `primary`: links, active icon, today, chart 1 |
| `balise` | `#f5b000` | `#ffc21a` | En cours icon, chart 3 |
| `jade` | `#10964a` | `#33d17a` | Terminé, progress, diff additions |
| `jade-soft` | `#dcf7e5` | `#0f2e1d` | added diff lines |
| `jade-text` | `#0d7a39` | `#7ee5a8` | green text |

Semantic aliases, identical in both themes: `background`, `card`, `sidebar` → `surface`;
`foreground`, `card-foreground`, `popover-foreground`, `secondary-foreground`,
`accent-foreground`, `sidebar-foreground`, `sidebar-primary`, `sidebar-accent-foreground` → `ink`;
`popover` → `surface-overlay`; `primary` → `amethyste`; `primary-foreground`,
`destructive-foreground`, `sidebar-primary-foreground` → `surface`; `secondary` → `stone`; `muted`
→ `surface-muted`; `muted-foreground` → `ink-muted`; `accent`, `sidebar-accent` → `hover`;
`destructive` → `grenat`; `border`, `sidebar-border` → `line`; `input` → `line-strong`; `ring`,
`sidebar-ring` → `focus`; `chart-1` … `chart-5` → `amethyste`, `jade`, `balise`, `grenat`,
`ink-muted`.

Mockup extension, absent from `tokens.json` (status "En revue" and priority "Haute" use
`cornaline`; spaces and labels use the others): `cornaline` `#ea580c`/`#fb923c`, `indigo`
`#4f46e5`/`#818cf8`, `azur` `#2563eb`/`#60a5fa`, `lagon` `#0891b2`/`#22d3ee`, `olive`
`#65a30d`/`#a3e635`, `rose` `#db2777`/`#f472b6`, `fuchsia` `#c026d3`/`#e879f9`, `ardoise`
`#475569`/`#94a3b8`.

## Usage rules

- The primary action is ink: `bg-foreground text-background`. `amethyste` (`primary`) only as text,
  icon or focus ring: never a fill, never a surface border.
- Hover: `hover:bg-accent` on a transparent element, `hover:bg-linear-to-b hover:from-hover
  hover:to-hover` on a filled one; never a solid gray, never a border that appears.
- Selected, current, open: `bg-selected` (plus `border-foreground/40` on a card or a choice).
- Small controls (checkbox, radio, switch): border or track `line-control`; checked or on in ink.
- Focus, always `focus-visible`, amethyst: `FOCUS` `ring-2 ring-ring ring-offset-2
  ring-offset-background` (standalone controls), `FOCUS_INSET` `ring-2 ring-inset ring-ring` (rows,
  sidebar items, segmented tabs), `FOCUS_FIELD` `border-ring ring-3 ring-ring/20` (fields).
- Error text: `text-destructive` on `surface`, `text-grenat-text` on `canvas` and `surface-muted`.

## Type, spacing, radii, shadows

- Inter (opsz 14–32, wght 400–700) and Geist Mono (400–600), self-hosted by `@cadenway/tokens`.
- Text scale replaces Tailwind's: `text-xs` 12/16, `text-sm` 13/20 (base), `text-base` 14/20,
  `text-lg` 16/24, `text-2xl` 20/28. Styles: title `text-2xl font-semibold tracking-tight`, heading
  `text-base font-semibold`, body `text-sm`, body-strong `text-sm font-medium`, caption `text-xs
  text-muted-foreground`, code `font-mono text-xs`.
- 4 px grid (`--spacing`). Controls 32 px (`h-8`); a compact bar puts all its items in `sm` (28 px);
  list rows 36 px (`h-9`).
- Radius base 6 px: `rounded-sm` 3, `rounded-md` 4, `rounded-lg` 6, `rounded-xl` 8; nothing above.
- Shadows only on what floats: `shadow-xs` (slider thumb, switch knob), `shadow-sm` (tooltip),
  `shadow-md` (menus, Select, Combobox, Popover), `shadow-lg` (toasts, lifted Kanban card),
  `shadow-xl` (Dialog, Alert Dialog, command palette). Never animate a shadow.
