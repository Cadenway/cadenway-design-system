---
name: cw-brick-recipes
description: "The API of each @cadenway/ui brick as its Design System artifact sheet defines it, its entry point, the Angular Aria or CDK primitive underneath, and the adaptations the repository rules impose. Load it before building or changing a brick."
---

# Brick recipes

Source of truth: the brick's sheet in the [Design System artifact](https://claude.ai/artifact/Xrfx4ccwixnRpFgVYvrCcZ),
`project/components/<Name>/README.md` (API, variants, sizes, states, keyboard, accessibility,
motion) and its `preview.html`. The tables below summarize those sheets; read the sheet before
building. The mockup settles behavior and copy.

## Conventions every brick follows

- Entry point `@cadenway/ui/<entry>`, folder `packages/ui/<entry>/`; classes `Cw<Name>`.
- One component, directive or service per file: `<name>.component.ts` + `<name>.component.html`
  (no inline template), `<name>.directive.ts`, `<name>.service.ts`; exported types in
  `<entry>.types.ts`, exported constants in `<entry>.constants.ts` (`.claude/rules/bricks.md`).
- Standalone, OnPush; `input()`, `input.required()`, `model()` for two-way values, `output()`;
  `booleanAttribute` and `numberAttribute`.
- **No `class` input** (41 sheets list one: drop it; `cwTooltipClass` too). The native `class`
  attribute serves layout only.
- Value bricks: `model()` plus `ControlValueAccessor` (the sheets) and Signal Forms `[formField]`
  (the webapp); the pattern is settled on `cw-checkbox` first.
- Style hooks: `data-state`, `data-disabled`, `data-orientation`, `data-side`, `data-variant`,
  `data-size` and `aria-*` only. French default texts, overridable by inputs.
- Behavior: Angular Aria where a pattern exists (Menu, Listbox, Combobox, Tabs, Toolbar, Tree,
  Grid, Accordion), CDK otherwise. The sheets only name CDK pieces (`@angular/cdk/menu`,
  `FocusKeyManager`, `ActiveDescendantKeyManager`, overlay, drag-drop, stepper, scrolling): where
  Angular Aria covers the same pattern, it replaces them.

## Adaptations to the repository boundaries

The sheets carry task knowledge that `AGENTS.md` keeps out of this repository ("no knowledge of
tasks beyond the display contracts of `cw-status-icon` and `cw-priority-icon`"):

- `CwStatusBadge` and `CwPriorityBadge` (Badge sheet) use the product keys and the two business
  icons: status `triage` … `cancelled` (10 keys), priority `urgente`, `haute`, `moyenne`, `basse`;
  not the sheet's `todo/pending/progress/done/blocked` and `urgent/high/normal/low/none`.
- `CwTaskCard` (Card sheet) is not built here: `cadenway-webapp` builds its task card and passes it
  to `cw-kanban` through `CwKanbanCardDef`.
- Kanban, DataTable, CalendarView, Timeline, Relations, Checklist take generic items (`T`, with
  `trackBy` and key accessors) and labels as inputs; bulk actions, relation types and statuses are
  given by the consumer, never defaulted to task values.
- Tooltip provider: `provideCwTooltip` (the sheet's `provideCnTooltip` is a renaming leftover).

## Wave 1: primitives, form controls, indicators

| Brick | Entry | Selectors | API (inputs; models; outputs) | Primitive |
| --- | --- | --- | --- | --- |
| Button | `button` | `button[cwButton]`, `a[cwButton]` | `variant`: default, destructive, outline, secondary, ghost, link; `size`: xs, sm, default, lg, icon-xs, icon-sm, icon, icon-lg; `loading`; `disabled`; sets `type="button"` | native; `CwRipple` from `core` |
| Spinner | `spinner` | `svg[cwSpinner]`, `cw-spinner`, `[cwLoadingOverlay]` | `size`: xs, sm, default, lg, xl, page; `label` = Chargement; `showLabel`; `solid`; `delay` 300; `minDuration` 500 | — |
| ButtonGroup | `button-group` | `cw-button-group`, `-separator`, `-text` | `orientation`; `ariaLabel` (required) | `role="group"` |
| Kbd | `kbd` | `kbd[cwKbd]`, `kbd[cwKbdGroup]`, `cw-shortcut` | `size`: sm, default, lg; `variant`: default, inverse; `keys` (shortcut) | — |
| Label | `label` | `label[cwLabel]` | — | native |
| Separator | `separator` | `cw-separator` | `orientation`; `decorative` = true | — |
| Badge | `badge` | `span`, `a` or `button[cwBadge]`, `cw-status-badge`, `cw-priority-badge` | `variant`: default, secondary, destructive, outline, ghost, link; `size`: default, sm; `status` / `priority` (product keys); `showLabel` | — |
| Avatar | `avatar` | `cw-avatar`, `cw-avatar-group`, `button[cwAvatarAdd]` | `name`, `src`, `size`: xs, sm, default, lg; `presence`: online, away; group `max` = 3; out `imageError` | — |
| Skeleton | `skeleton` | `div[cwSkeleton]` | `animation`: pulse, shimmer, none | — |
| Card | `card` | `cw-card`, `-header`, `-title`, `-description`, `-action`, `-content`, `-footer` | `size`: default, sm; `interactive`; `selected` | — |
| Item | `item` | `cw-item`, `a` or `button[cwItem]`, `cw-item-media`, `-content`, `-title`, `-description`, `-actions`, `-group`, `-separator` | `variant`: default, outline, muted; `size`: default, sm, xs; `selected` (model); `disabled`; `unread`; media `variant`: default, icon, image | roving focus in a group |
| Logo | `logo` | `cw-logo` | `variant`: lockup, stacked, mark; `tone`: auto, mono; `size` = 28; `decorative`. Mark only until the lockups are redrawn | — |
| Field | `field` | `fieldset[cwFieldSet]`, `legend[cwFieldLegend]`, `cw-field-group`, `cw-field`, `label[cwFieldLabel]`, `cw-field-content`, `-title`, `-description`, `-error`, `-separator` | `orientation`: vertical, horizontal; `invalid`, `disabled` deduced from the control; `errors` | wires `id`, `for`, `aria-describedby` |
| Input | `input` | `input[cwInput]` | `size`: sm, default, lg | native accessor |
| Textarea | `textarea` | `textarea[cwTextarea]` | `autoResize` = true | `field-sizing: content` |
| InputGroup | `input-group` | `cw-input-group`, `input[cwInputGroupInput]`, `textarea[cwInputGroupTextarea]`, `cw-input-group-addon`, `-text`, `button[cwInputGroupButton]` | group `size`; addon `align`: inline-start, inline-end, block-start, block-end; button `size`: xs, icon-xs, sm, icon-sm, `variant` = ghost | native accessor |
| Checkbox | `checkbox` | `cw-checkbox` | `checked`, `indeterminate` (models); `disabled`; `id`; `ariaLabel` | `role="checkbox"`; forms pattern |
| Switch | `switch` | `cw-switch` | `checked` (model); `size`: sm, default; `disabled`; `id`; `ariaLabel` | `role="switch"` |
| RadioGroup | `radio-group` | `cw-radio-group`, `cw-radio-group-item` | `value` (model); `orientation`; `disabled`; `required`; `ariaLabel`; item `value`, `disabled`. Choice cards and chips are its card style | roving tabindex |
| Toggle | `toggle` | `button[cwToggle]` | `pressed` (model); `variant`: default, outline; `size`: sm, default, lg | — |
| ToggleGroup | `toggle-group` | `cw-toggle-group`, `button[cwToggleGroupItem]` | `type`: single, multiple; `value` (model); `variant`; `size`; `spacing`; `orientation`; `ariaLabel` | roving tabindex |
| InputOTP | `input-otp` | `cw-input-otp`, `-group`, `-slot`, `-separator` | `length` = 6; `pattern`: digits, alphanumeric; `value` (model); out `complete` | one hidden native input |
| Progress | `progress` | `cw-progress` | `value`; `max` = 100; `variant`: default, success, destructive; `size`; `ariaLabel` (required); `valueText` | `role="progressbar"` |
| Meter | `meter` | `cw-meter` | `value` (required); `min`, `max`; `high` = 80 %, `critical` = 95 %; `low`, `optimum`, `threshold`; `variant`: bar, segmented, stacked; `segments` = 10; `series`; `size`; `label`; `showValue`; `format`; `note`; `showLegend`; `loading` | `role="meter"` |
| Alert | `alert` | `cw-alert`, `-title`, `-description`, `-actions` | `variant`: info, success, warning, destructive; `size`: default, compact; `icon`; `dismissible`; `closeLabel` = Fermer; out `dismissed` | — |
| Banner | `banner` | `cw-banner`, `cw-banner-actions` | `tone`: info, success, warning, error, neutral; `placement`: inline, top; `title` (required); `description`; `dismissible` = true; `dismissKey`; `closeLabel` = Masquer le bandeau | — |
| Empty | `empty` | `cw-empty`, `-header`, `-media`, `-title`, `-description`, `-content` | `variant`: default, outline; `size`: default, sm. The error panel (title, text, code, Réessayer) is an Empty composition | — |
| CodeBlock | `code-block` | `cw-code-block` | `code` (required); `language`; `filename`; `variant`: default, destructive; `size`; `lineNumbers`; `highlight`; `diff`; `copyable`; out `copied` | CDK Clipboard |
| Table | `table` | `table[cwTable]`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, `caption` with `cwTable…` attributes, `cw-table-container` | `size`: default, sm; head and cell `align`: start, end, center | native table |
| Status icon | `status-icon` | `cw-status-icon` | `status` (10 keys); `from`; `milestone`; `size`: 3, 3.5, 4, 5 | SVG layers (mockup `StatutTache.dc.html`) |
| Priority icon | `priority-icon` | `cw-priority-icon` | `priority` (4 keys, unknown → moyenne); `from`; `size` | SVG bars (mockup `PrioriteTache.dc.html`) |

## Wave 2: overlays and pickers

| Brick | Entry | Selectors | API | Primitive |
| --- | --- | --- | --- | --- |
| Tooltip | `tooltip` | `[cwTooltip]` | `cwTooltip` (text or template); `cwTooltipShortcut`; `cwTooltipSide`, `cwTooltipAlign`; `cwTooltipArrow` = true; `cwTooltipOpenDelay` = 700; `cwTooltipDisabled`; `provideCwTooltip({ openDelay, skipDelay })` | CDK Overlay |
| Popover | `popover` | `[cwPopoverTrigger]`, `cw-popover`, `cw-popover-arrow`, `button[cwPopoverClose]` | `open` (model); `side`; `align`; `sideOffset` = 8; `arrow`; `modal`; `closeOnOutsideClick` = true | CDK Overlay |
| Menu (DropdownMenu sheet) | `menu` | `cw-menu`, `[cwMenuTriggerFor]`, `button[cwMenuItem]`, `button[cwMenuItemCheckbox]`, `button[cwMenuItemRadio]`, `cw-menu-radio-group`, `-group`, `-label`, `-separator`, `-shortcut` | menu `side`, `align`; item `variant`: default, destructive; `inset`; checkbox `checked` (model); radio group `value` (model); outs `triggered`, `closed` | Aria Menu |
| ContextMenu | `context-menu` (panel from `menu`) | `[cwContextMenuTriggerFor]` | `cwContextMenuData`; `cwContextMenuDisabled`; outs `opened`, `closed`; right click, Menu key, Shift + F10 | Aria Menu; CDK Overlay at the pointer |
| Select | `select` | `cw-select`, `-group`, `-option`, `-separator`, `-empty` | `value` (model); `placeholder` = Choisir…; `size`; `compareWith`; `emptyText` = Aucune option; `open` (model); label change through `CwSwap` | Aria Select (Combobox + Listbox) |
| Combobox | `combobox` | `cw-combobox`, `-group`, `-option`, `-empty` | `value` (model); `multiple`; `placeholder`; `searchPlaceholder` = Rechercher…; `emptyText` = Aucun résultat; `creatable`; `createLabel`; `loading`; `filter`; outs `search`, `create` | Aria Combobox |
| Autocomplete | `autocomplete` | `input[cwAutocomplete]`, `cw-autocomplete`, `-group`, `-option` | `trigger`; `minLength` = 1; `loading`; `emptyText`; `highlight`; outs `optionSelected`, `query` | Aria Combobox |
| Command | `command` | `cw-command`, `input[cwCommandInput]`, `cw-command-list`, `-group`, `-item`, `-separator`, `-empty`, `-loading`, `-footer`, `-dialog` | `search` (model); `filter`; `loading`; `loop`; dialog `open` (model); item out `selected` | Aria Listbox; CDK virtual scroll |
| Calendar | `calendar` | `cw-calendar` | `mode`: single, range; `selected`, `month` (models); `min`, `max`, `disabled`; `weekStartsOn` = 1; `showOutsideDays`; `showWeekNumbers`; `captionLayout`; `locale` = fr | Aria Grid |
| DatePicker | `date-picker` | `cw-date-picker` | `value` (model); `mode`; `variant`: button, input; `placeholder` = Choisir une date; `format`; `presets` (the mockup's Aujourd'hui, Demain, Vendredi, Fin du sprint, Sans échéance); `clearable`; `withTime`; `open` (model) | Calendar in a Popover |

## Wave 3: dialogs and feedback

| Brick | Entry | Selectors | API | Primitive |
| --- | --- | --- | --- | --- |
| Dialog | `dialog` | `cw-dialog`, `[cwDialogTrigger]`, `cw-dialog-header`, `h2[cwDialogTitle]`, `p[cwDialogDescription]`, `cw-dialog-footer`, `button[cwDialogClose]` | `open` (model); `size`: sm, default, lg, full; `scrollable`; `showClose`; `closeOnEscape`; `closeOnOverlayClick`; `pending`; `closeLabel` = Fermer; out `closed` (escape, overlay, close, action). Full screen under 768 px | CDK Dialog and Overlay, focus trap |
| AlertDialog | `alert-dialog` | `cw-alert-dialog`, `[cwAlertDialogTrigger]`, `cw-alert-dialog-media`, `h2[cwAlertDialogTitle]`, `p[cwAlertDialogDescription]`, `button[cwAlertDialogCancel]`, `button[cwAlertDialogAction]` | `open` (model); `variant`: default, destructive; `size`: sm, default; `confirmText` (type the name to confirm); `confirmLabel`; `pending`; outs `confirm`, `cancel` | CDK Dialog (`role="alertdialog"`) |
| Toast | `toast` | `cw-toaster`; `CwToastService` | `position` = bottom-right; `expand`; `visibleToasts` = 3; `duration` per tone (6 s in the mockup); `closeButton`; `hotkey` = F8; action and undo through `action.run()` | CDK Overlay; live region |

## Wave 4: navigation and layout

| Brick | Entry | Selectors | API | Primitive |
| --- | --- | --- | --- | --- |
| Tabs | `tabs` | `cw-tabs`, `cw-tabs-list`, `button[cwTab]`, `cw-tab-panel` | `value` (model); `variant`: segmented, bar; `size`: default, sm; `orientation`; `activation`: automatic, manual; tab `count` | Aria Tabs |
| Sidebar | `sidebar` | `cw-sidebar`, `-header`, `-group`, `a[cwSidebarItem]`, `cw-sidebar-space`, `-footer`, `button[cwSidebarToggle]` | `state`: expanded, collapsed (model); `collapsible`: icon, offcanvas, none; item `icon`, `count`, `tooltip`; space `expanded` (model) | Aria Accordion for spaces |
| Breadcrumb | `breadcrumb` | `nav[cwBreadcrumb]`, `a[cwBreadcrumbLink]`, `span[cwBreadcrumbPage]`, `cw-breadcrumb-separator`, `-ellipsis` | `size`; `separator`: chevron, slash; `maxItems` = 4; `ariaLabel` = Fil d'Ariane | — |
| PageHeader | `page-header` | `cw-page-header` (+ title, favorite, description, actions, tabs parts) | `size`: default, compact; favorite `favorite` (model) | Tabs `bar` |
| Toolbar | `toolbar` | `cw-toolbar`, `-group`, `-separator`, `-spacer`, `[cwToolbarItem]`, `cw-toolbar-overflow` | `ariaLabel` (required); `size`; `overflowLabel` = Plus d'options; out `overflowChange` | Aria Toolbar; overflow `cw-menu` |
| FilterBar | `filter-bar` | `cw-filter-bar` (+ `CwFilterChip`) | `filters` (model); `fields` (required); `savedFilters`; `dirty`; `total`; outs `saveView`, `applySaved` | Aria Listbox in the field picker |
| Accordion | `accordion` | `cw-accordion`, `-item`, `button[cwAccordionTrigger]`, `cw-accordion-content` | `type`: single, multiple; `collapsible` = true; `value` (model); `variant`: default, card | Aria Accordion |
| Collapsible | `collapsible` | `cw-collapsible`, `[cwCollapsibleTrigger]`, `cw-collapsible-content` | `expanded` (model); `disabled` | `aria-expanded` + grid rows |
| Pagination | `pagination` | `cw-pagination`, `a[cwPaginationLink]`, `cw-pagination-ellipsis` | `page`, `pageSize` (models); `total` (required); `pageSizes`; `variant`: full, simple; `size`; `siblings`; `showFirstLast`; `showRange` | — |
| Stepper | `stepper` | `cw-stepper` (+ `CwStep`) | `orientation`; `size`; `selected` (model); `linear` = true; `ariaLabel` = Progression; step `label`, `description`, `optional`, `completed`, `error`, `editable` | CDK Stepper |

## Wave 5: data and composed blocks

All generic (see the boundary adaptations above); full inputs in the sheets.

| Brick | Entry | Selectors | Key API | Primitive |
| --- | --- | --- | --- | --- |
| DataTable (DataTable and DataTableComplete sheets) | `data-table` | `cw-data-table`, `cw-data-table-column`, `ng-template[cwCell]`, `ng-template[cwCellEditor]`, `cw-data-table-bulk-bar`, `cw-data-table-pagination` | `data`, `columns`, `trackBy`; `sort`, `selection`, `collapsed`, `filters`, `search`, `density`, `columnWidths`, `columnOrder`, `columnVisibility`, `page`, `pageSize` (models); `groupBy`; `editable`; `bulkActions`; `virtual`; `loading`; `error` | Aria Grid; CDK drag-drop, virtual scroll |
| Kanban | `kanban` | `cw-kanban`, `-column`, `-lane`, `-quick-add`, `ng-template[cwKanbanCard]` | `columns`, `items`; `groupBy`; `swimlaneBy`; `wipLimits`; `density`, `collapsedColumns`, `collapsedLanes`, `selection` (models); outs `moved`, `created`, `wipExceeded`, `open` | CDK drag-drop |
| CalendarView | `calendar-view` | `cw-calendar-view` | `items`; `view`: month, week (model); `date` (model); `weekStartsOn` = 1; `maxPerDay` = 2; `hours`; `slotMinutes`; outs `itemMove`, `create`, `open` | CDK drag-drop; Aria Grid |
| Timeline | `timeline` | `cw-timeline` | `items`, `dependencies`, `milestones`; `scale`: day, week, month (model); `range` (model); `groupBy`; `showDependencies` (model); outs `itemChange`, `schedule`, `dependencyCreate`, `conflict` | pointer events + ← →; CDK drag-drop on the x axis |
| Chart | `chart` | `cw-chart` | `type`: bar, line, area, donut; `data`, `x`, `series` (colors `chart-1` … `chart-5`); `stacked`; `orientation`; `legend`; `valueFormat` (fr-FR) | own SVG, no library |
| Stat | `stat` | `cw-stat`, `cw-stat-group`, `cw-stat-sparkline` | `label`, `value` (required); `delta`; `trend`; `sentiment`; `comparison`; `goal`; `size`; `loading` | — |
| PropertyList | `property-list` | `cw-property-list`, `-group`, `cw-property`, `[cwPropertyValue]` | `orientation`: vertical, inline; `labelWidth`; `readonly`; `hideEmpty`; `showEmpty` (model); property `label`, `icon`, `emptyText` = Vide, `error` | wraps projected controls |
| Relations | `relations` | `cw-relations`, `cw-relation-picker` | `relations`; `types` (given by the consumer); `search`; `readonly`; outs `add`, `remove`, `changeType`, `open` | Combobox |
| Checklist | `checklist` | `cw-checklist`, `-item`, `-add` | `title`; `variant`: checklist, subtasks; `expanded`, `hideCompleted` (models); `sortable`; item `checked`, `editing` (models), `label` | CDK drag-drop |
| TimeTracker | `time-tracker` | `cw-time-tracker`, `cw-time-entry-list`, `cw-time-entry-form` | `state`: stopped, running, paused (model); `startedAt`; `elapsed`, `total`, `estimate` (ms); `variant`: full, compact; `parseDuration`, `formatDuration` | — |
| InlineEdit | `inline-edit` | `cw-inline-edit` | `value`, `editing` (models); `multiline`; `required`; `maxLength`; `saving`; `error`; `submitOnBlur`; outs `save`, `cancel` | forms pattern |
| Dropzone | `dropzone` | `cw-dropzone` (+ `CwDropzoneFile`) | `accept`; `maxSize` = 50 MiB; `maxFiles`; `multiple`; `size`; outs `filesAdded`, `filesRejected` | hidden native file input |
| Attachment | `attachment` | `cw-attachment` | `name` (required); `type`; `fileSize`; `href`; `thumbnail`; `state`: done, uploading, processing, error; `progress`; `size`; `orientation`; `removable` | — |
| Message | `message` | `cw-message` (+ avatar, actions, note, thread, footer, group parts) | `variant`: incoming, outgoing, system; `tone`; `author`; `time`; `edited`; `status`: sent, sending, failed; `grouped` | — |
| Bubble | `bubble` | `cw-bubble`, `-group`, `-quote`, `-reactions`, `button[cwBubbleReaction]` | `variant`: default, secondary, muted, outline, ghost (muted for others, secondary for oneself); `tone`; `size`; `align` | — |
| Questionnaire | `questionnaire` | `form[cwQuestionnaire]`, `fieldset[cwQuestionnaireQuestion]`, `label[cwQuestionnaireChoice]`, and parts | `step` (model); `shortcuts`: letters, none; question `type`, `required`; choice `value`, `other`; outs `submitted`, `stepChange` | native radios and checkboxes |

## Wave 6: rich text

| Brick | Entry | Selectors | API | Primitive |
| --- | --- | --- | --- | --- |
| Markdown | `markdown` | `cw-markdown` | `source` (Markdown) | `marked` lexer, Angular template |
| Block editor | `block-editor` | `cw-block-editor` | `value` (model, Markdown) | Tiptap; Aria Toolbar |
| CommentComposer | `comment-composer` | `cw-comment-composer` | `value` (model, Markdown); `variant`: full, compact; `mode`: create, edit; `placeholder` = Écrire un commentaire…; `mentionSearch`; `commands`; `attachments` (model); `sending`; `error`; outs `submit`, `cancel`, `filesAdded` | block editor |

## `cw-block-editor`

- Engine: Tiptap, headless (`@tiptap/core` over `@tiptap/pm`). It ships no style: every style is
  Tailwind over `@cadenway/tokens`. This is the one exception to "Behavior from Angular Aria or the
  CDK" (`rules/bricks.md`): the editable surface, its schema, selection, history and input rules
  belong to the engine; the toolbar, menus and popovers around it stay on Aria and the CDK.
- Secondary entry point `@cadenway/ui/block-editor`, with its own `ng-package.json` and
  `public-api.ts`: a consumer that only displays Markdown never loads the engine. Nothing outside
  that entry point imports `@tiptap/*` or `prosemirror-*`.
- Extensions: `@tiptap/starter-kit` is the base. In Tiptap 3 it already registers Link and
  Underline: configure them through `StarterKit.configure({ link, underline })`, never add
  `@tiptap/extension-link` or `@tiptap/extension-underline` as a dependency or register them a
  second time. `@tiptap/extension-list` holds the list nodes (bullet, ordered, task),
  `@tiptap/extensions` the utilities (placeholder, character count, focus, trailing node), and
  `@tiptap/suggestion` the suggestion menus such as mentions, positioned with `@floating-ui/dom`
  (its required peer).
- Storage stays Markdown: `@tiptap/markdown` parses `value` and serializes the document back.
- The `@tiptap/*` packages pin each other to one exact version: they move together.

## `cw-markdown`

- `marked` only tokenizes (`marked.lexer`). An Angular template renders the token tree, one branch
  per token type. No `innerHTML`, no `bypassSecurityTrust*`, no `marked.parse()`: an `html` token is
  never injected into the page.
- Same grammar as the editor: `cw-markdown` owns the `marked` instance and the editor receives it
  through `Markdown.configure({ marked })`, so one parser reads everything. `@tiptap/markdown` still
  depends on an older major of `marked`, which stays installed next to ours until Tiptap moves (the
  catalog in `pnpm-workspace.yaml` states the range). Its `marked` option is typed against that
  older major: our instance works at run time but TypeScript refuses it (TS2322), so the editor
  passes it through one documented cast, in one place, removed when the two majors meet.
- Shared `__underline__` rule: CommonMark reads `__text__` as strong; Cadenway reads and writes it
  as underline, and bold is `**text**` only. The rule is one `marked` inline extension, defined once
  next to `cw-markdown` and given to the editor through `Markdown.configure({ marked })`. Out of the
  box Tiptap does the opposite on both sides (Underline writes `<u>…</u>`, Bold accepts `__`): the
  editor overrides both so that what it saves is what `cw-markdown` displays.
