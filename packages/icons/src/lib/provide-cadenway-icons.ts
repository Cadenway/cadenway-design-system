import type { Provider } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

/**
 * The registered set, keyed by the name a template gives to `<ng-icon name="…">`.
 *
 * Only icons a consumer uses are registered, sorted by name; Phosphor `Bold` by default and `Fill`
 * for an active state (.claude/agents/cw-ds-icon-maintainer.md).
 *
 * `phosphorCheckBold` is the check shown on the right of the selected option of a menu
 * (.claude/rules/bricks.md; mockup `App.dc.html`: `<span class="ng-icon phosphorCheckBold ml-auto">`).
 * The other icons of the mockup, the svgl logos and the flags are added with the bricks and screens
 * that use them.
 */
const CADENWAY_ICONS = {
  phosphorCheckBold,
};

/**
 * Registers the Cadenway icon set so `<ng-icon name="…">` of `@ng-icons/core` can render it.
 *
 * Call it once in the providers of the application (or of a test bed); it takes no argument and
 * returns the providers to spread there. A name that is not part of the set is not rendered:
 * `@ng-icons/core` logs a warning for it.
 */
export function provideCadenwayIcons(): Provider[] {
  return provideIcons(CADENWAY_ICONS);
}
