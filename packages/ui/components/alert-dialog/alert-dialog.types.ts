/** Style of the action and the media: `destructive` for a deletion, `default` for a heavy but reversible action. */
export type CwAlertDialogVariant = 'default' | 'destructive';

/** `sm`: 320 px, centered, with a media; `default`: 448 px, aligned to the start. */
export type CwAlertDialogSize = 'sm' | 'default';

/** How the confirmation was cancelled: the « Annuler » button or Escape. */
export type CwAlertDialogCancelReason = 'button' | 'escape';
