import { _IdGenerator } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { COMMAND_GROUP } from '../command-group.token';
import { type CommandOption, CommandState } from '../command-state/command-state.service';

/* Literal class string (Command sheet and preview of the Design System artifact): 32 px rows, the
   highlight in `bg-selected`, the first key pushed to the right. */
const ITEM =
  'relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm whitespace-nowrap outline-hidden select-none transition-colors motion-reduce:transition-none hover:bg-accent data-highlighted:bg-selected data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] [&>kbd:first-of-type]:ml-auto';

/**
 * One result of a command: an action, a task, a place (Command sheet of the Design System
 * artifact). `role="option"`, highlighted by ↑ ↓ and the pointer (`data-highlighted`,
 * `aria-selected`), run by Enter or a click: `selected` emits its `value`.
 *
 * Content: an icon or a status icon, a task id in `font-mono text-xs`, the label (wrap it in
 * `cw-command-highlight` to bold the matched letters), a hint, shortcut keys (`kbd[cwKbd]`, the
 * first one pushed to the right). The filter reads `value` (the text content by default), the
 * `keywords` and, when `value` is set, the text content too. A `disabled` item stays visible at 50 % and is skipped by the arrows.
 */
@Component({
  selector: 'cw-command-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: ITEM,
    role: 'option',
    '[id]': 'id',
    '[attr.hidden]': 'state.isVisible(option) ? null : ""',
    '[attr.aria-selected]': 'highlighted()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-highlighted]': 'highlighted() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(click)': 'run()',
    '(pointermove)': 'state.highlight(option)',
    // The focus stays in the search field: a press on a row must not take it.
    '(mousedown)': '$event.preventDefault()',
  },
  templateUrl: './command-item.component.html',
})
export class CwCommandItem {
  /** Text the filter reads and `selected` emits; the trimmed text content by default. */
  readonly value = input('');
  /** Synonyms the filter also reads (« effacer » for « Supprimer »). */
  readonly keywords = input<readonly string[]>([]);
  /** Dims the item and skips it (« Assigner à moi » without an open task). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Emitted with the item's value on Enter or click. */
  readonly selected = output<string>();

  protected readonly state = inject(CommandState);
  protected readonly id = inject(_IdGenerator).getId('cw-command-item-');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly group = inject(COMMAND_GROUP, { optional: true });

  protected readonly option: CommandOption = this.createOption();
  protected readonly highlighted = computed(() => this.state.highlighted() === this.option);

  constructor() {
    this.state.register(this.option);
    inject(DestroyRef).onDestroy(() => {
      this.state.unregister(this.option);
    });
  }

  protected run(): void {
    if (this.disabled()) return;
    this.selected.emit(this.resolvedValue());
  }

  private resolvedValue(): string {
    return this.value() || this.element.textContent.trim();
  }

  private createOption(): CommandOption {
    // An adapter for the CDK key manager, which reads `disabled` as a plain boolean. The highlight
    // is the state's signal, so the style callbacks have nothing to do.
    const disabled = this.disabled;
    return {
      id: this.id,
      element: this.element,
      group: this.group,
      value: () => this.resolvedValue(),
      // A `value` set to an id (« CAD-488 ») still lets the label match (mockup App.dc.html: the
      // palette searches the label and the id).
      keywords: () =>
        this.value() ? [...this.keywords(), this.element.textContent.trim()] : this.keywords(),
      isDisabled: () => disabled(),
      select: () => {
        this.run();
      },
      get disabled() {
        return disabled();
      },
      getLabel: () => this.resolvedValue(),
      setActiveStyles: () => undefined,
      setInactiveStyles: () => undefined,
    };
  }
}
