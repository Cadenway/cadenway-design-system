import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { CwMenu, CwMenuItem, CwMenuTriggerFor } from '@cadenway/ui/components/menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDotsThreeBold } from '@ng-icons/phosphor-icons/bold';

import { CW_TOOLBAR, CW_TOOLBAR_ITEM, type ToolbarItemHandle } from '../toolbar.token';

/**
 * Where the « Plus » button of a `cw-toolbar` sits, usually right before the primary action
 * (Toolbar sheet of the Design System artifact). Without it, the toolbar puts the button at its
 * end.
 *
 * The button (`ghost` icon, `dots-three`, named by the toolbar's `overflowLabel`) shows only while
 * some `[cwToolbarItem]` controls do not fit; it opens a `cw-menu` aligned on its right edge that
 * lists them, in the order of the bar. It takes part in the arrow navigation of the bar and never
 * moves into its own menu. ↓, Enter or Space open the menu on its first entry, Escape closes it and
 * gives the focus back to the button.
 */
@Component({
  selector: 'cw-toolbar-overflow',
  imports: [CwButton, CwMenu, CwMenuItem, CwMenuTriggerFor, NgIcon],
  providers: [
    provideIcons({ phosphorDotsThreeBold }),
    { provide: CW_TOOLBAR_ITEM, useExisting: CwToolbarOverflow },
  ],
  host: { class: 'contents' },
  templateUrl: './toolbar-overflow.component.html',
})
export class CwToolbarOverflow implements ToolbarItemHandle {
  protected readonly toolbar = inject(CW_TOOLBAR);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly button = viewChild.required<string, ElementRef<HTMLElement>>('button', {
    read: ElementRef,
  });

  private readonly shown = signal(false);

  /** The overflow button is never hidden by the measure; `setOverflowed(true)` shows it. */
  readonly overflowed = signal(false).asReadonly();
  readonly pinned = true;

  protected readonly label = computed(() => this.toolbar.overflowLabel());
  protected readonly buttonSize = computed(() =>
    this.toolbar.size() === 'sm' ? 'icon-sm' : 'icon',
  );

  constructor() {
    this.host.style.setProperty('display', 'none');
  }

  get element(): HTMLElement {
    return this.button().nativeElement;
  }

  get disabled(): boolean {
    return !this.shown();
  }

  /**
   * Shows the button (`true`: some controls moved into the menu) or hides it, at once, for the
   * width measure. Not public API.
   */
  setOverflowed(show: boolean): void {
    if (show) this.host.style.removeProperty('display');
    else this.host.style.setProperty('display', 'none');
    this.shown.set(show);
  }

  menuLabel(): string {
    return this.label();
  }

  menuIcon(): string | null {
    return 'phosphorDotsThreeBold';
  }

  activate(): void {
    this.element.click();
  }

  focus(): void {
    this.element.focus();
  }

  getLabel(): string {
    return this.label();
  }
}
