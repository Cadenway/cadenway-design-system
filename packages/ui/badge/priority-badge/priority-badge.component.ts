import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import {
  CW_PRIORITY_LABELS,
  CwPriorityIcon,
  type CwPriorityIconSize,
  type CwPriorityKey,
} from '@cadenway/ui/priority-icon';

import { BADGE_BASE } from '../badge.constants';
import type { CwBadgeSize } from '../badge.types';

/* The priority badge is a `ghost` badge with a tighter padding (Badge preview, "Priorités"). */
const PRIORITY_SIZES: Record<CwBadgeSize, string> = {
  default: 'rounded-md px-1.5 py-0.5 text-xs',
  sm: 'h-[18px] px-1.5 text-[11px] leading-none',
};

const PRIORITY_ICON_SIZES: Record<CwBadgeSize, CwPriorityIconSize> = { default: '4', sm: '3' };

/* Accessible name of a priority badge drawn without its word (Badge sheet, "Accessibilité"). */
const PRIORITY_IMAGE_LABELS: Record<CwPriorityKey, string> = {
  urgente: 'Priorité urgente',
  haute: 'Priorité haute',
  moyenne: 'Priorité moyenne',
  basse: 'Priorité basse',
};

/**
 * The priority of a task as a `ghost` badge: the animated priority bars and their French word, the
 * word in `text-destructive` for `urgente` (Badge sheet, "Compositions Cadenway", with the product
 * keys of `@cadenway/ui/priority-icon`).
 *
 * `priority` is one of the four `CwPriorityKey`; an unknown key reads `moyenne`. `from` forwards a
 * previous priority so the bars morph after mounting. `label` replaces the word (`CW_PRIORITY_LABELS`
 * by default). With `showLabel` off, the word is not written and the badge becomes an image named
 * by `ariaLabel` (« Priorité haute » by default), also shown as its tooltip.
 */
@Component({
  selector: 'cw-priority-badge',
  imports: [CwPriorityIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'showLabel() ? null : "img"',
    '[attr.aria-label]': 'showLabel() ? null : imageLabel()',
    '[attr.title]': 'showLabel() ? null : imageLabel()',
    '[attr.data-priority]': 'current()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './priority-badge.component.html',
})
export class CwPriorityBadge {
  /** The priority shown. */
  readonly priority = input.required<CwPriorityKey>();
  /** A previous priority the bars morph from after mounting. */
  readonly from = input<CwPriorityKey | null | undefined>(undefined);
  /** Writes the word next to the bars; off, the badge is an image named by `ariaLabel`. */
  readonly showLabel = input(true, { transform: booleanAttribute });
  /** Replaces the French word of the priority. */
  readonly label = input<string | null | undefined>(undefined);
  /** Accessible name without the word; « Priorité <word> » by default. */
  readonly ariaLabel = input<string | null | undefined>(undefined);
  /** Height: 22 px (`default`) or 18 px (`sm`). */
  readonly size = input<CwBadgeSize>('default');

  protected readonly current = computed<CwPriorityKey>(() =>
    Object.hasOwn(CW_PRIORITY_LABELS, this.priority()) ? this.priority() : 'moyenne',
  );
  protected readonly classes = computed(() => {
    const tone = this.current() === 'urgente' ? 'text-destructive' : 'text-foreground';
    return `${BADGE_BASE} border-transparent ${PRIORITY_SIZES[this.size()]} ${tone}`;
  });
  protected readonly iconSize = computed(() => PRIORITY_ICON_SIZES[this.size()]);
  protected readonly text = computed(() => this.label() ?? CW_PRIORITY_LABELS[this.current()]);
  protected readonly imageLabel = computed(
    () => this.ariaLabel() ?? PRIORITY_IMAGE_LABELS[this.current()],
  );
}
