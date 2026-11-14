import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';

import type { CwEmptySize, CwEmptyVariant } from './empty.types';

/**
 * Constant BASE
 *
 * @description
 * Literal Empty sheet classes for a centered, balanced empty state.
 *
 * @type {string}
 */
const BASE: string =
  'flex min-w-0 flex-col items-center justify-center rounded-xl text-center text-balance';

/**
 * Constant VARIANTS
 *
 * @description
 * Frame classes for an unframed empty state or a dashed outline.
 *
 * @type {Record<CwEmptyVariant, string>}
 */
const VARIANTS: Record<CwEmptyVariant, string> = {
  default: '',
  outline: 'border border-dashed',
};

/**
 * Constant SIZES
 *
 * @description
 * Padding and spacing classes for standard and compact empty states.
 *
 * @type {Record<CwEmptySize, string>}
 */
const SIZES: Record<CwEmptySize, string> = {
  default: 'gap-4 p-6',
  sm: 'gap-3 p-4',
};

/**
 * Class CwEmpty
 * @class CwEmpty
 *
 * @description
 * An empty state: it names what is missing, says why in one sentence and offers a way out (Empty
 * sheet of the Design System artifact).
 *
 * Compose it with `cw-empty-header` (`cw-empty-media`, `cw-empty-title`, `cw-empty-description`)
 * and `cw-empty-content` for the actions: one `default` button at most, one `outline`. The state
 * itself never takes the focus. An empty state that appears after a search is announced: give the
 * host `role="status"` (« Aucun résultat pour export pdf »).
 *
 * The loading error panel of the integration guide ("Erreurs") is a composition of this brick in a
 * `role="alert"` container: `cw-empty-media tone="destructive"` with the warning-circle icon,
 * a title « Impossible de charger les tâches », the text, the actions Réessayer (`outline`, arrow
 * icon) and État du service (`ghost`), then the code `Erreur 503 · réf. …` in
 * `font-mono text-xs text-muted-foreground` (story `ErrorPanel`).
 */
@Component({
  selector: 'cw-empty',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './empty.component.html',
})
export class CwEmpty {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting an unframed state or a dashed outline for a free page area.
   *
   * @type {InputSignal<CwEmptyVariant>}
   * @default 'default'
   */
  public readonly variant: InputSignal<CwEmptyVariant> = input<CwEmptyVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting spacing and the size used by the media part.
   *
   * @type {InputSignal<CwEmptySize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwEmptySize> = input<CwEmptySize>('default');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed layout, frame and spacing classes for the empty-state host.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );
  // #endregion
}
