/** Color of the filled part: ink, jade for items that have a done state, grenat for an overrun. */
export type CwProgressVariant = 'default' | 'success' | 'destructive';

/** Height of the track: 4 px (`sm`), 6 px (`default`), 8 px (`lg`). */
export type CwProgressSize = 'sm' | 'default' | 'lg';

/** What the bar shows: an empty or partial fill, a full track, or an unknown amount. */
export type CwProgressState = 'loading' | 'complete' | 'indeterminate';
