import { Service } from '@angular/core';

/**
 * Interface ɵStackedPanel
 * @interface ɵStackedPanel
 *
 * @description
 * A floating panel `ɵPanelStack` can close: a menu, a select, a combobox, an autocomplete, a popover
 * or a date picker. Its owner keeps one stable object per panel.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export interface ɵStackedPanel {
  // #region Methods
  /**
   * Method close
   * @method close
   *
   * @description
   * Closes the panel as an outside click would, without moving focus.
   */
  close(): void;

  /**
   * Method contains
   * @method contains
   *
   * @description
   * Determines whether a node, such as a nested panel trigger, is inside this panel.
   *
   * @param {Node} node - Node to locate within the panel.
   *
   * @returns {boolean} Whether the node is inside the panel.
   */
  contains(node: Node): boolean;
  // #endregion
}

/**
 * Class ɵPanelStack
 * @class ɵPanelStack
 *
 * @description
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
  // #region Properties
  /**
   * Property panels
   * @readonly
   *
   * @description
   * Panels registered by their owners, in the order they were opened.
   *
   * @type {ɵStackedPanel[]}
   */
  private readonly panels: ɵStackedPanel[] = [];
  // #endregion

  // #region Methods
  /**
   * Method open
   * @method open
   *
   * @description
   * Records a panel as opened and closes registered panels that do not contain its origin.
   *
   * @param {ɵStackedPanel} panel - Panel to add to the stack.
   * @param {Node | null} origin - Trigger inside a parent panel, or null when there is none.
   */
  public open(panel: ɵStackedPanel, origin: Node | null): void {
    for (const other of [...this.panels].reverse()) {
      if (other === panel || (origin !== null && other.contains(origin))) continue;
      this.release(other);
      other.close();
    }
    this.release(panel);
    this.panels.push(panel);
  }

  /**
   * Method release
   * @method release
   *
   * @description
   * Removes a panel from the stack; does nothing when it is not registered.
   *
   * @param {ɵStackedPanel} panel - Panel whose registration is released.
   */
  public release(panel: ɵStackedPanel): void {
    const index: number = this.panels.indexOf(panel);
    if (index !== -1) this.panels.splice(index, 1);
  }
  // #endregion
}
