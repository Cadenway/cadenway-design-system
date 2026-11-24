import {
  booleanAttribute,
  Component,
  contentChild,
  inject,
  input,
  output,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { CwMenu, CwMenuTriggerFor } from '@cadenway/ui/components/menu';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRightBold, phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';

import { SPLIT_BUTTON_LABELS } from './split-button-labels.token';

/**
 * Constant MAIN
 *
 * @description
 * Mockup `App.dc.html` (task status): the main half carries the current value in 12 px medium text,
 * lit `bg-muted` on hover; the focus ring stays inside the welded block.
 *
 * @type {string}
 */
const MAIN: string = `group/advance relative isolate flex min-w-0 items-center gap-1.5 rounded-l-[5px] px-2 text-left text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none ${ɵFOCUS_INSET}`;

/**
 * Constant TOGGLE
 *
 * @description
 * Mockup `App.dc.html`: the caret half is 24 px wide and muted, and turns `foreground` on hover;
 * `CwMenuTriggerFor` lights it while its menu is open.
 *
 * @type {string}
 */
const TOGGLE: string = `group/toggle relative isolate inline-flex w-6 shrink-0 items-center justify-center rounded-r-[5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:text-foreground disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none ${ɵFOCUS_INSET}`;

/**
 * Component CwSplitButton
 *
 * @description
 * A two-part button: the main half runs the quick action, the caret half opens a menu of every
 * choice, as the task status button of the mockup (`App.dc.html`: the status moves to the next one
 * on click, the caret lists them all). The content is the main half's visual (an icon and the
 * current value); `label` is its accessible name and tooltip, since the content names the value and
 * not the action (« En cours · passer à « En revue » »). A click emits `advance`; `advanceable`
 * shows the → hint on hover and focus when there is a next value. Project the `cw-menu` the caret
 * opens inside the split button: it is wired to the caret (`aria-haspopup`, `aria-expanded`, the
 * keyboard of `CwMenuTriggerFor`), whose name is `menuLabel` (« Plus d’options » by default, or the
 * text of `provideCwSplitButtonLabels`). Both halves are their own Tab stop; `disabled` disables
 * both. No business logic: the consumer decides what the next value is.
 */
@Component({
  selector: 'cw-split-button',
  imports: [CwMenuTriggerFor, NgIcon],
  providers: [provideIcons({ phosphorArrowRightBold, phosphorCaretDownBold })],
  host: {
    class: 'inline-flex h-7 max-w-full items-stretch rounded-md border border-input',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  templateUrl: './split-button.component.html',
})
export class CwSplitButton {
  // #region Properties
  /**
   * Property label
   *
   * @description
   * Accessible name and tooltip of the main half: the action it runs, for example « En cours ·
   * passer à « En revue » ».
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property menuLabel
   *
   * @description
   * Accessible name and tooltip of the caret half, for example « Choisir un statut ».
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly menuLabel: InputSignal<string> = input<string>(inject(SPLIT_BUTTON_LABELS).menu);

  /**
   * Property advanceable
   *
   * @description
   * Whether the main half moves to a next value: shows the → hint on hover and keyboard focus.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly advanceable: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property disabled
   *
   * @description
   * Disables both halves.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property advance
   *
   * @description
   * Emits when the main half is clicked (or pressed with Enter or Space).
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly advance: OutputEmitterRef<void> = output();

  /**
   * Property menu
   *
   * @description
   * The projected menu the caret half opens.
   *
   * @type {Signal<CwMenu>}
   * @readonly
   */
  protected readonly menu: Signal<CwMenu> = contentChild.required(CwMenu);

  /**
   * Property mainClasses
   *
   * @description
   * Classes of the main half.
   *
   * @type {string}
   * @readonly
   */
  protected readonly mainClasses: string = MAIN;

  /**
   * Property toggleClasses
   *
   * @description
   * Classes of the caret half.
   *
   * @type {string}
   * @readonly
   */
  protected readonly toggleClasses: string = TOGGLE;
  // #endregion
}
