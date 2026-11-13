import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { CwButtonGroup } from './button-group.component';
import type { CwButtonGroupOrientation } from './button-group.types';

/* After a `default` button (ink fill), the rule is a light gap; between `outline` buttons, their
   border color (Button Group sheet, "Anatomie"). The sibling selector reads the button's own
   `data-variant` hook, so the separator needs no input. */
const SEPARATOR: Record<CwButtonGroupOrientation, string> = {
  horizontal: 'w-px shrink-0 self-stretch bg-input [[data-variant=default]+&]:bg-background/25',
  vertical: 'h-px shrink-0 self-stretch bg-input [[data-variant=default]+&]:bg-background/25',
};

/**
 * A 1 px rule between two buttons of a `cw-button-group`, required between two `default` buttons
 * (the split button), useless between `outline` buttons.
 *
 * `role="separator"`, oriented across its group (`aria-orientation="vertical"` in a horizontal
 * group).
 */
@Component({
  selector: 'cw-button-group-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    '[class]': 'classes()',
    '[attr.aria-orientation]': 'across()',
  },
  templateUrl: './button-group-separator.component.html',
})
export class CwButtonGroupSeparator {
  private readonly group = inject(CwButtonGroup, { optional: true });

  protected readonly across = computed(() =>
    this.group?.orientation() === 'vertical' ? 'horizontal' : 'vertical',
  );
  protected readonly classes = computed(() =>
    this.across() === 'vertical' ? SEPARATOR.horizontal : SEPARATOR.vertical,
  );
}
