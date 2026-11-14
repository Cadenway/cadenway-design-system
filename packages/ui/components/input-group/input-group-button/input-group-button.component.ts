import { Component, input, type InputSignal } from '@angular/core';
import { CwButton, type CwButtonSize, type CwButtonVariant } from '@cadenway/ui/components/button';
import { CwRipple } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/components/spinner';

/**
 * Class CwInputGroupButton
 * @class CwInputGroupButton
 *
 * @description
 * A button inside an addon: the Button brick, `ghost` and `xs` by default (`icon-xs` for an icon,
 * `default` only for the send action). Same contract as `button[cwButton]`: `type="button"`,
 * `loading`, `disabled`, ripple; an icon-only button needs an `aria-label` (« Copier l'URL »), a
 * show / hide button toggles `aria-pressed`.
 */
@Component({
  selector: 'button[cwInputGroupButton]',
  imports: [CwSpinner],
  hostDirectives: [CwRipple],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './input-group-button.component.html',
})
export class CwInputGroupButton extends CwButton {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Button appearance, ghost in an addon by default.
   *
   * @type {InputSignal<CwButtonVariant>}
   */
  public override readonly variant: InputSignal<CwButtonVariant> = input<CwButtonVariant>('ghost');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Size of the button: `xs` or `icon-xs` in a 28 or 32 px group, `sm` or `icon-sm` in a 36 px one.
   * Typed as every Button size because an input signal cannot narrow the type it overrides.
   *
   * @type {InputSignal<CwButtonSize>}
   */
  public override readonly size: InputSignal<CwButtonSize> = input<CwButtonSize>('xs');
  // #endregion
}
