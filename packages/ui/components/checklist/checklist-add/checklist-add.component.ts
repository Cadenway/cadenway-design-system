import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPlusBold } from '@ng-icons/phosphor-icons/bold';

import { CHECKLIST } from '../checklist.token';

/* Literal class strings (Checklist sheet and preview of the Design System artifact): the `plus`
   lines up with the boxes, after the handle's reserved place. */
const TRIGGER =
  'relative isolate overflow-hidden flex h-8 w-full items-center gap-2 rounded-md pr-2 pl-0.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none';

const FIELD =
  'h-7 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm placeholder:text-muted-foreground outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20';

/**
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
  /** Placeholder of the field (mockup `App.dc.html`). */
  readonly placeholder = input('Élément de checklist (Entrée pour ajouter, Échap pour terminer)');

  protected readonly checklist = inject(CHECKLIST);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  protected readonly open = signal(false);
  protected readonly triggerClasses = TRIGGER;
  protected readonly fieldClasses = FIELD;

  protected start(): void {
    this.open.set(true);
    afterNextRender(() => this.field()?.nativeElement.focus(), { injector: this.injector });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const field = event.target as HTMLInputElement;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
      return;
    }
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    const label = field.value.trim();
    if (!label) return;
    this.checklist.add({ label });
    field.value = '';
  }

  protected onBlur(event: FocusEvent): void {
    if ((event.target as HTMLInputElement).value.trim() === '') this.close(false);
  }

  private close(restoreFocus: boolean): void {
    this.open.set(false);
    if (restoreFocus) {
      afterNextRender(() => this.trigger()?.nativeElement.focus(), { injector: this.injector });
    }
  }
}
