import {
  forwardRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import type { FocusableOption } from '@angular/cdk/a11y';
import { CwRipple } from '@cadenway/ui/core';

import { CwToggleGroup } from '../toggle-group.component';
import { TOGGLE_GROUP_ITEM } from '../toggle-group-item.token';
import type { CwToggleGroupSize, CwToggleGroupVariant } from '../toggle-group.types';

/* Literal class strings (Toggle Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. The items carry the classes of the Toggle sheet ("mêmes
   classes que Toggle"); they are repeated here because one entry point never reaches into another's
   internals. Icons are `ng-icon`: their size goes through `--ng-icon__size`. */
const ITEM_BASE =
  'relative isolate overflow-hidden inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground ' +
  'transition-[color,background-color,box-shadow] motion-reduce:transition-none hover:bg-accent hover:text-foreground ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'data-[state=on]:bg-selected data-[state=on]:text-foreground data-[state=on]:hover:bg-selected ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const ITEM_VARIANTS: Record<CwToggleGroupVariant, string> = {
  default: 'bg-transparent',
  outline: 'border border-input bg-transparent',
};

const ITEM_SIZES: Record<CwToggleGroupSize, string> = {
  sm: 'h-7 min-w-7 rounded-md px-1.5',
  default: 'h-8 min-w-8 rounded-lg px-2',
  lg: 'h-9 min-w-9 rounded-lg px-2.5',
};

/**
 * One option of a `cw-toggle-group`: put it on a native `<button>` with its `value`.
 *
 * Takes the variant and size of its group, `role="radio"` and `aria-checked` in single choice,
 * `aria-pressed` in multiple choice, `data-state="on|off"`, and `tabindex` 0 only on the group's Tab
 * stop. Sets `type="button"` when no type is given. An icon-only item needs an `aria-label`. Every
 * press draws the ripple (`CwRipple`), except under reduced motion.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[cwToggleGroupItem]',
  providers: [{ provide: TOGGLE_GROUP_ITEM, useExisting: forwardRef(() => CwToggleGroupItem) }],
  hostDirectives: [CwRipple],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type',
    '[attr.role]': 'single() ? "radio" : null',
    '[attr.aria-checked]': 'single() ? on() : null',
    '[attr.aria-pressed]': 'single() ? null : on()',
    '[attr.data-state]': 'on() ? "on" : "off"',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.tabindex]': 'group.tabStop() === this ? 0 : -1',
    '(click)': 'group.activate(this)',
    '(focus)': 'group.focused(this)',
  },
  templateUrl: './toggle-group-item.component.html',
})
export class CwToggleGroupItem {
  /** Value this item stands for in the group's value. */
  readonly value = input.required<string>();
  /** Disables this item; the arrow keys skip it. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly group = inject(CwToggleGroup);
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;

  // A button without a type would submit its form by accident.
  protected readonly type = inject(new HostAttributeToken('type'), { optional: true }) ?? 'button';

  /** @internal Whether this item is disabled, alone or with its group. */
  readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());

  /** @internal The option the group's `FocusKeyManager` moves through; one per item, never replaced. */
  readonly keyOption: FocusableOption = optionOf(this);

  protected readonly single = computed(() => this.group.type() === 'single');
  protected readonly on = computed(() => this.group.selected().includes(this.value()));
  protected readonly classes = computed(
    () => `${ITEM_BASE} ${ITEM_VARIANTS[this.group.variant()]} ${ITEM_SIZES[this.group.size()]}`,
  );

  /** Moves the focus to this item. */
  focus(options?: FocusOptions): void {
    this.element.focus(options);
  }
}

/* The item's signal input `disabled` cannot be the `disabled: boolean` the CDK key manager reads, so
   the manager moves through one plain option per item that reads the item's state when asked. */
function optionOf(item: CwToggleGroupItem): FocusableOption {
  return {
    focus: () => {
      item.focus();
    },
    get disabled(): boolean {
      return item.isDisabled();
    },
  };
}
