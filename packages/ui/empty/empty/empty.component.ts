import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { CwEmptySize, CwEmptyVariant } from '../empty.types';

/* Literal class strings (Empty sheet and preview of the Design System artifact). */
const BASE =
  'flex min-w-0 flex-col items-center justify-center rounded-xl text-center text-balance';

const VARIANTS: Record<CwEmptyVariant, string> = {
  default: '',
  outline: 'border border-dashed',
};

const SIZES: Record<CwEmptySize, string> = {
  default: 'gap-4 p-6',
  sm: 'gap-3 p-4',
};

/**
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './empty.component.html',
})
export class CwEmpty {
  /** Frame: `outline` draws a dashed border, for a free area of a page. */
  readonly variant = input<CwEmptyVariant>('default');
  /** Spacing and media size. */
  readonly size = input<CwEmptySize>('default');

  protected readonly classes = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );
}
