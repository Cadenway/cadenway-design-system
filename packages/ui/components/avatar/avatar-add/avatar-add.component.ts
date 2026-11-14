import {
  Component,
  computed,
  HostAttributeToken,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorUserBold } from '@ng-icons/phosphor-icons/bold';

import { CwAvatarGroup } from '../avatar-group/avatar-group.component';
import { ICON_SIZES, SIZES } from '../avatar.styles';
import type { CwAvatarSize } from '../avatar.types';

/**
 * Constant ADD
 *
 * @description
 * Classes for the dashed assignment button and its interaction states.
 *
 * @type {string}
 */
const ADD: string =
  'relative isolate flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-input text-muted-foreground ' +
  'transition-colors motion-reduce:transition-none hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Class CwAvatarAdd
 * @class CwAvatarAdd
 *
 * @description
 * The « Non assigné » disc: a dashed round button with a user icon that opens the choice of people
 * when the Assignés field is empty (Avatar sheet of the Design System artifact).
 *
 * Put it on a native `<button>`; it sets `type="button"` when no type is given, carries
 * `aria-label` « Assigner » (override it with `ariaLabel`) and draws the ripple on press, except
 * under reduced motion. Inside a `cw-avatar-group` it takes the group's size. Listen to the native
 * `(click)`.
 */
@Component({
  selector: 'button[cwAvatarAdd]',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorUserBold })],
  hostDirectives: [CwRipple],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-size]': 'effectiveSize()',
  },
  templateUrl: './avatar-add.component.html',
})
export class CwAvatarAdd {
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Diameter used outside an avatar group.
   *
   * @type {InputSignal<CwAvatarSize>}
   */
  public readonly size: InputSignal<CwAvatarSize> = input<CwAvatarSize>('default');

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the button.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('Assigner');

  /**
   * Property group
   * @readonly
   *
   * @description
   * Optional group supplying a shared avatar size.
   *
   * @type {CwAvatarGroup | null}
   */
  private readonly group: CwAvatarGroup | null = inject(CwAvatarGroup, { optional: true });

  /**
   * Property type
   * @readonly
   *
   * @description
   * Supplied button type, defaulting to button to avoid accidental form submission.
   *
   * @type {string}
   */
  protected readonly type: string =
    inject(new HostAttributeToken('type'), { optional: true }) ?? 'button';

  /**
   * Property effectiveSize
   * @readonly
   *
   * @description
   * Group size when present, otherwise the local size.
   *
   * @type {Signal<CwAvatarSize>}
   */
  protected readonly effectiveSize: Signal<CwAvatarSize> = computed(
    () => this.group?.size() ?? this.size(),
  );

  /**
   * Property iconSize
   * @readonly
   *
   * @description
   * Icon size matching the effective diameter.
   *
   * @type {Signal<string>}
   */
  protected readonly iconSize: Signal<string> = computed(() => ICON_SIZES[this.effectiveSize()]);

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Button and size classes applied to the host.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${ADD} ${SIZES[this.effectiveSize()]}`,
  );
  // #endregion
}
