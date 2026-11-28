# @cadenway/ui

## 0.13.0

### Minor Changes

- acb58bf: Align several bricks with the mockup (`App.dc.html`).
  
  - `cwButton`: each size now sets its icon size once. `xs` and `icon-xs` draw 14 px icons again; the shared 16 px declaration used to win over theirs. The other sizes keep 16 px.
  - Menu: the chosen `cwMenuItemRadio` shows the same check on the right as a `selected` `cwMenuItem`, in place of the dot in a left slot; radio items lose their `pl-8` inset, so a leading icon or dot lines up with the other items, and radio group labels no longer need `inset`. The submenu chevron is 14 px. New `cw-menu-item-value` (`CwMenuItemValue`): the current value at the end of an item (« Thème … Sombre »); on a submenu trigger the chevron follows it at the right edge instead of sharing the free space with it. Triggers without a value keep their chevron at the right.
  - `cwSidebarItem`: the current item is violet, `bg-primary/5` with `text-primary` and `font-medium`, and still shows the Fill icon; its count stays muted and regular. The icon rail's current item takes the same tint.
  - `cwPopoverTrigger`: the grey veil of an open trigger is now a fallback that yields to any state style of the host, such as the violet `aria-expanded` tint of a `cwAppRailItem`; it still covers a button's plain background.
  - `cwKbd` and `cw-shortcut`: new `size="xl"`, 24 px keys with 12 px text for the keyboard shortcuts dialog. `sm` remains the command palette footer key. The default is unchanged.
  - `cw-chart`: new `size="lg"` (192 px plot, 12 px axis text, single-series bars up to 36 px wide with 4 px corners), `current` (the `x` of the category still in progress, drawn at 45 % opacity) and `valueLabels` (`none` by default, `all`, or `peak` for the highest bars and the current one, as on the dashboards' weekly completion card). Value labels come one per category: the stack total when stacked, else the category's highest value; a category at 0 is labelled on the baseline, one without any value is not, negative values (not drawn) are never labelled, so a category whose highest value is negative or a stack with a negative part gets no label, labels stay inside the plot (edge ones slide inward), a label that would touch its left neighbour is dropped, and with `markers` the plot leaves room for the marker labels above the values. New type `CwChartValueLabels`. Other sizes keep their geometry.
  - `cw-avatar`: the presence dot overhangs the bottom right corner by 2 px and is larger (12 px on a 32 px avatar). The new `ring` input (`background` by default, `canvas`, `popover`, `card`, `sidebar`) colors its ring after the surface the avatar sits on. New type `CwAvatarRing`.

## 0.12.0

### Minor Changes

- e82cc55: Add an optional `closeOnNavigation` input to `cw-dialog`. The CDK closes a dialog on a browser Back or Forward (`popstate`); set the input to `false` for a dialog that must stay open through history navigation, such as a full-screen flow whose consumer binds `[open]` one way, or to `true` to close on navigation whatever the application configures. Left unset (the default), the CDK default and any application `DEFAULT_DIALOG_CONFIG` apply, exactly as before. The value is read when the dialog opens. A navigation close still sets `open` to false and emits `closed` with the reason `action`. `cw-sheet` and `cw-alert-dialog` keep following the CDK default and `DEFAULT_DIALOG_CONFIG`.
  
  Fix the focus after a navigation close of `cw-dialog` and `cw-sheet`: they no longer keep the trigger that opened them, so reopening one through `[(open)]` returns the focus to the element focused before it opened, not to that old trigger.
  
  Fix NG0950 in `cw-radio-group` when its items come from a `@for` and the checked item is not the first one rendered, or no item is checked. The group placed its Tab stop by reading the required `value` of every item from the template of the first item, before Angular had set the inputs of the next ones. Each item now marks when its `value` is set, through a component effect and an internal `hasValue` signal, the mechanism `CwToggleGroupItem.hasValue` already uses; until then the group leaves the item out of its Tab stop. Selection, roving tabindex and arrow keys are unchanged.

## 0.11.0

### Minor Changes

- f85d906: Add the bricks the onboarding assistant needs. All additions are opt-in; existing defaults are unchanged.
  
  - `cw-dialog`: new `size="screen"`. The panel fills the overlay container edge to edge on the canvas surface, with no border, radius, shadow, padding or backdrop, and without the scrollbar overflow of `100vw`. The body fills the height, scrolls as a focusable region and stays unpadded; with `scrollable`, the header and footer are also pinned. The consumer lays out the content. Focus trapping, Escape, the close button and `cwDialogClose` behave as at the other sizes. Changing `size` while the dialog is open, to or from `screen`, resizes the window and shows or hides the backdrop in place, without closing it. `CwDialogSize` gains `'screen'`.
  - `cw-stepper`: new `variant` input, `'default' | 'segments'`, and its `CwStepperVariant` type. `segments` draws the steps as a segmented progress bar: one bar per step with the label below. The state follows the position alone: the bars are filled up to the current step, later steps are empty and read "to do", and a step in error is red; `completed` does not change it. No step is clickable, and the stepper writes no "Step n of N" line, so the consumer writes it. The current step's description shows under the bar. The current step keeps `aria-current="step"`, every step keeps its hidden state text, and `next()` and `previous()` still announce the change. `segments` ignores `orientation` and `size`.
  - `cw-radio-group-item`: new `indicator` input, `true` by default. With `variant="card"`, `[indicator]="false"` hides the radio dot. The card then shows its selection by its fill and border alone and draws the cues the dot carried: the focus ring, the dimming without hover veil when disabled, and the destructive border when invalid. The radio stays the focused, announced control.

## 0.10.0

### Minor Changes

- 68f3a11: Add the `md` and `xl` sizes to `cw-dialog` (`CwDialogSize`). `md` is 512 px (`max-w-lg`), between `default` (448 px) and `lg` (672 px), for the Space statuses, sharing and keyboard shortcuts dialogs of the mockup `App.dc.html`. `xl` is 896 px (`max-w-4xl`), between `lg` and `full`, for its sprint report and custom fields dialogs. Existing sizes and the default are unchanged; under 768 px the window still fills the screen.

### Patch Changes

- 68f3a11: Fix NG0950 in `cw-toggle-group` when its items come from a `@for` and the item that is on is not the first one rendered. The group placed its Tab stop by reading the required `value` of every item from the host bindings of the first item, before Angular had set the inputs of the next ones. Items now report when their `value` is set (`CwToggleGroupItem.hasValue`), and until then the group treats them as off. Selection, roving tabindex and keyboard behavior are unchanged.

## 0.9.0

### Minor Changes

- 6fe94ea: Add the data bricks of the list views (workload, sheet, activity, sprint report):
  
  - `cw-data-table`: a sticky footer row of per-column aggregates, from a `footer` function on a
    column or an `ng-template[cwFooterCell]` (`CwFooterCellDef`, `CwFooterCellContext`), reached with
    the arrows; and a `rowContextMenu` input that opens a `cw-menu` on a data row with a right click, a
    long press, Shift + F10 or the Menu key, the row given as the menu's `data()`.
  - `cw-chart`: `markers` (`CwChartMarker`), vertical reference lines with a label such as « today »,
    described to screen readers; `maxSeries`, `othersLabel` and `othersColor`, which sum the series
    past the limit into one « Autres » series (`CW_CHART_OTHERS_KEY`). New `othersLabel` and `marker`
    texts in `CwChartLabels`.
  - New `@cadenway/ui/components/heat-grid`: `cw-heat-grid`, a rows × columns load grid (person × day)
    with load levels, item chips (`ng-template[cwHeatGridChip]`), a day popover, row headers with an
    avatar, a total column with a `cw-meter` (`ng-template[cwHeatGridTotal]`), grid keyboard navigation
    and `provideCwHeatGridLabels`.
  - New `@cadenway/ui/components/activity-feed`: `cw-activity-feed`, a list of activity entries with an
    actor avatar or icon, a rich-text summary, a quote, a detail template, a time, optional grouping by
    day and `provideCwActivityFeedLabels`.
  
  Existing defaults are unchanged; the new texts have French defaults, from the mockup where it has the wording.
- 0de9114: Add the planning hooks the webapp board, calendar and Gantt views need, every one additive and off by default:
  
  - `cw-kanban`: `addRequest` (`CwKanbanAddRequest`: `column`, `lane`) on « + », the footer, the empty-column button and N, with `quickAdd=false` to turn the inline quick add off; `cardMenu` and `columnMenu` take a `cw-menu` opened by a right click, Shift + F10 or the Menu key, on the item or the `CwKanbanColumn` (`data()`); the `ng-template[cwKanbanColumnMenu]` header slot (`CwKanbanColumnMenuDef`, `CwKanbanColumnMenuContext`); `loading` draws a column skeleton. New optional `loading` text.
  - `cw-calendar-view`: outside items (an undated side panel) are scheduled by dropping them on a day from a `cdkDropList` connected to `dropListIds()`, or with the keyboard through `scheduleWithKeyboard(data, label)`; both emit `itemSchedule` (`CwCalendarItemSchedule`: `data`, `date`, `allDay`). `dayMenu` takes a `cw-menu` opened on a day or slot with a `CwCalendarDayMenuData`; `loading` draws a grid skeleton. New optional `loading` and `scheduled` texts.
  - `cw-timeline`: `showDuration` adds a duration column; `ng-template[cwTimelineName]` (`CwTimelineNameDef`, `CwTimelineNameContext`) replaces the name cell content; `fit()` fits the scale and window to the dated items; `milestoneDisplay="lines"` (`CwTimelineMilestoneDisplay`) draws full-height milestone lines with a ruler marker; `showOffWindow` marks bars outside the window with a chip that brings them into view (also Enter on the row); `loading` draws a skeleton and an empty timeline shows the `empty` text. New optional `durationHeader`, `duration`, `reveal`, `fitted`, `loading` and `empty` texts.
  
  The new texts default to French, from the mockup (`App.dc.html`) where it has the wording; the label constants are now typed `Required<…>`.

## 0.8.0

### Minor Changes

- 2929a60: Add the follow-ups the webapp list view needs, every one additive:
  
  - `cw-data-table`: `groups` declares groups (`CwGroupDef`: `value`, optional `label` and `count`) with `groupBy`; they render in order before the undeclared values, even without a loaded row (and instead of the empty state), and their header reads the declared count. `nearEnd` fires in `virtual` mode when the rendered window comes within `nearEndThreshold` lines (10 by default) of the last line, once per approach. `rowMotion` selects the built-in row entrance animation. `phoneLayout="grid"` keeps a compact grid of the first data column and the `phoneColumns` under its header below 768 px (`cards` stays the default). `addRow` ends each open group with an « Ajouter une tâche » row that emits `rowAdd` with the group value; its label is the new optional `addRow` text of `provideCwDataTableTexts`. New types `CwGroupDef` and `CwDataTablePhoneLayout`.
  - `cw-tabs`: a tab or panel created by a `@for` in the same change that makes it active no longer throws NG0950; the set ignores it until its `value` is bound.
  - `cw-popover`: `size="xl"` (384 px) and `padding="none"`, which hands the inner spacing to the content (the inbox panel of the mockup). New type `CwPopoverPadding`.
  - `cw-avatar`: the `dnd` (« ne pas déranger », a bar across the dot) and `invisible` (a hollow dot) presences, read through the new optional `dnd` and `invisible` labels of `provideCwAvatarLabels`.

## 0.7.0

### Minor Changes

- ba33b3b: Add `phoneLayout` to `nav[cwAppRail]`: `tab-bar` (the default, unchanged) turns the rail into the bottom tab bar below 768 px; `column` keeps the 56 px column at every width, with its separators, groups and `desktopOnly` items, as the settings screens of the mockup do (`Compte.dc.html`, `Organisation.dc.html`); the column scrolls when it is taller than a short or landscape phone screen. The parts follow the layout through the rail's `data-phone-layout` attribute, so they also work when projected through a wrapper component; used outside a `nav[cwAppRail]`, a part no longer changes below 768 px. New type `CwAppRailPhoneLayout`.
- 5248f10: Add two opt-in inputs to `cw-sidebar` for the application shell of the mockup (`App.dc.html`). `overlayBelow="lg"` (default `md`, the phone drawer only) also floats the expanded sidebar over the content between 768 and 1023 px, with a `shadow-md`: it starts hidden there instead of showing the icon rail, closes on Escape and on a click outside it (a transparent backdrop), stays open when an item is followed, and opens again when the window grows back to a desktop width. `backdrop="container"` (default `viewport`) makes the backdrop `absolute` inside the nearest positioned ancestor instead of `fixed` over the viewport, so it leaves out the bottom tab bar of `cw-app-rail`; use it with `overlayBelow="lg"` when controls sit beside the content panel. When a floating sidebar (the phone drawer or the tablet overlay) closes with the focus inside it, however it closes, the focus now goes back to the element that opened it, or to a visible toggle outside it, instead of staying in the inert navigation. The phone and tablet media queries now use Tailwind's rem breakpoints (`48rem`, `64rem`), so the script and the classes switch together whatever the default font size. New types `CwSidebarOverlayBelow` and `CwSidebarBackdrop`.

## 0.6.0

### Minor Changes

- 6ee2f56: Add `virtual` to `cw-data-table` for long lists (the List and Sheet views): only the lines in view plus ten above and below are rendered, between spacer rows that keep the scrollbar to the full list. Rendered rows and group headers are measured on every layout and observed for later size changes; scrolling stays anchored as estimates change. Unmeasured desktop rows use 32, 36 or 44 px and group headers use 28, 32 or 36 px by density; below 48rem, unmeasured lines use the mean of measured heights of their kind. Keyboard navigation reaches the selection banner and expanded rows, while active, focused and editing rows remain rendered. The table requires a bounded height, such as a fixed height or a flex parent with `min-h-0`. Virtual rows have no entry motion, and column auto-fit measures rendered cells only.

## 0.5.0

### Minor Changes

- 2ae2174: Add the `@cadenway/ui/components/password-strength` entry point, the strength of a new password as the mockup shows it under the field (`Inscription.dc.html`, `Reinitialisation.dc.html`): `cw-password-strength` (`exportAs` `cwPasswordStrength`) draws a `cw-meter` in `segmented` with one notch per rule (its value text is the level) and the list of rules, each read as met or not; `cw-password-strength-level` (`for`) writes the level (« Trop court » to « Excellent ») in a polite live region next to the field label. `value` is the password, `minLength` (12 code points, as the identity service's policy) sets the length rule and `rules` replaces the four default rules (length, upper and lower case, a digit, a symbol, read in Unicode, built by `cwPasswordRules`). The level follows the share of rules met, whatever their number, and its `tone` (weak, fair, good) follows the level. `score`, `total`, `level`, `tone`, `empty` and `rulesId` (for the field's `aria-describedby`) are readable; the meter never validates. Texts come from `provideCwPasswordStrengthLabels` over `CW_PASSWORD_STRENGTH_LABELS`.
- d544e0c: Add the `@cadenway/ui/components/split-button` entry point, the two-part button of the task status in the mockup (`App.dc.html`): `cw-split-button` runs a quick action from its main half (out `triggered`; named by the required `label`, titled by `tooltip`, its content the visual of the current value, a → hint on hover and focus with `arrow`; with `opensMenu` it opens the menu instead) and opens the projected `cw-menu`, placed against the whole button, from its caret half, a menu button named by `menuLabel` (« Plus d’options » by default, `provideCwSplitButtonLabels` over `CW_SPLIT_BUTTON_LABELS`). The main half grows when the button is stretched. `disabled` disables and dims both halves and closes an open menu.

## 0.4.0

### Minor Changes

- b0651f2: Add the `@cadenway/ui/components/app-rail` entry point, the applications rail of the app shell (mockup `App.dc.html`): `nav[cwAppRail]` (named by `ariaLabel`), `cw-app-rail-group` (`desktopOnly`), `cw-app-rail-separator`, `cw-app-rail-footer` (pushed to the bottom) and `a` or `button[cwAppRailItem]`. An item is a 36 px icon button whose content is its label (hidden on screen, its accessible name and its tooltip, shown on the right on hover and keyboard focus; `tooltip`, `shortcut`), `current` for `aria-current="page"`, the violet tint and the filled icon (`activeIcon`, by default the Fill weight), a `badge` read after the label (`badgeLabel`), the `primary` variant of the organization switcher, and a `[cwAppRailItemMedia]` element (initials, an avatar) when it has no icon. From 768 px the rail is a 56 px column; below, a 56 px tab bar fixed at the bottom of the screen, without the separators and the `desktopOnly` groups and items.
- c2b99ac: Make every French default text of the bricks injectable, so an application can provide its own copy (for example English source text translated with `$localize`) once for the whole tree, a route or a component subtree. Each entry point that writes text exports a `Cw<Entry>Labels` type, its French defaults `CW_<ENTRY>_LABELS` and a `provideCw<Entry>Labels(labels | () => labels)` provider (`provideCwDataTableTexts` for the data table; tracker, entry form and entry list providers for the time tracker; zone and file providers for the dropzone; message, thread and tone providers for the message). Provided texts merge over those of the parent injector, then over the French defaults; a brick's text inputs and `labels` input still override them. `injectCwStatusLabels` and `injectCwPriorityLabels` return the status and priority words in effect, used by the badges and the timeline. Hard-coded texts that no input could change (toast « Annuler », attachment and avatar states, key names of shortcuts, result counts, pagination and stepper texts…) are now part of these labels. The French defaults are unchanged: an application that provides nothing renders exactly as before.
- 9bfee0d: Make the locale of every date, number and file size written by the bricks injectable with `provideCwLocale(locale | () => locale)` from `@cadenway/ui/core`, so an English application gets English months, weekdays, times, relative times, numbers and sizes once for the whole tree, a route or a component subtree. The function form runs once in an injection context, for example `provideCwLocale(() => inject(LOCALE_ID))` to follow Angular's locale. It covers the avatar initials, block editor matching, chart, checklist due dates, data table dates and sorting, filter chip dates, message times, meter, pagination, stat, time tracker and time entry list, timeline ruler and periods, attachment and dropzone sizes (« Mo » in French, « MB » elsewhere). The `locale` inputs of `cw-calendar`, `cw-calendar-view` and `cw-date-picker` default to the provided locale and still override it; the date picker's typed date and its default hint (`inputPlaceholder`) now follow the order and separators of that locale (« mm/dd/yyyy » in `en-US`), always in the Gregorian calendar with Latin digits so the shown date parses back. Without a provider the locale stays `fr-FR`: an application that provides nothing renders exactly as before. Texts (« sur », « depuis », « du … au ») are not part of the locale.
- 9fc1441: Add the `lockup` variant to `cw-logo`: the mark followed by the « Cadenway » wordmark (bold, `-0.035em` tracking, in the ink color), as in the mockup's sign-in header. The wordmark and the gap scale with `size` (16 px and 8 px next to a 24 px mark). The lockup is one image named « Cadenway », hidden as a whole with `decorative`. `variant` still defaults to `mark`.
- efecf22: Add the `@cadenway/ui/components/sheet` entry point: `cw-sheet`, a panel docked to an edge of the screen above a backdrop (Sheet sheet), with `[cwSheetTrigger]`, `cw-sheet-header`, `h2[cwSheetTitle]`, `p[cwSheetDescription]`, `cw-sheet-body`, `cw-sheet-footer` and `button[cwSheetClose]`; `side` right (`animate-sheet-in`), left, top or bottom (`animate-drawer-in`), `size` sm, default, lg or full, `showClose`, `closeOnEscape`, `closeOnOverlayClick`, `closeLabel`, a two-way `open` and a `closed` output carrying the reason. Built on CDK Dialog like `cw-dialog`: focus trap, scroll block, focus returned to the trigger. Its close label is French by default and replaced with `provideCwSheetLabels`, like the other bricks.
  
  Add `provideCwPhoneSheets` to `@cadenway/ui/core`: an application that provides it gets, below 768 px, the panels of `cw-menu`, `cw-popover`, `cw-select` and `cw-combobox` docked above the bottom tab bar, full width between 8 px gutters (mockup `App.dc.html`). Opt-in: without the provider every brick behaves as before.

## 0.3.1

### Patch Changes

- fc97fac: Share the Markdown grammar between the renderer and Block Editor through UI core. The Markdown entry point continues to re-export the existing compatibility symbols.

## 0.3.0

### Minor Changes

- 1f32819: Allow consumers to format message and thread timestamps while keeping the existing French display by default.
- 1f32819: Add the `@cadenway/ui/components/accordion` entry point: `cw-accordion` (`type` single or multiple, `collapsible`, `[(value)]`, `variant` default or card), `cw-accordion-item` (`value`, `disabled`; wraps its trigger in an `h3`), `button[cwAccordionTrigger]` (chevron, ripple, `aria-expanded`, `aria-controls`; ↓ ↑ Home End between triggers through the CDK `FocusKeyManager`) and `cw-accordion-content` (a `region` named by its trigger, grid rows animation, `inert` when closed).
- 1f32819: Add `@cadenway/ui/components/alert-dialog`: `cw-alert-dialog` (`role="alertdialog"`) with its trigger, media, title, description, cancel and action buttons; `default` and `destructive` variants, `sm` and `default` sizes, the typed confirmation of `confirmText` (« Pour confirmer, saisissez … »), the list of the items concerned (eight, then « + n autres »), `pending`, and `confirm` and `cancel` outputs. The focus starts on « Annuler »; a backdrop click never closes it.
- 1f32819: Add `@cadenway/ui/components/alert`: `cw-alert` with its title, description and actions; four tones (info, success, warning, destructive), a compact size, and dismissal by button or Escape.
- 1f32819: Add the `@cadenway/ui/components/attachment` entry point: `cw-attachment` (image, PDF, file and link types
  detected from the MIME type or the name, thumbnail, French sizes, done, uploading, processing and
  error states, card, compact chip and vertical thumbnail, download or open, retry, cancel and
  « Retirer »).
- 1f32819: Add `@cadenway/ui/components/autocomplete`: `input[cwAutocomplete]` (`CwAutocompleteTrigger`) with `cw-autocomplete`, `cw-autocomplete-group` and `cw-autocomplete-option`; suggestions while typing that keep the free text, a `trigger` character for mentions, `minLength`, `loading`, the typed part in bold, and the field's native value accessor.
- 1f32819: Add the `@cadenway/ui/components/avatar` entry point: `cw-avatar` (photo, initials or fallback icon, presence
  dot, deactivated state, hidden name), `cw-avatar-group` (stack with « +N » beyond `max`) and
  `button[cwAvatarAdd]` (« Non assigné »).
- 1f32819: Add `@cadenway/ui/components/badge`: `CwBadge` on `span`, `a` or `button` (six variants, two sizes), and the
  `cw-status-badge` and `cw-priority-badge` compositions built on the status and priority icons.
- 1f32819: Add `@cadenway/ui/components/banner`: `cw-banner` and `cw-banner-actions`; five tones, inline and top placements, and a dismissal remembered in `localStorage` through `dismissKey`.
- 1f32819: Add the `@cadenway/ui/components/block-editor` entry point: `cw-block-editor`, rich text editing stored as
  Markdown (`[(value)]`, Signal Forms and value accessor) on headless Tiptap, with the formatting
  toolbar of the mockup, the « / » block menu (ten block types), « @ » mentions, a link panel,
  Ctrl + B, I, U, E, K and Ctrl + Entrée. It reads and writes the grammar of `cw-markdown`. Only this
  entry point (and the comment composer built on it) loads the editor engine.
- 1f32819: Add the `@cadenway/ui/components/breadcrumb` entry point: `nav[cwBreadcrumb]` (`size` `default` or `sm`, `separator` `chevron` or `slash`, `maxItems` = 4, `ariaLabel` = Fil d'Ariane, `ellipsisLabel` = Niveaux masqués), `a[cwBreadcrumbLink]` (and `button[cwBreadcrumbLink]` for a level with a menu), `span[cwBreadcrumbPage]` (`aria-current="page"`, truncated past 192 px with a tooltip), `cw-breadcrumb-separator` and `cw-breadcrumb-ellipsis`. The levels are written flat and laid out as an ordered list; past `maxItems` the middle levels fold into « … », which opens a `cw-menu` of the hidden levels.
- 1f32819: Add the `@cadenway/ui/components/bubble` entry point: `cw-bubble` (five variants, four tones, two sizes,
  `start` and `end`), `cw-bubble-group` (tightened corners), `cw-bubble-quote`, `cw-bubble-reactions`,
  `button[cwBubbleReaction]` and the `CW_BUBBLE_DEFAULTS` token a container uses to give its bubbles a
  variant, a side and a position.
- 1f32819: Add the `@cadenway/ui/components/button-group` entry point: `cw-button-group` (welded buttons, horizontal or
  vertical, nested groups), `cw-button-group-separator` and `cw-button-group-text`.
- 1f32819: Add `@cadenway/ui/components/calendar-view`: `cw-calendar-view`, a generic calendar (`items` of any type, `trackBy`, `itemLabel`, `itemSpan`) with the item content given by `ng-template[cwCalendarItem]` (`CwCalendarItemDef`). Month view (six weeks from Monday, `maxPerDay` lines then « +n autres » and the day popover, bars across days) and week view (all-day row, `hours` in `slotMinutes` slots, blocks as tall as their duration, current time line); `showWeekends`; today marker; drag to reschedule with the CDK (`itemMove`, duration kept); `create` from « + », a double click on a slot or N; `open`; « Sans date » (`unscheduledOpen`); grid keyboard navigation (arrows, Home, End, Page Up, Page Down, T, M, S, N) and keyboard move announced through the CDK `LiveAnnouncer`; `readonly`.
- 1f32819: Add `@cadenway/ui/components/calendar`: `cw-calendar`, the month calendar with the week on Monday, single day or range selection (`[(selected)]`, `[(month)]`), `min`, `max` and `disabledDates`, ISO week numbers, month and year lists, French names from `Intl.DateTimeFormat`, grid keyboard (arrows, Home, End, Page Up and Down), Signal Forms and value accessor support.
- 1f32819: Add the `@cadenway/ui/components/card` entry point: `cw-card` (sizes `default`, `sm`; `interactive`; `selected`) and its parts `cw-card-header`, `-title`, `-description`, `-action`, `-content`, `-footer`. The task card is built by the web application on top of it.
- 1f32819: Add `@cadenway/ui/components/chart`: `cw-chart`, dashboard charts drawn in SVG without a library (grouped and stacked bars, horizontal bars on a capacity track, lines, areas with a dashed reference, ring) in the `chart-1` … `chart-5` colors, with a toggling legend, French number format, keyboard category navigation with a polite announcement, a hidden data table, and loading and empty states.
- 1f32819: Add `@cadenway/ui/components/checklist`: `cw-checklist`, `cw-checklist-item`, `cw-checklist-add` and `[cwChecklistItemMenu]`. A collapsible checklist with its « 3 / 9 » count and progress bar, items to tick (`[(checked)]`), to edit in place (click or F2, Enter, Escape, Tab nests), one level of sub-items, inline addition that stays open after Enter, « Masquer les éléments terminés » (`[(hideCompleted)]`), reordering by CDK drag-drop and from the keyboard (Space, arrows, announced), a default menu (Modifier, Ajouter un sous-élément, Convertir en tâche, Supprimer) and a `subtasks` variant whose status control is a consumer slot. The consumer owns the data: `itemAdd`, `itemMove`, `itemConvert`, `itemRemove`, `labelChange`.
- 1f32819: Add `@cadenway/ui/components/code-block`: `cw-code-block`, plain-text code with line numbers, highlighted lines, a diff mode and a copy button (CDK Clipboard) that turns into « Copié ».
- 1f32819: Add the `@cadenway/ui/components/collapsible` entry point: `cw-collapsible` (`[(expanded)]`, `disabled`, exported as `cwCollapsible`), the `[cwCollapsibleTrigger]` directive (`bare` on a `cwButton`, or the 36 px `row` of the List view; `aria-expanded`, `aria-controls`, `aria-disabled`), `cw-collapsible-content` (grid rows 0fr to 1fr with a fade, 300 ms `ease-snap`, `inert` when closed) and `cw-collapsible-chevron` (`down` turning 180°, `right` turning 90°). Every part carries `data-state="open|closed"`.
- 1f32819: Add `@cadenway/ui/components/combobox`: `cw-combobox` with `cw-combobox-group`, `cw-combobox-option` and `cw-combobox-empty`; a searchable single or `multiple` choice with accent-insensitive filtering on text and keywords, `creatable`, `loading`, a custom `filter`, announced result counts, and `[(value)]`, `[(open)]`, Signal Forms and `ControlValueAccessor` support.
- 1f32819: Add `@cadenway/ui/components/command`: `cw-command` and its parts (`input[cwCommandInput]`, list, group, item, separator, empty, loading, footer, match highlight) with a fuzzy filter by default, and `cw-command-dialog`, the `Ctrl K` palette in a CDK dialog.
- 1f32819: Add the `@cadenway/ui/components/comment-composer` entry point: `cw-comment-composer`, the comment editor of a
  task on `cw-block-editor` (full and compact variants, create and edit modes, « @ » mentions through
  `mentionSearch`, « / » commands, attachments as compact `cw-attachment`, send with Ctrl + Entrée,
  sending, error with Réessayer and disabled states).
- 1f32819: Add the `@cadenway/ui/components/context-menu` entry point: `[cwContextMenuTriggerFor]` opens a `cw-menu` from `@cadenway/ui/components/menu` at the pointer on a right click or a 500 ms long press, and on the focused element with Shift + F10 or the Menu key (`cwContextMenuData`, `cwContextMenuDisabled`; outputs `opened`, `closed`; `data-state="open|closed"` on the element). Editable fields keep the browser's menu.
- 1f32819: Add the `@cadenway/ui/core` entry point: the `CwRipple` press ripple and the `CwSwap` label
  animation shared by the bricks. Each brick ships as its own entry point (`@cadenway/ui/components/<brick>`).
- 1f32819: Add the `@cadenway/ui/components/data-table` entry point: `cw-data-table`, a grid of generic rows (`data`, `columns` or `cw-data-table-column` children with `ng-template[cwCell]` and `ng-template[cwCellEditor]`, `trackBy`) with multi-column sorting (`[(sort)]`, Shift + click), selection (`[(selection)]`, header checkbox with the mixed state, Shift ranges, `'all'` beyond the page), collapsible groups (`groupBy`, `groupOrder`, `[(collapsed)]`, `ng-template[cwDataTableGroup]`), three densities, skeleton rows, empty (`[cwDataTableEmpty]`) and error states, a single-tab-stop keyboard grid (arrows, Home / End, Page keys, Space, Enter, F2, Escape), inline editors (`cellEdit`), the selection bar `cw-data-table-bulk-bar` driven by the consumer's `bulkActions` (`bulkAction`), resizable, reorderable and hideable columns (`[(columnWidths)]`, `[(columnOrder)]`, `[(columnVisibility)]`), the `cw-data-table-pagination` footer built on `cw-pagination`, and cards under 768 px. Its French texts are `CW_DATA_TABLE_TEXTS`, overridable through `texts`.
- 1f32819: Add `@cadenway/ui/components/date-picker`: `cw-date-picker`, a button or a typed « jj/mm/aaaa » field that opens `cw-calendar` in a CDK overlay, with presets, « Effacer », an optional time, single or range mode, `[(value)]` and `[(open)]`, Signal Forms and value accessor support.
- 1f32819: Add `@cadenway/ui/components/dialog`: `cw-dialog` with `[cwDialogTrigger]`, its header, title, description, footer and `button[cwDialogClose]`; four sizes (sm, default, lg, full, full screen under 768 px), a scrollable body, `pending`, a two-way `open` and a `closed` output carrying the reason (escape, overlay, close, action). Built on CDK Dialog: focus trap, scroll block, focus returned to the trigger; Escape closes a popup open inside it first.
- 1f32819: Add the `@cadenway/ui/components/dropzone` entry point: `cw-dropzone` (drop, « parcourez » through a hidden
  native file input, paste; `accept`, `maxSize` and `maxFiles` checks with `filesAdded` and
  `filesRejected` reasons; drag-over and reject states; `default` and `compact`) and
  `cw-dropzone-file` (an upload row: queued, uploading with progress, done, error; cancel, retry,
  remove).
- 1f32819: Add the `@cadenway/ui/components/empty` entry point: `cw-empty` (variants `default`, `outline`; sizes `default`, `sm`) and its parts `cw-empty-header`, `-media` (with a `destructive` tone for loading errors), `-title`, `-description`, `-content`.
- 1f32819: Add `@cadenway/ui/components/field`: field sets, legends, groups, fields (vertical and horizontal) with
  labels, choice cards, titles, descriptions, errors and separators. A field wires `id`, `for`,
  `aria-labelledby` and `aria-describedby` to its control and deduces its invalid and disabled
  states from the bound form control.
- 1f32819: Add the `@cadenway/ui/components/filter-bar` entry point: `cw-filter-bar` (`[(filters)]`, `fields` required, `savedFilters`, `dirty`, `total`, `labels`; outputs `saveView`, `applySaved`, `saveFilter`, `manageSaved`) and `cw-filter-chip` (`[(filter)]`, `field`, `labels`; output `removed`), with `ng-template[cwFilterValue]` and `ng-template[cwFilterOption]`, the types `CwFilter`, `CwFilterField`, `CwFilterOperator`, `CwFilterOption`, `CwFilterValue`, `CwSavedFilter`, `CwFilterBarLabels` and the default French texts `CW_FILTER_BAR_LABELS`. Fields, operators and values are given by the consumer; operators and ticked values are edited in `cw-menu` menus, dates in a `cw-calendar` popover, texts in a popover field.
- 1f32819: Add `@cadenway/ui/components/inline-edit`: `cw-inline-edit`, a text that turns into a field at the same place and size (title, list name, short description). Reading, hover, keyboard focus, editing (text selected, « Entrée pour valider · Échap pour annuler »), saving (spinner, « Enregistrement… », `aria-busy`), error (the field reopens with the typed text), empty (placeholder) and read-only states; `multiline` validates with Ctrl + Enter; `[(value)]`, `[(editing)]`, `save` and `cancel`; a Signal Forms value control and a `ControlValueAccessor`.
- 1f32819: Add `@cadenway/ui/components/input-group`: a field and its addons in one border (inline and block addons,
  text, Button-based buttons, sizes `sm`, `default`, `lg`), focus halo, error and disabled states on
  the group.
- 1f32819: Add the `@cadenway/ui/components/input-otp` entry point: `cw-input-otp`, its groups, slots and separator. One
  native `autocomplete="one-time-code"` input carries the code (typing, paste, autofill), digits or
  alphanumeric, `[(value)]`, the `complete` output, Signal Forms and Reactive or template-driven forms.
- 1f32819: Add `@cadenway/ui/components/input`: `input[cwInput]` (sizes `sm`, `default`, `lg`; read-only, disabled and
  invalid states) on the native value accessor, with `aria-invalid` from the bound form control.
- 1f32819: Add the `@cadenway/ui/components/item` entry point: `cw-item`, `a[cwItem]` and `button[cwItem]` (variants `default`, `outline`, `muted`; sizes `default`, `sm`, `xs`; `[(selected)]`, `disabled`, `unread`), their parts, and `cw-item-group` with one tab stop and arrow navigation (CDK `FocusKeyManager`), selectable as a multi-selection listbox.
- 1f32819: Add `@cadenway/ui/components/kanban`: `cw-kanban`, a generic board (`columns`, `items` of any type, `trackBy`, `groupBy`, `itemLabel`, optional `lanes` and `swimlaneBy`) with the card content given by `ng-template[cwKanbanCard]` (`CwKanbanCardDef`), the empty-column text by `ng-template[cwKanbanEmpty]` and the lane marker by `ng-template[cwKanbanLaneMarker]`. CDK drag-drop between columns and swimlanes with a full-ink line or a dashed ghost as drop indicator and a lifted `rotate-1 shadow-lg` preview; work-in-progress limits (« 3/2 », « Limite de 2 dépassée », `wipExceeded`); foldable columns and swimlanes; the quick add (`created`, Enter keeps it open); `detailed` and `compact` densities; selection with Ctrl; keyboard move (Space, arrows, Space, Escape) announced through the CDK `LiveAnnouncer`; `moved` and `open` outputs; `readonly`.
- 1f32819: Add the `@cadenway/ui/components/kbd` entry point: `kbd[cwKbd]` (sizes `sm`, `default`, `lg`; variants `default`, `inverse`), `kbd[cwKbdGroup]` for a combination, and `cw-shortcut`, which writes a shortcut from its keys (`mod+K`, `g i`) for the platform with a spelled-out text for assistive technologies and an `ariaKeyShortcuts()` value.
- 1f32819: Add the `@cadenway/ui/components/label` entry point: `label[cwLabel]`, the visible name of a control, dimmed next to a disabled peer control or in a disabled field.
- 1f32819: Add the `@cadenway/ui/components/logo` entry point: `cw-logo`, the Cadenway mark in the brand violet or the ink color, switching to its small drawing under 32 px. The horizontal and stacked lockups come once their logotype is redrawn.
- 1f32819: Add the `@cadenway/ui/components/markdown` entry point: `cw-markdown` renders stored Markdown with Angular
  templates over the `marked` lexer (headings, paragraphs and breaks, bold, italic, `__underline__`,
  strike, inline code, safe links, bullet, numbered and task lists, quotes, code blocks through
  `cw-code-block`, separators, tables, `@[name](id)` mentions); HTML in the source is shown as text,
  never injected. It owns the Markdown grammar shared with the block editor.
- 1f32819: Add the `@cadenway/ui/components/menu` entry point: `cw-menu` (`side`, `align`, `ariaLabel`, `inline`; output `closed`; `data()` of the trigger that opened it), `[cwMenuTriggerFor]` on a button or on a menu item (submenus), `button[cwMenuItem]` (`variant` `default` or `destructive`, `inset`, `selected`, `disabled`; output `triggered`), `button[cwMenuItemCheckbox]` (`[(checked)]`), `cw-menu-radio-group` (`[(value)]`) with `button[cwMenuItemRadio]`, `cw-menu-group`, `cw-menu-label`, `cw-menu-separator` and `cw-menu-shortcut`. The panel opens in a CDK overlay from the trigger's corner, one menu at a time, with arrow, Home, End, typeahead, →/← submenu, Escape and Tab keys, and closes on an outside click.
- 1f32819: Add the `@cadenway/ui/components/message` entry point: `cw-message` (incoming, outgoing and system notices;
  author, relative French time, « modifié », sending and failed states with Réessayer, state notes
  with tones, action bar on hover) with `cw-message-avatar`, `cw-message-actions`, `cw-message-note`,
  `cw-message-thread`, `cw-message-footer` and `cw-message-group` (consecutive messages grouped).
- 1f32819: Add `@cadenway/ui/components/meter`: `cw-meter`, a `role="meter"` gauge with zones (normal, high at 80 %, critical at 95 %, optimum), a capacity threshold with its overrun, `bar`, `segmented` and `stacked` forms, a note, and loading and unmeasured states.
- 1f32819: Add the `@cadenway/ui/components/page-header` entry point: `cw-page-header` (`size` `default` or `compact`) with its parts `cw-page-header-title` (the page's `h1`), `cw-page-header-favorite` (`[(favorite)]`, `ariaLabel` « Favori », `aria-pressed`), `cw-page-header-description`, `cw-page-header-actions` and `cw-page-header-tabs`, which renders the projected `cw-tabs` in the `bar` variant with the « + Vue » area after it. Without tabs the default header draws its own bottom rule; the compact header puts everything on one 44 px row.
- 1f32819: Add the `@cadenway/ui/components/pagination` entry point: `cw-pagination` (`[(page)]`, `[(pageSize)]`, `total`, `pageSizes` = 10, 25, 50, 100 through `cw-select`, `variant` `full` or `simple`, `size` `default` or `sm`, `siblings`, `showFirstLast`, `showRange`, `ariaLabel`, `labels`), with `a[cwPaginationLink]` / `button[cwPaginationLink]` and `cw-pagination-ellipsis` for a routed pagination built by hand. Page changes are announced (« Page 6 sur 12 ») and a new page size goes back to page 1.
- 1f32819: Add the `@cadenway/ui/components/popover` entry point: `cw-popover` (`open` model, `side`, `align`, `sideOffset`, `arrow`, `modal`, `closeOnOutsideClick`, `size`: `sm`, `default`, `lg`, `ariaLabel`, `ariaLabelledby`), `[cwPopoverTrigger]`, `cw-popover-arrow` and `button[cwPopoverClose]`. The panel is a non-modal `role="dialog"` in a CDK overlay, flipped and shifted to stay on screen, revealed from the trigger corner; the focus moves into it on opening, and it closes on Escape, outside click, a new click of the trigger, a close button or when the focus tabs out, the focus returning to the trigger.
- 1f32819: Add `@cadenway/ui/components/priority-icon`: `cw-priority-icon`, the animated bars of the four task priorities
  (`CwPriorityKey`, French words in `CW_PRIORITY_LABELS`), with the `from` morph on mount and four
  sizes.
- 1f32819: Add `@cadenway/ui/components/progress`: `cw-progress`, a `role="progressbar"` bar with three variants (default, success, destructive), three sizes, and an indeterminate state.
- 1f32819: Add `@cadenway/ui/components/property-list`: `cw-property-list`, `cw-property-group`, `cw-property` and `[cwPropertyValue]`, the label / value rows of an item whose values edit in place through the projected `cw-select`, `cw-combobox`, `cw-date-picker` or `cw-inline-edit`. `vertical` rows (label column of `labelWidth`) or `inline` chips; « Vide » for an empty value, `hideEmpty` folds the empty rows behind « Champs vides N » (`[(showEmpty)]`), « Ajouter un champ » (`canAddField`, `addField`); read-only values with a lock, an `error` message linked to the control; each value named « label value ».
- 1f32819: Add the `@cadenway/ui/components/questionnaire` entry point: `form[cwQuestionnaire]` (one question per step,
  letter shortcuts, Enter to go on, required errors, `submitted` answers and a confirmation screen),
  `fieldset[cwQuestionnaireQuestion]` (single or multiple, value accessor and Signal Forms control),
  `label[cwQuestionnaireChoice]` (with « Autre » and its field), `legend[cwQuestionnaireTitle]`,
  `cw-questionnaire-description`, `cw-questionnaire-progress`, `cw-questionnaire-actions` and
  `cw-questionnaire-done`.
- 1f32819: Add `@cadenway/ui/components/radio-group`: `cw-radio-group` and `cw-radio-group-item` (vertical or
  horizontal, roving focus with wrapping arrows, `card` choice-card variant) for Signal Forms,
  Reactive Forms and `ngModel`.
- 1f32819: Add the first bricks: `@cadenway/ui/components/button` (six variants, eight sizes, loading, ripple),
  `@cadenway/ui/components/spinner` (ring, delayed indicator, loading overlay) and `@cadenway/ui/components/checkbox`
  (checked, indeterminate; Signal Forms and Reactive Forms).
- 1f32819: Add `@cadenway/ui/components/relations`: `cw-relations`, `cw-relation-picker` and `ng-template[cwRelationLeading]`. The relations of an item grouped by the consumer's relation types (in their order, empty groups hidden), each row with the consumer's glyph, the reference, the title as a link (the whole row clickable, `open`), the path of an item that lives elsewhere, a written warning (« Non terminée ») and the assignee; a row menu (Ouvrir la tâche, Changer le type, Copier le lien, Retirer la relation), Delete and Shift + F10 on the title; « Aucune relation. » when empty. « Ajouter » opens the picker in a popover: the type in a `cw-select`, then a search in a `cw-combobox` whose results come from the consumer (`search`, `results`, `loading`), an item already related disabled with « Déjà liée »; `add`, `remove`, `changeType`.
- 1f32819: Add `@cadenway/ui/components/select`: `cw-select` with `cw-select-group`, `cw-select-option`, `cw-select-separator` and `cw-select-empty`; a single-choice list in a CDK overlay with `aria-activedescendant` navigation, typeahead, the chosen option copied into the trigger through `CwSwap`, three sizes, and `[(value)]`, `[(open)]`, Signal Forms and `ControlValueAccessor` support.
- 1f32819: Add the `@cadenway/ui/components/separator` entry point: `cw-separator`, a 1 px line, horizontal or vertical, decorative by default, with an optional centered label.
- 1f32819: Add the `@cadenway/ui/components/sidebar` entry point: `cw-sidebar` (`[(state)]` expanded or collapsed, `collapsible` icon, offcanvas or none, Ctrl B, an off-canvas drawer with a backdrop under 768 px), `cw-sidebar-header`, `cw-sidebar-group` (`label`, `cwSidebarGroupAction` slot), `a[cwSidebarItem]` (`icon` Bold then Fill when `active`, `count`, `countLabel`, `tooltip` in the icon rail through `[cwTooltip]`, `aria-current="page"`), `cw-sidebar-space` (`name`, `icon` or initial, `color` from the space palette, `count`, `[(expanded)]`, → and ←, `cwSidebarSpaceAction` slot), `cw-sidebar-footer` and `button[cwSidebarToggle]`.
- 1f32819: Add the `@cadenway/ui/components/skeleton` entry point: `div[cwSkeleton]`, a loading shape with the `pulse`, `shimmer` or `none` animation, still under reduced motion.
- 1f32819: Add `@cadenway/ui/components/stat`: `cw-stat`, a dashboard figure with its change colored by its meaning (never its sign), the direction in visually hidden text, a period comparison, an optional goal track and shimmer loading or refresh spinner; `cw-stat-group` for a row of stats in one card and `cw-stat-sparkline` for an 80 × 28 px line or bar mini chart.
- 1f32819: Add `@cadenway/ui/components/status-icon`: `cw-status-icon`, the animated icon of the ten task statuses
  (`CwStatusKey`, French words in `CW_STATUS_LABELS`), with the `from` morph on mount, the milestone
  diamond and four sizes.
- 1f32819: Add the `@cadenway/ui/components/stepper` entry point: `cw-stepper` (`orientation` `horizontal` or `vertical`, `size` `default` or `sm`, `[(selected)]`, `linear` = true, `ariaLabel` = Progression, `labels`; methods `next()`, `previous()`, `reset()`) and `cw-step` (`label`, `description`, `optional`, `completed`, `error`, `editable`; its content is the panel of the current step). Done steps are buttons, steps to come plain text; ← → (↑ ↓ vertical), Home and End move between reachable steps; a change moves the focus to the new panel and is announced (« Étape 3 sur 5 : Équipe »).
- 1f32819: Add `@cadenway/ui/components/switch`: `cw-switch` (sizes `default`, `sm`; checked model) for Signal Forms,
  Reactive Forms and `ngModel`.
- 1f32819: Add `@cadenway/ui/components/table`: directives on the native table elements (`table[cwTable]`, `thead[cwTableHeader]`, `tbody[cwTableBody]`, `tfoot[cwTableFooter]`, `tr[cwTableRow]`, `th[cwTableHead]`, `td[cwTableCell]`, `td[cwTableEmpty]`, `caption[cwTableCaption]`) and `cw-table-container`.
- 1f32819: Add the `@cadenway/ui/components/tabs` entry point: `cw-tabs` (`[(value)]`, `variant` `segmented` or `bar`, `size` `default` or `sm`, `orientation` `horizontal` or `vertical` with `bar`, `activation` `automatic` or `manual`), `cw-tabs-list` (`ariaLabel`), `button[cwTab]` and `a[cwTab]` (`value`, `disabled`, `count`, `active` for router links; `exportAs: 'cwTab'` with `isActive()`), `cw-tab-panel` (`value`) and `provideCwTabs({ variant, size })`. One Tab stop with arrow, Home and End keys that wrap and skip disabled tabs; one indicator slides to the active tab (off under reduced motion). Buttons make a `tablist` with linked `tabpanel`s; links make a `navigation` whose active link is `aria-current="page"`.
- 1f32819: Add `@cadenway/ui/components/textarea`: `textarea[cwTextarea]`, growing with its content between 64 and
  240 px (`autoResize`), on the native value accessor, with `aria-invalid` from the bound form
  control.
- 1f32819: Add `@cadenway/ui/components/time-tracker`: `cw-time-tracker` (timer stopped, running and paused with `[(state)]`, a live `h:mm:ss` duration, `start`, `pause`, `resume` and `stop` rounded to the minute; the total against the estimate through `cw-meter`, the excess written « +33 min »; the billable line; a `compact` chip), `cw-time-entry-list` (entries with person, date, note, billable, duration, a running entry, totals, edit, duplicate and remove) and `cw-time-entry-form` (shortcuts « + 15 min » … « + 2 h », a duration read as typed, date, note, billable; opened from « Ajouter du temps »). `parseDuration` reads « 1 h 30 », « 1:30 », « 90 min », « 1,5 h » (a bare number in minutes, or hours for an estimate) and `formatDuration` writes « 1 h 30 », « 48 min » or `h:mm:ss`.
- 1f32819: Add `@cadenway/ui/components/timeline`: `cw-timeline`, a generic Gantt tree grid with a name column, day, week and month scales and an eight-step zoom (Ctrl + wheel, Ctrl + / −), bars moved and resized by pointer and by the arrows, finish-to-start dependency arrows with conflicts, milestones, today line, weekends, collapsible groups, selection and « Planifier » for undated items; `CwTimelineBarDef` and `CwTimelineToolbar`.
- 1f32819: Add `@cadenway/ui/components/toast`: `cw-toaster` and `CwToastService` (`show`, `success`, `info`, `warning`, `error`, `loading`, `promise`, `update`, `dismiss`); a title, a description, one action or `undo` (« Annuler »), 6 s by default (errors and running operations stay), durations paused on hover and focus, a folded stack that unfolds on hover or F8, swipe to dismiss, `role="status"` or `role="alert"` for errors.
- 1f32819: Add the `@cadenway/ui/components/toggle-group` entry point: `cw-toggle-group` and `button[cwToggleGroupItem]`,
  single (radio group) or multiple choice, welded or spaced, horizontal or vertical, with a roving
  tabindex, `[(value)]`, Signal Forms (`[formField]`) and Reactive or template-driven forms.
- 1f32819: Add the `@cadenway/ui/components/toggle` entry point: `button[cwToggle]`, a two-state button with
  `[(pressed)]`, `aria-pressed`, the `default` and `outline` variants, three sizes and the press ripple.
- 1f32819: Add the `@cadenway/ui/components/toolbar` entry point: `cw-toolbar` (`ariaLabel` required, `size` `default` or `sm`, `overflowLabel` « Plus d’options »; output `overflowChange`), `cw-toolbar-group`, `cw-toolbar-separator`, `cw-toolbar-spacer`, `[cwToolbarItem]` (`overflowLabel`, `overflowIcon`, `pinned`) and `cw-toolbar-overflow`. The `[cwToolbarItem]` controls share one Tab stop with ← → (in a loop), Home and End navigation; when the width runs short, the non-pinned ones move from the last into a « Plus » `cw-menu`.
- 1f32819: Add the `@cadenway/ui/components/tooltip` entry point: the `[cwTooltip]` directive (text or template, `cwTooltipShortcut` keys drawn with the inverse `kbd[cwKbd]`, `cwTooltipSide`, `cwTooltipAlign`, `cwTooltipArrow`, `cwTooltipOpenDelay`, `cwTooltipDisabled`) and `provideCwTooltip({ openDelay, skipDelay })`. The bubble is a `role="tooltip"` in a CDK overlay, referenced by the host's `aria-describedby` while open; it opens after 700 ms of hover, at once on keyboard focus and within the 300 ms skip window, stays open while hovered, closes on leave, blur, press and Escape, one at a time.

### Patch Changes

- 1f32819: Use an internal provider token to avoid a circular import between avatars and their group.
- 1f32819: Wait for pagination label animations before checking story accessibility.
- 1f32819: Reuse shared date and text normalization utilities and keep command search highlights aligned with accented and emoji text.
- 1f32819: Wait for both spinner labels before checking the Storybook interaction.
- 1f32819: Style priority and status icon morphs with Tailwind utilities while preserving their motion and reduced-motion behavior.
- 1f32819: Propagate touched and disabled states consistently from the time entry form to Angular forms.
- 1f32819: Use the timer handle type supplied by the active runtime declarations in the time tracker.
- 1f32819: Cover timeline date boundaries and keyboard activation of editor and combobox options.
- 1f32819: Document UI declarations and make their types and class member accessibility explicit throughout the package.
- 1f32819: Organize the shared Angular forms compatibility test with the package integration tests.
- 1f32819: Improve keyboard handling of listbox options and remove inline lint suppressions from UI components.

## 0.2.0

### Minor Changes

- c1141b2: Declare the third-party dependencies the bricks are built on. `@cadenway/ui` now requires `@angular/cdk`, `@angular/aria`, `@angular/forms` and `@ng-icons/core` as peer dependencies, and depends on Tiptap (`@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-list`, `@tiptap/extensions`, `@tiptap/suggestion`, `@tiptap/markdown`), `@floating-ui/dom` and `marked` for the future `cw-block-editor` and `cw-markdown` bricks. `@cadenway/icons` depends on `@ng-icons/svgl` and `@ng-icons/flag-icons` for logos and flags. `@cadenway/tokens` takes the Inter and Geist Mono variable fonts from Fontsource as development dependencies; what it publishes is unchanged.

## 0.1.0

### Minor Changes

- 85a4d03: Bootstrap the three packages: `@cadenway/tokens` ships the structure of `tokens.css` and `theme.css` without values yet, `@cadenway/icons` exports `provideCadenwayIcons()`, and `@cadenway/ui` is an Angular library whose public API is still empty.
