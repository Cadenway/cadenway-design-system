/**
 * Type CwButtonVariant
 *
 * @description
 * Button appearance; the Button sheet calls for one ink-filled default per view, with outline,
 * secondary or ghost for other actions.
 *
 * @type {'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'}
 */
export type CwButtonVariant =
  'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

/**
 * Type CwButtonSize
 *
 * @description
 * Height, padding and radius of a button; controls in the same row share a size.
 *
 * @type {'xs' | 'sm' | 'default' | 'lg' | 'icon-xs' | 'icon-sm' | 'icon' | 'icon-lg'}
 */
export type CwButtonSize =
  'xs' | 'sm' | 'default' | 'lg' | 'icon-xs' | 'icon-sm' | 'icon' | 'icon-lg';
