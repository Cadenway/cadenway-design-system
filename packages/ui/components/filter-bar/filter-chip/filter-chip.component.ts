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
  viewChild,
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
import { CW_FILTER_TEMPLATES } from '../filter-bar.token';
import type {
  CwFilter,
  CwFilterBarLabels,
  CwFilterField,
  CwFilterOperator,
  CwFilterOption,
} from '../filter-bar.types';
import { CwFilterOptionDef } from '../filter-option/filter-option.directive';
import { CwFilterValueDef } from '../filter-value/filter-value.directive';

/* Literal class strings (Filter Bar sheet and preview of the Design System artifact): a 28 px
   segmented chip, `input` border, segments split by `border-l` lines; each segment takes the hover
   alone, and the focus ring rises above its neighbours (`focus-visible:z-10`). The open segment
   turns `bg-selected` through its menu or popover trigger. A chip enters with `animate-item-in`. */
const CHIP =
  'inline-flex h-7 items-stretch rounded-md border border-input bg-background text-xs animate-item-in motion-reduce:animate-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:0.875rem]';

const FIELD = 'flex items-center gap-1.5 px-2 whitespace-nowrap text-muted-foreground';

const OPERATOR =
  'relative flex items-center gap-1.5 border-l px-2 whitespace-nowrap text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-accent hover:text-foreground outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const VALUE =
  'relative flex items-center gap-1.5 border-l px-2 font-medium whitespace-nowrap transition-colors motion-reduce:transition-none hover:bg-accent hover:text-foreground outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const REMOVE =
  'relative flex items-center rounded-r-[3px] border-l px-1.5 text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-accent hover:text-foreground outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/* Values shown in the segment before the summary (sheet: « 3 personnes » beyond two). */
const SHOWN_VALUES = 2;
const SHOWN_MEDIA = 3;

const DAY_FORMAT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

function parseDay(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(date.getFullYear())}-${month}-${day}`;
}

/**
 * One active filter, as a segmented chip « field · operator · value · remove » (Filter Bar sheet of
 * the Design System artifact). `cw-filter-bar` renders one per filter; it also works alone.
 *
 * `[(filter)]` is a model (`filterChange` on every edit); `field` describes the field (label,
 * icon, type, operators, options) and is required. The field segment is plain text. The operator
 * segment (« Opérateur : est ») opens a `cw-menu` of the field's operators, the current one
 * checked. The value segment, absent for a `valueless` operator, opens the value editor: a menu of
 * ticked options for `status`, `person` and `select` (it stays open while ticking), a calendar in
 * a popover for `date` (picking a day closes it), a text field in a popover for `text` (Enter
 * applies and closes). It shows « En cours, Bloqué », or the field's `manyLabel` beyond two
 * values, with the options' media (`icon`, or an `ng-template[cwFilterOption]`); an
 * `ng-template[cwFilterValue]` replaces that content. The remove segment (« Retirer le filtre
 * Statut ») and Backspace or Delete on it emit `removed`. Renders `role="group"` named « Filtre
 * Statut ».
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
  /** The filter, `[(filter)]`; `filterChange` fires on each edit of the operator or the value. */
  readonly filter = model.required<CwFilter>();
  /** The field the filter applies to. */
  readonly field = input.required<CwFilterField>();
  /** French texts to override (`CwFilterBarLabels`). */
  readonly labels = input<Partial<CwFilterBarLabels>>({});
  /** Emitted when the remove segment is clicked, or on Backspace or Delete over it. */
  readonly removed = output();

  protected readonly fieldClasses = FIELD;
  protected readonly operatorClasses = OPERATOR;
  protected readonly valueClasses = VALUE;
  protected readonly removeClasses = REMOVE;

  private readonly barTemplates = inject(CW_FILTER_TEMPLATES, { optional: true });
  private readonly ownValueTemplates = contentChildren(CwFilterValueDef);
  private readonly ownOptionTemplates = contentChildren(CwFilterOptionDef);

  private readonly operatorButton = viewChild.required<string, ElementRef<HTMLElement>>(
    'operatorButton',
    { read: ElementRef },
  );
  private readonly valueButton = viewChild<string, ElementRef<HTMLElement>>('valueButton', {
    read: ElementRef,
  });
  private readonly valueMenu = viewChild<CwMenu>('valueMenu');
  private readonly valuePopover = viewChild<CwPopover>('valuePopover');

  protected readonly text = computed<CwFilterBarLabels>(() => ({
    ...CW_FILTER_BAR_LABELS,
    ...this.labels(),
  }));

  protected readonly operator = computed<CwFilterOperator | null>(
    () => this.field().operators.find((item) => item.value === this.filter().operator) ?? null,
  );
  protected readonly operatorLabel = computed(
    () => this.operator()?.label ?? this.filter().operator,
  );
  protected readonly hasValue = computed(() => !this.operator()?.valueless);
  protected readonly kind = computed(() => {
    const type = this.field().type;
    return type === 'date' || type === 'text' ? type : 'choice';
  });

  private readonly ticked = computed<readonly string[]>(() => {
    const value = this.filter().value;
    if (Array.isArray(value)) return value as readonly string[];
    return typeof value === 'string' ? [value] : [];
  });
  /** The ticked options, in the order of the field. */
  protected readonly chosen = computed<readonly CwFilterOption[]>(() => {
    const ticked = this.ticked();
    return (this.field().options ?? []).filter((option) => ticked.includes(option.value));
  });
  protected readonly media = computed(() => this.chosen().slice(0, SHOWN_MEDIA));
  protected readonly stacked = computed(() => this.chosen().length > SHOWN_VALUES);
  protected readonly day = computed(() => parseDay(this.filter().value));
  protected readonly typed = computed(() => {
    const value = this.filter().value;
    return typeof value === 'string' ? value : '';
  });

  /** Text of the value segment. */
  protected readonly summary = computed(() => {
    switch (this.kind()) {
      case 'date': {
        const day = this.day();
        return day ? DAY_FORMAT.format(day) : this.text().emptyValue;
      }
      case 'text':
        return this.typed() || this.text().emptyValue;
      default: {
        const chosen = this.chosen();
        if (chosen.length === 0) return this.text().emptyValue;
        const many = this.field().manyLabel;
        if (chosen.length > SHOWN_VALUES && many) return many(chosen.length);
        return chosen.map((option) => option.label).join(', ');
      }
    }
  });

  protected readonly valueTemplate = computed(() => {
    const key = this.field().key;
    const all = [...this.ownValueTemplates(), ...(this.barTemplates?.values() ?? [])];
    return all.find((template) => template.cwFilterValue() === key)?.ɵtemplate ?? null;
  });
  protected readonly optionTemplate = computed(() => {
    const key = this.field().key;
    const all = [...this.ownOptionTemplates(), ...(this.barTemplates?.options() ?? [])];
    return all.find((template) => template.cwFilterOption() === key)?.ɵtemplate ?? null;
  });

  /** Moves the focus to the chip's first segment. Not public API. */
  ɵfocus(): void {
    this.operatorButton().nativeElement.focus();
  }

  /** Opens the value editor (after the bar added the filter). Not public API. */
  ɵopenValue(): void {
    const button = this.valueButton()?.nativeElement;
    if (!button) return;
    const menu = this.valueMenu();
    if (menu) {
      menu.open({ origin: button, trigger: button, focus: 'first' });
      return;
    }
    this.valuePopover()?.toggle(button);
  }

  protected isTicked(option: CwFilterOption): boolean {
    return this.ticked().includes(option.value);
  }

  protected setOperator(operator: CwFilterOperator): void {
    const current = this.filter();
    if (current.operator === operator.value) return;
    this.filter.set({
      ...current,
      operator: operator.value,
      value: operator.valueless ? null : current.value,
    });
  }

  protected tick(option: CwFilterOption, checked: boolean): void {
    const ticked = this.ticked().filter((value) => value !== option.value);
    // Keep the order of the field's options, whatever the order of the clicks.
    const next = checked ? [...ticked, option.value] : ticked;
    const order = (this.field().options ?? []).map((item) => item.value);
    this.filter.set({
      ...this.filter(),
      value: [...next].sort((a, b) => order.indexOf(a) - order.indexOf(b)),
    });
  }

  protected pickDay(selection: CwCalendarSelection, popover: CwPopover): void {
    if (!(selection instanceof Date)) return;
    this.filter.set({ ...this.filter(), value: formatDay(selection) });
    popover.close();
  }

  protected commitText(value: string): void {
    const trimmed = value.trim();
    const next = trimmed === '' ? null : trimmed;
    if (next === this.filter().value) return;
    this.filter.set({ ...this.filter(), value: next });
  }

  protected applyText(field: HTMLInputElement, popover: CwPopover, event: Event): void {
    event.preventDefault();
    this.commitText(field.value);
    popover.close();
  }

  protected onRemoveKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    event.preventDefault();
    this.removed.emit();
  }
}
