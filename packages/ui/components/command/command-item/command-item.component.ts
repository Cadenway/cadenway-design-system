import { _IdGenerator } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  type InputSignalWithTransform,
  type InputSignal,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';

import { COMMAND_GROUP } from '../command-group.token';
import { type CommandOption, CommandState } from '../command-state/command-state.service';

/* Literal class string (Command sheet and preview of the Design System artifact): 32 px rows, the
   highlight in `bg-selected`, the first key pushed to the right. */
/**
 * Constant ITEM
 *
 * @description
 * Classes for a command result and its highlighted and disabled states.
 *
 * @type {string}
 */
const ITEM: string =
  'relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm whitespace-nowrap outline-hidden select-none transition-colors motion-reduce:transition-none hover:bg-accent data-highlighted:bg-selected data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] [&>kbd:first-of-type]:ml-auto';

/**
 * Component CwCommandItem
 *
 * @description
 * One result of a command: an action, a task, a place (Command sheet of the Design System artifact). `role="option"`, highlighted by ↑ ↓ and the pointer (`data-highlighted`, `aria-selected`), run by Enter or a click: `selected` emits its `value`. Content: an icon or a status icon, a task id in `font-mono text-xs`, the label (wrap it in `cw-command-highlight` to bold the matched letters), a hint, shortcut keys (`kbd[cwKbd]`, the first one pushed to the right). The filter reads `value` (the text content by default), the `keywords` and, when `value` is set, the text content too. A `disabled` item stays visible at 50 % and is skipped by the arrows.
 */
@Component({
  selector: 'cw-command-item',
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
    '(mousedown)': '$event.preventDefault()',
  },
  templateUrl: './command-item.component.html',
})
export class CwCommandItem {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * Text the filter reads and `selected` emits; the trimmed text content by default.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly value: InputSignal<string> = input('');

  /**
   * Property keywords
   *
   * @description
   * Synonyms the filter also reads (« effacer » for « Supprimer »).
   *
   * @type {InputSignal<readonly string[]>}
   * @readonly
   */
  public readonly keywords: InputSignal<readonly string[]> = input<readonly string[]>([]);

  /**
   * Property disabled
   *
   * @description
   * Dims the item and skips it (« Assigner à moi » without an open task).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property selected
   *
   * @description
   * Emitted with the item's value on Enter or click.
   *
   * @type {OutputEmitterRef<string>}
   * @readonly
   */
  public readonly selected: OutputEmitterRef<string> = output<string>();

  /**
   * Property state
   *
   * @description
   * Shared command state used to register and navigate options.
   *
   * @type {CommandState}
   * @readonly
   */
  protected readonly state: CommandState = inject(CommandState);

  /**
   * Property id
   *
   * @description
   * Unique identifier of the command option.
   *
   * @type {string}
   * @readonly
   */
  protected readonly id: string = inject(_IdGenerator).getId('cw-command-item-');

  /**
   * Property element
   *
   * @description
   * Native item element used for value and focus behavior.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property group
   *
   * @description
   * Optional command group containing this item.
   *
   * @type {object | null}
   * @readonly
   */
  private readonly group: object | null = inject(COMMAND_GROUP, { optional: true });

  /**
   * Property option
   *
   * @description
   * Adapter registered with the shared command state.
   *
   * @type {CommandOption}
   * @readonly
   */
  protected readonly option: CommandOption = this.createOption();

  /**
   * Property highlighted
   *
   * @description
   * Whether the item is currently highlighted.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly highlighted: Signal<boolean> = computed(
    () => this.state.highlighted() === this.option,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Registers the item and unregisters it when destroyed.
   *
   * @constructor
   */
  public constructor() {
    this.state.register(this.option);
    inject(DestroyRef).onDestroy(() => {
      this.state.unregister(this.option);
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method run
   *
   * @description
   * Emits the item value unless the item is disabled.
   */
  protected run(): void {
    if (this.disabled()) return;
    this.selected.emit(this.resolvedValue());
  }

  /**
   * Method resolvedValue
   *
   * @description
   * Uses the supplied value or the trimmed item text.
   * @returns {string} Supplied value or trimmed item text.
   */
  private resolvedValue(): string {
    return this.value() || this.element.textContent.trim();
  }

  /**
   * Method createOption
   *
   * @description
   * Builds the option adapter used by the focus manager.
   * @returns {CommandOption} Option adapter for registration and keyboard navigation.
   */
  private createOption(): CommandOption {
    // An adapter for the CDK key manager, which reads `disabled` as a plain boolean. The highlight
    // is the state's signal, so the style callbacks have nothing to do.
    const disabled: InputSignalWithTransform<boolean, unknown> = this.disabled;
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
  // #endregion
}
