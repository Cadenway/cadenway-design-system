import { Component, computed, input, model, numberAttribute } from '@angular/core';
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
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
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
  /** Phosphor icon name in kebab case (`thumbs-up`). */
  readonly icon = input.required<string>();
  /** How many people reacted, you included. */
  readonly count = input(0, { transform: numberAttribute });
  /** What the reaction means (« D'accord »), read first. */
  readonly label = input.required<string>();
  /** Words added to the name when you reacted. */
  readonly youLabel = input('dont vous');
  /** Whether you reacted; `[(pressed)]`. */
  readonly pressed = model(false);

  protected readonly iconName = computed(() => {
    const pascal = this.icon()
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    // An icon name, not a class name: ng-icon looks it up in the registered icon sets.
    return `phosphor${pascal}${this.pressed() ? 'Fill' : 'Bold'}`;
  });
  protected readonly accessibleName = computed(
    () =>
      `${this.label()} : ${String(this.count())}${this.pressed() ? `, ${this.youLabel()}` : ''}`,
  );
}
