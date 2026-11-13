/** Whether one section opens at a time (`single`) or each one on its own (`multiple`). */
export type CwAccordionType = 'single' | 'multiple';

/** Look of an accordion: sections separated by rules (`default`) or framed as one card (`card`). */
export type CwAccordionVariant = 'default' | 'card';

/**
 * The open section(s) of an accordion, by their `value`: one value (or `null`) in `single`, the list
 * of values in `multiple`. Either form is read in both modes; each mode writes its own.
 */
export type CwAccordionValue = string | string[] | null;

/** Open or closed, as the `data-state` hook of a section and its parts carries it. */
export type CwAccordionState = 'open' | 'closed';
