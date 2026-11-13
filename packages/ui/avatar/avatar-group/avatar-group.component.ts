import { Component, computed, contentChildren, input, numberAttribute } from '@angular/core';

import { CwAvatar } from '../avatar.component';
import type { CwAvatarSize } from '../avatar.types';

const GROUP_SPACING: Record<CwAvatarSize, string> = {
  xs: 'flex -space-x-0.5',
  sm: 'flex -space-x-1',
  default: 'flex -space-x-1.5',
  lg: 'flex -space-x-1.5',
};

const MORE: Record<CwAvatarSize, string> = {
  xs: 'relative flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] leading-none font-semibold text-muted-foreground ring-2 ring-background',
  sm: 'relative flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] leading-none font-semibold text-muted-foreground ring-2 ring-background',
  default:
    'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs leading-none font-semibold text-muted-foreground ring-2 ring-background',
  lg: 'relative flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm leading-none font-semibold text-muted-foreground ring-2 ring-background',
};

/**
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
  host: {
    role: 'group',
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './avatar-group.component.html',
})
export class CwAvatarGroup {
  /** Number of avatars shown before « +N »; three in lists (the sheet's rule). */
  readonly max = input(3, { transform: numberAttribute });
  /** Size of every avatar of the stack. */
  readonly size = input<CwAvatarSize>('sm');
  /** Accessible name of the stack. */
  readonly ariaLabel = input('Assignés');
  /** Word read before the names hidden behind « +N » (« et Samuel Roux »). */
  readonly othersPrefix = input('et');

  private readonly avatars = contentChildren(CwAvatar);

  /** @internal The avatars hidden behind « +N », in their order. */
  readonly overflow = computed(() => this.avatars().slice(Math.max(1, this.max())));

  protected readonly hiddenNames = computed(() =>
    this.overflow()
      .map((avatar) => avatar.spoken())
      .join(', '),
  );
  protected readonly classes = computed(() => GROUP_SPACING[this.size()]);
  protected readonly moreClasses = computed(() => MORE[this.size()]);
}
