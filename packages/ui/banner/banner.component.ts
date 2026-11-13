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
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CwButton } from '@cadenway/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorInfoBold, phosphorXBold } from '@ng-icons/phosphor-icons/bold';
import {
  phosphorCheckCircleFill,
  phosphorInfoFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import type { CwBannerPlacement, CwBannerTone } from './banner.types';

/* Literal class strings (Banner sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. */
const BASE = 'flex w-full gap-3 border text-sm animate-item-in motion-reduce:animate-none';

const TONES: Record<CwBannerTone, string> = {
  info: 'border-transparent bg-muted',
  success: 'border-transparent bg-muted',
  warning: 'border-transparent bg-muted',
  error: 'border-transparent bg-grenat-soft',
  neutral: 'bg-background',
};

const PLACEMENTS: Record<CwBannerPlacement, string> = {
  inline: 'rounded-lg px-3',
  top: 'rounded-none border-x-0 border-t-0 px-4',
};

const LAYOUTS = {
  single: 'min-h-10 items-center py-1.5',
  multiline: 'items-start py-2.5',
} as const;

// Filled icon in the tone's color; neutral shows a context icon in Bold, muted.
const ICONS: Record<CwBannerTone, string> = {
  info: 'phosphorInfoFill',
  success: 'phosphorCheckCircleFill',
  warning: 'phosphorWarningFill',
  error: 'phosphorWarningCircleFill',
  neutral: 'phosphorInfoBold',
};

const ICON_TONES: Record<CwBannerTone, string> = {
  info: 'shrink-0 text-primary',
  success: 'shrink-0 text-jade',
  warning: 'shrink-0 text-balise',
  error: 'shrink-0 text-destructive',
  neutral: 'shrink-0 text-muted-foreground',
};

const STORAGE_PREFIX = 'cw-banner:';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
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
    // `title` is an input: keep it off the element, where it would draw a native tooltip.
    '[attr.title]': 'null',
    '[attr.hidden]': 'closed() ? "" : null',
    '[attr.data-tone]': 'tone()',
    '[attr.data-placement]': 'placement()',
  },
  templateUrl: './banner.component.html',
})
export class CwBanner {
  /** Tone: icon color, background and ARIA role. */
  readonly tone = input<CwBannerTone>('info');
  /** Rounded in the page column, or flat across the window. */
  readonly placement = input<CwBannerPlacement>('inline');
  /** Main sentence, in `font-medium` (« Stockage presque plein. »). */
  readonly title = input.required<string>();
  /** Rest of the message, muted (« 46 Go utilisés sur 50 Go. »). */
  readonly description = input('');
  /** Name of a registered icon replacing the tone's icon: the context icon of a `neutral` banner. */
  readonly icon = input<string | null>(null);
  /** Shows « Masquer le bandeau »; `false` for an error still in progress. */
  readonly dismissible = input(true, { transform: booleanAttribute });
  /** Stores the dismissal under this key, so the banner does not come back. */
  readonly dismissKey = input<string | null>(null);
  /** Accessible name of the close button. */
  readonly closeLabel = input('Masquer le bandeau');
  /** Title on its own line and the description under it, for a long message. */
  readonly multiline = input(false, { transform: booleanAttribute });
  /** Emitted when the banner is hidden through its close button. */
  readonly dismissed = output();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly dismissedHere = signal(false);
  private readonly stored = signal(false);
  protected readonly closed = computed(() => this.dismissedHere() || this.stored());

  protected readonly classes = computed(
    () =>
      `${BASE} ${TONES[this.tone()]} ${PLACEMENTS[this.placement()]} ${this.multiline() ? LAYOUTS.multiline : LAYOUTS.single}`,
  );
  protected readonly iconName = computed(() => this.icon() ?? ICONS[this.tone()]);
  protected readonly iconClasses = computed(
    () => `${ICON_TONES[this.tone()]}${this.multiline() ? ' mt-0.5' : ''}`,
  );
  protected readonly messageClasses = computed(() =>
    this.multiline() ? 'min-w-0 flex-1 leading-5' : 'min-w-0 flex-1 truncate',
  );
  protected readonly titleClasses = computed(() => {
    const color =
      this.tone() === 'error' ? 'font-medium text-grenat-text' : 'font-medium text-foreground';
    return this.multiline() ? `${color} block` : color;
  });
  protected readonly descriptionClasses = computed(() =>
    this.tone() === 'error' ? 'text-grenat-text' : 'text-muted-foreground',
  );
  protected readonly closeClasses = computed(() => {
    const color =
      this.tone() === 'error' ? 'text-grenat-text' : 'text-muted-foreground hover:text-foreground';
    return this.multiline() ? `-my-1 -mr-1 ${color}` : `-mr-1 ${color}`;
  });

  constructor() {
    effect(() => {
      const key = this.dismissKey();
      this.stored.set(key !== null && this.readStored(key));
    });
  }

  /** Hides the banner, stores the dismissal under `dismissKey`, emits `dismissed`. */
  dismiss(): void {
    if (this.closed()) return;
    const hadFocus = this.host.contains(this.document.activeElement);
    const next = hadFocus ? this.focusTarget() : null;
    const key = this.dismissKey();
    if (key !== null) this.writeStored(key);
    this.dismissedHere.set(true);
    next?.focus();
    this.dismissed.emit();
  }

  private readStored(key: string): boolean {
    if (!this.browser) return false;
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_PREFIX + key) === '1';
    } catch {
      // Storage refused (private mode, policy): the banner shows, as for a first visit.
      return false;
    }
  }

  private writeStored(key: string): void {
    if (!this.browser) return;
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_PREFIX + key, '1');
    } catch {
      // Storage refused or full: the dismissal holds for this page only.
    }
  }

  // Banner sheet, "Accessibilité": after « Masquer », the focus goes to the main content.
  private focusTarget(): HTMLElement | null {
    const main = this.document.querySelector('main');
    const inMain = main?.querySelector<HTMLElement>(FOCUSABLE);
    if (inMain && !this.host.contains(inMain)) return inMain;
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
