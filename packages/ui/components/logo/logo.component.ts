import {
  booleanAttribute,
  Component,
  computed,
  input,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';

import type { CwLogoTone, CwLogoVariant } from './logo.types';

/**
 * Interface MarkDrawing
 * @interface MarkDrawing
 *
 * @description
 * Geometry of a logo mark in its 24-unit SVG view box. The small drawing thickens the stroke and
 * enlarges the dot to remain legible below 32 pixels, as specified by the Logo sheet.
 */
interface MarkDrawing {
  // #region Properties
  /**
   * Property path
   * @readonly
   *
   * @description
   * SVG path data for the open outline of the mark.
   *
   * @type {string}
   */
  readonly path: string;

  /**
   * Property strokeWidth
   * @readonly
   *
   * @description
   * Outline width in SVG view-box units.
   *
   * @type {number}
   */
  readonly strokeWidth: number;

  /**
   * Property dotY
   * @readonly
   *
   * @description
   * Vertical coordinate of the waypoint dot in SVG view-box units.
   *
   * @type {number}
   */
  readonly dotY: number;

  /**
   * Property dotRadius
   * @readonly
   *
   * @description
   * Waypoint dot radius in SVG view-box units.
   *
   * @type {number}
   */
  readonly dotRadius: number;
  // #endregion
}

/**
 * Constant LARGE
 *
 * @description
 * Logo sheet geometry for a mark rendered at 32 pixels or larger.
 *
 * @type {MarkDrawing}
 */
const LARGE: MarkDrawing = {
  path: 'M12 21.6c-3.6-3.4-7.2-7.2-7.2-11.6a7.2 7.2 0 0 1 14.4 0c0 2.2-.9 4.3-2.3 6.3',
  strokeWidth: 3.3,
  dotY: 10,
  dotRadius: 2.6,
};

/**
 * Constant SMALL
 *
 * @description
 * Logo sheet geometry adapted for marks smaller than 32 pixels.
 *
 * @type {MarkDrawing}
 */
const SMALL: MarkDrawing = {
  path: 'M12 21.4c-3.5-3.3-7-7-7-11.2a7 7 0 0 1 14 0c0 1.8-.6 3.5-1.6 5.1',
  strokeWidth: 4.2,
  dotY: 10.2,
  dotRadius: 3,
};

/**
 * Constant TONES
 *
 * @description
 * Token color classes for the brand and monochrome logo tones.
 *
 * @type {Record<CwLogoTone, string>}
 */
const TONES: Record<CwLogoTone, string> = {
  auto: 'text-primary',
  mono: 'text-foreground',
};

/**
 * Class CwLogo
 * @class CwLogo
 *
 * @description
 * The Cadenway mark: a map pin drawn with one thick road stroke, left open on the right, around a
 * solid waypoint (Logo sheet of the Design System artifact).
 *
 * `size` is the height of the mark in px (28 by default, 12 at least); under 32 px the small drawing
 * is used. One brand color, the violet `primary` (`tone="auto"`), or the ink color (`tone="mono"`)
 * for print and busy backgrounds; never a second color, a gradient or a shadow. It is an image named
 * « Cadenway »; with `decorative` it is hidden, when the name is written next to it. In a link to
 * the home page, name the link (« Cadenway — accueil ») and set `decorative`. Keep a clear space of
 * one dot diameter around it.
 *
 * `variant="lockup"` writes the « Cadenway » wordmark after the mark, in the ink color, bold, with
 * the mockup's `-0.035em` tracking; the wordmark and the gap scale with `size` (mockup `Main.dc.html`:
 * a 24 px mark, an 8 px gap and a 16 px wordmark; `Emails.dc.html`: 20 px and 14 px). The whole
 * lockup is then one image named « Cadenway ».
 */
@Component({
  selector: 'cw-logo',
  host: {
    '[class]': 'classes()',
    '[style.width.px]': 'lockup() ? null : size()',
    '[style.height.px]': 'size()',
    '[style.gap.px]': 'lockup() ? gap() : null',
    '[attr.role]': 'lockup() && !decorative() ? "img" : null',
    '[attr.aria-label]': 'lockup() && !decorative() ? "Cadenway" : null',
    '[attr.aria-hidden]': 'lockup() && decorative() ? "true" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-tone]': 'tone()',
  },
  templateUrl: './logo.component.html',
})
export class CwLogo {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting the logo form: the mark alone, or the mark followed by the wordmark.
   *
   * @type {InputSignal<CwLogoVariant>}
   * @default 'mark'
   */
  public readonly variant: InputSignal<CwLogoVariant> = input<CwLogoVariant>('mark');

  /**
   * Property tone
   * @readonly
   *
   * @description
   * Input selecting brand violet or the monochrome ink color.
   *
   * @type {InputSignal<CwLogoTone>}
   * @default 'auto'
   */
  public readonly tone: InputSignal<CwLogoTone> = input<CwLogoTone>('auto');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Height in pixels, clamped to at least 12; the small drawing is used below 32.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @default 28
   */
  public readonly size: InputSignalWithTransform<number, unknown> = input(28, {
    transform: (value: unknown) => Math.max(12, numberAttribute(value, 28)),
  });

  /**
   * Property decorative
   * @readonly
   *
   * @description
   * Input hiding the mark from assistive technologies when the brand name is already present.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly decorative: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property drawing
   * @readonly
   *
   * @description
   * Geometry selected for the current rendered size.
   *
   * @type {Signal<MarkDrawing>}
   */
  protected readonly drawing: Signal<MarkDrawing> = computed(() =>
    this.size() < 32 ? SMALL : LARGE,
  );

  /**
   * Property lockup
   * @readonly
   *
   * @description
   * Whether the wordmark follows the mark; the host then carries the image role and name.
   *
   * @type {Signal<boolean>}
   */
  protected readonly lockup: Signal<boolean> = computed(() => this.variant() === 'lockup');

  /**
   * Property wordmarkSize
   * @readonly
   *
   * @description
   * Font size of the wordmark in px: 0.68 of the mark, which gives the mockup's 16 px next to a
   * 24 px mark (`Main.dc.html`) and 14 px next to a 20 px one (`Emails.dc.html`).
   *
   * @type {Signal<number>}
   */
  protected readonly wordmarkSize: Signal<number> = computed(() => Math.round(this.size() * 0.68));

  /**
   * Property gap
   * @readonly
   *
   * @description
   * Space between the mark and the wordmark in px: the mockup's 8 px (`gap-2`) up to a 24 px mark,
   * then a third of the mark so a large lockup keeps its proportions.
   *
   * @type {Signal<number>}
   */
  protected readonly gap: Signal<number> = computed(() => Math.max(8, Math.round(this.size() / 3)));

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Host layout and token color classes for the selected tone.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `inline-flex shrink-0 items-center ${TONES[this.tone()]}`,
  );
  // #endregion
}
