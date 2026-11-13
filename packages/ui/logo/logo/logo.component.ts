import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

import type { CwLogoTone, CwLogoVariant } from '../logo.types';

/* Two drawings of the mark (Logo sheet of the Design System artifact, `cadenway-mark.svg` and
   `cadenway-mark-small.svg`): under 32 px the small one thickens the stroke, enlarges the dot and
   widens the opening so the drop stays legible down to 12 px. The large one is never shown under
   32 px. Both draw in `currentColor`; the host class gives the color from the tokens. */
interface MarkDrawing {
  readonly path: string;
  readonly strokeWidth: number;
  readonly dotY: number;
  readonly dotRadius: number;
}

const LARGE: MarkDrawing = {
  path: 'M12 21.6c-3.6-3.4-7.2-7.2-7.2-11.6a7.2 7.2 0 0 1 14.4 0c0 2.2-.9 4.3-2.3 6.3',
  strokeWidth: 3.3,
  dotY: 10,
  dotRadius: 2.6,
};

const SMALL: MarkDrawing = {
  path: 'M12 21.4c-3.5-3.3-7-7-7-11.2a7 7 0 0 1 14 0c0 1.8-.6 3.5-1.6 5.1',
  strokeWidth: 4.2,
  dotY: 10.2,
  dotRadius: 3,
};

const TONES: Record<CwLogoTone, string> = {
  auto: 'text-primary',
  mono: 'text-foreground',
};

/**
 * The Cadenway mark: a map pin drawn with one thick road stroke, left open on the right, around a
 * solid waypoint (Logo sheet of the Design System artifact).
 *
 * `size` is the height in px (28 by default, 12 at least); under 32 px the small drawing is used.
 * One brand color, the violet `primary` (`tone="auto"`), or the ink color (`tone="mono"`) for print
 * and busy backgrounds; never a second color, a gradient or a shadow. It is an image named
 * « Cadenway »; with `decorative` it is hidden, when the name is written next to it. In a link to
 * the home page, name the link (« Cadenway — accueil ») and set `decorative`. Keep a clear space of
 * one dot diameter around it.
 */
@Component({
  selector: 'cw-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-tone]': 'tone()',
  },
  templateUrl: './logo.component.html',
})
export class CwLogo {
  /** Form of the logo; only `mark` until the lockups are redrawn. */
  readonly variant = input<CwLogoVariant>('mark');
  /** `auto`: brand violet; `mono`: ink color. */
  readonly tone = input<CwLogoTone>('auto');
  /** Height in px; under 32 the small drawing is used. Values under 12 are raised to 12. */
  readonly size = input(28, {
    transform: (value: unknown) => Math.max(12, numberAttribute(value, 28)),
  });
  /** Hides the logo from assistive technologies, when the name is written next to it. */
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly drawing = computed(() => (this.size() < 32 ? SMALL : LARGE));

  protected readonly classes = computed(() => `inline-flex shrink-0 ${TONES[this.tone()]}`);
}
