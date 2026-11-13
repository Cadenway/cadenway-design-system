import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorXBold } from '@ng-icons/phosphor-icons/bold';
import {
  phosphorCheckCircleFill,
  phosphorInfoFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import type { CwAlertSize, CwAlertVariant } from './alert.types';

/* Literal class strings (Alert sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. */
const BASE = 'flex w-full gap-3 rounded-lg border px-4 text-sm';

const VARIANTS: Record<CwAlertVariant, string> = {
  info: 'bg-card text-card-foreground',
  success: 'bg-card text-card-foreground',
  warning: 'bg-card text-card-foreground',
  destructive: 'border-transparent bg-grenat-soft text-grenat-text',
};

const SIZES: Record<CwAlertSize, string> = {
  default: 'items-start py-3',
  compact: 'items-center py-2.5',
};

// Filled Phosphor icons in the tone's color; yellow is never a text, only this icon.
const ICONS: Record<CwAlertVariant, string> = {
  info: 'phosphorInfoFill',
  success: 'phosphorCheckCircleFill',
  warning: 'phosphorWarningFill',
  destructive: 'phosphorWarningCircleFill',
};

const ICON_TONES: Record<CwAlertVariant, string> = {
  info: 'text-primary',
  success: 'text-jade',
  warning: 'text-balise',
  destructive: 'text-destructive',
};

const BODIES: Record<CwAlertSize, string> = {
  default: 'flex min-w-0 flex-1 flex-col gap-0.5',
  compact: 'flex min-w-0 flex-1 items-center gap-3',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  /** Tone: icon, background and ARIA role. */
  readonly variant = input<CwAlertVariant>('info');
  /** `compact`: the title alone on one line, actions at the right. */
  readonly size = input<CwAlertSize>('default');
  /** Name of a registered icon replacing the tone's icon; `null` shows none. */
  readonly icon = input<string | null | undefined>(undefined);
  /** Adds the close button and closes on Escape. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Accessible name of the close button. */
  readonly closeLabel = input('Fermer');
  /** Emitted once the alert is closed (button or Escape). */
  readonly dismissed = output();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  protected readonly closed = signal(false);

  protected readonly role = computed(() =>
    this.variant() === 'warning' || this.variant() === 'destructive' ? 'alert' : 'status',
  );
  protected readonly classes = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );
  protected readonly iconName = computed(() => {
    const icon = this.icon();
    return icon === undefined ? ICONS[this.variant()] : icon;
  });
  protected readonly iconClasses = computed(
    () => `shrink-0 ${ICON_TONES[this.variant()]}${this.size() === 'default' ? ' mt-0.5' : ''}`,
  );
  protected readonly bodyClasses = computed(() => BODIES[this.size()]);
  protected readonly closeClasses = computed(() =>
    this.variant() === 'destructive'
      ? '-my-0.5 -mr-1.5 text-grenat-text'
      : '-my-0.5 -mr-1.5 text-muted-foreground hover:text-foreground',
  );

  /** Closes the alert: hides it, emits `dismissed` and moves a focus that was inside it. */
  dismiss(): void {
    if (this.closed()) return;
    const hadFocus = this.host.contains(this.document.activeElement);
    const next = hadFocus ? this.nextFocusable() : null;
    this.closed.set(true);
    next?.focus();
    this.dismissed.emit();
  }

  protected onEscape(event: Event): void {
    if (!this.dismissible()) return;
    event.preventDefault();
    this.dismiss();
  }

  // Alert sheet, "Clavier": after Escape the focus goes to the element that follows the alert.
  private nextFocusable(): HTMLElement | null {
    const candidates = Array.from(this.document.querySelectorAll<HTMLElement>(FOCUSABLE));
    return (
      candidates.find(
        (element) =>
          !this.host.contains(element) &&
          (this.host.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      ) ?? null
    );
  }
}
