/**
 * Type CwCodeBlockVariant
 *
 * @description
 * `default` for code, configuration and terminals; `destructive` for the log of a failed run.
 *
 * @type {'default' | 'destructive'}
 */
export type CwCodeBlockVariant = 'default' | 'destructive';

/**
 * Type CwCodeBlockSize
 *
 * @description
 * `default` 12/20 px; `sm` 11/18 px for terminals, logs and comments.
 *
 * @type {'default' | 'sm'}
 */
export type CwCodeBlockSize = 'default' | 'sm';

/**
 * Type CwCodeBlockLineKind
 *
 * @description
 * How a line is drawn: plain, put forward, added or removed (diff), or a comment.
 *
 * @type {'default' | 'highlighted' | 'added' | 'removed' | 'comment'}
 */
export type CwCodeBlockLineKind = 'default' | 'highlighted' | 'added' | 'removed' | 'comment';
