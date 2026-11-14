import {
  booleanAttribute,
  Component,
  computed,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  output,
  signal,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorXBold } from '@ng-icons/phosphor-icons/bold';
import {
  phosphorCheckCircleFill,
  phosphorInfoFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import type { CwAlertSize, CwAlertVariant } from './alert.types';

/**
 * Constant BASE
 *
 * @description
 * Literal shared Alert sheet classes, kept visible to Tailwind in the package.
 *
 * @type {string}
 */
const BASE: string = 'flex w-full gap-3 rounded-lg border px-4 text-sm';

/**
 * Constant VARIANTS
 *
 * @description
 * Background and text classes for each alert tone.
 *
 * @type {Record<CwAlertVariant, string>}
 */
const VARIANTS: Record<CwAlertVariant, string> = {
  info: 'bg-card text-card-foreground',
  success: 'bg-card text-card-foreground',
  warning: 'bg-card text-card-foreground',
  destructive: 'border-transparent bg-grenat-soft text-grenat-text',
};

/**
 * Constant SIZES
 *
 * @description
 * Alignment and vertical padding classes for each alert size.
 *
 * @type {Record<CwAlertSize, string>}
 */
const SIZES: Record<CwAlertSize, string> = {
  default: 'items-start py-3',
  compact: 'items-center py-2.5',
};

/**
 * Constant ICONS
 *
 * @description
 * Filled Phosphor icon names associated with each alert tone.
 *
 * @type {Record<CwAlertVariant, string>}
 */
const ICONS: Record<CwAlertVariant, string> = {
  info: 'phosphorInfoFill',
  success: 'phosphorCheckCircleFill',
  warning: 'phosphorWarningFill',
  destructive: 'phosphorWarningCircleFill',
};

/**
 * Constant ICON_TONES
 *
 * @description
 * Semantic icon color classes; warning yellow is applied to the icon rather than text.
 *
 * @type {Record<CwAlertVariant, string>}
 */
const ICON_TONES: Record<CwAlertVariant, string> = {
  info: 'text-primary',
  success: 'text-jade',
  warning: 'text-balise',
  destructive: 'text-destructive',
};

/**
 * Constant BODIES
 *
 * @description
 * Content layout classes for standard and compact alerts.
 *
 * @type {Record<CwAlertSize, string>}
 */
const BODIES: Record<CwAlertSize, string> = {
  default: 'flex min-w-0 flex-1 flex-col gap-0.5',
  compact: 'flex min-w-0 flex-1 items-center gap-3',
};

/**
 * Constant FOCUSABLE
 *
 * @description
 * Selector for candidate elements that may receive focus after an alert is dismissed.
 *
 * @type {string}
 */
const FOCUSABLE: string =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Class CwAlert
 * @class CwAlert
 *
 * @description
 * A persistent message in the page (information, success, warning, error) with a title, a
 * description and, when needed, actions (Alert sheet of the Design System artifact). For a passing
 * confirmation use a toast; for the whole application a `cw-banner`.
 *
 * Compose it with `cw-alert-title`, `cw-alert-description` and `cw-alert-actions` (`outline` or
 * `ghost` `sm` buttons). `info` and `success` are `role="status"`, `warning` and `destructive`
 * `role="alert"`; the icon is decorative, the title says the meaning. `icon` replaces the tone's
 * filled icon (register it with `provideIcons`), `null` removes it. `dismissible` adds the « Fermer »
 * button; it and Escape inside the alert hide it for the life of the component, emit `dismissed`,
 * and move a focus that was inside it to the next focusable element.
 */
@Component({
  selector: 'cw-alert',
  imports: [CwButton, NgIcon],
  providers: [
    provideIcons({
      phosphorCheckCircleFill,
      phosphorInfoFill,
      phosphorWarningCircleFill,
      phosphorWarningFill,
      phosphorXBold,
    }),
  ],
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
    '[attr.hidden]': 'closed() ? "" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '(keydown.escape)': 'onEscape($event)',
  },
  templateUrl: './alert.component.html',
})
export class CwAlert {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting alert tone, default icon, background and ARIA role.
   *
   * @type {InputSignal<CwAlertVariant>}
   * @default 'info'
   */
  public readonly variant: InputSignal<CwAlertVariant> = input<CwAlertVariant>('info');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the standard layout or a compact single-line title and actions.
   *
   * @type {InputSignal<CwAlertSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwAlertSize> = input<CwAlertSize>('default');

  /**
   * Property icon
   * @readonly
   *
   * @description
   * Registered replacement icon name; null hides it and undefined uses the tone's default.
   *
   * @type {InputSignal<string | null | undefined>}
   * @default undefined
   */
  public readonly icon: InputSignal<string | null | undefined> = input<string | null | undefined>(
    undefined,
  );

  /**
   * Property dismissible
   * @readonly
   *
   * @description
   * Input enabling the close button and Escape dismissal.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly dismissible: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property closeLabel
   * @readonly
   *
   * @description
   * Accessible name of the close button.
   *
   * @type {InputSignal<string>}
   * @default 'Fermer'
   */
  public readonly closeLabel: InputSignal<string> = input('Fermer');

  /**
   * Property dismissed
   * @readonly
   *
   * @description
   * Emits once when the alert closes through the button, Escape or a direct dismiss call.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly dismissed: OutputEmitterRef<void> = output();

  /**
   * Property host
   * @readonly
   *
   * @description
   * Native alert element used to check and restore focus on dismissal.
   *
   * @type {HTMLElement}
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document used to inspect the active element and locate subsequent focus candidates.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property closed
   * @readonly
   *
   * @description
   * Signal indicating that the alert has been dismissed for this component's lifetime.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  protected readonly closed: WritableSignal<boolean> = signal(false);

  /**
   * Property role
   * @readonly
   *
   * @description
   * ARIA role: alerts for warning and destructive tones, status for information and success.
   *
   * @type {Signal<'alert' | 'status'>}
   */
  protected readonly role: Signal<'alert' | 'status'> = computed(() =>
    this.variant() === 'warning' || this.variant() === 'destructive' ? 'alert' : 'status',
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Base, tone and size classes applied to the alert host.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );

  /**
   * Property iconName
   * @readonly
   *
   * @description
   * Selected replacement icon, null when hidden, or the default icon for the current tone.
   *
   * @type {Signal<string | null>}
   */
  protected readonly iconName: Signal<string | null> = computed(() => {
    const icon: string | null | undefined = this.icon();
    return icon === undefined ? ICONS[this.variant()] : icon;
  });

  /**
   * Property iconClasses
   * @readonly
   *
   * @description
   * Icon color and spacing classes for the current tone and size.
   *
   * @type {Signal<string>}
   */
  protected readonly iconClasses: Signal<string> = computed(
    () => `shrink-0 ${ICON_TONES[this.variant()]}${this.size() === 'default' ? ' mt-0.5' : ''}`,
  );

  /**
   * Property bodyClasses
   * @readonly
   *
   * @description
   * Content layout classes corresponding to the selected size.
   *
   * @type {Signal<string>}
   */
  protected readonly bodyClasses: Signal<string> = computed(() => BODIES[this.size()]);

  /**
   * Property closeClasses
   * @readonly
   *
   * @description
   * Close button spacing and color classes for the current tone.
   *
   * @type {Signal<string>}
   */
  protected readonly closeClasses: Signal<string> = computed(() =>
    this.variant() === 'destructive'
      ? '-my-0.5 -mr-1.5 text-grenat-text'
      : '-my-0.5 -mr-1.5 text-muted-foreground hover:text-foreground',
  );
  // #endregion

  // #region Methods
  /**
   * Method dismiss
   * @method dismiss
   *
   * @description
   * Hides the alert and emits `dismissed` once. If focus was inside, moves it to the next candidate
   * when one exists. Repeated calls after closing do nothing.
   */
  public dismiss(): void {
    if (this.closed()) return;
    const hadFocus: boolean = this.host.contains(this.document.activeElement);
    const next: HTMLElement | null = hadFocus ? this.nextFocusable() : null;
    this.closed.set(true);
    next?.focus();
    this.dismissed.emit();
  }

  /**
   * Method onEscape
   * @method onEscape
   *
   * @description
   * Prevents the default Escape action and dismisses the alert when dismissal is enabled.
   *
   * @param {Event} event - Escape key event received by the alert.
   */
  protected onEscape(event: Event): void {
    if (!this.dismissible()) return;
    event.preventDefault();
    this.dismiss();
  }

  /**
   * Method nextFocusable
   * @method nextFocusable
   *
   * @description
   * Finds the first candidate following the alert outside its host, as required by the Alert sheet.
   *
   * @returns {HTMLElement | null} Next focus candidate, or null when none is found.
   */
  private nextFocusable(): HTMLElement | null {
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
