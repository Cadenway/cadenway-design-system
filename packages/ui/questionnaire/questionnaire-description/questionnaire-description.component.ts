import { Component } from '@angular/core';

/**
 * The line under a question that says what the answer is for (« Elle devient une tâche dans
 * l'espace Produit. ») or whether it is optional (Questionnaire sheet of the Design System artifact).
 */
@Component({
  selector: 'cw-questionnaire-description',
  host: { class: 'mb-3 block text-sm text-muted-foreground' },
  templateUrl: './questionnaire-description.component.html',
})
export class CwQuestionnaireDescription {}
