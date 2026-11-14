import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { ɵFOCUS } from '@cadenway/ui/core';

import { BADGE_BASE, BADGE_SIZES, BADGE_VARIANTS } from './badge.constants';
import type { CwBadgeSize, CwBadgeVariant } from './badge.types';

/**
 * Class CwBadge
 * @class CwBadge
 *
 * @description
 * A short label: a tag, a counter, a « Nouveau » mention, a status or a priority (Badge sheet of the
 * Design System artifact). Not interactive by default.
 *
 * Put it on a `<span>`; on an `<a>` or a `<button>` when it leads somewhere or acts, and only then
 * does it take the hover veil and the keyboard focus ring. On `<button>` it sets `type="button"` when
 * no type is given. `disabled` is native on `<button>`; on `<a>` it sets `aria-disabled`, removes the
 * link from the tab order and swallows clicks. A counter doubles its number with a visually hidden
 * text (« 12 commentaires »). Listen to the native `(click)`. No animation (sheet, "Mouvement").
 */
@Component({
  selector: 'span[cwBadge], a[cwBadge], button[cwBadge]',
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': 'isLink && disabled() ? "true" : null',
    '[attr.tabindex]': 'isLink && disabled() ? -1 : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './badge.component.html',
})
export class CwBadge {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting the visual appearance of the badge.
   *
   * @type {InputSignal<CwBadgeVariant>}
   * @default 'default'
   */
  public readonly variant: InputSignal<CwBadgeVariant> = input<CwBadgeVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the badge height: 22 pixels by default or 18 pixels for `sm`.
   *
   * @type {InputSignal<CwBadgeSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwBadgeSize> = input<CwBadgeSize>('default');

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Input disabling a clickable badge natively on buttons and through `aria-disabled` on links.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native host used to determine interaction and guard disabled link clicks.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property isButton
   * @readonly
   *
   * @description
   * Whether the badge is hosted on a native button.
   *
   * @type {boolean}
   */
  protected readonly isButton: boolean = this.element.tagName === 'BUTTON';

  /**
   * Property isLink
   * @readonly
   *
   * @description
   * Whether the badge is hosted on a native link.
   *
   * @type {boolean}
   */
  protected readonly isLink: boolean = this.element.tagName === 'A';

  /**
   * Property declaredType
   * @readonly
   *
   * @description
   * Native type attribute supplied by the consumer, or null when it is absent.
   *
   * @type {string | null}
   */
  private readonly declaredType: string | null = inject(new HostAttributeToken('type'), {
    optional: true,
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed appearance and size classes, including a focus ring for interactive hosts.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => {
    const focus: string = this.isButton || this.isLink ? ` ${ɵFOCUS}` : '';
    return `${BADGE_BASE} ${BADGE_VARIANTS[this.variant()]} ${BADGE_SIZES[this.size()]}${focus}`;
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Installs a capture-phase guard that suppresses disabled link clicks before consumer listeners.
   */
  public constructor() {
    // Capture phase: the guard runs before the consumer's own (click) listener on the same element.
    this.element.addEventListener(
      'click',
      (event) => {
        if (this.isLink && this.disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
  // #endregion

  // #region Methods
  /**
   * Method type
   * @method type
   *
   * @description
   * Uses the declared button type or defaults to `button` to avoid accidental form submission.
   *
   * @returns {string | null} Button type, or null for a span or link host.
   */
  protected type(): string | null {
    // A button without a type would submit its form by accident.
    return this.isButton ? (this.declaredType ?? 'button') : null;
  }
  // #endregion
}
