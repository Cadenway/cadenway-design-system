import { Directive, computed, input } from '@angular/core';

import type { CwKbdSize, CwKbdVariant } from '../kbd.types';

/* Literal class strings (Kbd sheet and preview of the Design System artifact, mockup `App.dc.html`),
   so Tailwind finds them in the compiled package. A key is flat: no gradient, no shadow; its relief
   is the 2 px bottom border. */
const BASE =
  'pointer-events-none inline-flex w-fit items-center justify-center gap-0.5 align-middle font-sans leading-none font-medium whitespace-nowrap select-none [font-variant-emoji:text]';

const VARIANTS: Record<CwKbdVariant, string> = {
  default:
    'border border-line-strong border-b-2 border-b-line-control bg-background text-muted-foreground dark:bg-surface-overlay',
  inverse: 'bg-background/15 text-background dark:bg-secondary dark:text-muted-foreground',
};

// The inverse key keeps a 4 px radius at every size and has no border (mockup tooltips).
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
  /** Look of the key; `inverse` on the ink fill of a tooltip. */
  readonly variant = input<CwKbdVariant>('default');
  /** Height, padding and text size. */
  readonly size = input<CwKbdSize>('default');

  protected readonly classes = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.variant()][this.size()]}`,
  );
}
