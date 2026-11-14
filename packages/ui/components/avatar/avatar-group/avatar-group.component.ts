import {
  Component,
  computed,
  contentChildren,
  forwardRef,
  input,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';

import { AVATAR_GROUP } from '../avatar-group.token';
import { CwAvatar } from '../avatar.component';
import type { CwAvatarSize } from '../avatar.types';

/**
 * Constant GROUP_SPACING
 *
 * @description
 * Overlap classes for each avatar size.
 *
 * @type {Record<CwAvatarSize, string>}
 */
const GROUP_SPACING: Record<CwAvatarSize, string> = {
  xs: 'flex -space-x-0.5',
  sm: 'flex -space-x-1',
  default: 'flex -space-x-1.5',
  lg: 'flex -space-x-1.5',
};

/**
 * Constant MORE
 *
 * @description
 * Overflow disc classes for each avatar size.
 *
 * @type {Record<CwAvatarSize, string>}
 */
const MORE: Record<CwAvatarSize, string> = {
  xs: 'relative flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] leading-none font-semibold text-muted-foreground ring-2 ring-background',
  sm: 'relative flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] leading-none font-semibold text-muted-foreground ring-2 ring-background',
  default:
    'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs leading-none font-semibold text-muted-foreground ring-2 ring-background',
  lg: 'relative flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm leading-none font-semibold text-muted-foreground ring-2 ring-background',
};

/**
 * Class CwAvatarGroup
 * @class CwAvatarGroup
 *
 * @description
 * A stack of avatars, the assignees of a task: at most `max` discs, then a « +N » disc of the same
 * size (Avatar sheet of the Design System artifact).
 *
 * Project `cw-avatar` children (and a `button[cwAvatarAdd]` when nobody is assigned); each takes the
 * group's `size`. The group is a `role="group"` named by `ariaLabel`. The « +N » disc is hidden from
 * assistive technologies and replaced by « et Samuel Roux » in a hidden text; its `title` names the
 * hidden people too. One size per stack.
 */
@Component({
  selector: 'cw-avatar-group',
  providers: [{ provide: AVATAR_GROUP, useExisting: forwardRef(() => CwAvatarGroup) }],
  host: {
    role: 'group',
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './avatar-group.component.html',
})
export class CwAvatarGroup {
  // #region Properties
  /**
   * Property max
   * @readonly
   *
   * @description
   * Number of avatars shown before the overflow disc.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly max: InputSignalWithTransform<number, unknown> = input(3, {
    transform: numberAttribute,
  });

  /**
   * Property size
   * @readonly
   *
   * @description
   * Size shared by the avatars in the stack.
   *
   * @type {InputSignal<CwAvatarSize>}
   */
  public readonly size: InputSignal<CwAvatarSize> = input<CwAvatarSize>('sm');

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the stack.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('Assignés');

  /**
   * Property othersPrefix
   * @readonly
   *
   * @description
   * Word read before the names hidden behind the overflow disc.
   *
   * @type {InputSignal<string>}
   */
  public readonly othersPrefix: InputSignal<string> = input('et');

  /**
   * Property avatars
   * @readonly
   *
   * @description
   * Projected avatars in their content order.
   *
   * @type {Signal<readonly CwAvatar[]>}
   */
  private readonly avatars: Signal<readonly CwAvatar[]> = contentChildren(CwAvatar);

  /**
   * Property overflow
   * @readonly
   *
   * @description
   * Avatars hidden behind the overflow disc, in their content order.
   * @internal
   *
   * @type {Signal<CwAvatar[]>}
   */
  public readonly overflow: Signal<CwAvatar[]> = computed(() =>
    this.avatars().slice(Math.max(1, this.max())),
  );

  /**
   * Property hiddenNames
   * @readonly
   *
   * @description
   * Accessible names of the avatars hidden by the overflow disc.
   *
   * @type {Signal<string>}
   */
  protected readonly hiddenNames: Signal<string> = computed(() =>
    this.overflow()
      .map((avatar) => avatar.spoken())
      .join(', '),
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Stack spacing classes for the selected size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => GROUP_SPACING[this.size()]);

  /**
   * Property moreClasses
   * @readonly
   *
   * @description
   * Overflow disc classes for the selected size.
   *
   * @type {Signal<string>}
   */
  protected readonly moreClasses: Signal<string> = computed(() => MORE[this.size()]);
  // #endregion
}
