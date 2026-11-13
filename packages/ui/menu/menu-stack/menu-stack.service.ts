import { Service } from '@angular/core';

import type { CwMenu } from '../menu.component';

/**
 * The menu open at the root of the page: opening another one closes it first (integration guide,
 * "Placement des menus": "Un seul menu ouvert à la fois"). Dropdown and context menus share it.
 * Submenus are not tracked here: each menu closes its own open submenu. Not exported.
 */
@Service()
export class MenuStack {
  private current: CwMenu | null = null;

  /** Records `menu` as the open root menu, closing the previous one. */
  open(menu: CwMenu): void {
    const previous = this.current;
    this.current = menu;
    if (previous && previous !== menu) previous.close();
  }

  /** Forgets `menu` once it closes. */
  release(menu: CwMenu): void {
    if (this.current === menu) this.current = null;
  }
}
