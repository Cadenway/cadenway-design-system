/** Height, padding and radius of the trigger, those of Select; the panel keeps one size. */
export type CwComboboxSize = 'sm' | 'default' | 'lg';

/** Tells whether two option values are the same choice (object values compared by id, say). */
export type CwComboboxCompareWith<T> = (a: T, b: T) => boolean;

/** What the search filter knows of an option: its value, its visible text and its keywords. */
export interface CwComboboxFilterOption<T> {
  readonly value: T;
  readonly label: string;
  readonly keywords: readonly string[];
}

/** Tells whether an option matches the typed search (never called with an empty search). */
export type CwComboboxFilter<T> = (option: CwComboboxFilterOption<T>, query: string) => boolean;
