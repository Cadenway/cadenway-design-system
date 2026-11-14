import {
  booleanAttribute,
  Component,
  computed,
  HostAttributeToken,
  inject,
  input,
  model,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type Signal,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';

import type { CwToggleSize, CwToggleVariant } from './toggle.types';

/**
 * Constant BASE
 *
 * @description
 * Literal Toggle sheet classes kept visible to Tailwind, including `ng-icon` sizing and focus states.
 *
 * @type {string}
 */
const BASE: string =
  'relative isolate overflow-hidden inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground ' +
  'transition-[color,background-color,box-shadow] motion-reduce:transition-none hover:bg-accent hover:text-foreground ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'data-[state=on]:bg-selected data-[state=on]:text-foreground data-[state=on]:hover:bg-selected ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Constant VARIANTS
 *
 * @description
 * Background and border classes for each toggle appearance.
 *
 * @type {Record<CwToggleVariant, string>}
 */
const VARIANTS: Record<CwToggleVariant, string> = {
  default: 'bg-transparent',
  outline: 'border border-input bg-transparent',
};

/**
 * Constant SIZES
 *
 * @description
 * Dimension and radius classes for each toggle size.
 *
 * @type {Record<CwToggleSize, string>}
 */
const SIZES: Record<CwToggleSize, string> = {
  sm: 'h-7 min-w-7 rounded-md px-1.5',
  default: 'h-8 min-w-8 rounded-lg px-2',
  lg: 'h-9 min-w-9 rounded-lg px-2.5',
};

/**
 * Class CwToggle
 * @class CwToggle
 *
 * @description
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
  selector: 'button[cwToggle]',
  hostDirectives: [CwRipple],
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
  // #region Properties
  /**
   * Property pressed
   * @readonly
   *
   * @description
   * Two-way model indicating whether the toggle is on; each flip emits `pressedChange`.
   *
   * @type {ModelSignal<boolean>}
   * @default false
   */
  public readonly pressed: ModelSignal<boolean> = model(false);

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting the toggle's appearance.
   *
   * @type {InputSignal<CwToggleVariant>}
   * @default 'default'
   */
  public readonly variant: InputSignal<CwToggleVariant> = input<CwToggleVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting height, minimum width, padding and radius.
   *
   * @type {InputSignal<CwToggleSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwToggleSize> = input<CwToggleSize>('default');

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Input disabling the native button without hiding its pressed state.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property type
   * @readonly
   *
   * @description
   * Consumer-provided button type, defaulting to `button` to avoid accidental form submission.
   *
   * @type {string}
   */
  protected readonly type: string =
    inject(new HostAttributeToken('type'), { optional: true }) ?? 'button';

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed base, appearance and size classes for the button host.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );
  // #endregion

  // #region Methods
  /**
   * Method toggle
   * @method toggle
   *
   * @description
   * Flips the pressed model when the native button receives a click.
   */
  protected toggle(): void {
    this.pressed.set(!this.pressed());
  }
  // #endregion
}
