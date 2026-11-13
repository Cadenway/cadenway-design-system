import {
  ComponentRef,
  Directive,
  ElementRef,
  Renderer2,
  ViewContainerRef,
  booleanAttribute,
  effect,
  inject,
  input,
} from '@angular/core';

import { CwLoadingVeil } from './loading-veil.component';

/**
 * Covers an area that refreshes while its old content stays visible: a veil
 * `bg-background/70` with a centered spinner, and `aria-busy="true"` on the area (Spinner sheet,
 * "Surimpression").
 *
 * The host must be positioned (`relative`). Bind the wait: `<section class="relative"
 * [cwLoadingOverlay]="refreshing()" loadingLabel="Actualisation des tâches">`.
 */
@Directive({
  selector: '[cwLoadingOverlay]',
  host: {
    '[attr.aria-busy]': 'cwLoadingOverlay() ? "true" : null',
  },
})
export class CwLoadingOverlay {
  /** Whether the area is refreshing. */
  readonly cwLoadingOverlay = input(false, { transform: booleanAttribute });
  /** Accessible name of the wait. */
  readonly loadingLabel = input('Chargement');

  private readonly container = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private veil: ComponentRef<CwLoadingVeil> | undefined;

  constructor() {
    effect(() => {
      if (this.cwLoadingOverlay()) {
        if (!this.veil) {
          this.veil = this.container.createComponent(CwLoadingVeil);
          // The veil is placed inside the area so that `absolute inset-0` covers it.
          this.renderer.appendChild(this.host.nativeElement, this.veil.location.nativeElement);
        }
        this.veil.setInput('label', this.loadingLabel());
      } else if (this.veil) {
        this.veil.destroy();
        this.veil = undefined;
      }
    });
  }
}
