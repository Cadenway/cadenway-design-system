/** Side of the trigger the panel opens on; flipped to the opposite side when it lacks room. */
export type CwPopoverSide = 'top' | 'right' | 'bottom' | 'left';

/** Edge of the panel aligned with the trigger along its side; shifted to stay on screen. */
export type CwPopoverAlign = 'start' | 'center' | 'end';

/**
 * Width of the panel (Popover sheet, "Tailles"): `sm` 224 px (a small form such as an estimate),
 * `default` 288 px (contextual help, settings), `lg` 320 px (sharing with a link).
 */
export type CwPopoverSize = 'sm' | 'default' | 'lg';
