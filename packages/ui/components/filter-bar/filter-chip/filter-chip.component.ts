import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
  type TemplateRef,
  viewChild,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { CwCalendar, type CwCalendarSelection } from '@cadenway/ui/components/calendar';
import { CwInput } from '@cadenway/ui/components/input';
import {
  CwMenu,
  CwMenuItem,
  CwMenuItemCheckbox,
  CwMenuTriggerFor,
} from '@cadenway/ui/components/menu';
import { CwPopover, CwPopoverTrigger } from '@cadenway/ui/components/popover';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorXBold } from '@ng-icons/phosphor-icons/bold';

import { CW_FILTER_BAR_LABELS } from '../filter-bar.constants';
import { CW_FILTER_TEMPLATES, type FilterTemplates } from '../filter-bar.token';
import type {
  CwFilter,
  CwFilterBarLabels,
  CwFilterField,
  CwFilterFieldType,
  CwFilterOperator,
  CwFilterOption,
  CwFilterOptionContext,
  CwFilterValue,
  CwFilterValueContext,
} from '../filter-bar.types';
import { CwFilterOptionDef } from '../filter-option/filter-option.directive';
import { CwFilterValueDef } from '../filter-value/filter-value.directive';

/* Literal class strings (Filter Bar sheet and preview of the Design System artifact): a 28 px
   segmented chip, `input` border, segments split by `border-l` lines; each segment takes the hover
   alone, and the focus ring rises above its neighbours (`focus-visible:z-10`). The open segment
   turns `bg-selected` through its menu or popover trigger. A chip enters with `animate-item-in`. */
/**
 * Constant CHIP
 *
 * @description
 * Base classes for a segmented filter chip.
 *
 * @type {string}
 */
const CHIP: string =
  'inline-flex h-7 items-stretch rounded-md border border-input bg-background text-xs animate-item-in motion-reduce:animate-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:0.875rem]';

/**
 * Constant FIELD
 *
 * @description
 * Classes for the field segment.
 *
 * @type {string}
 */
const FIELD: string = 'flex items-center gap-1.5 px-2 whitespace-nowrap text-muted-foreground';

/**
 * Constant OPERATOR
 *
 * @description
 * Classes for the operator segment.
 *
 * @type {string}
 */
const OPERATOR: string =
  'relative flex items-center gap-1.5 border-l px-2 whitespace-nowrap text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-accent hover:text-foreground outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Constant VALUE
 *
 * @description
 * Classes for the value segment.
 *
 * @type {string}
 */
const VALUE: string =
  'relative flex items-center gap-1.5 border-l px-2 font-medium whitespace-nowrap transition-colors motion-reduce:transition-none hover:bg-accent hover:text-foreground outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Constant REMOVE
 *
 * @description
 * Classes for the remove control.
 *
 * @type {string}
 */
const REMOVE: string =
  'relative flex items-center rounded-r-[3px] border-l px-1.5 text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-accent hover:text-foreground outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/* Values shown in the segment before the summary (sheet: « 3 personnes » beyond two). */
/**
 * Constant SHOWN_VALUES
 *
 * @description
 * Maximum number of value labels shown before a summary is used.
 *
 * @type {2}
 */
const SHOWN_VALUES: 2 = 2;
/**
 * Constant SHOWN_MEDIA
 *
 * @description
 * Maximum number of value icons shown in the segment.
 *
 * @type {3}
 */
const SHOWN_MEDIA: 3 = 3;

/**
 * Constant DAY_FORMAT
 *
 * @description
 * French day-and-month formatter for the value segment.
 *
 * @type {Intl.DateTimeFormat}
 */
const DAY_FORMAT: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
});

/**
 * Function parseDay
 *
 * @description
 * Parses an ISO day string into a date.
 *
 * @param {unknown} value - Value to parse or apply.
 * @returns {Date | null} Parsed date, or null for an invalid input.
 */
function parseDay(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const match: RegExpExecArray | null = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * Function formatDay
 *
 * @description
 * Formats a date as an ISO day string.
 *
 * @param {Date} date - Date to format.
 * @returns {string} ISO day string.
 */
function formatDay(date: Date): string {
  const month: string = String(date.getMonth() + 1).padStart(2, '0');
  const day: string = String(date.getDate()).padStart(2, '0');
  return `${String(date.getFullYear())}-${month}-${day}`;
}

/**
 * Component CwFilterChip
 *
 * @description
 * One active filter, as a segmented chip « field · operator · value · remove » (Filter Bar sheet of the Design System artifact). `cw-filter-bar` renders one per filter; it also works alone. `[(filter)]` is a model (`filterChange` on every edit); `field` describes the field (label, icon, type, operators, options) and is required. The field segment is plain text. The operator segment (« Opérateur : est ») opens a `cw-menu` of the field's operators, the current one checked. The value segment, absent for a `valueless` operator, opens the value editor: a menu of ticked options for `status`, `person` and `select` (it stays open while ticking), a calendar in a popover for `date` (picking a day closes it), a text field in a popover for `text` (Enter applies and closes). It shows « En cours, Bloqué », or the field's `manyLabel` beyond two values, with the options' media (`icon`, or an `ng-template[cwFilterOption]`); an `ng-template[cwFilterValue]` replaces that content. The remove segment (« Retirer le filtre Statut ») and Backspace or Delete on it emit `removed`. Renders `role="group"` named « Filtre Statut ».
 */
@Component({
  selector: 'cw-filter-chip',
  imports: [
    NgIcon,
    NgTemplateOutlet,
    CwCalendar,
    CwInput,
    CwMenu,
    CwMenuItem,
    CwMenuItemCheckbox,
    CwMenuTriggerFor,
    CwPopover,
    CwPopoverTrigger,
  ],
  providers: [provideIcons({ phosphorXBold })],
  host: {
    role: 'group',
    class: CHIP,
    '[attr.aria-label]': 'text().chip(field().label)',
    '[attr.data-field]': 'field().key',
  },
  templateUrl: './filter-chip.component.html',
})
export class CwFilterChip {
  // #region Properties
  /**
   * Property filter
   *
   * @description
   * The filter, `[(filter)]`; `filterChange` fires on each edit of the operator or the value.
   *
   * @type {ModelSignal<CwFilter>}
   * @readonly
   */
  public readonly filter: ModelSignal<CwFilter> = model.required<CwFilter>();

  /**
   * Property field
   *
   * @description
   * The field the filter applies to.
   *
   * @type {InputSignal<CwFilterField>}
   * @readonly
   */
  public readonly field: InputSignal<CwFilterField> = input.required<CwFilterField>();

  /**
   * Property labels
   *
   * @description
   * French texts to override (`CwFilterBarLabels`).
   *
   * @type {InputSignal<Partial<CwFilterBarLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwFilterBarLabels>> = input<
    Partial<CwFilterBarLabels>
  >({});

  /**
   * Property removed
   *
   * @description
   * Emitted when the remove segment is clicked, or on Backspace or Delete over it.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly removed: OutputEmitterRef<void> = output();

  /**
   * Property fieldClasses
   *
   * @description
   * Classes applied to the field segment.
   *
   * @type {string}
   * @readonly
   */
  protected readonly fieldClasses: string = FIELD;

  /**
   * Property operatorClasses
   *
   * @description
   * Classes applied to the operator segment.
   *
   * @type {string}
   * @readonly
   */
  protected readonly operatorClasses: string = OPERATOR;

  /**
   * Property valueClasses
   *
   * @description
   * Classes applied to the value segment.
   *
   * @type {string}
   * @readonly
   */
  protected readonly valueClasses: string = VALUE;

  /**
   * Property removeClasses
   *
   * @description
   * Classes applied to the remove control.
   *
   * @type {string}
   * @readonly
   */
  protected readonly removeClasses: string = REMOVE;

  /**
   * Property barTemplates
   *
   * @description
   * Optional templates inherited from a containing filter bar.
   *
   * @type {FilterTemplates | null}
   * @readonly
   */
  private readonly barTemplates: FilterTemplates | null = inject(CW_FILTER_TEMPLATES, {
    optional: true,
  });

  /**
   * Property ownValueTemplates
   *
   * @description
   * Value templates projected directly into the chip.
   *
   * @type {Signal<readonly CwFilterValueDef[]>}
   * @readonly
   */
  private readonly ownValueTemplates: Signal<readonly CwFilterValueDef[]> =
    contentChildren(CwFilterValueDef);

  /**
   * Property ownOptionTemplates
   *
   * @description
   * Option templates projected directly into the chip.
   *
   * @type {Signal<readonly CwFilterOptionDef[]>}
   * @readonly
   */
  private readonly ownOptionTemplates: Signal<readonly CwFilterOptionDef[]> =
    contentChildren(CwFilterOptionDef);

  /**
   * Property operatorButton
   *
   * @description
   * First chip segment used for focus.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly operatorButton: Signal<ElementRef<HTMLElement>> = viewChild.required<
    string,
    ElementRef<HTMLElement>
  >('operatorButton', { read: ElementRef });

  /**
   * Property valueButton
   *
   * @description
   * Optional value segment used to open its editor.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   * @readonly
   */
  private readonly valueButton: Signal<ElementRef<HTMLElement> | undefined> = viewChild<
    string,
    ElementRef<HTMLElement>
  >('valueButton', {
    read: ElementRef,
  });

  /**
   * Property valueMenu
   *
   * @description
   * Menu used to select option values.
   *
   * @type {Signal<CwMenu | undefined>}
   * @readonly
   */
  private readonly valueMenu: Signal<CwMenu | undefined> = viewChild<CwMenu>('valueMenu');

  /**
   * Property valuePopover
   *
   * @description
   * Popover used for date or text values.
   *
   * @type {Signal<CwPopover | undefined>}
   * @readonly
   */
  private readonly valuePopover: Signal<CwPopover | undefined> =
    viewChild<CwPopover>('valuePopover');

  /**
   * Property text
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<CwFilterBarLabels>}
   * @readonly
   */
  protected readonly text: Signal<CwFilterBarLabels> = computed<CwFilterBarLabels>(() => ({
    ...CW_FILTER_BAR_LABELS,
    ...this.labels(),
  }));

  /**
   * Property operator
   *
   * @description
   * Selected operator, or null when unavailable.
   *
   * @type {Signal<CwFilterOperator | null>}
   * @readonly
   */
  protected readonly operator: Signal<CwFilterOperator | null> = computed<CwFilterOperator | null>(
    () => this.field().operators.find((item) => item.value === this.filter().operator) ?? null,
  );

  /**
   * Property operatorLabel
   *
   * @description
   * Displayed label of the selected operator.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly operatorLabel: Signal<string> = computed(
    () => this.operator()?.label ?? this.filter().operator,
  );

  /**
   * Property hasValue
   *
   * @description
   * Whether the selected operator requires a value.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hasValue: Signal<boolean> = computed(() => !this.operator()?.valueless);

  /**
   * Property kind
   *
   * @description
   * Editor kind selected for the field type.
   *
   * @type {Signal<"date" | "text" | "choice">}
   * @readonly
   */
  protected readonly kind: Signal<'date' | 'text' | 'choice'> = computed(() => {
    const type: CwFilterFieldType = this.field().type;
    return type === 'date' || type === 'text' ? type : 'choice';
  });

  /**
   * Property ticked
   *
   * @description
   * Currently selected option values.
   *
   * @type {Signal<readonly string[]>}
   * @readonly
   */
  private readonly ticked: Signal<readonly string[]> = computed<readonly string[]>(() => {
    const value: CwFilterValue = this.filter().value;
    if (Array.isArray(value)) return value as readonly string[];
    return typeof value === 'string' ? [value] : [];
  });

  /**
   * Property chosen
   *
   * @description
   * The ticked options, in the order of the field.
   *
   * @type {Signal<readonly CwFilterOption[]>}
   * @readonly
   */
  protected readonly chosen: Signal<readonly CwFilterOption[]> = computed<
    readonly CwFilterOption[]
  >(() => {
    const ticked: readonly string[] = this.ticked();
    return (this.field().options ?? []).filter((option) => ticked.includes(option.value));
  });

  /**
   * Property media
   *
   * @description
   * Options whose icons are displayed in the value segment.
   *
   * @type {Signal<CwFilterOption[]>}
   * @readonly
   */
  protected readonly media: Signal<CwFilterOption[]> = computed(() =>
    this.chosen().slice(0, SHOWN_MEDIA),
  );

  /**
   * Property stacked
   *
   * @description
   * Whether option media use a stacked presentation.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly stacked: Signal<boolean> = computed(() => this.chosen().length > SHOWN_VALUES);

  /**
   * Property day
   *
   * @description
   * Selected date parsed from the filter value.
   *
   * @type {Signal<Date | null>}
   * @readonly
   */
  protected readonly day: Signal<Date | null> = computed(() => parseDay(this.filter().value));

  /**
   * Property typed
   *
   * @description
   * Current text filter value.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly typed: Signal<string> = computed(() => {
    const value: CwFilterValue = this.filter().value;
    return typeof value === 'string' ? value : '';
  });

  /**
   * Property summary
   *
   * @description
   * Text of the value segment.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly summary: Signal<string> = computed(() => {
    switch (this.kind()) {
      case 'date': {
        const day: Date | null = this.day();
        return day ? DAY_FORMAT.format(day) : this.text().emptyValue;
      }
      case 'text':
        return this.typed() || this.text().emptyValue;
      default: {
        const chosen: readonly CwFilterOption[] = this.chosen();
        if (chosen.length === 0) return this.text().emptyValue;
        const many: ((count: number) => string) | undefined = this.field().manyLabel;
        if (chosen.length > SHOWN_VALUES && many) return many(chosen.length);
        return chosen.map((option) => option.label).join(', ');
      }
    }
  });

  /**
   * Property valueTemplate
   *
   * @description
   * Custom value template for this field, when supplied.
   *
   * @type {Signal<TemplateRef<CwFilterValueContext> | null>}
   * @readonly
   */
  protected readonly valueTemplate: Signal<TemplateRef<CwFilterValueContext> | null> = computed(
    () => {
      const key: string = this.field().key;
      const all: CwFilterValueDef[] = [
        ...this.ownValueTemplates(),
        ...(this.barTemplates?.values() ?? []),
      ];
      return all.find((template) => template.cwFilterValue() === key)?.ɵtemplate ?? null;
    },
  );

  /**
   * Property optionTemplate
   *
   * @description
   * Custom option template for this field, when supplied.
   *
   * @type {Signal<TemplateRef<CwFilterOptionContext> | null>}
   * @readonly
   */
  protected readonly optionTemplate: Signal<TemplateRef<CwFilterOptionContext> | null> = computed(
    () => {
      const key: string = this.field().key;
      const all: CwFilterOptionDef[] = [
        ...this.ownOptionTemplates(),
        ...(this.barTemplates?.options() ?? []),
      ];
      return all.find((template) => template.cwFilterOption() === key)?.ɵtemplate ?? null;
    },
  );
  // #endregion

  // #region Methods
  /**
   * Method ɵfocus
   *
   * @description
   * Moves the focus to the chip's first segment. Not public API.
   */
  public ɵfocus(): void {
    this.operatorButton().nativeElement.focus();
  }

  /**
   * Method ɵopenValue
   *
   * @description
   * Opens the value editor (after the bar added the filter). Not public API.
   */
  public ɵopenValue(): void {
    const button: HTMLElement | undefined = this.valueButton()?.nativeElement;
    if (!button) return;
    const menu: CwMenu | undefined = this.valueMenu();
    if (menu) {
      menu.open({ origin: button, trigger: button, focus: 'first' });
      return;
    }
    this.valuePopover()?.toggle(button);
  }

  /**
   * Method isTicked
   *
   * @description
   * Checks whether an option is selected.
   *
   * @param {CwFilterOption} option - Option involved in the interaction.
   * @returns {boolean} Whether the option is selected.
   */
  protected isTicked(option: CwFilterOption): boolean {
    return this.ticked().includes(option.value);
  }

  /**
   * Method setOperator
   *
   * @description
   * Updates the operator and clears values for valueless operators.
   *
   * @param {CwFilterOperator} operator - Operator to select.
   */
  protected setOperator(operator: CwFilterOperator): void {
    const current: CwFilter = this.filter();
    if (current.operator === operator.value) return;
    this.filter.set({
      ...current,
      operator: operator.value,
      value: operator.valueless ? null : current.value,
    });
  }

  /**
   * Method tick
   *
   * @description
   * Updates selected options while preserving field option order.
   *
   * @param {CwFilterOption} option - Option involved in the interaction.
   * @param {boolean} checked - Whether the option should be selected.
   */
  protected tick(option: CwFilterOption, checked: boolean): void {
    const ticked: string[] = this.ticked().filter((value) => value !== option.value);
    // Keep the order of the field's options, whatever the order of the clicks.
    const next: string[] = checked ? [...ticked, option.value] : ticked;
    const order: string[] = (this.field().options ?? []).map((item) => item.value);
    this.filter.set({
      ...this.filter(),
      value: [...next].sort((a, b) => order.indexOf(a) - order.indexOf(b)),
    });
  }

  /**
   * Method pickDay
   *
   * @description
   * Applies a selected calendar day and closes the editor.
   *
   * @param {CwCalendarSelection} selection - Selection received from the calendar.
   * @param {CwPopover} popover - Popover containing the editor.
   */
  protected pickDay(selection: CwCalendarSelection, popover: CwPopover): void {
    if (!(selection instanceof Date)) return;
    this.filter.set({ ...this.filter(), value: formatDay(selection) });
    popover.close();
  }

  /**
   * Method commitText
   *
   * @description
   * Trims and applies a text value.
   *
   * @param {string} value - Value to parse or apply.
   */
  protected commitText(value: string): void {
    const trimmed: string = value.trim();
    const next: string | null = trimmed === '' ? null : trimmed;
    if (next === this.filter().value) return;
    this.filter.set({ ...this.filter(), value: next });
  }

  /**
   * Method applyText
   *
   * @description
   * Applies the text field value and closes its editor.
   *
   * @param {HTMLInputElement} field - Field associated with the operation.
   * @param {CwPopover} popover - Popover containing the editor.
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected applyText(field: HTMLInputElement, popover: CwPopover, event: Event): void {
    event.preventDefault();
    this.commitText(field.value);
    popover.close();
  }

  /**
   * Method onRemoveKeydown
   *
   * @description
   * Removes the chip for Backspace or Delete.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   */
  protected onRemoveKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    event.preventDefault();
    this.removed.emit();
  }
  // #endregion
}
