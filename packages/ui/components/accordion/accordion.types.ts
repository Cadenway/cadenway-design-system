/**
 * Type CwAccordionType
 *
 * @description
 * Whether one accordion section opens at a time or sections open independently.
 *
 * @type {'single' | 'multiple'}
 */
export type CwAccordionType = 'single' | 'multiple';

/**
 * Type CwAccordionVariant
 *
 * @description
 * Accordion appearance: sections separated by rules or framed together as one card.
 *
 * @type {'default' | 'card'}
 */
export type CwAccordionVariant = 'default' | 'card';

/**
 * Type CwAccordionValue
 *
 * @description
 * The open section(s) of an accordion, by their `value`: one value (or `null`) in `single`, the list
 * of values in `multiple`. Either form is read in both modes; each mode writes its own.
 *
 * @type {string | string[] | null}
 */
export type CwAccordionValue = string | string[] | null;

/**
 * Type CwAccordionState
 *
 * @description
 * Open or closed state exposed by an accordion section and its parts through `data-state`.
 *
 * @type {'open' | 'closed'}
 */
export type CwAccordionState = 'open' | 'closed';
