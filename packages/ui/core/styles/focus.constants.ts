/*
 * The three keyboard focus styles of Cadenway, always on `focus-visible`, solid amethyst (artifact
 * README, "États d'interaction"). Shared across the entry points of `@cadenway/ui`; not public API
 * (`ɵ` prefix). Literal strings, so Tailwind finds the classes in the compiled bricks.
 */

/**
 * Constant ɵFOCUS
 *
 * @description
 * Focus-visible ring classes for standalone controls, including buttons, links and switches.
 *
 * @type {'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'}
 */
export const ɵFOCUS: 'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background' =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Constant ɵFOCUS_INSET
 *
 * @description
 * Inset focus-visible ring classes for full-width items such as rows and sidebar items.
 *
 * @type {'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'}
 */
export const ɵFOCUS_INSET: 'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring' =
  'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';

/**
 * Constant ɵFOCUS_FIELD
 *
 * @description
 * Focus-visible border and ring classes for form fields, including inputs and selects.
 *
 * @type {'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20'}
 */
export const ɵFOCUS_FIELD: 'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20' =
  'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20';

/**
 * Constant ɵFOCUS_FIELD_WITHIN
 *
 * @description
 * Focus-within border and ring classes for a group containing the focused field.
 *
 * @type {'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20'}
 */
export const ɵFOCUS_FIELD_WITHIN: 'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20' =
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20';
