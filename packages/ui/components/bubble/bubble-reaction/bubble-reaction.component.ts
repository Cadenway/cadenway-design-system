import {
  Component,
  computed,
  input,
  model,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type Signal,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorEyesBold,
  phosphorHandsClappingBold,
  phosphorHeartBold,
  phosphorThumbsUpBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  phosphorEyesFill,
  phosphorHandsClappingFill,
  phosphorHeartFill,
  phosphorThumbsUpFill,
} from '@ng-icons/phosphor-icons/fill';

/**
 * Class CwBubbleReaction
 * @class CwBubbleReaction
 *
 * @description
 * One reaction under a bubble: a Phosphor icon and its count, pressed when it includes you (Bubble
 * sheet of the Design System artifact, « Réactions »).
 *
 * Put it on a native `<button>` inside `cw-bubble-reactions`; it sets `type="button"`. `icon` is a
 * Phosphor name in kebab case (`thumbs-up`, `eyes`, `hands-clapping` and `heart` are provided; give
 * any other one with `provideIcons`, in Bold and Fill); the icon fills when `pressed`. Click, Enter
 * or Space toggles `[(pressed)]`; the consumer updates `count`. The accessible name says the label,
 * the count and whether you reacted (« D'accord : 2, dont vous »). Every press draws the ripple.
 */
@Component({
  selector: 'button[cwBubbleReaction]',
  imports: [NgIcon],
  hostDirectives: [CwRipple],
  providers: [
    provideIcons({
      phosphorEyesBold,
      phosphorEyesFill,
      phosphorHandsClappingBold,
      phosphorHandsClappingFill,
      phosphorHeartBold,
      phosphorHeartFill,
      phosphorThumbsUpBold,
      phosphorThumbsUpFill,
    }),
  ],
  host: {
    type: 'button',
    class:
      'relative isolate inline-flex h-6 items-center gap-1 overflow-hidden rounded-full border px-2 text-xs font-medium tabular-nums text-muted-foreground transition-colors outline-hidden hover:bg-accent hover:text-foreground aria-pressed:bg-selected aria-pressed:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
    '[attr.aria-pressed]': 'pressed()',
    '[attr.aria-label]': 'accessibleName()',
    '(click)': 'pressed.set(!pressed())',
  },
  templateUrl: './bubble-reaction.component.html',
})
export class CwBubbleReaction {
  // #region Properties
  /**
   * Property icon
   * @readonly
   *
   * @description
   * Phosphor icon name in kebab case.
   *
   * @type {InputSignal<string>}
   */
  public readonly icon: InputSignal<string> = input.required<string>();

  /**
   * Property count
   * @readonly
   *
   * @description
   * Number of people who reacted, including the current user.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly count: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });

  /**
   * Property label
   * @readonly
   *
   * @description
   * Meaning of the reaction, read first.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property youLabel
   * @readonly
   *
   * @description
   * Words added to the accessible name when the user reacted.
   *
   * @type {InputSignal<string>}
   */
  public readonly youLabel: InputSignal<string> = input('dont vous');

  /**
   * Property pressed
   * @readonly
   *
   * @description
   * Two-way state indicating whether the user reacted.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly pressed: ModelSignal<boolean> = model(false);

  /**
   * Property iconName
   * @readonly
   *
   * @description
   * Registered icon name in bold or fill according to the pressed state.
   *
   * @type {Signal<string>}
   */
  protected readonly iconName: Signal<string> = computed(() => {
    const pascal: string = this.icon()
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    // An icon name, not a class name: ng-icon looks it up in the registered icon sets.
    return `phosphor${pascal}${this.pressed() ? 'Fill' : 'Bold'}`;
  });

  /**
   * Property accessibleName
   * @readonly
   *
   * @description
   * Reaction label, count and current-user state for assistive technology.
   *
   * @type {Signal<string>}
   */
  protected readonly accessibleName: Signal<string> = computed(
    () =>
      `${this.label()} : ${String(this.count())}${this.pressed() ? `, ${this.youLabel()}` : ''}`,
  );
  // #endregion
}
