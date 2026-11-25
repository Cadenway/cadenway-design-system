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
 * `default` 288 px (contextual help, settings), `lg` 320 px (sharing with a link), `xl` 384 px
 * (the inbox panel of the rail, mockup `App.dc.html`).
 *
 * @type {'sm' | 'default' | 'lg' | 'xl'}
 */
export type CwPopoverSize = 'sm' | 'default' | 'lg' | 'xl';

/**
 * Type CwPopoverPadding
 *
 * @description
 * Inner spacing of the panel: `default` pads the content by size and spaces its children by 12 px;
 * `none` leaves both to the content, whose sections draw their own edges (the inbox panel of the
 * mockup `App.dc.html`: a header, tabs, a list and a footer separated by borders).
 *
 * @type {'default' | 'none'}
 */
export type CwPopoverPadding = 'default' | 'none';
