import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/button';
import { ɵprefersReducedMotion } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/spinner';
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
const BASE =
  'flex h-full w-full items-start gap-2.5 rounded-lg border bg-popover p-3.5 text-sm text-popover-foreground shadow-lg ' +
  'animate-item-in motion-reduce:animate-none data-[state=closed]:pointer-events-none data-[state=closed]:animate-fade-out motion-reduce:data-[state=closed]:animate-none';
const FOLDED = '*:opacity-0';

const ICONS: Partial<Record<CwToastTone, string>> = {
  success: 'phosphorCheckCircleFill',
  info: 'phosphorInfoFill',
  warning: 'phosphorWarningFill',
  error: 'phosphorWarningCircleFill',
};

// Yellow is never a text: only the warning icon is `balise`.
const ICON_TONES: Partial<Record<CwToastTone, string>> = {
  success: 'mt-0.5 shrink-0 text-jade',
  info: 'mt-0.5 shrink-0 text-primary',
  warning: 'mt-0.5 shrink-0 text-balise',
  error: 'mt-0.5 shrink-0 text-destructive',
};

// Longest exit of the tokens (`fade-out` 180 ms) plus a margin, when `animationend` never comes.
const EXIT_FALLBACK_MS = 300;

/**
 * One toast as `cw-toaster` draws it: the tone's icon (or the spinner), the title, the description,
 * the action and the close button. `role="status"`, `role="alert"` for an error; it never takes
 * the focus by itself. Escape inside it asks to close it. Once closed, it is `inert` and hidden from
 * assistive technologies while its exit animation plays. Internal to the entry point (the toaster
 * and the static stories render it); not exported.
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'toast().tone === "error" ? "alert" : "status"',
    '[attr.data-state]': 'toast().state',
    '[attr.data-tone]': 'toast().tone',
    // While it plays its exit, a closed toast is out of reach: not read again, its action not run
    // a second time, its buttons not focusable.
    '[attr.aria-hidden]': 'toast().state === "closed" ? "true" : null',
    '[attr.inert]': 'toast().state === "closed" ? "" : null',
    '(keydown.escape)': 'dismissed.emit()',
  },
  templateUrl: './toast-item.component.html',
})
export class CwToastItem {
  /** The toast to draw. */
  readonly toast = input.required<CwToast>();
  /** Behind the front toast of a folded stack: content hidden. */
  readonly folded = input(false, { transform: booleanAttribute });
  /** Shows the close button even when the toast is not `closable`. */
  readonly closeButton = input(false, { transform: booleanAttribute });
  /** Accessible name of the close button. */
  readonly closeLabel = input('Fermer la notification');
  /** The close button or Escape asked to close the toast. */
  readonly dismissed = output();
  /** The action button was activated. */
  readonly acted = output();
  /** The exit animation of a closed toast has ended: it can leave the list. */
  readonly removed = output();

  protected readonly classes = computed(() => (this.folded() ? `${BASE} ${FOLDED}` : BASE));
  protected readonly icon = computed(() => ICONS[this.toast().tone] ?? null);
  protected readonly iconClasses = computed(() => ICON_TONES[this.toast().tone] ?? '');
  protected readonly closable = computed(() => this.closeButton() || this.toast().closable);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private leaving = false;

  constructor() {
    effect(() => {
      if (this.toast().state !== 'closed' || this.leaving) return;
      this.leaving = true;
      afterNextRender(
        () => {
          this.afterExit(() => {
            this.removed.emit();
          });
        },
        { injector: this.injector },
      );
    });
  }

  private afterExit(done: () => void): void {
    const view = this.document.defaultView;
    const name = view ? view.getComputedStyle(this.element).animationName : '';
    if (!name || name === 'none' || ɵprefersReducedMotion(this.document)) {
      done();
      return;
    }
    let finished = false;
    const finish = (): void => {
      if (finished) return;
      finished = true;
      this.element.removeEventListener('animationend', onEnd);
      clearTimeout(timer);
      done();
    };
    const onEnd = (event: AnimationEvent): void => {
      if (event.target === this.element) finish();
    };
    const timer = setTimeout(finish, EXIT_FALLBACK_MS);
    this.element.addEventListener('animationend', onEnd);
  }
}
