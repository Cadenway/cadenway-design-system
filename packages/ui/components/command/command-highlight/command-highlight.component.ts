import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';

import { matchRanges, type MatchRange } from '../command.match';
import { CommandState } from '../command-state/command-state.service';

/**
 * Interface Part
 *
 * @description
 * Segment of a highlighted command label.
 */
interface Part {
  // #region Properties
  /**
   * Property text
   *
   * @description
   * Text displayed in this segment.
   *
   * @type {string}
   * @readonly
   */
  readonly text: string;

  /**
   * Property match
   *
   * @description
   * Whether the segment matches the search.
   *
   * @type {boolean}
   * @readonly
   */
  readonly match: boolean;
  // #endregion
}

/**
 * Component CwCommandHighlight
 *
 * @description
 * The label of a command item with the letters that match the search in `font-semibold text-foreground` (Command sheet of the Design System artifact, "Filtré"). Renders `text` as is outside a command or without a search.
 */
@Component({
  selector: 'cw-command-highlight',
  host: { class: 'min-w-0 truncate' },
  templateUrl: './command-highlight.component.html',
})
export class CwCommandHighlight {
  // #region Properties
  /**
   * Property text
   *
   * @description
   * The label to show.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly text: InputSignal<string> = input.required<string>();

  /**
   * Property state
   *
   * @description
   * Shared command state used to render and navigate results.
   *
   * @type {CommandState | null}
   * @readonly
   */
  private readonly state: CommandState | null = inject(CommandState, { optional: true });

  /**
   * Property parts
   *
   * @description
   * Label segments marked according to the current search.
   *
   * @type {Signal<readonly Part[]>}
   * @readonly
   */
  protected readonly parts: Signal<readonly Part[]> = computed<readonly Part[]>(() => {
    const text: string = this.text();
    const ranges: readonly MatchRange[] = matchRanges(text, this.state?.search() ?? '');
    const parts: Part[] = [];
    let cursor: number = 0;
    for (const range of ranges) {
      const [start, end]: MatchRange = range;
      if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
      parts.push({ text: text.slice(start, end), match: true });
      cursor = end;
    }
    if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
    return parts;
  });
  // #endregion
}
