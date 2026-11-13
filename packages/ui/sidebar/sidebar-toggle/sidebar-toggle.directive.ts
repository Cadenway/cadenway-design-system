import { Directive, computed, inject, input } from '@angular/core';

import { CwSidebar } from '../sidebar.component';

/**
 * Expands or collapses a `cw-sidebar` (Sidebar sheet of the Design System artifact): the
 * `ghost` `icon-sm` button of the content bar, or the one in the sidebar's header.
 *
 * Put it on a `cwButton` holding the sidebar icon (`phosphorSidebarSimpleBold`). Inside the
 * sidebar it finds it; outside, give it the sidebar: `[cwSidebarToggle]="sidebar"` with
 * `#sidebar="cwSidebar"`. Named « Replier la barre latérale » or « Déplier la barre latérale »
 * after the state (`collapseLabel`, `expandLabel`), it announces Ctrl B (`aria-keyshortcuts`) and
 * points at the sidebar (`aria-controls`).
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
  /** The sidebar to toggle, when the button sits outside it; empty inside it. */
  readonly cwSidebarToggle = input<CwSidebar | '' | null | undefined>('');
  /** Name of the button while the sidebar is expanded. */
  readonly collapseLabel = input('Replier la barre latérale');
  /** Name of the button while the sidebar is collapsed. */
  readonly expandLabel = input('Déplier la barre latérale');

  private readonly parent = inject(CwSidebar, { optional: true });

  protected readonly sidebar = computed(() => {
    const target = this.cwSidebarToggle();
    return target instanceof CwSidebar ? target : this.parent;
  });
  protected readonly label = computed(() =>
    this.sidebar()?.collapsed() ? this.expandLabel() : this.collapseLabel(),
  );
}
