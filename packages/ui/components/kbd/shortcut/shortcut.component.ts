import {
  Component,
  computed,
  DOCUMENT,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';

import { CwKbdGroup } from '../kbd-group/kbd-group.directive';
import { CwKbd } from '../kbd.directive';
import type { CwKbdSize, CwKbdVariant } from '../kbd.types';

/**
 * Interface KeyName
 * @interface KeyName
 *
 * @description
 * Visible, spoken and ARIA names for a key, following the Kbd sheet's keyboard conventions.
 */
interface KeyName {
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Text or symbol displayed on the key.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property spoken
   * @readonly
   *
   * @description
   * French name included in the visually hidden shortcut description.
   *
   * @type {string}
   */
  readonly spoken: string;

  /**
   * Property aria
   * @readonly
   *
   * @description
   * Key name used in `aria-keyshortcuts` according to WAI-ARIA and UI Events.
   *
   * @type {string}
   */
  readonly aria: string;
  // #endregion
}

/**
 * Function keyName
 *
 * @description
 * Maps a shortcut token to visible, spoken and ARIA key names, accounting for macOS modifiers.
 * Unrecognized single characters are capitalized and other tokens are retained.
 *
 * @param {string} token - Key token from a shortcut combination.
 * @param {boolean} mac - Whether platform-specific modifiers use macOS names.
 *
 * @returns {KeyName} Names used to render and announce the key.
 */
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
      const label: string = token.length === 1 ? token.toUpperCase() : token;
      return { label, spoken: label, aria: label };
    }
  }
}

/**
 * Function isMac
 *
 * @description
 * Checks the document window's platform and user agent for an Apple desktop or mobile device.
 *
 * @param {Document} document - Document whose window provides navigator information.
 *
 * @returns {boolean} Whether the window reports an Apple platform; false without a window.
 */
function isMac(document: Document): boolean {
  const navigator: Navigator | undefined = document.defaultView?.navigator;
  return !!navigator && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

/**
 * Class CwShortcut
 * @class CwShortcut
 *
 * @description
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
  // #region Properties
  /**
   * Property keys
   * @readonly
   *
   * @description
   * Required shortcut string: `+` joins keys in a combination and spaces separate sequence steps.
   *
   * @type {InputSignal<string>}
   */
  public readonly keys: InputSignal<string> = input.required<string>();

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the height of the displayed keys.
   *
   * @type {InputSignal<CwKbdSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwKbdSize> = input<CwKbdSize>('default');

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting key appearance; inverse is used inside a tooltip.
   *
   * @type {InputSignal<CwKbdVariant>}
   * @default 'default'
   */
  public readonly variant: InputSignal<CwKbdVariant> = input<CwKbdVariant>('default');

  /**
   * Property thenLabel
   * @readonly
   *
   * @description
   * Word spoken between consecutive steps of a shortcut sequence.
   *
   * @type {InputSignal<string>}
   * @default 'puis'
   */
  public readonly thenLabel: InputSignal<string> = input('puis');

  /**
   * Property mac
   * @readonly
   *
   * @description
   * Platform decision used to render modifier names for this component instance.
   *
   * @type {boolean}
   */
  private readonly mac: boolean = isMac(inject(DOCUMENT));

  /**
   * Property steps
   * @readonly
   *
   * @description
   * Parsed shortcut sequence, with each combination represented by its ordered key names.
   *
   * @type {Signal<KeyName[][]>}
   */
  protected readonly steps: Signal<KeyName[][]> = computed(() =>
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

  /**
   * Property spoken
   * @readonly
   *
   * @description
   * French spoken shortcut text joining combination keys and sequence steps.
   *
   * @type {Signal<string>}
   */
  protected readonly spoken: Signal<string> = computed(() =>
    this.steps()
      .map((step) => step.map((key) => key.spoken).join(' '))
      .join(` ${this.thenLabel()} `),
  );

  /**
   * Property ariaKeyShortcuts
   * @readonly
   *
   * @description
   * The `aria-keyshortcuts` value of the shortcut (`Control+K`, `Meta+K` under macOS), for the
   * element that triggers the action. A sequence has no `aria-keyshortcuts` form: empty string.
   *
   * @type {Signal<string>}
   */
  public readonly ariaKeyShortcuts: Signal<string> = computed(() => {
    const steps: KeyName[][] = this.steps();
    return steps.length === 1 ? steps[0].map((key) => key.aria).join('+') : '';
  });
  // #endregion
}
