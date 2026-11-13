import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CwTooltip } from '@cadenway/ui/components/tooltip';

import { type BreadcrumbItemHandle, CW_BREADCRUMB_ITEM } from '../breadcrumb.token';

/**
 * The current page, last level of a breadcrumb: the task identifier, the settings page (Breadcrumb
 * sheet of the Design System artifact, anatomy 6). Write it last inside `nav[cwBreadcrumb]`.
 *
 * Ink, not clickable and not a tab stop, `aria-current="page"`. An optional leading `ng-icon`
 * (16 px) comes first; the text is truncated past 192 px (`max-w-48`) and then shows its full name
 * in a tooltip on hover.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires. The lint rule
  // only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'span[cwBreadcrumbPage]',
  imports: [CwTooltip],
  providers: [{ provide: CW_BREADCRUMB_ITEM, useExisting: CwBreadcrumbPage }],
  host: {
    class:
      'inline-flex min-w-0 items-center gap-1.5 font-normal text-foreground [&>ng-icon]:shrink-0 [&>ng-icon]:[--ng-icon__size:1rem]',
    'aria-current': 'page',
    // The host is entered before the text inside it: the tooltip reads the measure on its own
    // pointerenter.
    '(pointerenter)': 'measure()',
  },
  templateUrl: './breadcrumb-page.component.html',
})
export class CwBreadcrumbPage implements BreadcrumbItemHandle {
  /** The page element. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** Always true. */
  readonly isPage = true;

  private readonly text = viewChild.required<ElementRef<HTMLElement>>('text');
  protected readonly truncated = signal(false);
  protected readonly fullText = signal('');

  /** The visible text of the page. */
  label(): string {
    return this.element.textContent.trim();
  }

  protected measure(): void {
    const text = this.text().nativeElement;
    this.fullText.set(text.textContent.trim());
    this.truncated.set(text.scrollWidth > text.clientWidth);
  }
}
