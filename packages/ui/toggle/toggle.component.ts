import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';

import type { CwToggleSize, CwToggleVariant } from './toggle.types';

/* Literal class strings (Toggle sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Icons are `ng-icon`: their size goes through `--ng-icon__size`. */
const BASE =
  'relative isolate overflow-hidden inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground ' +
  'transition-[color,background-color,box-shadow] motion-reduce:transition-none hover:bg-accent hover:text-foreground ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'data-[state=on]:bg-selected data-[state=on]:text-foreground data-[state=on]:hover:bg-selected ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const VARIANTS: Record<CwToggleVariant, string> = {
  default: 'bg-transparent',
  outline: 'border border-input bg-transparent',
};

const SIZES: Record<CwToggleSize, string> = {
  sm: 'h-7 min-w-7 rounded-md px-1.5',
  default: 'h-8 min-w-8 rounded-lg px-2',
  lg: 'h-9 min-w-9 rounded-lg px-2.5',
};

/**
 * A two-state button for a display setting that applies at once and stays visible: the "Moi
 * uniquement" quick filter, bold in the editor (Toggle sheet of the Design System artifact).
 *
 * Put it on a native `<button>`; it sets `type="button"` when no type is given. `[(pressed)]` is a
 * model, flipped on every click (Space and Enter through the native button). The host carries
 * `aria-pressed` and `data-state="on|off"`; the label stays the same in both states, and an
 * icon-only toggle needs an `aria-label`. Pressed draws the `selected` veil and the text in ink, never
 * a ring or a darker border. Every press draws the ripple (`CwRipple`), except under reduced motion.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[cwToggle]',
  hostDirectives: [CwRipple],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.aria-pressed]': 'pressed() ? "true" : "false"',
    '[attr.data-state]': 'pressed() ? "on" : "off"',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '(click)': 'toggle()',
  },
  templateUrl: './toggle.component.html',
})
export class CwToggle {
  /** Whether the toggle is on; `[(pressed)]`, emits `pressedChange` on every flip. */
  readonly pressed = model(false);
  /** Look of the toggle. */
  readonly variant = input<CwToggleVariant>('default');
  /** Height, minimum width, padding and radius. */
  readonly size = input<CwToggleSize>('default');
  /** Disables the toggle (native `disabled`); the pressed state stays readable. */
  readonly disabled = input(false, { transform: booleanAttribute });

  // A button without a type would submit its form by accident.
  protected readonly type = inject(new HostAttributeToken('type'), { optional: true }) ?? 'button';

  protected readonly classes = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );

  protected toggle(): void {
    this.pressed.set(!this.pressed());
  }
}
