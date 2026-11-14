import {
  Component,
  computed,
  contentChildren,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { CwComboboxOption } from '../combobox-option/combobox-option.component';
import { GROUP_TITLE } from '../combobox.styles';

/* A line above every group but the first, edge to edge of the panel (the preview's separator). */
/**
 * Constant SHOWN
 *
 * @description
 * Layout and separator classes for option groups.
 *
 * @type {string}
 */
const SHOWN: string =
  'block not-first:-mx-1 not-first:mt-1 not-first:border-t not-first:px-1 not-first:pt-1';

/**
 * Component CwComboboxGroup
 *
 * @description
 * A titled run of options of a `cw-combobox` (« Équipe Produit », « Autres membres »), with a line
 * above every group but the first (Combobox sheet of the Design System artifact).
 *
 * Renders `role="group"` named by its visible `label`; hidden while none of its options matches
 * the search.
 */
@Component({
  selector: 'cw-combobox-group',
  host: {
    role: 'group',
    class: SHOWN,
    '[attr.hidden]': 'shown() ? null : ""',
    '[attr.aria-labelledby]': 'titleId',
  },
  templateUrl: './combobox-group.component.html',
})
export class CwComboboxGroup {
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Title shown above the options.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property options
   * @readonly
   *
   * @description
   * Options contained in the group.
   *
   * @type {Signal<readonly CwComboboxOption[]>}
   */
  private readonly options: Signal<readonly CwComboboxOption[]> = contentChildren(
    CwComboboxOption,
    { descendants: true },
  );

  /**
   * Property titleId
   * @readonly
   *
   * @description
   * Identifier naming the group.
   *
   * @type {string}
   */
  protected readonly titleId: string = inject(_IdGenerator).getId('cw-combobox-group-');

  /**
   * Property titleClass
   * @readonly
   *
   * @description
   * Classes for the group title.
   *
   * @type {string}
   */
  protected readonly titleClass: string = GROUP_TITLE;

  /**
   * Property shown
   * @readonly
   *
   * @description
   * Whether any option matches the search.
   *
   * @type {Signal<boolean>}
   */
  protected readonly shown: Signal<boolean> = computed(() =>
    this.options().some((option) => option.visible()),
  );
  // #endregion
}
