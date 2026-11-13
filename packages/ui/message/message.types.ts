/** Kind of message: from the others (left), your own (right), or a notice about the thread. */
export type CwMessageVariant = 'incoming' | 'outgoing' | 'system';

/** Tone of a system notice or of the state note under a bubble; same tones as Banner and Alert. */
export type CwMessageTone = 'default' | 'info' | 'success' | 'warning' | 'error';

/** Sending state of an outgoing message; `failed` brings the error note with « Réessayer ». */
export type CwMessageStatus = 'sent' | 'sending' | 'failed';

/** The French texts of a message; each one can be replaced through the `labels` input. */
export interface CwMessageLabels {
  /** After the time of an edited message. */
  readonly edited: string;
  /** Footer of an outgoing message being sent. */
  readonly sending: string;
  /** Note of a message whose sending failed. */
  readonly failed: string;
  /** Retry button of the failed note. */
  readonly retry: string;
  /** Delete button of the failed note. */
  readonly remove: string;
  /** Accessible name of the action bar. */
  readonly actions: string;
  /** Accessible name of the react button. */
  readonly react: string;
  /** Accessible name of the reply button. */
  readonly reply: string;
  /** Accessible name of the more-actions button. */
  readonly more: string;
  /** Time of a message less than a minute old. */
  readonly justNow: string;
}

/** The tone words read before a notice or a note (« Avertissement : … »), French by default. */
export interface CwMessageToneLabels {
  readonly info: string;
  readonly success: string;
  readonly warning: string;
  readonly error: string;
}

/** The French texts of a thread summary; each one can be replaced through the `labels` input. */
export interface CwMessageThreadLabels {
  /** After a count of one (« 1 réponse »). */
  readonly reply: string;
  /** After any other count (« 3 réponses »). */
  readonly replies: string;
  /** Before the time of the last reply (« Dernière à 11:05 »). */
  readonly last: string;
  /** Between `last` and a time of today. */
  readonly at: string;
  /** Time of a reply less than a minute old. */
  readonly justNow: string;
}
