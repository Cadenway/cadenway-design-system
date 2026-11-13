/** Height, padding and radius of the trigger, aligned on Input; the panel keeps one size. */
export type CwSelectSize = 'sm' | 'default' | 'lg';

/** Tells whether two option values are the same choice (object values compared by id, say). */
export type CwSelectCompareWith<T> = (a: T, b: T) => boolean;
