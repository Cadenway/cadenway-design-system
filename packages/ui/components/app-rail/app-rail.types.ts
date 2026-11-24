/**
 * Type CwAppRailItemVariant
 *
 * @description
 * Look of a rail item: `default` is the muted icon button of the mockup's applications; `primary`
 * is the filled square of the organization switcher at the top of the rail (`App.dc.html`).
 *
 * @type {'default' | 'primary'}
 */
export type CwAppRailItemVariant = 'default' | 'primary';

/**
 * Type CwAppRailPhoneLayout
 *
 * @description
 * Layout of the rail below 768 px: the bottom `tab-bar` of the application shell (`App.dc.html`),
 * or the same 56 px `column` as on a desktop, as the settings screens keep it (`Compte.dc.html`,
 * `Organisation.dc.html`).
 *
 * @type {'tab-bar' | 'column'}
 */
export type CwAppRailPhoneLayout = 'tab-bar' | 'column';
