import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorLockSimpleBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { PROPERTY_LIST } from '../property-list.token';
import { PROPERTY, type PropertyHost } from '../property.token';
import { CwPropertyValue } from '../property-value/property-value.directive';

/* Literal class strings (Property List sheet and preview of the Design System artifact). Inline, the
   label is not visible: it stays in the accessible name of the chip. */
const LABEL = {
  vertical: 'flex h-8 min-w-0 items-center gap-2 px-2 text-sm text-muted-foreground',
  inline: 'sr-only',
} as const;

const VALUE = {
  vertical: 'min-w-0',
  inline: 'flex min-w-0',
} as const;

const STATIC = {
  vertical: 'flex min-h-8 min-w-0 items-center gap-2 px-[9px] text-sm',
  inline:
    'inline-flex h-7 items-center gap-1.5 rounded-md border border-input px-2 text-xs font-medium',
} as const;

/* A read-only control keeps its own padding: the lock follows it. */
const WITH_CONTROL = {
  vertical: 'flex min-w-0 items-center gap-1 pr-2',
  inline: 'inline-flex min-w-0 items-center gap-1',
} as const;

/* Keys that open a control; a read-only value swallows them before the control sees them. */
const OPENING_KEYS = new Set(['Enter', ' ', 'ArrowDown', 'ArrowUp', 'F2']);

/**
 * One labelled row of a `cw-property-list`: the field type's icon and its name, then the value that
 * edits in place (Property List sheet of the Design System artifact).
 *
 * Project the control marked `[cwPropertyValue]` (`cw-select`, `cw-combobox`, `cw-date-picker`,
 * `cw-inline-edit`, a `cw-checkbox` alone, a native button or link); the value changes come from
 * that control. `icon` is an ng-icons name the consumer has provided (`phosphorTimerBold`).
 * Without a value control, the projected content is shown as is, or `emptyText` (« Vide ») when
 * `empty` is set. `empty` is otherwise deduced from the control (its placeholder is showing), and
 * `hideEmpty` on the list folds the empty rows away. `error` writes the message under the value and
 * marks the control invalid. `readonly` (or the list's) shows the value as text with a lock
 * (« Lecture seule »): no hover, out of the tab order, clicks and opening keys ignored. Style hooks
 * on the host: `data-empty`, `data-readonly`, `data-hidden`. Only valid inside `cw-property-list`
 * or `cw-property-group`.
 */
@Component({
  selector: 'cw-property',
  imports: [NgIcon, NgTemplateOutlet],
  providers: [
    provideIcons({ phosphorLockSimpleBold, phosphorWarningCircleFill }),
    { provide: PROPERTY, useFactory: () => inject(CwProperty) as PropertyHost },
  ],
  host: {
    class: 'contents',
    '[attr.data-empty]': 'isEmpty() ? "" : null',
    '[attr.data-readonly]': 'isReadonly() ? "" : null',
    '[attr.data-hidden]': 'hidden() ? "" : null',
    '[attr.hidden]': 'hidden() ? "" : null',
  },
  templateUrl: './property.component.html',
})
export class CwProperty implements PropertyHost {
  /** Name of the field (« Statut »); the start of the value's accessible name. */
  readonly label = input.required<string>();
  /** ng-icons name of the field type's icon, provided by the consumer. */
  readonly icon = input<string | undefined>(undefined);
  /** Shows the value as text, with a lock. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Forces the empty state; deduced from the value control when not set. */
  readonly empty = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) =>
      value === undefined || value === null ? undefined : booleanAttribute(value),
  });
  /** Text of an empty value without a control of its own. */
  readonly emptyText = input('Vide');
  /** Text of the lock of a read-only value. */
  readonly readonlyLabel = input('Lecture seule');
  /** Message under the value, the control marked invalid; `null` for none. */
  readonly error = input<string | null>(null);

  private readonly list = inject(PROPERTY_LIST);
  private readonly ids = inject(_IdGenerator);
  private readonly value = contentChild(CwPropertyValue);

  /** @internal */
  readonly labelId = this.ids.getId('cw-property-label-');
  /** @internal */
  readonly errorId = this.ids.getId('cw-property-error-');
  /** @internal */
  readonly orientation = this.list.orientation;
  /** @internal */
  readonly isReadonly = computed(() => this.readonly() || this.list.readonly());
  /** @internal Whether the value is empty, given or deduced from the control. */
  readonly isEmpty = computed(() => this.empty() ?? this.value()?.empty() ?? false);
  /** @internal Folded away behind « Champs vides ». */
  readonly hidden = computed(() => this.isEmpty() && this.list.foldEmpty());

  protected readonly hasControl = computed(() => !!this.value());
  protected readonly labelClasses = computed(() => LABEL[this.orientation()]);
  protected readonly valueClasses = computed(() => VALUE[this.orientation()]);
  protected readonly staticClasses = computed(() => STATIC[this.orientation()]);
  protected readonly readonlyClasses = computed(() =>
    this.hasControl() ? WITH_CONTROL[this.orientation()] : STATIC[this.orientation()],
  );
  protected readonly lockSize = computed(() =>
    this.orientation() === 'inline' ? '0.75rem' : '0.875rem',
  );

  constructor() {
    // Capture phase on the host: runs before the projected control's own listeners, so a read-only
    // value never opens its panel, also from a screen reader's virtual click.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const guard = (event: Event): void => {
      this.guard(event);
    };
    host.addEventListener('click', guard, { capture: true });
    host.addEventListener('keydown', guard, { capture: true });
  }

  private guard(event: Event): void {
    if (!this.isReadonly()) return;
    if (event instanceof KeyboardEvent && !OPENING_KEYS.has(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
  }
}
