/*
 * The three keyboard focus styles of Cadenway, always on `focus-visible`, solid amethyst (artifact
 * README, "États d'interaction"). Shared across the entry points of `@cadenway/ui`; not public API
 * (`ɵ` prefix). Literal strings, so Tailwind finds the classes in the compiled bricks.
 */

/** Standalone controls: buttons, toggles, links, chips, checkboxes, switches, clickable avatars. */
export const ɵFOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Full-width items in a container: list and table rows, sidebar items, segmented tabs. */
export const ɵFOCUS_INSET =
  'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';

/** Fields: Input, Textarea, Select, Combobox, Date Picker; `focus-within:` on a group. */
export const ɵFOCUS_FIELD =
  'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20';

/** The field style for a group that holds the focused field (Input Group, composer). */
export const ɵFOCUS_FIELD_WITHIN =
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20';
