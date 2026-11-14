/**
 * Type CwPopoverSide
 *
 * @description
 * Side of the trigger the panel opens on; flipped to the opposite side when it lacks room.
 *
 * @type {'top' | 'right' | 'bottom' | 'left'}
 */
export type CwPopoverSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Type CwPopoverAlign
 *
 * @description
 * Edge of the panel aligned with the trigger along its side; shifted to stay on screen.
 *
 * @type {'start' | 'center' | 'end'}
 */
export type CwPopoverAlign = 'start' | 'center' | 'end';

/**
 * Type CwPopoverSize
 *
 * @description
 * Width of the panel (Popover sheet, "Tailles"): `sm` 224 px (a small form such as an estimate),
 * `default` 288 px (contextual help, settings), `lg` 320 px (sharing with a link).
 *
 * @type {'sm' | 'default' | 'lg'}
 */
export type CwPopoverSize = 'sm' | 'default' | 'lg';
