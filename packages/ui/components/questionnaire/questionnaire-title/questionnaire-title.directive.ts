import { Directive } from '@angular/core';

/**
 * The question itself, as the `legend` of its fieldset (Questionnaire sheet of the Design System
 * artifact).
 *
 * Put it on the native `<legend>` of a `fieldset[cwQuestionnaireQuestion]`: the question is read
 * with each choice. It takes the focus (programmatically only) when its question shows.
 */
@Directive({
  selector: 'legend[cwQuestionnaireTitle]',
  host: {
    class: 'mb-1 text-base leading-5 font-semibold text-pretty outline-none',
    tabindex: '-1',
  },
})
export class CwQuestionnaireTitle {}
