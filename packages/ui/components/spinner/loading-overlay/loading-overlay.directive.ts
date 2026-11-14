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
  type InputSignal,
  type InputSignalWithTransform,
} from '@angular/core';

import { CwLoadingVeil } from '../loading-veil/loading-veil.component';

/**
 * Class CwLoadingOverlay
 * @class CwLoadingOverlay
 *
 * @description
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
  // #region Properties
  /**
   * Property cwLoadingOverlay
   * @readonly
   *
   * @description
   * Input controlling whether the host is marked busy and covered by the loading veil.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly cwLoadingOverlay: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property loadingLabel
   * @readonly
   *
   * @description
   * Accessible name supplied to the spinner inside the loading veil.
   *
   * @type {InputSignal<string>}
   * @default 'Chargement'
   */
  public readonly loadingLabel: InputSignal<string> = input('Chargement');

  /**
   * Property container
   * @readonly
   *
   * @description
   * View container used to create the veil while loading is active.
   *
   * @type {ViewContainerRef}
   */
  private readonly container: ViewContainerRef = inject(ViewContainerRef);

  /**
   * Property host
   * @readonly
   *
   * @description
   * Area into which the veil element is inserted.
   *
   * @type {ElementRef<HTMLElement>}
   */
  private readonly host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Property renderer
   * @readonly
   *
   * @description
   * Renderer used to place the dynamically created veil within the host.
   *
   * @type {Renderer2}
   */
  private readonly renderer: Renderer2 = inject(Renderer2);

  /**
   * Property veil
   *
   * @description
   * Current loading veil component, or undefined when the area is not covered.
   *
   * @type {ComponentRef<CwLoadingVeil> | undefined}
   */
  private veil: ComponentRef<CwLoadingVeil> | undefined;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Observes loading and label inputs, creating, updating or destroying the veil as needed.
   */
  public constructor() {
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
  // #endregion
}
