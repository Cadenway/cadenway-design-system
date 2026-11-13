/** Whether one item at most is on (`single`, a radio group) or each item flips alone (`multiple`). */
export type CwToggleGroupType = 'single' | 'multiple';

/** Look of the items: `default` without border, `outline` with the `input` border. */
export type CwToggleGroupVariant = 'default' | 'outline';

/** Height of every item (28, 32 or 36 px), aligned on the buttons of the same row. */
export type CwToggleGroupSize = 'sm' | 'default' | 'lg';

/** Direction of the group and of its arrow keys. */
export type CwToggleGroupOrientation = 'horizontal' | 'vertical';

/**
 * Value of a toggle group: the value of the item that is on, or `null` (`single`); the values of the
 * items that are on, in click order (`multiple`).
 */
export type CwToggleGroupValue = string | null | readonly string[];
