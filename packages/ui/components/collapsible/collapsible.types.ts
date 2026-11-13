/** Open or closed, as the `data-state` hook of a collapsible and its parts carries it. */
export type CwCollapsibleState = 'open' | 'closed';

/**
 * Look of a collapsible trigger: `bare` adds nothing (put it on a `cwButton`, the icon button of a
 * block header or the « Afficher plus » button); `row` is the 36 px group row of the List view.
 */
export type CwCollapsibleTriggerVariant = 'bare' | 'row';

/**
 * Direction of a collapsible chevron: `down` turns 180° when open (block header, « Afficher plus »),
 * `right` turns 90° (group row).
 */
export type CwCollapsibleChevronDirection = 'down' | 'right';
