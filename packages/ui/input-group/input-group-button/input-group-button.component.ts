import { Component, input } from '@angular/core';
import { CwButton, type CwButtonSize, type CwButtonVariant } from '@cadenway/ui/button';
import { CwRipple } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/spinner';

/**
 * A button inside an addon: the Button brick, `ghost` and `xs` by default (`icon-xs` for an icon,
 * `default` only for the send action). Same contract as `button[cwButton]`: `type="button"`,
 * `loading`, `disabled`, ripple; an icon-only button needs an `aria-label` (« Copier l'URL »), a
 * show / hide button toggles `aria-pressed`.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
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
  /** Look of the button; `ghost` in an addon, `default` for the send action only. */
  override readonly variant = input<CwButtonVariant>('ghost');
  /**
   * Size of the button: `xs` or `icon-xs` in a 28 or 32 px group, `sm` or `icon-sm` in a 36 px one.
   * Typed as every Button size because an input signal cannot narrow the type it overrides.
   */
  override readonly size = input<CwButtonSize>('xs');
}
