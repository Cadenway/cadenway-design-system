import { Service } from '@angular/core';

/**
 * A floating panel `ɵPanelStack` can close: a menu, a select, a combobox, an autocomplete, a popover
 * or a date picker. Its owner keeps one stable object per panel.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export interface ɵStackedPanel {
  /** Closes the panel as an outside click would: the focus is not moved. */
  close(): void;
  /** Whether `node` is inside the open panel: the trigger of a panel opened from it. */
  contains(node: Node): boolean;
}

/**
 * The floating panels the user opened, so that one is open at a time (integration guide,
 * "Placement des menus": « Un seul menu ouvert à la fois »). Tooltips stay out of it.
 *
 * Owners call `open` when the user opens their panel from a trigger (pointer or keyboard): every
 * other open panel closes, except those that hold the trigger, so a select or a menu opened inside
 * a popover keeps that popover open. A panel opened through its `open` model by the consumer does
 * not join the stack, so several panels can be shown on purpose. Owners call `release` once their
 * panel closes or is destroyed. Submenus are handled by their parent menu, not here.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
@Service()
export class ɵPanelStack {
  private readonly panels: ɵStackedPanel[] = [];

  /** Records `panel` as opened from `origin`, closing the open panels that do not hold `origin`. */
  open(panel: ɵStackedPanel, origin: Node | null): void {
    for (const other of [...this.panels].reverse()) {
      if (other === panel || (origin !== null && other.contains(origin))) continue;
      this.release(other);
      other.close();
    }
    this.release(panel);
    this.panels.push(panel);
  }

  /** Forgets `panel`; does nothing when it is not in the stack. */
  release(panel: ɵStackedPanel): void {
    const index = this.panels.indexOf(panel);
    if (index !== -1) this.panels.splice(index, 1);
  }
}
