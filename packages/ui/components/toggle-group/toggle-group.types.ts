/**
 * Type CwToggleGroupType
 *
 * @description
 * Whether one item at most is on (`single`, a radio group) or each item flips alone (`multiple`).
 *
 * @type {'single' | 'multiple'}
 */
export type CwToggleGroupType = 'single' | 'multiple';

/**
 * Type CwToggleGroupVariant
 *
 * @description
 * Look of the items: `default` without border, selected grey (`bg-selected`); `outline` with the
 * `input` border, selected violet (`border-primary/50 bg-primary/5`, icon `text-primary`); `swatch`
 * 32 px circles ringed in violet when chosen (`ring-primary/60`), for colors, always spaced and
 * wrapping (8 px), whatever `size` and `spacing`.
 *
 * @type {'default' | 'outline' | 'swatch'}
 */
export type CwToggleGroupVariant = 'default' | 'outline' | 'swatch';

/**
 * Type CwToggleGroupSize
 *
 * @description
 * Height of every item (28, 32 or 36 px), aligned on the buttons of the same row. `xs` is a 28 px
 * chip with 12 px text, 14 px icons and a 6 px gap (mockup `App.dc.html`, the activity type chips).
 *
 * @type {'xs' | 'sm' | 'default' | 'lg'}
 */
export type CwToggleGroupSize = 'xs' | 'sm' | 'default' | 'lg';

/**
 * Type CwToggleGroupOrientation
 *
 * @description
 * Direction of the group and of its arrow keys.
 *
 * @type {'horizontal' | 'vertical'}
 */
export type CwToggleGroupOrientation = 'horizontal' | 'vertical';

/**
 * Type CwToggleGroupValue
 *
 * @description
 * Value of a toggle group: the value of the item that is on, or `null` (`single`); the values of the
 * items that are on, in click order (`multiple`).
 *
 * @type {string | null | readonly string[]}
 */
export type CwToggleGroupValue = string | null | readonly string[];
