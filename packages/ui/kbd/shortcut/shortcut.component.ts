import { Component, computed, DOCUMENT, inject, input } from '@angular/core';

import { CwKbdGroup } from '../kbd-group/kbd-group.directive';
import { CwKbd } from '../kbd.directive';
import type { CwKbdSize, CwKbdVariant } from '../kbd.types';

/* French names of the keys, visible (`label`) and spoken (`spoken`): written once here so a later
   `@angular/localize` extraction is mechanical. Conventions of the Kbd sheet, "Clavier". */
interface KeyName {
  readonly label: string;
  readonly spoken: string;
  /** The `aria-keyshortcuts` name of the key (WAI-ARIA, UI Events `key` values). */
  readonly aria: string;
}

function keyName(token: string, mac: boolean): KeyName {
  switch (token.toLowerCase()) {
    case 'mod':
      return mac
        ? { label: '⌘', spoken: 'Commande', aria: 'Meta' }
        : { label: 'Ctrl', spoken: 'Contrôle', aria: 'Control' };
    case 'ctrl':
    case 'control':
      return { label: 'Ctrl', spoken: 'Contrôle', aria: 'Control' };
    case 'meta':
    case 'cmd':
      return { label: '⌘', spoken: 'Commande', aria: 'Meta' };
    case 'shift':
      return mac
        ? { label: '⇧', spoken: 'Majuscule', aria: 'Shift' }
        : { label: 'Maj', spoken: 'Majuscule', aria: 'Shift' };
    case 'alt':
    case 'option':
      return mac
        ? { label: '⌥', spoken: 'Option', aria: 'Alt' }
        : { label: 'Alt', spoken: 'Alt', aria: 'Alt' };
    case 'esc':
    case 'escape':
      return { label: 'Échap', spoken: 'Échap', aria: 'Escape' };
    case 'enter':
      return { label: 'Entrée', spoken: 'Entrée', aria: 'Enter' };
    case 'tab':
      return { label: 'Tab', spoken: 'Tab', aria: 'Tab' };
    case 'del':
    case 'delete':
      return { label: 'Suppr', spoken: 'Suppr', aria: 'Delete' };
    case 'space':
      return { label: 'Espace', spoken: 'Espace', aria: 'Space' };
    case 'up':
    case 'arrowup':
      return { label: '↑', spoken: 'Flèche haut', aria: 'ArrowUp' };
    case 'down':
    case 'arrowdown':
      return { label: '↓', spoken: 'Flèche bas', aria: 'ArrowDown' };
    case 'left':
    case 'arrowleft':
      return { label: '←', spoken: 'Flèche gauche', aria: 'ArrowLeft' };
    case 'right':
    case 'arrowright':
      return { label: '→', spoken: 'Flèche droite', aria: 'ArrowRight' };
    default: {
      const label = token.length === 1 ? token.toUpperCase() : token;
      return { label, spoken: label, aria: label };
    }
  }
}

function isMac(document: Document): boolean {
  const navigator = document.defaultView?.navigator;
  return !!navigator && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

/**
 * A shortcut written from its keys: `keys="mod+K"` shows Ctrl K under Windows and Linux and ⌘ K
 * under macOS; a space separates the steps of a sequence (`keys="g i"` shows G puis I).
 *
 * `+` joins the keys of one combination; `mod` is Ctrl or ⌘ depending on the platform, `shift` and
 * `alt` follow the platform too, and the keys of the Kbd sheet (`esc`, `enter`, `tab`, `delete`,
 * `space`, arrows `up`, `down`, `left`, `right`) get their French names. The keys are hidden from
 * assistive technologies and a visually hidden text spells the shortcut out (« Contrôle K »). The
 * element that carries the shortcut sets `aria-keyshortcuts` itself, from `ariaKeyShortcuts()`.
 */
@Component({
  selector: 'cw-shortcut',
  imports: [CwKbd, CwKbdGroup],
  host: {
    class: 'inline-flex items-center align-middle',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './shortcut.component.html',
})
export class CwShortcut {
  /** The shortcut: `+` between the keys of a combination, a space between the steps of a sequence. */
  readonly keys = input.required<string>();
  /** Height of the keys. */
  readonly size = input<CwKbdSize>('default');
  /** Look of the keys; `inverse` inside a tooltip. */
  readonly variant = input<CwKbdVariant>('default');
  /** The word between the steps of a sequence. */
  readonly thenLabel = input('puis');

  private readonly mac = isMac(inject(DOCUMENT));

  protected readonly steps = computed(() =>
    this.keys()
      .trim()
      .split(/\s+/)
      .filter((step) => step !== '')
      .map((step) =>
        step
          .split('+')
          .filter((token) => token !== '')
          .map((token) => keyName(token, this.mac)),
      ),
  );

  protected readonly spoken = computed(() =>
    this.steps()
      .map((step) => step.map((key) => key.spoken).join(' '))
      .join(` ${this.thenLabel()} `),
  );

  /**
   * The `aria-keyshortcuts` value of the shortcut (`Control+K`, `Meta+K` under macOS), for the
   * element that triggers the action. A sequence has no `aria-keyshortcuts` form: empty string.
   */
  readonly ariaKeyShortcuts = computed(() => {
    const steps = this.steps();
    return steps.length === 1 ? steps[0].map((key) => key.aria).join('+') : '';
  });
}
