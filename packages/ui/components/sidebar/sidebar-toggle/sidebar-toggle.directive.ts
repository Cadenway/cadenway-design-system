import { Directive, computed, inject, input, type InputSignal, type Signal } from '@angular/core';

import { CwSidebar } from '../sidebar.component';

/**
 * Directive CwSidebarToggle
 *
 * @description
 * Expands or collapses a `cw-sidebar` (Sidebar sheet of the Design System artifact): the `ghost` `icon-sm` button of the content bar, or the one in the sidebar's header. Put it on a `cwButton` holding the sidebar icon (`phosphorSidebarSimpleBold`). Inside the sidebar it finds it; outside, give it the sidebar: `[cwSidebarToggle]="sidebar"` with `#sidebar="cwSidebar"`. Named « Replier la barre latérale » or « Déplier la barre latérale » after the state (`collapseLabel`, `expandLabel`), it announces Ctrl B (`aria-keyshortcuts`) and points at the sidebar (`aria-controls`).
 */
@Directive({
  selector: 'button[cwSidebarToggle]',
  host: {
    'aria-keyshortcuts': 'Control+B',
    '[attr.aria-label]': 'label()',
    '[attr.aria-controls]': 'sidebar()?.id ?? null',
    '(click)': 'sidebar()?.toggle()',
  },
})
export class CwSidebarToggle {
  // #region Properties
  /**
   * Property cwSidebarToggle
   *
   * @description
   * The sidebar to toggle, when the button sits outside it; empty inside it.
   *
   * @type {InputSignal<"" | CwSidebar | null | undefined>}
   * @readonly
   */
  public readonly cwSidebarToggle: InputSignal<'' | CwSidebar | null | undefined> = input<
    CwSidebar | '' | null | undefined
  >('');

  /**
   * Property collapseLabel
   *
   * @description
   * Name of the button while the sidebar is expanded.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly collapseLabel: InputSignal<string> = input('Replier la barre latérale');

  /**
   * Property expandLabel
   *
   * @description
   * Name of the button while the sidebar is collapsed.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly expandLabel: InputSignal<string> = input('Déplier la barre latérale');

  /**
   * Property parent
   *
   * @description
   * Containing sidebar, or null when the trigger is outside it.
   *
   * @type {CwSidebar | null}
   * @readonly
   */
  private readonly parent: CwSidebar | null = inject(CwSidebar, { optional: true });

  /**
   * Property sidebar
   *
   * @description
   * Containing sidebar providing the current layout.
   *
   * @type {Signal<CwSidebar | null>}
   * @readonly
   */
  protected readonly sidebar: Signal<CwSidebar | null> = computed(() => {
    const target: CwSidebar | '' | null | undefined = this.cwSidebarToggle();
    return target instanceof CwSidebar ? target : this.parent;
  });

  /**
   * Property label
   *
   * @description
   * Current label or accessible toggle text.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly label: Signal<string> = computed(() =>
    this.sidebar()?.collapsed() ? this.expandLabel() : this.collapseLabel(),
  );
  // #endregion
}
