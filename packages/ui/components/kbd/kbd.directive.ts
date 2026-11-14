import { Directive, computed, input, type InputSignal, type Signal } from '@angular/core';

import type { CwKbdSize, CwKbdVariant } from './kbd.types';

/**
 * Constant BASE
 *
 * @description
 * Literal classes for a flat key from the Kbd sheet and mockup, kept visible to Tailwind.
 *
 * @type {string}
 */
const BASE: string =
  'pointer-events-none inline-flex w-fit items-center justify-center gap-0.5 align-middle font-sans leading-none font-medium whitespace-nowrap select-none [font-variant-emoji:text]';

/**
 * Constant VARIANTS
 *
 * @description
 * Key appearance classes, including the default key's two-pixel bottom border.
 *
 * @type {Record<CwKbdVariant, string>}
 */
const VARIANTS: Record<CwKbdVariant, string> = {
  default:
    'border border-line-strong border-b-2 border-b-line-control bg-background text-muted-foreground dark:bg-surface-overlay',
  inverse: 'bg-background/15 text-background dark:bg-secondary dark:text-muted-foreground',
};

/**
 * Constant SIZES
 *
 * @description
 * Dimensions by appearance and size. Inverse tooltip keys keep a four-pixel radius and no border.
 *
 * @type {Record<CwKbdVariant, Record<CwKbdSize, string>>}
 */
const SIZES: Record<CwKbdVariant, Record<CwKbdSize, string>> = {
  default: {
    sm: 'h-4 min-w-4 rounded-[4px] px-[3px] text-[9px]',
    default: 'h-[18px] min-w-[18px] rounded-[5px] px-1 text-[10px]',
    lg: 'h-5 min-w-5 rounded-md px-1.5 text-[11px]',
  },
  inverse: {
    sm: 'h-4 min-w-4 rounded-[4px] px-1 text-[10px]',
    default: 'h-[18px] min-w-[18px] rounded-[4px] px-1 text-[10px]',
    lg: 'h-5 min-w-5 rounded-[4px] px-1.5 text-[11px]',
  },
};

/**
 * Class CwKbd
 * @class CwKbd
 *
 * @description
 * One keyboard key, drawn as a small flat key (Kbd sheet of the Design System artifact).
 *
 * Put it on a native `<kbd>`, one key per element: `Ctrl`, `Maj`, `Alt` under Windows and Linux,
 * `⌘`, `⇧`, `⌥` under macOS, Échap, Entrée, Tab, Suppr in full, arrows `↑ ↓ ← →`. It is not
 * interactive and never takes the focus; it follows the state of its container (a disabled menu
 * item dims it). Use `inverse` inside a tooltip. A shortcut is never the only way to an action.
 */
@Directive({
  selector: 'kbd[cwKbd]',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class CwKbd {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting the key appearance; inverse is intended for a tooltip's ink fill.
   *
   * @type {InputSignal<CwKbdVariant>}
   * @default 'default'
   */
  public readonly variant: InputSignal<CwKbdVariant> = input<CwKbdVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting key height, padding and text size.
   *
   * @type {InputSignal<CwKbdSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwKbdSize> = input<CwKbdSize>('default');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed classes for the selected appearance and size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.variant()][this.size()]}`,
  );
  // #endregion
}
