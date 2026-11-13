import { Component, ElementRef, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';

import { type BreadcrumbItemHandle, CW_BREADCRUMB_ITEM } from '../breadcrumb.token';

/* Literal class strings (Breadcrumb sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. A leading icon is an `ng-icon` of 16 px. */
const LINK =
  'inline-flex items-center gap-1.5 rounded-sm transition-colors motion-reduce:transition-none hover:text-foreground ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  '[&>ng-icon]:shrink-0 [&>ng-icon]:[--ng-icon__size:1rem]';

/* Level with a menu (anatomy 5): the label and a `caret-down` on a hover veil, selected while the
   menu of the sibling levels is open (`data-state` set by `[cwMenuTriggerFor]`). */
const MENU_LEVEL =
  'relative isolate -mx-1 inline-flex items-center gap-1 overflow-hidden rounded-md px-1 transition-colors motion-reduce:transition-none ' +
  'hover:bg-accent hover:text-foreground data-[state=open]:bg-selected data-[state=open]:text-foreground ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  '[&>ng-icon]:shrink-0 [&>ng-icon]:[--ng-icon__size:1rem]';

/**
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
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and navigation. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
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
  /** The link or button element. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** Always false: a link is never the current page. */
  readonly isPage = false;

  protected readonly isButton = this.element.tagName === 'BUTTON';
  protected readonly classes = this.isButton ? MENU_LEVEL : LINK;

  /** The visible text of the level. */
  label(): string {
    return this.element.textContent.trim();
  }
}
