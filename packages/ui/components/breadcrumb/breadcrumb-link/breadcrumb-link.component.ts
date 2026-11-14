import { Component, ElementRef, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';

import { type BreadcrumbItemHandle, CW_BREADCRUMB_ITEM } from '../breadcrumb.token';

/**
 * Constant LINK
 *
 * @description
 * Literal breadcrumb link classes from the sheet, including 16-pixel leading icons and focus styling.
 *
 * @type {string}
 */
const LINK: string =
  'inline-flex items-center gap-1.5 rounded-sm transition-colors motion-reduce:transition-none hover:text-foreground ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  '[&>ng-icon]:shrink-0 [&>ng-icon]:[--ng-icon__size:1rem]';

/**
 * Constant MENU_LEVEL
 *
 * @description
 * Literal classes for a menu trigger level, including the selected state when its menu is open.
 *
 * @type {string}
 */
const MENU_LEVEL: string =
  'relative isolate -mx-1 inline-flex items-center gap-1 overflow-hidden rounded-md px-1 transition-colors motion-reduce:transition-none ' +
  'hover:bg-accent hover:text-foreground data-[state=open]:bg-selected data-[state=open]:text-foreground ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  '[&>ng-icon]:shrink-0 [&>ng-icon]:[--ng-icon__size:1rem]';

/**
 * Class CwBreadcrumbLink
 * @class CwBreadcrumbLink
 *
 * @description
 * A clickable level of a breadcrumb: the space, the list, the parent task (Breadcrumb sheet of the
 * Design System artifact, anatomy 2). Write it directly inside `nav[cwBreadcrumb]`.
 *
 * On `<a>` (with `href` or `routerLink`) it is a muted link that turns ink on hover, with an
 * optional leading `ng-icon` (16 px). On `<button>` with `[cwMenuTriggerFor]` it is a level with a
 * menu (« Sprint 14 ▾ »): a `caret-down` follows the label and the menu lists the sibling levels;
 * the button sets `type="button"`. When the trail folds, a hidden link is reached through the menu
 * of « … », which clicks it: its `routerLink` or `href` and its `(click)` keep working.
 */
@Component({
  selector: 'a[cwBreadcrumbLink], button[cwBreadcrumbLink]',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorCaretDownBold }),
    { provide: CW_BREADCRUMB_ITEM, useExisting: CwBreadcrumbLink },
  ],
  host: {
    '[class]': 'classes',
    '[attr.type]': 'isButton ? "button" : null',
  },
  templateUrl: './breadcrumb-link.component.html',
})
export class CwBreadcrumbLink implements BreadcrumbItemHandle {
  // #region Properties
  /**
   * Property element
   * @readonly
   *
   * @description
   * Native link or button element projected into the breadcrumb list.
   *
   * @type {HTMLElement}
   */
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property isPage
   * @readonly
   *
   * @description
   * Always false because this handle represents a clickable level rather than the current page.
   *
   * @type {false}
   * @default false
   */
  public readonly isPage: false = false;

  /**
   * Property isButton
   * @readonly
   *
   * @description
   * Whether the host is a button used as a menu trigger.
   *
   * @type {boolean}
   */
  protected readonly isButton: boolean = this.element.tagName === 'BUTTON';

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Initial host classes selected for a link or menu button.
   *
   * @type {string}
   */
  protected readonly classes: string = this.isButton ? MENU_LEVEL : LINK;
  // #endregion

  // #region Methods
  /**
   * Method label
   * @method label
   *
   * @description
   * Reads the level's visible text for the folded-level menu.
   *
   * @returns {string} Host text with leading and trailing whitespace removed.
   */
  public label(): string {
    return this.element.textContent.trim();
  }
  // #endregion
}
