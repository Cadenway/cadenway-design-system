import { Directive, ElementRef, afterEveryRender, computed, inject, signal } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { PROPERTY } from '../property.token';

/* Literal class strings (Property List sheet and preview of the Design System artifact). On a native
   trigger (a `button` opening the consumer's own popover, a link), the directive styles the host;
   on a Cadenway control (`cw-select`, `cw-combobox`, `cw-date-picker`, `cw-inline-edit`), it styles
   the control's own trigger, its direct child `button` or the inline edit's field: the border
   goes transparent at rest, the value takes the row's padding and the inset focus ring, the
   control's trailing caret is hidden. Nothing else of the control changes. */
const NATIVE = {
  vertical:
    'relative isolate overflow-hidden flex min-h-8 w-full min-w-0 items-center gap-2 rounded-md border border-transparent px-2 py-1 text-left text-sm transition-colors hover:bg-accent aria-expanded:bg-selected outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_ng-icon]:shrink-0',
  inline:
    'relative isolate overflow-hidden inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-md border border-input px-2 text-xs font-medium whitespace-nowrap transition-colors hover:bg-accent aria-expanded:bg-selected outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:0.875rem]',
} as const;

const WRAPPED = {
  vertical:
    'w-full min-w-0 [&>button]:mx-0 [&>button]:h-auto [&>button]:min-h-8 [&>button]:w-full [&>button]:max-w-full [&>button]:rounded-md [&>button]:border-transparent [&>button]:px-2 [&>button]:py-1 [&>button]:text-sm [&>button:focus-visible]:border-transparent [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-inset [&>button:focus-visible]:ring-ring [&>button:focus-visible]:ring-offset-0 [&>button>ng-icon:last-child]:hidden ' +
    '[&_input]:mx-0 [&_input]:h-8 [&_input]:w-full [&_input]:px-2 [&_input]:py-1 [&_input]:text-sm [&_textarea]:mx-0 [&_textarea]:w-full [&_textarea]:px-2 [&_textarea]:text-sm',
  inline:
    'w-fit max-w-full min-w-0 [&>button]:mx-0 [&>button]:h-7 [&>button]:w-auto [&>button]:max-w-full [&>button]:gap-1.5 [&>button]:rounded-md [&>button]:border-input [&>button]:px-2 [&>button]:py-0 [&>button]:text-xs [&>button]:font-medium [&>button_ng-icon]:[--ng-icon__size:0.875rem] [&>button:focus-visible]:border-input [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-ring [&>button:focus-visible]:ring-offset-2 [&>button:focus-visible]:ring-offset-background [&>button>ng-icon:last-child]:hidden ' +
    '[&_input]:mx-0 [&_input]:h-7 [&_input]:w-40 [&_input]:px-2 [&_input]:text-xs',
} as const;

/* A read-only value is text: no hover, no veil, the default cursor. */
const READONLY = {
  native: 'pointer-events-none hover:bg-transparent',
  wrapped:
    '[&>button]:pointer-events-none [&>button]:hover:bg-transparent [&>button]:disabled:opacity-100',
} as const;

const NATIVE_TAGS = new Set(['BUTTON', 'A', 'INPUT', 'TEXTAREA']);
const TARGET = 'button, input, textarea, a[href], [role="combobox"]';

/**
 * Marks the control that edits a `cw-property`'s value and gives it the look of a value: no field
 * border at rest, the row's hover, `bg-selected` while open, the inset focus ring (Property List
 * sheet of the Design System artifact). It never changes the control's behavior: its panel, its
 * keyboard, its value (`[(value)]`, forms) stay the control's.
 *
 * Put it on `cw-select`, `cw-combobox`, `cw-date-picker`, `cw-inline-edit`, or on a native
 * `button` or `a` (a trigger of the consumer's own popover, an URL). It names the control's
 * focusable trigger « Label value » (`aria-labelledby` = the property's label and the trigger),
 * links the property's `error` (`aria-invalid`, `aria-describedby`), takes a read-only value out of
 * the tab order, and tells the property whether the control is empty (its trigger shows its
 * placeholder, `data-placeholder`, or the inline edit is `data-empty`). The Cadenway controls draw
 * their own ripple; add `cwRipple` (`@cadenway/ui/core`) to a native trigger for it. Only valid
 * inside `cw-property`.
 */
@Directive({
  selector: '[cwPropertyValue]',
  host: {
    '[class]': 'classes()',
  },
})
export class CwPropertyValue {
  private readonly property = inject(PROPERTY);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly ids = inject(_IdGenerator);
  private readonly native = NATIVE_TAGS.has(this.element.tagName);
  private readonly emptyState = signal(false);
  // The trigger whose tab stop this directive removed, to give it back.
  private untabbed: HTMLElement | null = null;

  /** @internal Whether the projected control shows no value. */
  readonly empty = this.emptyState.asReadonly();

  protected readonly classes = computed(() => {
    const orientation = this.property.orientation();
    const readonly = this.property.isReadonly();
    if (this.native) return `${NATIVE[orientation]}${readonly ? ` ${READONLY.native}` : ''}`;
    return `${WRAPPED[orientation]}${readonly ? ` ${READONLY.wrapped}` : ''}`;
  });

  constructor() {
    // The controls render their trigger themselves, and an inline edit swaps its button and its
    // field: the attributes are checked after every render rather than once.
    afterEveryRender({
      write: () => {
        this.sync();
      },
    });
  }

  private target(): HTMLElement | null {
    if (this.native) return this.element;
    return this.element.querySelector<HTMLElement>(TARGET);
  }

  private sync(): void {
    const target = this.target();
    const empty =
      this.element.hasAttribute('data-empty') ||
      (target?.hasAttribute('data-placeholder') ?? false);
    if (empty !== this.emptyState()) this.emptyState.set(empty);
    if (!target) return;

    if (!target.id) target.id = this.ids.getId('cw-property-value-');
    // A field is named by the label alone: its own value is not part of its name.
    const field = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    const labelledby = field ? this.property.labelId : `${this.property.labelId} ${target.id}`;
    if (target.getAttribute('aria-labelledby') !== labelledby) {
      target.setAttribute('aria-labelledby', labelledby);
    }

    const errorId = this.property.errorId;
    const described = (target.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .filter((id) => id !== '' && id !== errorId);
    if (this.property.error()) {
      described.unshift(errorId);
      target.setAttribute('aria-invalid', 'true');
    } else if (
      target.getAttribute('aria-invalid') === 'true' &&
      target.dataset['cwPropertyError']
    ) {
      target.removeAttribute('aria-invalid');
    }
    if (this.property.error()) target.dataset['cwPropertyError'] = '';
    else delete target.dataset['cwPropertyError'];
    if (described.length) target.setAttribute('aria-describedby', described.join(' '));
    else target.removeAttribute('aria-describedby');

    const readonly = this.property.isReadonly();
    if (readonly && this.untabbed !== target) {
      target.tabIndex = -1;
      this.untabbed = target;
    } else if (!readonly && this.untabbed) {
      this.untabbed.removeAttribute('tabindex');
      this.untabbed = null;
    }
  }
}
