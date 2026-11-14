import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
  type InputSignal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPlusBold } from '@ng-icons/phosphor-icons/bold';

import { CHECKLIST, type ChecklistHost } from '../checklist.token';

/* Literal class strings (Checklist sheet and preview of the Design System artifact): the `plus`
   lines up with the boxes, after the handle's reserved place. */
/**
 * Constant TRIGGER
 *
 * @description
 * Classes of the add-item trigger.
 *
 * @type {string}
 */
const TRIGGER: string =
  'relative isolate overflow-hidden flex h-8 w-full items-center gap-2 rounded-md pr-2 pl-0.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none';

/**
 * Constant FIELD
 *
 * @description
 * Classes of the inline item entry field.
 *
 * @type {string}
 */
const FIELD: string =
  'h-7 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm placeholder:text-muted-foreground outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20';

/**
 * Class CwChecklistAdd
 * @class CwChecklistAdd
 *
 * @description
 * The row that adds an item at the end of a `cw-checklist`: « Ajouter un élément » (the
 * checklist's `addLabel`), then a field in its place (Checklist sheet of the Design System
 * artifact).
 *
 * Enter emits the checklist's `itemAdd` with the typed label and keeps the field open, empty, to
 * chain the next item; Escape, or leaving an empty field, closes it and gives the focus back to the
 * trigger. Hidden when the checklist is `readonly`. Place it last inside `cw-checklist`.
 */
@Component({
  selector: 'cw-checklist-add',
  imports: [NgIcon, CwRipple],
  providers: [provideIcons({ phosphorPlusBold })],
  host: {
    class: 'block',
    '[attr.hidden]': 'checklist.readonly() ? "" : null',
  },
  templateUrl: './checklist-add.component.html',
})
export class CwChecklistAdd {
  // #region Properties
  /**
   * Property placeholder
   * @readonly
   *
   * @description
   * Placeholder for the new item field.
   *
   * @type {InputSignal<string>}
   */
  public readonly placeholder: InputSignal<string> = input(
    'Élément de checklist (Entrée pour ajouter, Échap pour terminer)',
  );

  /**
   * Property checklist
   * @readonly
   *
   * @description
   * Parent checklist receiving addition requests.
   *
   * @type {ChecklistHost}
   */
  protected readonly checklist: ChecklistHost = inject(CHECKLIST);

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to schedule focus after rendering.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property trigger
   * @readonly
   *
   * @description
   * Add trigger button when rendered.
   *
   * @type {Signal<ElementRef<HTMLButtonElement> | undefined>}
   */
  private readonly trigger: Signal<ElementRef<HTMLButtonElement> | undefined> =
    viewChild<ElementRef<HTMLButtonElement>>('trigger');

  /**
   * Property field
   * @readonly
   *
   * @description
   * New item field when rendered.
   *
   * @type {Signal<ElementRef<HTMLInputElement> | undefined>}
   */
  private readonly field: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement>>('field');

  /**
   * Property open
   * @readonly
   *
   * @description
   * Whether the entry field is open.
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly open: WritableSignal<boolean> = signal(false);

  /**
   * Property triggerClasses
   * @readonly
   *
   * @description
   * Add trigger classes.
   *
   * @type {string}
   */
  protected readonly triggerClasses: string = TRIGGER;

  /**
   * Property fieldClasses
   * @readonly
   *
   * @description
   * Entry field classes.
   *
   * @type {string}
   */
  protected readonly fieldClasses: string = FIELD;
  // #endregion

  // #region Methods
  /**
   * Method start
   * @method start
   *
   * @description
   * Opens the entry field and focuses it after rendering.
   */
  protected start(): void {
    this.open.set(true);
    afterNextRender(() => this.field()?.nativeElement.focus(), { injector: this.injector });
  }

  /**
   * Method onKeydown
   * @method onKeydown
   *
   * @description
   * Adds a nonempty item on Enter or closes the field on Escape.
   *
   * @param {KeyboardEvent} event - Keyboard event from the add field.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const field: HTMLInputElement = event.target as HTMLInputElement;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
      return;
    }
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    const label: string = field.value.trim();
    if (!label) return;
    this.checklist.add({ label });
    field.value = '';
  }

  /**
   * Method onBlur
   * @method onBlur
   *
   * @description
   * Closes the field when it loses focus while empty.
   *
   * @param {FocusEvent} event - Focus event from the add field.
   */
  protected onBlur(event: FocusEvent): void {
    if ((event.target as HTMLInputElement).value.trim() === '') this.close(false);
  }

  /**
   * Method close
   * @method close
   *
   * @description
   * Closes the field and optionally returns focus to the trigger.
   *
   * @param {boolean} restoreFocus - Whether to return focus to the trigger.
   */
  private close(restoreFocus: boolean): void {
    this.open.set(false);
    if (restoreFocus) {
      afterNextRender(() => this.trigger()?.nativeElement.focus(), { injector: this.injector });
    }
  }
  // #endregion
}
