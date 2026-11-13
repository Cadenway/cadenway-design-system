import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { CwInput } from '@cadenway/ui/input';
import { CwKbd } from '@cadenway/ui/kbd';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import {
  type ChoiceRef,
  QUESTIONNAIRE_CHOICE,
  QUESTIONNAIRE_QUESTION,
} from '../questionnaire.token';

/**
 * One answer card of a question: a hidden native radio or checkbox, its indicator, the title, an
 * optional description and the letter key (Questionnaire sheet of the Design System artifact).
 *
 * Put it on a native `<label>` inside a `fieldset[cwQuestionnaireQuestion]`; its content is the
 * title. The native input keeps the role, the state and the arrow keys of a radio group; the card
 * reads `:checked` and `:disabled` (`has-checked:bg-selected`). The letter (« B ») is read before
 * the title and drawn as a key on the right. `other` adds a text field shown while the choice is
 * ticked; its text is `[(otherText)]` and replaces the value in the answers; Escape in it gives
 * the focus back to the choice. `disabled` dims the card and ignores its letter.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'label[cwQuestionnaireChoice]',
  imports: [CwInput, CwKbd, NgIcon],
  providers: [
    provideIcons({ phosphorCheckBold }),
    { provide: QUESTIONNAIRE_CHOICE, useExisting: CwQuestionnaireChoice },
  ],
  host: {
    class:
      'group/choice relative flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors motion-reduce:transition-none hover:bg-accent has-checked:border-foreground/40 has-checked:bg-selected has-[[data-choice]:focus-visible]:ring-2 has-[[data-choice]:focus-visible]:ring-ring has-[[data-choice]:focus-visible]:ring-offset-2 has-[[data-choice]:focus-visible]:ring-offset-background has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:bg-transparent',
  },
  templateUrl: './questionnaire-choice.component.html',
})
export class CwQuestionnaireChoice implements ChoiceRef {
  /** Value sent when the choice is ticked. */
  readonly value = input.required<string>();
  /** Makes the choice unavailable. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Adds a free text field, shown while ticked. */
  readonly other = input(false, { transform: booleanAttribute });
  /** Text typed in the free field; `[(otherText)]`. */
  readonly otherText = model('');
  /** Second line under the title. */
  readonly description = input('');
  /** Placeholder of the free field. */
  readonly otherPlaceholder = input('Précisez…');
  /** Accessible name of the free field. */
  readonly otherLabel = input('Autre : précisez');

  protected readonly question = inject(QUESTIONNAIRE_QUESTION);
  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  /** Whether the choice cannot be picked. */
  readonly isDisabled = computed(() => this.disabled() || this.question.isDisabled());
  protected readonly checked = computed(() => this.question.isChecked(this));
  protected readonly letter = computed(() => this.question.letterOf(this));
  protected readonly multiple = computed(() => this.question.type() === 'multiple');

  /** Moves the focus to the native input. */
  focus(): void {
    this.control().nativeElement.focus();
  }

  protected changed(): void {
    this.question.toggle(this, this.control().nativeElement.checked);
  }

  protected typed(event: Event): void {
    this.otherText.set((event.target as HTMLInputElement).value);
  }

  protected escape(event: Event): void {
    event.preventDefault();
    this.focus();
  }
}
