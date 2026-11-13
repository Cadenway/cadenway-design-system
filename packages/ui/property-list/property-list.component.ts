import {
  Component,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  input,
  model,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CwButton } from '@cadenway/ui/button';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold, phosphorPlusBold } from '@ng-icons/phosphor-icons/bold';

import { CwProperty } from './property/property.component';
import { CwPropertyGroup } from './property-group/property-group.component';
import { PROPERTY_LIST, type PropertyListHost } from './property-list.token';
import type { CwPropertyListOrientation } from './property-list.types';

/* Literal class strings (Property List sheet and preview of the Design System artifact). The label
   column width comes from `labelWidth` through a CSS variable. */
const ROWS: Record<CwPropertyListOrientation, string> = {
  vertical:
    'grid grid-cols-[var(--cw-property-label-width)_minmax(0,1fr)] items-start gap-x-1 gap-y-px',
  inline: 'flex flex-wrap items-center gap-1.5',
};

const FOOTER_BUTTON =
  'relative isolate overflow-hidden flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none';

/**
 * The properties of an item in label / value rows, each value editing in place in a Select, a
 * Combobox, a Date Picker or an Inline Edit: the task panel, a sprint, a list (Property List sheet
 * of the Design System artifact).
 *
 * Holds `cw-property` rows, directly or in titled `cw-property-group`s. `vertical` (default) lays
 * out a label column of `labelWidth` and a value column, 32 px rows that grow with long values;
 * `inline` lays out chips without visible labels (the label stays in each chip's accessible name).
 * `readonly` makes every value read-only. `hideEmpty` folds the empty rows behind « Champs vides
 * N »; unfolding (`[(showEmpty)]`) shows them back in place. `canAddField` adds « Ajouter un
 * champ » (a `plus` icon button ending the row of chips in `inline`), which emits `addField`. The
 * values save on every choice, from their own controls. Style hook: `data-orientation`.
 */
@Component({
  selector: 'cw-property-list',
  imports: [NgIcon, NgTemplateOutlet, CwButton, CwRipple],
  providers: [
    provideIcons({ phosphorCaretRightBold, phosphorPlusBold }),
    { provide: PROPERTY_LIST, useExisting: forwardRef(() => CwPropertyList) },
  ],
  host: {
    class: 'block min-w-0',
    '[attr.data-orientation]': 'orientation()',
    '[style.--cw-property-label-width]': 'labelWidth()',
  },
  templateUrl: './property-list.component.html',
})
export class CwPropertyList implements PropertyListHost {
  /** Label / value rows, or chips. */
  readonly orientation = input<CwPropertyListOrientation>('vertical');
  /** Width of the label column, any CSS length. */
  readonly labelWidth = input('8rem');
  /** Every value read-only. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Folds the empty properties behind « Champs vides ». */
  readonly hideEmpty = input(false, { transform: booleanAttribute });
  /** Whether the folded empty properties are shown; `[(showEmpty)]`. */
  readonly showEmpty = model(false);
  /** Shows « Ajouter un champ ». */
  readonly canAddField = input(false, { transform: booleanAttribute });
  /** Text of the empty properties' toggle. */
  readonly emptyFieldsLabel = input('Champs vides');
  /** Text, or accessible name in `inline`, of the add button. */
  readonly addFieldLabel = input('Ajouter un champ');
  /** Emitted on « Ajouter un champ ». */
  readonly addField = output();

  private readonly properties = contentChildren(CwProperty, { descendants: true });
  private readonly groups = contentChildren(CwPropertyGroup);

  /** @internal */
  readonly foldEmpty = computed(
    () => this.hideEmpty() && !this.showEmpty() && this.orientation() === 'vertical',
  );
  /** @internal */
  readonly rowsClasses = computed(() => ROWS[this.orientation()]);

  protected readonly footerButton = FOOTER_BUTTON;
  protected readonly emptyCount = computed(
    () => this.properties().filter((property) => property.isEmpty()).length,
  );
  protected readonly showToggle = computed(
    () => this.hideEmpty() && this.orientation() === 'vertical' && this.emptyCount() > 0,
  );
  protected readonly showAdd = computed(() => this.canAddField() && !this.readonly());

  /** @internal */
  isFirstGroup(group: object): boolean {
    return this.groups()[0] === group;
  }

  protected toggleEmpty(): void {
    this.showEmpty.set(!this.showEmpty());
  }
}
