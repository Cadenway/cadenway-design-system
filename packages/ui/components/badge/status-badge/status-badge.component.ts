import { Component, computed, input } from '@angular/core';
import {
  CW_STATUS_LABELS,
  CwStatusIcon,
  type CwStatusIconSize,
  type CwStatusKey,
} from '@cadenway/ui/components/status-icon';

import { BADGE_BASE, BADGE_SIZES, BADGE_VARIANTS } from '../badge.constants';
import type { CwBadgeSize } from '../badge.types';

const STATUS_ICON_SIZES: Record<CwBadgeSize, CwStatusIconSize> = { default: '3', sm: '3' };

/**
 * The status of a task as an `outline` badge: the animated status icon and its French word, always
 * both (Badge sheet, "Compositions Cadenway", with the product keys of `@cadenway/ui/components/status-icon`).
 *
 * `status` is one of the ten `CwStatusKey`; an unknown key reads `todo`. `from` forwards a previous
 * status so the icon morphs after mounting. `label` replaces the word (« En cours » by default, from
 * `CW_STATUS_LABELS`). The icon is `aria-hidden`: the word is the accessible text.
 */
@Component({
  selector: 'cw-status-badge',
  imports: [CwStatusIcon],
  host: {
    '[class]': 'classes()',
    '[attr.data-status]': 'current()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './status-badge.component.html',
})
export class CwStatusBadge {
  /** The status shown. */
  readonly status = input.required<CwStatusKey>();
  /** A previous status the icon morphs from after mounting. */
  readonly from = input<CwStatusKey | null | undefined>(undefined);
  /** Replaces the French word of the status. */
  readonly label = input<string | null | undefined>(undefined);
  /** Height: 22 px (`default`) or 18 px (`sm`). */
  readonly size = input<CwBadgeSize>('default');

  protected readonly current = computed<CwStatusKey>(() =>
    Object.hasOwn(CW_STATUS_LABELS, this.status()) ? this.status() : 'todo',
  );
  protected readonly classes = computed(
    () => `${BADGE_BASE} ${BADGE_VARIANTS.outline} ${BADGE_SIZES[this.size()]}`,
  );
  protected readonly iconSize = computed(() => STATUS_ICON_SIZES[this.size()]);
  protected readonly text = computed(() => this.label() ?? CW_STATUS_LABELS[this.current()]);
}
