import { Component, computed, inject, input, model } from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorStarBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorStarFill } from '@ng-icons/phosphor-icons/fill';

import { CwPageHeader } from '../page-header.component';

/* Page Header sheet, « Favori »: the Bold star in `muted-foreground` (ink on hover, as the ghost
   button's text), the Fill star in `foreground` when on; never a colored star. The color goes
   through `--ng-icon__color`: the icon's own style layer beats a `text-*` class. */
const ICON_OFF =
  '[--ng-icon__color:var(--muted-foreground)] [button:hover>&]:[--ng-icon__color:var(--foreground)]';
const ICON_ON = '[--ng-icon__color:var(--foreground)]';

/**
 * The favorite toggle next to the title of a `cw-page-header`: a `ghost` icon button with a star.
 *
 * `[(favorite)]` is the state; a click (or Enter, Space) flips it. Its accessible name stays
 * « Favori » (`ariaLabel`) whatever the state, which `aria-pressed` carries (Page Header sheet,
 * "Accessibilité"). `icon-sm` on a default header, `icon-xs` on a compact one. Style hook on the
 * button: `data-state="on|off"`.
 */
@Component({
  selector: 'cw-page-header-favorite',
  imports: [CwButton, NgIcon],
  viewProviders: [provideIcons({ phosphorStarBold, phosphorStarFill })],
  host: {
    class: 'inline-flex shrink-0',
    '[attr.data-state]': 'favorite() ? "on" : "off"',
  },
  templateUrl: './page-header-favorite.component.html',
})
export class CwPageHeaderFavorite {
  /** Whether the page is a favorite, `[(favorite)]`. */
  readonly favorite = model(false);
  /** Accessible name of the toggle; fixed, the state is `aria-pressed`. */
  readonly ariaLabel = input('Favori');

  private readonly header = inject(CwPageHeader, { optional: true });

  protected readonly buttonSize = computed(() =>
    this.header?.size() === 'compact' ? 'icon-xs' : 'icon-sm',
  );
  protected readonly iconClasses = computed(() => (this.favorite() ? ICON_ON : ICON_OFF));

  protected toggle(): void {
    this.favorite.update((favorite) => !favorite);
  }
}
