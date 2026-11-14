import {
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { CwMenu, CwMenuItem, CwMenuTriggerFor } from '@cadenway/ui/components/menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDotsThreeBold } from '@ng-icons/phosphor-icons/bold';

import {
  CW_TOOLBAR,
  CW_TOOLBAR_ITEM,
  type ToolbarHandle,
  type ToolbarItemHandle,
} from '../toolbar.token';

/**
 * Class CwToolbarOverflow
 * @class CwToolbarOverflow
 *
 * @description
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
  // #region Properties
  /**
   * Property toolbar
   * @readonly
   *
   * @description
   * Containing toolbar providing size, label and menu entries.
   *
   * @type {ToolbarHandle}
   */
  protected readonly toolbar: ToolbarHandle = inject(CW_TOOLBAR);

  /**
   * Property host
   * @readonly
   *
   * @description
   * Host element shown when controls overflow.
   *
   * @type {HTMLElement}
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property button
   * @readonly
   *
   * @description
   * Overflow button used for focus and activation.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   */
  private readonly button: Signal<ElementRef<HTMLElement>> = viewChild.required<
    string,
    ElementRef<HTMLElement>
  >('button', {
    read: ElementRef,
  });

  /**
   * Property shown
   * @readonly
   *
   * @description
   * Whether the overflow button is visible.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly shown: WritableSignal<boolean> = signal(false);

  /**
   * Property overflowed
   * @readonly
   *
   * @description
   * Read-only overflow state of the control.
   *
   * @type {Signal<boolean>}
   */
  public readonly overflowed: Signal<boolean> = signal(false).asReadonly();

  /**
   * Property pinned
   * @readonly
   *
   * @description
   * Keeps the overflow button out of its own menu.
   *
   * @type {true}
   */
  public readonly pinned: true = true;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Accessible label supplied by the toolbar.
   *
   * @type {Signal<string>}
   */
  protected readonly label: Signal<string> = computed(() => this.toolbar.overflowLabel());

  /**
   * Property buttonSize
   * @readonly
   *
   * @description
   * Button size matching the toolbar.
   *
   * @type {Signal<'icon-sm' | 'icon'>}
   */
  protected readonly buttonSize: Signal<'icon-sm' | 'icon'> = computed(() =>
    this.toolbar.size() === 'sm' ? 'icon-sm' : 'icon',
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Initially hides the overflow host until it is needed.
   */
  public constructor() {
    this.host.style.setProperty('display', 'none');
  }
  // #endregion

  // #region Properties
  /**
   * Property element
   *
   * @description
   * Native overflow button used for navigation.
   *
   * @returns {HTMLElement} Overflow button element.
   */
  public get element(): HTMLElement {
    return this.button().nativeElement;
  }

  /**
   * Property disabled
   *
   * @description
   * Whether keyboard navigation should skip the hidden button.
   *
   * @returns {boolean} Whether the button is hidden.
   */
  public get disabled(): boolean {
    return !this.shown();
  }
  // #endregion

  // #region Methods
  /**
   * Method setOverflowed
   * @method setOverflowed
   *
   * @description
   * Synchronously shows or hides the overflow control.
   *
   * @param {boolean} show - Whether the overflow control should be shown.
   */
  public setOverflowed(show: boolean): void {
    if (show) this.host.style.removeProperty('display');
    else this.host.style.setProperty('display', 'none');
    this.shown.set(show);
  }

  /**
   * Method menuLabel
   * @method menuLabel
   *
   * @description
   * Returns the overflow button label.
   *
   * @returns {string} Overflow button label.
   */
  public menuLabel(): string {
    return this.label();
  }

  /**
   * Method menuIcon
   * @method menuIcon
   *
   * @description
   * Returns the overflow button icon name.
   *
   * @returns {string | null} Overflow icon name, or null when absent.
   */
  public menuIcon(): string | null {
    return 'phosphorDotsThreeBold';
  }

  /**
   * Method activate
   * @method activate
   *
   * @description
   * Activates the overflow button.
   */
  public activate(): void {
    this.element.click();
  }

  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the overflow button.
   */
  public focus(): void {
    this.element.focus();
  }

  /**
   * Method getLabel
   * @method getLabel
   *
   * @description
   * Returns the label for keyboard navigation.
   *
   * @returns {string} Label used for keyboard navigation.
   */
  public getLabel(): string {
    return this.label();
  }
  // #endregion
}
