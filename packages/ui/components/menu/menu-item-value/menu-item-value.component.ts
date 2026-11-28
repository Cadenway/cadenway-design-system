import { Component } from '@angular/core';

/**
 * Component CwMenuItemValue
 *
 * @description
 * The current value shown at the end of a menu item, in muted text: « Active » after Statut,
 * « Sombre » after Thème (mockup App.dc.html, the account menu's submenu triggers). Put it last in
 * the item's content. It pushes itself to the right, and on a submenu trigger the chevron follows it
 * instead of splitting the free space with it, so the value and the chevron sit together at the
 * right edge. The text is part of the item's accessible name.
 */
@Component({
  selector: 'cw-menu-item-value',
  host: { class: 'ml-auto pl-6 text-xs text-muted-foreground' },
  templateUrl: './menu-item-value.component.html',
})
export class CwMenuItemValue {}
