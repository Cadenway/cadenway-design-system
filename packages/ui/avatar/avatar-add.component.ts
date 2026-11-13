import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  computed,
  inject,
  input,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorUserBold } from '@ng-icons/phosphor-icons/bold';

import { CwAvatarGroup } from './avatar-group.component';
import { ICON_SIZES, SIZES } from './avatar.styles';
import type { CwAvatarSize } from './avatar.types';

const ADD =
  'relative isolate flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-input text-muted-foreground ' +
  'transition-colors motion-reduce:transition-none hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * The « Non assigné » disc: a dashed round button with a user icon that opens the choice of people
 * when the Assignés field is empty (Avatar sheet of the Design System artifact).
 *
 * Put it on a native `<button>`; it sets `type="button"` when no type is given, carries
 * `aria-label` « Assigner » (override it with `ariaLabel`) and draws the ripple on press, except
 * under reduced motion. Inside a `cw-avatar-group` it takes the group's size. Listen to the native
 * `(click)`.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[cwAvatarAdd]',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorUserBold })],
  hostDirectives: [CwRipple],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-size]': 'effectiveSize()',
  },
  templateUrl: './avatar-add.component.html',
})
export class CwAvatarAdd {
  /** Diameter; inside a group, the group's size wins. */
  readonly size = input<CwAvatarSize>('default');
  /** Accessible name of the button. */
  readonly ariaLabel = input('Assigner');

  private readonly group = inject(CwAvatarGroup, { optional: true });

  // A button without a type would submit its form by accident.
  protected readonly type = inject(new HostAttributeToken('type'), { optional: true }) ?? 'button';

  protected readonly effectiveSize = computed(() => this.group?.size() ?? this.size());
  protected readonly iconSize = computed(() => ICON_SIZES[this.effectiveSize()]);
  protected readonly classes = computed(() => `${ADD} ${SIZES[this.effectiveSize()]}`);
}
