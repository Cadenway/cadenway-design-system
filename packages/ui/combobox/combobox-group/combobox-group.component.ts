import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  input,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { CwComboboxOption } from '../combobox-option/combobox-option.component';
import { GROUP_TITLE } from '../combobox.styles';

/* A line above every group but the first, edge to edge of the panel (the preview's separator). */
const SHOWN =
  'block not-first:-mx-1 not-first:mt-1 not-first:border-t not-first:px-1 not-first:pt-1';

/**
 * A titled run of options of a `cw-combobox` (« Équipe Produit », « Autres membres »), with a line
 * above every group but the first (Combobox sheet of the Design System artifact).
 *
 * Renders `role="group"` named by its visible `label`; hidden while none of its options matches
 * the search.
 */
@Component({
  selector: 'cw-combobox-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    class: SHOWN,
    '[attr.hidden]': 'shown() ? null : ""',
    '[attr.aria-labelledby]': 'titleId',
  },
  templateUrl: './combobox-group.component.html',
})
export class CwComboboxGroup {
  /** The title of the group, shown above its options. */
  readonly label = input.required<string>();

  private readonly options = contentChildren(CwComboboxOption, { descendants: true });

  protected readonly titleId = inject(_IdGenerator).getId('cw-combobox-group-');
  protected readonly titleClass = GROUP_TITLE;
  protected readonly shown = computed(() => this.options().some((option) => option.visible()));
}
