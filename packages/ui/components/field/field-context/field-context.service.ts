import {
  computed,
  DestroyRef,
  inject,
  Service,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';

/**
 * Interface FieldLabelRef
 *
 * @description
 * Label registered with a field.
 */
export interface FieldLabelRef {
  // #region Properties
  /**
   * Property element
   * @readonly
   *
   * @description
   * Registered label element.
   *
   * @type {HTMLLabelElement}
   */
  readonly element: HTMLLabelElement;

  /**
   * Property explicit
   * @readonly
   *
   * @description
   * Whether the consumer supplied the for attribute.
   *
   * @type {boolean}
   */
  readonly explicit: boolean;
  // #endregion
}

/**
 * Service FieldContext
 *
 * @description
 * What a `cw-field` shares with its parts: its error state, and the labels, descriptions and errors
 * that register with it so the field can wire them to its control. Provided by `cw-field`; not
 * exported from the entry point, the consumer never sees it.
 */
@Service({ autoProvided: false })
export class FieldContext {
  // #region Properties
  /**
   * Property invalidSource
   * @readonly
   *
   * @description
   * Source of the field invalid state.
   *
   * @type {WritableSignal<Signal<boolean>>}
   */
  private readonly invalidSource: WritableSignal<Signal<boolean>> = signal<Signal<boolean>>(
    signal(false),
  );

  /**
   * Property isInvalid
   * @readonly
   *
   * @description
   * Whether the field is invalid.
   *
   * @type {Signal<boolean>}
   */
  public readonly isInvalid: Signal<boolean> = computed(() => this.invalidSource()());

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Registered labels for the control.
   *
   * @type {WritableSignal<readonly FieldLabelRef[]>}
   */
  public readonly labels: WritableSignal<readonly FieldLabelRef[]> = signal<
    readonly FieldLabelRef[]
  >([]);

  /**
   * Property descriptions
   * @readonly
   *
   * @description
   * Registered description identifiers.
   *
   * @type {WritableSignal<readonly string[]>}
   */
  public readonly descriptions: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

  /**
   * Property errors
   * @readonly
   *
   * @description
   * Registered error identifiers.
   *
   * @type {WritableSignal<readonly string[]>}
   */
  public readonly errors: WritableSignal<readonly string[]> = signal<readonly string[]>([]);
  // #endregion

  // #region Methods
  /**
   * Method connect
   *
   * @description
   * Connects the invalid state supplied by the parent field.
   *
   * @param {Signal<boolean>} invalid - Signal supplied by the parent field for its invalid state.
   */
  public connect(invalid: Signal<boolean>): void {
    this.invalidSource.set(invalid);
  }
  // #endregion
}

/**
 * Function registerFieldPart
 *
 * @description
 * Adds a part to one list of the context until the part is destroyed. Call it in an injection
 * context (a constructor).
 *
 * @param {WritableSignal<readonly T[]>} list - Signal holding registered field parts.
 * @param {T} item - Part to register until the current context is destroyed.
 */
export function registerFieldPart<T>(list: WritableSignal<readonly T[]>, item: T): void {
  list.update((items) => [...items, item]);
  inject(DestroyRef).onDestroy(() => {
    list.update((items) => items.filter((entry) => entry !== item));
  });
}
