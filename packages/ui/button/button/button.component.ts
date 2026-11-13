import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/spinner';

import type { CwButtonSize, CwButtonVariant } from '../button.types';

/* Literal class strings (Button sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Icons are `ng-icon`: their size goes through `--ng-icon__size`. */
const BASE =
  'relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap font-medium transition-all outline-hidden ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 ' +
  'aria-busy:pointer-events-none aria-busy:cursor-progress ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  '[&>[cwSpinner]+ng-icon]:hidden';

const VARIANTS: Record<CwButtonVariant, string> = {
  default: 'bg-foreground text-background hover:bg-foreground/90',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-grenat-text dark:bg-grenat-soft dark:text-grenat-text dark:hover:bg-grenat-soft/70',
  outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-linear-to-b hover:from-hover hover:to-hover',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const SIZES: Record<CwButtonSize, string> = {
  xs: 'h-6 gap-1 rounded-md px-2 text-xs has-[>ng-icon]:px-1.5 [&_ng-icon]:[--ng-icon__size:0.875rem]',
  sm: 'h-7 gap-1.5 rounded-md px-2.5 text-sm has-[>ng-icon]:px-2',
  default: 'h-8 gap-1.5 rounded-lg px-3 text-sm has-[>ng-icon]:px-2.5',
  lg: 'h-9 gap-2 rounded-lg px-4 text-sm has-[>ng-icon]:px-3',
  'icon-xs': 'size-6 rounded-md text-sm [&_ng-icon]:[--ng-icon__size:0.875rem]',
  'icon-sm': 'size-7 rounded-md text-sm',
  icon: 'size-8 rounded-lg text-sm',
  'icon-lg': 'size-9 rounded-lg text-sm',
};

/**
 * Triggers an action: one `default` button (ink fill) per view, the others `outline`, `secondary` or
 * `ghost`; never a colored fill (Button sheet of the Design System artifact).
 *
 * Put it on a native `<button>` or `<a>`, never on a `div`. On `<button>` it sets `type="button"`
 * when no type is given. `loading` shows the shared spinner in place of the leading icon, sets
 * `aria-busy` and ignores clicks while keeping the focus. `disabled` on `<a>` sets `aria-disabled`
 * and removes it from the tab order. An icon-only button needs an `aria-label`. Every press draws the
 * ripple (`CwRipple`), except under reduced motion. Listen to the native `(click)`.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[cwButton], a[cwButton]',
  imports: [CwSpinner],
  hostDirectives: [CwRipple],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[attr.tabindex]': '!isButton && disabled() ? -1 : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './button.component.html',
})
export class CwButton {
  /** Look of the button. */
  readonly variant = input<CwButtonVariant>('default');
  /** Height, padding and radius. */
  readonly size = input<CwButtonSize>('default');
  /** Shows the spinner, sets `aria-busy` and ignores clicks; the button stays focusable. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Disables the button: native on `<button>`, `aria-disabled` on `<a>`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isButton = this.element.tagName === 'BUTTON';
  private readonly declaredType = inject(new HostAttributeToken('type'), { optional: true });

  protected readonly classes = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );
  protected readonly spinnerSize = computed(() =>
    this.size() === 'xs' || this.size() === 'icon-xs' ? 'sm' : 'default',
  );

  constructor() {
    // Capture phase: the guard runs before the consumer's own (click) listener on the same element.
    this.element.addEventListener(
      'click',
      (event) => {
        this.guard(event);
      },
      { capture: true },
    );
  }

  protected type(): string | null {
    // A button without a type would submit its form by accident.
    return this.isButton ? (this.declaredType ?? 'button') : null;
  }

  private guard(event: Event): void {
    if (this.loading() || (!this.isButton && this.disabled())) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
