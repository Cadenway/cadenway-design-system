/** What an inline edit shows: the text, the open field, or the text while the parent saves it. */
export type CwInlineEditState = 'reading' | 'editing' | 'saving';

/** The French texts of an inline edit (Inline Edit sheet of the Design System artifact). */
export interface CwInlineEditLabels {
  /** Description of the text in reading mode (« Cliquer pour modifier »). */
  readonly editHint: string;
  /** Name of the Enter key in the help line (« Entrée »). */
  readonly enterKey: string;
  /** Name of the Escape key in the help line (« Échap »). */
  readonly escapeKey: string;
  /** Name of the Control key in the multiline help line (« Ctrl »). */
  readonly controlKey: string;
  /** What Enter does, after the key (« pour valider »). */
  readonly submit: string;
  /** What Escape does, after the key (« pour annuler »). */
  readonly cancel: string;
  /** What Ctrl + Enter does in a multiline field (« valider »). */
  readonly submitMultiline: string;
  /** What Escape does in a multiline field (« annuler »). */
  readonly cancelMultiline: string;
  /** Text next to the spinner while the parent saves (« Enregistrement… »). */
  readonly saving: string;
  /** Announced once the parent has saved without error (« Modification enregistrée »). */
  readonly saved: string;
  /** Error of an empty value when `required` is set. */
  readonly required: string;
  /** Hidden text of the lock in read-only mode (« Lecture seule »); empty hides the lock. */
  readonly readonly: string;
}
