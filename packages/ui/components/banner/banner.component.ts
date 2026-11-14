import {
  booleanAttribute,
  Component,
  computed,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorInfoBold, phosphorXBold } from '@ng-icons/phosphor-icons/bold';
import {
  phosphorCheckCircleFill,
  phosphorInfoFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import type { CwBannerPlacement, CwBannerTone } from './banner.types';

/**
 * Constant BASE
 *
 * @description
 * Literal Banner sheet layout and entrance-animation classes, visible to Tailwind.
 *
 * @type {string}
 */
const BASE: string = 'flex w-full gap-3 border text-sm animate-item-in motion-reduce:animate-none';

/**
 * Constant TONES
 *
 * @description
 * Background and border classes for each banner tone.
 *
 * @type {Record<CwBannerTone, string>}
 */
const TONES: Record<CwBannerTone, string> = {
  info: 'border-transparent bg-muted',
  success: 'border-transparent bg-muted',
  warning: 'border-transparent bg-muted',
  error: 'border-transparent bg-grenat-soft',
  neutral: 'bg-background',
};

/**
 * Constant PLACEMENTS
 *
 * @description
 * Border, radius and padding classes for inline and top placements.
 *
 * @type {Record<CwBannerPlacement, string>}
 */
const PLACEMENTS: Record<CwBannerPlacement, string> = {
  inline: 'rounded-lg px-3',
  top: 'rounded-none border-x-0 border-t-0 px-4',
};

/**
 * Constant LAYOUTS
 *
 * @description
 * Alignment and spacing for single-line and multiline messages.
 *
 * @type {Readonly<{ single: string; multiline: string }>}
 */
const LAYOUTS: Readonly<{ single: string; multiline: string }> = {
  single: 'min-h-10 items-center py-1.5',
  multiline: 'items-start py-2.5',
};

/**
 * Constant ICONS
 *
 * @description
 * Default icon names for banner tones; neutral uses a bold context icon.
 *
 * @type {Record<CwBannerTone, string>}
 */
const ICONS: Record<CwBannerTone, string> = {
  info: 'phosphorInfoFill',
  success: 'phosphorCheckCircleFill',
  warning: 'phosphorWarningFill',
  error: 'phosphorWarningCircleFill',
  neutral: 'phosphorInfoBold',
};

/**
 * Constant ICON_TONES
 *
 * @description
 * Icon color classes for each banner tone.
 *
 * @type {Record<CwBannerTone, string>}
 */
const ICON_TONES: Record<CwBannerTone, string> = {
  info: 'shrink-0 text-primary',
  success: 'shrink-0 text-jade',
  warning: 'shrink-0 text-balise',
  error: 'shrink-0 text-destructive',
  neutral: 'shrink-0 text-muted-foreground',
};

/**
 * Constant STORAGE_PREFIX
 *
 * @description
 * Prefix for keys used to persist banner dismissal in local storage.
 *
 * @type {string}
 */
const STORAGE_PREFIX: string = 'cw-banner:';

/**
 * Constant FOCUSABLE
 *
 * @description
 * Selector for elements that may receive focus after a banner is dismissed.
 *
 * @type {string}
 */
const FOCUSABLE: string =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Class CwBanner
 * @class CwBanner
 *
 * @description
 * A full-width strip at the top of the application or of a page, for a message about the whole
 * instance or space that stays while it is true: new version, quota, failed backup, maintenance,
 * archived copy (Banner sheet of the Design System artifact). For an action's feedback use a toast;
 * for a local problem a `cw-alert`.
 *
 * Give the required `title` and an optional `description`; project one or two `sm` buttons in
 * `cw-banner-actions` (`ghost` then `outline`, never `default`). `role="status"`, `role="alert"` for
 * `error`; the icon is decorative. `dismissible` (default) adds « Masquer le bandeau »: it hides the
 * banner, emits `dismissed`, and moves a focus that was inside it to the first focusable element of
 * `main` (or the next one in the page). With `dismissKey`, the dismissal is stored in
 * `localStorage` (`cw-banner:<key>`) and the banner stays hidden on the next visits; storage errors
 * and server rendering are ignored. `multiline` puts the title on its own line. Style hooks:
 * `data-tone`, `data-placement`.
 */
@Component({
  selector: 'cw-banner',
  imports: [CwButton, NgIcon],
  providers: [
    provideIcons({
      phosphorCheckCircleFill,
      phosphorInfoBold,
      phosphorInfoFill,
      phosphorWarningCircleFill,
      phosphorWarningFill,
      phosphorXBold,
    }),
  ],
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'tone() === "error" ? "alert" : "status"',
    '[attr.title]': 'null',
    '[attr.hidden]': 'closed() ? "" : null',
    '[attr.data-tone]': 'tone()',
    '[attr.data-placement]': 'placement()',
  },
  templateUrl: './banner.component.html',
})
export class CwBanner {
  // #region Properties
  /**
   * Property tone
   * @readonly
   *
   * @description
   * Input selecting the banner's default icon, color and ARIA role.
   *
   * @type {InputSignal<CwBannerTone>}
   * @default 'info'
   */
  public readonly tone: InputSignal<CwBannerTone> = input<CwBannerTone>('info');

  /**
   * Property placement
   * @readonly
   *
   * @description
   * Input selecting rounded inline placement or a flat banner across the top of the window.
   *
   * @type {InputSignal<CwBannerPlacement>}
   * @default 'inline'
   */
  public readonly placement: InputSignal<CwBannerPlacement> = input<CwBannerPlacement>('inline');

  /**
   * Property title
   * @readonly
   *
   * @description
   * Required main sentence shown in the banner.
   *
   * @type {InputSignal<string>}
   */
  public readonly title: InputSignal<string> = input.required<string>();

  /**
   * Property description
   * @readonly
   *
   * @description
   * Additional message text, empty when no description is provided.
   *
   * @type {InputSignal<string>}
   * @default ''
   */
  public readonly description: InputSignal<string> = input('');

  /**
   * Property icon
   * @readonly
   *
   * @description
   * Registered replacement icon name; null uses the tone's default icon.
   *
   * @type {InputSignal<string | null>}
   * @default null
   */
  public readonly icon: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property dismissible
   * @readonly
   *
   * @description
   * Input controlling whether the close button is displayed.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default true
   */
  public readonly dismissible: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property dismissKey
   * @readonly
   *
   * @description
   * Optional key used to persist dismissal in local storage; null keeps dismissal in memory only.
   *
   * @type {InputSignal<string | null>}
   * @default null
   */
  public readonly dismissKey: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property closeLabel
   * @readonly
   *
   * @description
   * Accessible name of the close button.
   *
   * @type {InputSignal<string>}
   * @default 'Masquer le bandeau'
   */
  public readonly closeLabel: InputSignal<string> = input('Masquer le bandeau');

  /**
   * Property multiline
   * @readonly
   *
   * @description
   * Input placing the title and description on separate lines for a longer message.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly multiline: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property dismissed
   * @readonly
   *
   * @description
   * Emits when the banner is hidden by a dismissal call.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly dismissed: OutputEmitterRef<void> = output();

  /**
   * Property host
   * @readonly
   *
   * @description
   * Native banner element used to determine whether dismissal must move focus.
   *
   * @type {HTMLElement}
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document used for focus management and access to the window's storage.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property browser
   * @readonly
   *
   * @description
   * Whether this instance runs in a browser where local storage may be accessed.
   *
   * @type {boolean}
   */
  private readonly browser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Property dismissedHere
   * @readonly
   *
   * @description
   * Whether this instance has been dismissed during its current lifetime.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  private readonly dismissedHere: WritableSignal<boolean> = signal(false);

  /**
   * Property stored
   * @readonly
   *
   * @description
   * Whether a dismissal is stored for the current dismissal key.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  private readonly stored: WritableSignal<boolean> = signal(false);

  /**
   * Property closed
   * @readonly
   *
   * @description
   * Whether the banner is hidden by a current or stored dismissal.
   *
   * @type {Signal<boolean>}
   */
  protected readonly closed: Signal<boolean> = computed(
    () => this.dismissedHere() || this.stored(),
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed host classes for tone, placement and message layout.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `${BASE} ${TONES[this.tone()]} ${PLACEMENTS[this.placement()]} ${this.multiline() ? LAYOUTS.multiline : LAYOUTS.single}`,
  );

  /**
   * Property iconName
   * @readonly
   *
   * @description
   * Replacement icon when supplied, otherwise the current tone's default icon.
   *
   * @type {Signal<string>}
   */
  protected readonly iconName: Signal<string> = computed(() => this.icon() ?? ICONS[this.tone()]);

  /**
   * Property iconClasses
   * @readonly
   *
   * @description
   * Icon tone and multiline alignment classes.
   *
   * @type {Signal<string>}
   */
  protected readonly iconClasses: Signal<string> = computed(
    () => `${ICON_TONES[this.tone()]}${this.multiline() ? ' mt-0.5' : ''}`,
  );

  /**
   * Property messageClasses
   * @readonly
   *
   * @description
   * Message layout classes, truncating single-line text and allowing multiline text to wrap.
   *
   * @type {Signal<string>}
   */
  protected readonly messageClasses: Signal<string> = computed(() =>
    this.multiline() ? 'min-w-0 flex-1 leading-5' : 'min-w-0 flex-1 truncate',
  );

  /**
   * Property titleClasses
   * @readonly
   *
   * @description
   * Title color and display classes based on tone and message layout.
   *
   * @type {Signal<string>}
   */
  protected readonly titleClasses: Signal<string> = computed(() => {
    const color: string =
      this.tone() === 'error' ? 'font-medium text-grenat-text' : 'font-medium text-foreground';
    return this.multiline() ? `${color} block` : color;
  });

  /**
   * Property descriptionClasses
   * @readonly
   *
   * @description
   * Description text color for the current tone.
   *
   * @type {Signal<string>}
   */
  protected readonly descriptionClasses: Signal<string> = computed(() =>
    this.tone() === 'error' ? 'text-grenat-text' : 'text-muted-foreground',
  );

  /**
   * Property closeClasses
   * @readonly
   *
   * @description
   * Close-button spacing and color classes for the current tone and layout.
   *
   * @type {Signal<string>}
   */
  protected readonly closeClasses: Signal<string> = computed(() => {
    const color: string =
      this.tone() === 'error' ? 'text-grenat-text' : 'text-muted-foreground hover:text-foreground';
    return this.multiline() ? `-my-1 -mr-1 ${color}` : `-mr-1 ${color}`;
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Observes dismissal-key changes and loads the stored state when a key is present.
   */
  public constructor() {
    effect(() => {
      const key: string | null = this.dismissKey();
      this.stored.set(key !== null && this.readStored(key));
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method dismiss
   * @method dismiss
   *
   * @description
   * Hides the banner, persists the dismissal when keyed, moves focus when necessary and emits once.
   * Repeated calls after closing do nothing.
   */
  public dismiss(): void {
    if (this.closed()) return;
    const hadFocus: boolean = this.host.contains(this.document.activeElement);
    const next: HTMLElement | null = hadFocus ? this.focusTarget() : null;
    const key: string | null = this.dismissKey();
    if (key !== null) this.writeStored(key);
    this.dismissedHere.set(true);
    next?.focus();
    this.dismissed.emit();
  }

  /**
   * Method readStored
   * @method readStored
   *
   * @description
   * Reads a dismissal from browser storage, treating server rendering and storage failures as absent.
   *
   * @param {string} key - Consumer-provided dismissal key, without the storage prefix.
   *
   * @returns {boolean} Whether the stored value indicates a dismissal.
   */
  private readStored(key: string): boolean {
    if (!this.browser) return false;
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_PREFIX + key) === '1';
    } catch {
      // Storage refused (private mode, policy): the banner shows, as for a first visit.
      return false;
    }
  }

  /**
   * Method writeStored
   * @method writeStored
   *
   * @description
   * Persists dismissal in browser storage when available; storage failures leave it in memory only.
   *
   * @param {string} key - Consumer-provided dismissal key, without the storage prefix.
   */
  private writeStored(key: string): void {
    if (!this.browser) return;
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_PREFIX + key, '1');
    } catch {
      // Storage refused or full: the dismissal holds for this page only.
    }
  }

  /**
   * Method focusTarget
   * @method focusTarget
   *
   * @description
   * Finds a focus candidate in main content, falling back to the first candidate after the banner.
   *
   * @returns {HTMLElement | null} Focus target outside the banner, or null when none is found.
   */
  private focusTarget(): HTMLElement | null {
    const main: HTMLElement | null = this.document.querySelector('main');
    const inMain: HTMLElement | null | undefined = main?.querySelector<HTMLElement>(FOCUSABLE);
    if (inMain && !this.host.contains(inMain)) return inMain;
    const candidates: HTMLElement[] = Array.from(
      this.document.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    return (
      candidates.find(
        (element) =>
          !this.host.contains(element) &&
          (this.host.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      ) ?? null
    );
  }
  // #endregion
}
