import { Component, computed, inject, input } from '@angular/core';

import { matchRanges } from '../command.match';
import { CommandState } from '../command-state/command-state.service';

interface Part {
  readonly text: string;
  readonly match: boolean;
}

/**
 * The label of a command item with the letters that match the search in `font-semibold
 * text-foreground` (Command sheet of the Design System artifact, "Filtré"). Renders `text` as is
 * outside a command or without a search.
 */
@Component({
  selector: 'cw-command-highlight',
  host: { class: 'min-w-0 truncate' },
  templateUrl: './command-highlight.component.html',
})
export class CwCommandHighlight {
  /** The label to show. */
  readonly text = input.required<string>();

  private readonly state = inject(CommandState, { optional: true });

  protected readonly parts = computed<readonly Part[]>(() => {
    const text = this.text();
    const ranges = matchRanges(text, this.state?.search() ?? '');
    const parts: Part[] = [];
    let cursor = 0;
    for (const [start, end] of ranges) {
      if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
      parts.push({ text: text.slice(start, end), match: true });
      cursor = end;
    }
    if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
    return parts;
  });
}
