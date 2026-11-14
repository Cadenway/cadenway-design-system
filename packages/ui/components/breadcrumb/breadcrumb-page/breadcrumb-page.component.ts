import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { CwTooltip } from '@cadenway/ui/components/tooltip';

import { type BreadcrumbItemHandle, CW_BREADCRUMB_ITEM } from '../breadcrumb.token';

/**
 * Class CwBreadcrumbPage
 * @class CwBreadcrumbPage
 *
 * @description
 * The current page, last level of a breadcrumb: the task identifier, the settings page (Breadcrumb
 * sheet of the Design System artifact, anatomy 6). Write it last inside `nav[cwBreadcrumb]`.
 *
 * Ink, not clickable and not a tab stop, `aria-current="page"`. An optional leading `ng-icon`
 * (16 px) comes first; the text is truncated past 192 px (`max-w-48`) and then shows its full name
 * in a tooltip on hover.
 */
@Component({
  selector: 'span[cwBreadcrumbPage]',
  imports: [CwTooltip],
  providers: [{ provide: CW_BREADCRUMB_ITEM, useExisting: CwBreadcrumbPage }],
  host: {
    class:
      'inline-flex min-w-0 items-center gap-1.5 font-normal text-foreground [&>ng-icon]:shrink-0 [&>ng-icon]:[--ng-icon__size:1rem]',
    'aria-current': 'page',
    '(pointerenter)': 'measure()',
  },
  templateUrl: './breadcrumb-page.component.html',
})
export class CwBreadcrumbPage implements BreadcrumbItemHandle {
  // #region Properties
  /**
   * Property element
   * @readonly
   *
   * @description
   * Native page element projected as the final breadcrumb level.
   *
   * @type {HTMLElement}
   */
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property isPage
   * @readonly
   *
   * @description
   * Always true because this handle represents the current page.
   *
   * @type {true}
   * @default true
   */
  public readonly isPage: true = true;

  /**
   * Property text
   * @readonly
   *
   * @description
   * Required query for the text element whose overflow determines tooltip visibility.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   */
  private readonly text: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('text');

  /**
   * Property truncated
   * @readonly
   *
   * @description
   * Whether the latest measurement found the page label wider than its visible area.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  protected readonly truncated: WritableSignal<boolean> = signal(false);

  /**
   * Property fullText
   * @readonly
   *
   * @description
   * Trimmed label captured during the latest measurement for the tooltip.
   *
   * @type {WritableSignal<string>}
   * @default ''
   */
  protected readonly fullText: WritableSignal<string> = signal('');
  // #endregion

  // #region Methods
  /**
   * Method label
   * @method label
   *
   * @description
   * Reads the page level's text for the breadcrumb handle.
   *
   * @returns {string} Host text with leading and trailing whitespace removed.
   */
  public label(): string {
    return this.element.textContent.trim();
  }

  /**
   * Method measure
   * @method measure
   *
   * @description
   * Captures the full label and checks for overflow before the tooltip handles pointer entry.
   */
  protected measure(): void {
    const text: HTMLElement = this.text().nativeElement;
    this.fullText.set(text.textContent.trim());
    this.truncated.set(text.scrollWidth > text.clientWidth);
  }
  // #endregion
}
