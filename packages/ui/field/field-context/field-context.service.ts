import {
  computed,
  DestroyRef,
  inject,
  Service,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';

/** A `label[cwFieldLabel]` registered with its field. */
export interface FieldLabelRef {
  readonly element: HTMLLabelElement;
  /** The consumer wrote its own `for`: the field leaves it alone. */
  readonly explicit: boolean;
}

/**
 * What a `cw-field` shares with its parts: its error state, and the labels, descriptions and errors
 * that register with it so the field can wire them to its control. Provided by `cw-field`; not
 * exported from the entry point, the consumer never sees it.
 */
@Service({ autoProvided: false })
export class FieldContext {
  private readonly invalidSource = signal<Signal<boolean>>(signal(false));
  /** Whether the field is in error: the error shows, its id joins `aria-describedby`. */
  readonly isInvalid = computed(() => this.invalidSource()());
  /** Labels to point at the control. */
  readonly labels = signal<readonly FieldLabelRef[]>([]);
  /** Ids of the descriptions, always in `aria-describedby`. */
  readonly descriptions = signal<readonly string[]>([]);
  /** Ids of the errors, in `aria-describedby` while the field is invalid. */
  readonly errors = signal<readonly string[]>([]);

  /** Called once by the field that provides this context. */
  connect(invalid: Signal<boolean>): void {
    this.invalidSource.set(invalid);
  }
}

/**
 * Adds a part to one list of the context until the part is destroyed. Call it in an injection
 * context (a constructor).
 */
export function registerFieldPart<T>(list: WritableSignal<readonly T[]>, item: T): void {
  list.update((items) => [...items, item]);
  inject(DestroyRef).onDestroy(() => {
    list.update((items) => items.filter((entry) => entry !== item));
  });
}
