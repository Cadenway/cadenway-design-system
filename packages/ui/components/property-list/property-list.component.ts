import {
  Component,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  input,
  model,
  output,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CwButton } from '@cadenway/ui/components/button';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold, phosphorPlusBold } from '@ng-icons/phosphor-icons/bold';

import { CwProperty } from './property/property.component';
import { CwPropertyGroup } from './property-group/property-group.component';
import { PROPERTY_LIST, type PropertyListHost } from './property-list.token';
import type { CwPropertyListOrientation } from './property-list.types';

/* Literal class strings (Property List sheet and preview of the Design System artifact). The label
   column width comes from `labelWidth` through a CSS variable. */
/**
 * Constant ROWS
 *
 * @description
 * Classes for each property list orientation.
 *
 * @type {Record<CwPropertyListOrientation, string>}
 */
const ROWS: Record<CwPropertyListOrientation, string> = {
  vertical:
    'grid grid-cols-[var(--cw-property-label-width)_minmax(0,1fr)] items-start gap-x-1 gap-y-px',
  inline: 'flex flex-wrap items-center gap-1.5',
};

/**
 * Constant FOOTER_BUTTON
 *
 * @description
 * Classes for the add-field and empty-field controls.
 *
 * @type {string}
 */
const FOOTER_BUTTON: string =
  'relative isolate overflow-hidden flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none';

/**
 * Component CwPropertyList
 *
 * @description
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
  // #region Properties
  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Layout of the property rows.
   *
   * @type {InputSignal<CwPropertyListOrientation>}
   */
  public readonly orientation: InputSignal<CwPropertyListOrientation> =
    input<CwPropertyListOrientation>('vertical');

  /**
   * Property labelWidth
   * @readonly
   *
   * @description
   * CSS width of the label column.
   *
   * @type {InputSignal<string>}
   */
  public readonly labelWidth: InputSignal<string> = input('8rem');

  /**
   * Property readonly
   * @readonly
   *
   * @description
   * Whether all property values are read-only.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property hideEmpty
   * @readonly
   *
   * @description
   * Whether empty properties can be folded.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly hideEmpty: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property showEmpty
   * @readonly
   *
   * @description
   * Whether folded empty properties are shown.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly showEmpty: ModelSignal<boolean> = model(false);

  /**
   * Property canAddField
   * @readonly
   *
   * @description
   * Whether the add-field action is available.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly canAddField: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property emptyFieldsLabel
   * @readonly
   *
   * @description
   * Label of the empty-fields toggle.
   *
   * @type {InputSignal<string>}
   */
  public readonly emptyFieldsLabel: InputSignal<string> = input('Champs vides');

  /**
   * Property addFieldLabel
   * @readonly
   *
   * @description
   * Label of the add-field action.
   *
   * @type {InputSignal<string>}
   */
  public readonly addFieldLabel: InputSignal<string> = input('Ajouter un champ');

  /**
   * Property addField
   * @readonly
   *
   * @description
   * Emits when the add-field action is requested.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly addField: OutputEmitterRef<void> = output();

  /**
   * Property properties
   * @readonly
   *
   * @description
   * Descendant properties in the list.
   *
   * @type {Signal<readonly CwProperty[]>}
   */
  private readonly properties: Signal<readonly CwProperty[]> = contentChildren(CwProperty, {
    descendants: true,
  });

  /**
   * Property groups
   * @readonly
   *
   * @description
   * Direct groups in the list.
   *
   * @type {Signal<readonly CwPropertyGroup[]>}
   */
  private readonly groups: Signal<readonly CwPropertyGroup[]> = contentChildren(CwPropertyGroup);

  /**
   * Property foldEmpty
   * @readonly
   *
   * @description
   * Whether empty rows are currently folded.
   *
   * @internal
   *
   * @type {Signal<boolean>}
   */
  public readonly foldEmpty: Signal<boolean> = computed(
    () => this.hideEmpty() && !this.showEmpty() && this.orientation() === 'vertical',
  );

  /**
   * Property rowsClasses
   * @readonly
   *
   * @description
   * Layout classes shared with property groups.
   *
   * @internal
   *
   * @type {Signal<string>}
   */
  public readonly rowsClasses: Signal<string> = computed(() => ROWS[this.orientation()]);

  /**
   * Property footerButton
   * @readonly
   *
   * @description
   * Classes for footer actions.
   *
   * @type {string}
   */
  protected readonly footerButton: string = FOOTER_BUTTON;

  /**
   * Property emptyCount
   * @readonly
   *
   * @description
   * Number of empty descendant properties.
   *
   * @type {Signal<number>}
   */
  protected readonly emptyCount: Signal<number> = computed(
    () => this.properties().filter((property) => property.isEmpty()).length,
  );

  /**
   * Property showToggle
   * @readonly
   *
   * @description
   * Whether the empty-fields toggle is shown.
   *
   * @type {Signal<boolean>}
   */
  protected readonly showToggle: Signal<boolean> = computed(
    () => this.hideEmpty() && this.orientation() === 'vertical' && this.emptyCount() > 0,
  );

  /**
   * Property showAdd
   * @readonly
   *
   * @description
   * Whether the add-field action is shown.
   *
   * @type {Signal<boolean>}
   */
  protected readonly showAdd: Signal<boolean> = computed(
    () => this.canAddField() && !this.readonly(),
  );
  // #endregion

  // #region Methods
  /**
   * Method isFirstGroup
   *
   * @description
   * Reports whether a group is first in the list.
   *
   * @internal
   *
   * @param {object} group - Group to compare with the first projected group.
   *
   * @returns {boolean} Whether the supplied group is first in the list.
   */
  public isFirstGroup(group: object): boolean {
    return this.groups()[0] === group;
  }

  /**
   * Method toggleEmpty
   *
   * @description
   * Toggles the visibility of empty properties.
   */
  protected toggleEmpty(): void {
    this.showEmpty.set(!this.showEmpty());
  }
  // #endregion
}
