import {
  Component,
  computed,
  DOCUMENT,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';

import { KBD_LABELS } from '../kbd-labels.token';
import type { CwKbdLabels } from '../kbd.types';
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
   * Name included in the visually hidden shortcut description.
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
 * @param {CwKbdLabels} labels - Displayed and spoken names.
 *
 * @returns {KeyName} Names used to render and announce the key.
 */
function keyName(token: string, mac: boolean, labels: CwKbdLabels): KeyName {
  switch (token.toLowerCase()) {
    case 'mod':
      return mac
        ? { label: '⌘', spoken: labels.commandSpoken, aria: 'Meta' }
        : { label: labels.control, spoken: labels.controlSpoken, aria: 'Control' };
    case 'ctrl':
    case 'control':
      return { label: labels.control, spoken: labels.controlSpoken, aria: 'Control' };
    case 'meta':
    case 'cmd':
      return { label: '⌘', spoken: labels.commandSpoken, aria: 'Meta' };
    case 'shift':
      return mac
        ? { label: '⇧', spoken: labels.shiftSpoken, aria: 'Shift' }
        : { label: labels.shift, spoken: labels.shiftSpoken, aria: 'Shift' };
    case 'alt':
    case 'option':
      return mac
        ? { label: '⌥', spoken: labels.optionSpoken, aria: 'Alt' }
        : { label: labels.alt, spoken: labels.alt, aria: 'Alt' };
    case 'esc':
    case 'escape':
      return { label: labels.escape, spoken: labels.escape, aria: 'Escape' };
    case 'enter':
      return { label: labels.enter, spoken: labels.enter, aria: 'Enter' };
    case 'tab':
      return { label: labels.tab, spoken: labels.tab, aria: 'Tab' };
    case 'del':
    case 'delete':
      return { label: labels.delete, spoken: labels.delete, aria: 'Delete' };
    case 'space':
      return { label: labels.space, spoken: labels.space, aria: 'Space' };
    case 'up':
    case 'arrowup':
      return { label: '↑', spoken: labels.upSpoken, aria: 'ArrowUp' };
    case 'down':
    case 'arrowdown':
      return { label: '↓', spoken: labels.downSpoken, aria: 'ArrowDown' };
    case 'left':
    case 'arrowleft':
      return { label: '←', spoken: labels.leftSpoken, aria: 'ArrowLeft' };
    case 'right':
    case 'arrowright':
      return { label: '→', spoken: labels.rightSpoken, aria: 'ArrowRight' };
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
 * `space`, arrows `up`, `down`, `left`, `right`) get their configured names. The keys are hidden from
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
  public readonly thenLabel: InputSignal<string> = input<string>(inject(KBD_LABELS).then);

  /**
   * Property providedLabels
   *
   * @description
   * Shortcut names inherited from the current injector.
   *
   * @type {CwKbdLabels}
   * @readonly
   */
  private readonly providedLabels: CwKbdLabels = inject(KBD_LABELS);

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
          .map((token) => keyName(token, this.mac, this.providedLabels)),
      ),
  );

  /**
   * Property spoken
   * @readonly
   *
   * @description
   * Spoken shortcut text joining combination keys and sequence steps.
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
