import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorLockSimpleBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { PROPERTY_LIST, type PropertyListHost } from '../property-list.token';
import { PROPERTY, type PropertyHost } from '../property.token';
import type { CwPropertyListOrientation } from '../property-list.types';
import { CwPropertyValue } from '../property-value/property-value.directive';

/* Literal class strings (Property List sheet and preview of the Design System artifact). Inline, the
   label is not visible: it stays in the accessible name of the chip. */
/**
 * Constant LABEL
 *
 * @description
 * Label classes by list orientation.
 *
 * @type {Readonly<Record<CwPropertyListOrientation, string>>}
 */
const LABEL: Readonly<Record<CwPropertyListOrientation, string>> = {
  vertical: 'flex h-8 min-w-0 items-center gap-2 px-2 text-sm text-muted-foreground',
  inline: 'sr-only',
} as const;

/**
 * Constant VALUE
 *
 * @description
 * Value container classes by list orientation.
 *
 * @type {Readonly<Record<CwPropertyListOrientation, string>>}
 */
const VALUE: Readonly<Record<CwPropertyListOrientation, string>> = {
  vertical: 'min-w-0',
  inline: 'flex min-w-0',
} as const;

/**
 * Constant STATIC
 *
 * @description
 * Static value classes by list orientation.
 *
 * @type {Readonly<Record<CwPropertyListOrientation, string>>}
 */
const STATIC: Readonly<Record<CwPropertyListOrientation, string>> = {
  vertical: 'flex min-h-8 min-w-0 items-center gap-2 px-[9px] text-sm',
  inline:
    'inline-flex h-7 items-center gap-1.5 rounded-md border border-input px-2 text-xs font-medium',
} as const;

/* A read-only control keeps its own padding: the lock follows it. */
/**
 * Constant WITH_CONTROL
 *
 * @description
 * Read-only control classes by list orientation.
 *
 * @type {Readonly<Record<CwPropertyListOrientation, string>>}
 */
const WITH_CONTROL: Readonly<Record<CwPropertyListOrientation, string>> = {
  vertical: 'flex min-w-0 items-center gap-1 pr-2',
  inline: 'inline-flex min-w-0 items-center gap-1',
} as const;

/* Keys that open a control; a read-only value swallows them before the control sees them. */
/**
 * Constant OPENING_KEYS
 *
 * @description
 * Keys that open an editable control.
 *
 * @type {Set<string>}
 */
const OPENING_KEYS: Set<string> = new Set<string>(['Enter', ' ', 'ArrowDown', 'ArrowUp', 'F2']);

/**
 * Component CwProperty
 *
 * @description
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
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Property label used to name the value.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property icon
   * @readonly
   *
   * @description
   * Icon name for the property type.
   *
   * @type {InputSignal<string | undefined>}
   */
  public readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /**
   * Property readonly
   * @readonly
   *
   * @description
   * Whether the property is read-only.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property empty
   * @readonly
   *
   * @description
   * Explicit empty state, or undefined to detect it.
   *
   * @type {InputSignalWithTransform<boolean | undefined, unknown>}
   */
  public readonly empty: InputSignalWithTransform<boolean | undefined, unknown> = input<
    boolean | undefined,
    unknown
  >(undefined, {
    transform: (value: unknown) =>
      value === undefined || value === null ? undefined : booleanAttribute(value),
  });

  /**
   * Property emptyText
   * @readonly
   *
   * @description
   * Text displayed for an empty static value.
   *
   * @type {InputSignal<string>}
   */
  public readonly emptyText: InputSignal<string> = input('Vide');

  /**
   * Property readonlyLabel
   * @readonly
   *
   * @description
   * Accessible label of the read-only indicator.
   *
   * @type {InputSignal<string>}
   */
  public readonly readonlyLabel: InputSignal<string> = input('Lecture seule');

  /**
   * Property error
   * @readonly
   *
   * @description
   * Validation message or null.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly error: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property list
   * @readonly
   *
   * @description
   * Parent property list context.
   *
   * @type {PropertyListHost}
   */
  private readonly list: PropertyListHost = inject(PROPERTY_LIST);

  /**
   * Property ids
   * @readonly
   *
   * @description
   * Generator for accessible element identifiers.
   *
   * @type {_IdGenerator}
   */
  private readonly ids: _IdGenerator = inject(_IdGenerator);

  /**
   * Property value
   * @readonly
   *
   * @description
   * Projected value control, when present.
   *
   * @type {Signal<CwPropertyValue | undefined>}
   */
  private readonly value: Signal<CwPropertyValue | undefined> = contentChild(CwPropertyValue);

  /**
   * Property labelId
   * @readonly
   *
   * @description
   * Identifier of the property label.
   *
   * @internal
   *
   * @type {string}
   */
  public readonly labelId: string = this.ids.getId('cw-property-label-');

  /**
   * Property errorId
   * @readonly
   *
   * @description
   * Identifier of the property error.
   *
   * @internal
   *
   * @type {string}
   */
  public readonly errorId: string = this.ids.getId('cw-property-error-');

  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Orientation of the parent property list.
   *
   * @internal
   *
   * @type {Signal<CwPropertyListOrientation>}
   */
  public readonly orientation: Signal<CwPropertyListOrientation> = this.list.orientation;

  /**
   * Property isReadonly
   * @readonly
   *
   * @description
   * Whether the property or list is read-only.
   *
   * @internal
   *
   * @type {Signal<boolean>}
   */
  public readonly isReadonly: Signal<boolean> = computed(
    () => this.readonly() || this.list.readonly(),
  );

  /**
   * Property isEmpty
   * @readonly
   *
   * @description
   * Whether the value is empty.
   *
   * @internal
   *
   * @type {Signal<boolean>}
   */
  public readonly isEmpty: Signal<boolean> = computed(
    () => this.empty() ?? this.value()?.empty() ?? false,
  );

  /**
   * Property hidden
   * @readonly
   *
   * @description
   * Whether an empty row is folded.
   *
   * @internal
   *
   * @type {Signal<boolean>}
   */
  public readonly hidden: Signal<boolean> = computed(() => this.isEmpty() && this.list.foldEmpty());

  /**
   * Property hasControl
   * @readonly
   *
   * @description
   * Whether a value control is projected.
   *
   * @type {Signal<boolean>}
   */
  protected readonly hasControl: Signal<boolean> = computed(() => !!this.value());

  /**
   * Property labelClasses
   * @readonly
   *
   * @description
   * Label classes for the current orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly labelClasses: Signal<string> = computed(() => LABEL[this.orientation()]);

  /**
   * Property valueClasses
   * @readonly
   *
   * @description
   * Value container classes for the current orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly valueClasses: Signal<string> = computed(() => VALUE[this.orientation()]);

  /**
   * Property staticClasses
   * @readonly
   *
   * @description
   * Static value classes for the current orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly staticClasses: Signal<string> = computed(() => STATIC[this.orientation()]);

  /**
   * Property readonlyClasses
   * @readonly
   *
   * @description
   * Read-only value classes for the current orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly readonlyClasses: Signal<string> = computed(() =>
    this.hasControl() ? WITH_CONTROL[this.orientation()] : STATIC[this.orientation()],
  );

  /**
   * Property lockSize
   * @readonly
   *
   * @description
   * Icon size for the read-only indicator.
   *
   * @type {Signal<string>}
   */
  protected readonly lockSize: Signal<string> = computed(() =>
    this.orientation() === 'inline' ? '0.75rem' : '0.875rem',
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Guards projected controls against read-only interaction.
   */
  public constructor() {
    // Capture phase on the host: runs before the projected control's own listeners, so a read-only
    // value never opens its panel, also from a screen reader's virtual click.
    const host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const guard: (event: Event) => void = (event: Event): void => {
      this.guard(event);
    };
    host.addEventListener('click', guard, { capture: true });
    host.addEventListener('keydown', guard, { capture: true });
  }
  // #endregion

  // #region Methods
  /**
   * Method guard
   *
   * @description
   * Prevents opening a read-only property value.
   *
   * @param {Event} event - Click or keyboard event received by the property host.
   */
  private guard(event: Event): void {
    if (!this.isReadonly()) return;
    if (event instanceof KeyboardEvent && !OPENING_KEYS.has(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
  }
  // #endregion
}
