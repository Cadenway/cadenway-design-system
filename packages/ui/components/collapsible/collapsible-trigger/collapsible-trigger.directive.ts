import {
  Directive,
  ElementRef,
  HostAttributeToken,
  computed,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';

import { CwCollapsible } from '../collapsible.component';
import type { CwCollapsibleTriggerVariant } from '../collapsible.types';

/**
 * Constant VARIANTS
 *
 * @description
 * Literal classes for a bare trigger or a full-width 36-pixel List group row with an inset focus ring.
 * The trigger uses `aria-disabled` because a shared `cwButton` may own the native disabled attribute.
 *
 * @type {Record<CwCollapsibleTriggerVariant, string>}
 */
const VARIANTS: Record<CwCollapsibleTriggerVariant, string> = {
  bare: '',
  row:
    'relative isolate flex h-9 w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm font-medium transition-colors hover:bg-accent ' +
    'aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
    ɵFOCUS_INSET,
};

/**
 * Class CwCollapsibleTrigger
 * @class CwCollapsibleTrigger
 *
 * @description
 * Opens and closes the `cw-collapsible` it sits in (Collapsible sheet of the Design System
 * artifact): on click, Enter and Space, since it goes on a native `<button>`.
 *
 * `bare` (default) adds no style: combine it with `cwButton` (`ghost` `icon-sm` for a block header,
 * `ghost` `sm` for « Afficher N de plus »). `row` draws the 36 px group row of the List view. Add a
 * `cw-collapsible-chevron` inside for the arrow. It carries `aria-expanded`, `aria-controls` (the
 * content) and `data-state`; on a disabled block it is `aria-disabled` and ignores clicks. An
 * icon-only trigger needs an `aria-label` (« Replier les sous-tâches »).
 */
@Directive({
  selector: '[cwCollapsibleTrigger]',
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'isButton ? (declaredType ?? "button") : null',
    '[attr.aria-expanded]': 'collapsible.expanded()',
    '[attr.aria-controls]': 'collapsible.contentId',
    '[attr.aria-disabled]': 'collapsible.disabled() ? "true" : null',
    '[attr.data-state]': 'collapsible.state()',
    '[attr.data-disabled]': 'collapsible.disabled() ? "" : null',
    '[attr.data-variant]': 'variant()',
    '(click)': 'collapsible.toggle()',
  },
})
export class CwCollapsibleTrigger {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting unstyled `bare` presentation or the List group row.
   *
   * @type {InputSignal<CwCollapsibleTriggerVariant>}
   * @default 'bare'
   */
  public readonly variant: InputSignal<CwCollapsibleTriggerVariant> =
    input<CwCollapsibleTriggerVariant>('bare');

  /**
   * Property collapsible
   * @readonly
   *
   * @description
   * Parent block whose expansion state and disabled state drive the trigger.
   *
   * @type {CwCollapsible}
   */
  protected readonly collapsible: CwCollapsible = inject(CwCollapsible);

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native trigger host used to determine its type and guard disabled clicks.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property isButton
   * @readonly
   *
   * @description
   * Whether the trigger host is a native button.
   *
   * @type {boolean}
   */
  protected readonly isButton: boolean = this.element.tagName === 'BUTTON';

  /**
   * Property declaredType
   * @readonly
   *
   * @description
   * Native type attribute supplied by the consumer, or null when absent.
   *
   * @type {string | null}
   */
  protected readonly declaredType: string | null = inject(new HostAttributeToken('type'), {
    optional: true,
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed class string for the selected trigger variant.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => VARIANTS[this.variant()]);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Installs a capture-phase guard that suppresses clicks when the parent block is disabled.
   */
  public constructor() {
    // Capture phase: a disabled block swallows the click before the consumer's own (click).
    this.element.addEventListener(
      'click',
      (event) => {
        if (this.collapsible.disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
  // #endregion
}
