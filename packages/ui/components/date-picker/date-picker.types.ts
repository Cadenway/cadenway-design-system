/** A complete period picked in a range date picker: both ends are set. */
export interface CwDatePickerRange {
  readonly start: Date;
  readonly end: Date;
}

/** The value of a date picker: a day (`mode="single"`), a period (`mode="range"`) or nothing. */
export type CwDatePickerValue = Date | CwDatePickerRange | null;

/** The trigger of a date picker: a Select-like button, or a field to type « jj/mm/aaaa ». */
export type CwDatePickerVariant = 'button' | 'input';

/** Height of the trigger: 28 px in a List cell, 32 px by default, 36 px. */
export type CwDatePickerSize = 'sm' | 'default' | 'lg';

/**
 * A shortcut of the presets column (« Demain », « Fin du sprint »); `date: null` clears the value
 * (« Sans échéance »). The consumer computes the dates: the picker knows nothing of sprints.
 */
export interface CwDatePreset {
  readonly label: string;
  readonly date: Date | null;
}
