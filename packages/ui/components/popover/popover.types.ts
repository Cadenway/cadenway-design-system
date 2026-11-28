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
 * Type CwPopoverWidth
 *
 * @description
 * How the panel's width is set: `fixed` keeps the width of its `size`; `content` lets the panel
 * follow its content (`w-max`), never narrower than the width of its `size` and never wider than
 * the viewport minus 8 px gutters (mockup `App.dc.html`: the filter panel, a 34 rem grid, and the
 * reminder panel, `w-max min-w-72`).
 *
 * @type {'fixed' | 'content'}
 */
export type CwPopoverWidth = 'fixed' | 'content';

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
