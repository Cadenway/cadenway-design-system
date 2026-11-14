/**
 * Type CwCollapsibleState
 *
 * @description
 * Open or closed state exposed by a collapsible and its parts through `data-state`.
 *
 * @type {'open' | 'closed'}
 */
export type CwCollapsibleState = 'open' | 'closed';

/**
 * Type CwCollapsibleTriggerVariant
 *
 * @description
 * Look of a collapsible trigger: `bare` adds nothing (put it on a `cwButton`, the icon button of a
 * block header or the « Afficher plus » button); `row` is the 36 px group row of the List view.
 *
 * @type {'bare' | 'row'}
 */
export type CwCollapsibleTriggerVariant = 'bare' | 'row';

/**
 * Type CwCollapsibleChevronDirection
 *
 * @description
 * Direction of a collapsible chevron: `down` turns 180° when open (block header, « Afficher plus »),
 * `right` turns 90° (group row).
 *
 * @type {'down' | 'right'}
 */
export type CwCollapsibleChevronDirection = 'down' | 'right';
