import type { Provider } from '@angular/core';
import { provideIcons } from '@ng-icons/core';

import { BRAND_ICONS } from './sets/brand.icons';
import { FLAG_ICONS } from './sets/flags.icons';
import { PHOSPHOR_BOLD_ICONS } from './sets/phosphor-bold.icons';
import { PHOSPHOR_FILL_ICONS } from './sets/phosphor-fill.icons';

/**
 * The registered set, keyed by the name a template gives to `<ng-icon name="…">`, sorted by name.
 *
 * Every icon the mockup uses (docs/maquette/source/*.dc.html, literal `ng-icon` classes and the
 * script tables that feed them), one file per family under `sets/`: 217 Phosphor `Bold`, 57
 * Phosphor `Fill`, 7 svgl logos and 4 flags. No other Phosphor weight is used.
 */
const CADENWAY_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries({
    ...PHOSPHOR_BOLD_ICONS,
    ...PHOSPHOR_FILL_ICONS,
    ...BRAND_ICONS,
    ...FLAG_ICONS,
  }).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
);

/**
 * Registers the Cadenway icon set so `<ng-icon name="…">` of `@ng-icons/core` can render it.
 *
 * Call it once in the providers of the application (or of a test bed); it takes no argument and
 * returns the providers to spread there. A name that is not part of the set is not rendered:
 * `@ng-icons/core` logs a warning for it. The bricks of `@cadenway/ui` register their own icons and
 * do not depend on this call.
 */
export function provideCadenwayIcons(): Provider[] {
  return provideIcons(CADENWAY_ICONS);
}

/** The names of the registered set, sorted; a test and documentation aid. */
export const CADENWAY_ICON_NAMES: readonly string[] = Object.keys(CADENWAY_ICONS);
