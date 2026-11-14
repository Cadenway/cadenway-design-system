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
 * Look of the items: `default` without border, `outline` with the `input` border.
 *
 * @type {'default' | 'outline'}
 */
export type CwToggleGroupVariant = 'default' | 'outline';

/**
 * Type CwToggleGroupSize
 *
 * @description
 * Height of every item (28, 32 or 36 px), aligned on the buttons of the same row.
 *
 * @type {'sm' | 'default' | 'lg'}
 */
export type CwToggleGroupSize = 'sm' | 'default' | 'lg';

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
