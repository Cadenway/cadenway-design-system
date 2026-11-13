/** `default` for code, configuration and terminals; `destructive` for the log of a failed run. */
export type CwCodeBlockVariant = 'default' | 'destructive';

/** `default` 12/20 px; `sm` 11/18 px for terminals, logs and comments. */
export type CwCodeBlockSize = 'default' | 'sm';

/** How a line is drawn: plain, put forward, added or removed (diff), or a comment. */
export type CwCodeBlockLineKind = 'default' | 'highlighted' | 'added' | 'removed' | 'comment';
