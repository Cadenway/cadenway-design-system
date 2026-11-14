import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { ɵafterExitAnimation } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/components/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorXBold } from '@ng-icons/phosphor-icons/bold';
import {
  phosphorCheckCircleFill,
  phosphorInfoFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import type { CwToast, CwToastTone } from '../toast.types';

/* Literal class strings (Toast sheet and preview of the Design System artifact): every tone on
   `bg-popover`, the tone carried by the filled icon and the words, never by a colored background.
   A folded toast behind the front one keeps its background and hides its content. */
/**
 * Constant BASE
 *
 * @description
 * Base classes for the toast surface and its entrance and exit animations.
 *
 * @type {string}
 */
const BASE: string =
  'flex h-full w-full items-start gap-2.5 rounded-lg border bg-popover p-3.5 text-sm text-popover-foreground shadow-lg ' +
  'animate-item-in motion-reduce:animate-none data-[state=closed]:pointer-events-none data-[state=closed]:animate-fade-out motion-reduce:data-[state=closed]:animate-none';
/**
 * Constant FOLDED
 *
 * @description
 * Hides the content of a toast behind the front item in a folded stack.
 *
 * @type {string}
 */
const FOLDED: string = '*:opacity-0';

/**
 * Constant ICONS
 *
 * @description
 * Maps supported tones to the icon displayed beside the toast.
 *
 * @type {Partial<Record<CwToastTone, string>>}
 */
const ICONS: Partial<Record<CwToastTone, string>> = {
  success: 'phosphorCheckCircleFill',
  info: 'phosphorInfoFill',
  warning: 'phosphorWarningFill',
  error: 'phosphorWarningCircleFill',
};

// Yellow is never a text: only the warning icon is `balise`.
/**
 * Constant ICON_TONES
 *
 * @description
 * Maps supported tones to their icon color and layout classes.
 *
 * @type {Partial<Record<CwToastTone, string>>}
 */
const ICON_TONES: Partial<Record<CwToastTone, string>> = {
  success: 'mt-0.5 shrink-0 text-jade',
  info: 'mt-0.5 shrink-0 text-primary',
  warning: 'mt-0.5 shrink-0 text-balise',
  error: 'mt-0.5 shrink-0 text-destructive',
};

// Longest exit of the tokens (`fade-out` 180 ms) plus a margin, when `animationend` never comes.
/**
 * Constant EXIT_FALLBACK_MS
 *
 * @description
 * Fallback delay in milliseconds when an exit animation does not emit its completion event.
 *
 * @type {number}
 */
const EXIT_FALLBACK_MS: number = 300;

/**
 * Component CwToastItem
 *
 * @description
 * One toast as `cw-toaster` draws it: the tone's icon (or the spinner), the title, the description, the action and the close button. `role="status"`, `role="alert"` for an error; it never takes the focus by itself. Escape inside it asks to close it. Once closed, it is `inert` and hidden from assistive technologies while its exit animation plays. Internal to the entry point (the toaster and the static stories render it); not exported.
 */
@Component({
  selector: 'cw-toast-item',
  imports: [CwButton, CwSpinner, NgIcon],
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
    '[attr.role]': 'toast().tone === "error" ? "alert" : "status"',
    '[attr.data-state]': 'toast().state',
    '[attr.data-tone]': 'toast().tone',
    '[attr.aria-hidden]': 'toast().state === "closed" ? "true" : null',
    '[attr.inert]': 'toast().state === "closed" ? "" : null',
    '(keydown.escape)': 'dismissed.emit()',
  },
  templateUrl: './toast-item.component.html',
})
export class CwToastItem {
  // #region Properties
  /**
   * Property toast
   *
   * @description
   * The toast to draw.
   *
   * @type {InputSignal<CwToast>}
   * @readonly
   */
  public readonly toast: InputSignal<CwToast> = input.required<CwToast>();

  /**
   * Property folded
   *
   * @description
   * Behind the front toast of a folded stack: content hidden.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly folded: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property closeButton
   *
   * @description
   * Shows the close button even when the toast is not `closable`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly closeButton: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property closeLabel
   *
   * @description
   * Accessible name of the close button.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly closeLabel: InputSignal<string> = input('Fermer la notification');

  /**
   * Property dismissed
   *
   * @description
   * The close button or Escape asked to close the toast.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly dismissed: OutputEmitterRef<void> = output();

  /**
   * Property acted
   *
   * @description
   * The action button was activated.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly acted: OutputEmitterRef<void> = output();

  /**
   * Property removed
   *
   * @description
   * The exit animation of a closed toast has ended: it can leave the list.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly removed: OutputEmitterRef<void> = output();

  /**
   * Property classes
   *
   * @description
   * Combines the surface classes with the folded state.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.folded() ? `${BASE} ${FOLDED}` : BASE,
  );

  /**
   * Property icon
   *
   * @description
   * Selects the tone icon, or null when the tone has none.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly icon: Signal<string | null> = computed(() => ICONS[this.toast().tone] ?? null);

  /**
   * Property iconClasses
   *
   * @description
   * Selects the layout and color classes for the tone icon.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly iconClasses: Signal<string> = computed(
    () => ICON_TONES[this.toast().tone] ?? '',
  );

  /**
   * Property closable
   *
   * @description
   * Indicates whether this toast or the toaster requests a close button.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly closable: Signal<boolean> = computed(
    () => this.closeButton() || this.toast().closable,
  );

  /**
   * Property element
   *
   * @description
   * Native host element observed for exit animation completion.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property injector
   *
   * @description
   * Injector used to schedule work after the next render.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property leaving
   *
   * @description
   * Prevents scheduling the same exit animation more than once.
   *
   * @type {boolean}
   */
  private leaving: boolean = false;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Observes closure and emits removal after the exit animation completes.
   *
   * @constructor
   */
  public constructor() {
    effect(() => {
      if (this.toast().state !== 'closed' || this.leaving) return;
      this.leaving = true;
      afterNextRender(
        () => {
          ɵafterExitAnimation(
            this.element,
            () => {
              this.removed.emit();
            },
            { fallback: EXIT_FALLBACK_MS },
          );
        },
        { injector: this.injector },
      );
    });
  }
  // #endregion
}
