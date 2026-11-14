import { Component, computed, signal, type Signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, type FieldTree } from '@angular/forms/signals';

import { CwAutocompleteGroup } from './autocomplete-group/autocomplete-group.component';
import { CwAutocompleteOption } from './autocomplete-option/autocomplete-option.component';
import { CwAutocompleteTrigger } from './autocomplete-trigger/autocomplete-trigger.directive';
import { CwAutocomplete } from './autocomplete.component';

/**
 * Function field
 *
 * @description
 * Finds a combobox input by accessible name.
 *
 * @param {HTMLElement} host - Container holding the input.
 * @param {string} name - Expected accessible name.
 *
 * @returns {HTMLInputElement} Matching combobox input.
 */
function field(host: HTMLElement, name: string): HTMLInputElement {
  const found: HTMLInputElement | null = host.querySelector<HTMLInputElement>(
    `input[role="combobox"][aria-label="${name}"]`,
  );
  if (!found) throw new Error(`No combobox named ${name}`);
  return found;
}

/**
 * Function listbox
 *
 * @description
 * Returns the visible suggestion list.
 *
 * @returns {HTMLElement | null} Visible suggestion list, or null when absent.
 */
function listbox(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="listbox"]:not([hidden])');
}

/**
 * Function option
 *
 * @description
 * Finds a suggestion by its visible text.
 *
 * @param {string} name - Visible suggestion text to find.
 *
 * @returns {HTMLElement} Matching suggestion element.
 */
function option(name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    document.querySelectorAll<HTMLElement>('[role="option"]'),
  ).find((element) => element.textContent.replace(/\s+/g, ' ').trim() === name);
  if (!found) throw new Error(`No option named ${name}`);
  return found;
}

/**
 * Function key
 *
 * @description
 * Dispatches a keyboard event to the input.
 *
 * @param {HTMLElement} target - Input receiving the keyboard event.
 * @param {string} value - Keyboard key to dispatch.
 */
function key(target: HTMLElement, value: string): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
  );
}

/**
 * Function type
 *
 * @description
 * Writes text and dispatches an input event.
 *
 * @param {HTMLInputElement} input - Input to update.
 * @param {string} text - Text to enter before dispatching input.
 */
function type(input: HTMLInputElement, text: string): void {
  input.value = text;
  input.setSelectionRange(text.length, text.length);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Constant SPRINTS
 *
 * @description
 * Sprint names used as suggestions.
 *
 * @type {string[]}
 */
const SPRINTS: string[] = ['Sprint 14', 'Sprint 15', 'Revue du sprint 14'];
/**
 * Constant PEOPLE
 *
 * @description
 * People used as mention suggestions.
 *
 * @type {{ id: string; name: string }[]}
 */
const PEOPLE: { id: string; name: string }[] = [
  { id: 'lea', name: 'Léa Martin' },
  { id: 'leo', name: 'Léo Garnier' },
];

/**
 * Component Host
 *
 * @description
 * Exercises suggestions and mentions with reactive forms.
 */
@Component({
  imports: [
    CwAutocomplete,
    CwAutocompleteOption,
    CwAutocompleteGroup,
    CwAutocompleteTrigger,
    ReactiveFormsModule,
  ],
  template: `
    <input [cwAutocomplete]="sprints" [formControl]="sprint" aria-label="Nom du sprint" />
    <cw-autocomplete #sprints (query)="query.set($event)" (optionSelected)="picked.set($event)">
      <cw-autocomplete-group label="Sprints">
        @for (name of matches(); track name) {
          <cw-autocomplete-option [value]="name" [disabled]="name === 'Sprint 15'">{{
            name
          }}</cw-autocomplete-option>
        }
      </cw-autocomplete-group>
    </cw-autocomplete>

    <input
      [cwAutocomplete]="mentions"
      trigger="@"
      [formControl]="comment"
      aria-label="Commentaire"
    />
    <cw-autocomplete
      #mentions
      [loading]="loading()"
      (query)="mention.set($event)"
      (optionSelected)="mentioned.set($event)"
    >
      @for (person of people(); track person.id) {
        <cw-autocomplete-option [value]="person.id" [label]="person.name">{{
          person.name
        }}</cw-autocomplete-option>
      }
    </cw-autocomplete>
  `,
})
class Host {
  // #region Properties
  /**
   * Property sprint
   * @readonly
   *
   * @description
   * Sprint input form control.
   *
   * @type {FormControl<string>}
   */
  public readonly sprint: FormControl<string> = new FormControl<string>('', { nonNullable: true });

  /**
   * Property comment
   * @readonly
   *
   * @description
   * Comment input form control.
   *
   * @type {FormControl<string>}
   */
  public readonly comment: FormControl<string> = new FormControl<string>('', { nonNullable: true });

  /**
   * Property query
   * @readonly
   *
   * @description
   * Current sprint query.
   *
   * @type {WritableSignal<string>}
   */
  public readonly query: WritableSignal<string> = signal('');

  /**
   * Property mention
   * @readonly
   *
   * @description
   * Current mention query.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly mention: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property loading
   * @readonly
   *
   * @description
   * Whether suggestions are loading.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property picked
   * @readonly
   *
   * @description
   * Selected sprint value.
   *
   * @type {WritableSignal<unknown>}
   */
  public readonly picked: WritableSignal<unknown> = signal<unknown>(null);

  /**
   * Property mentioned
   * @readonly
   *
   * @description
   * Selected person value.
   *
   * @type {WritableSignal<unknown>}
   */
  public readonly mentioned: WritableSignal<unknown> = signal<unknown>(null);

  /**
   * Property matches
   * @readonly
   *
   * @description
   * Sprint suggestions matching the query.
   *
   * @type {Signal<string[]>}
   */
  public readonly matches: Signal<string[]> = computed(() =>
    SPRINTS.filter((name) => name.toLowerCase().includes(this.query().toLowerCase())),
  );

  /**
   * Property people
   * @readonly
   *
   * @description
   * People matching the mention query.
   *
   * @type {Signal<{ id: string; name: string }[]>}
   */
  public readonly people: Signal<{ id: string; name: string }[]> = computed(() => {
    const mention: string | null = this.mention();
    return mention === null
      ? []
      : PEOPLE.filter((person) => person.name.toLowerCase().startsWith(mention.toLowerCase()));
  });
  // #endregion
}

describe('CwAutocomplete', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('stays closed on focus and opens while typing, with the typed part in bold', async () => {
    const sprint: HTMLInputElement = field(host, 'Nom du sprint');
    expect(sprint.getAttribute('aria-autocomplete')).toBe('list');
    sprint.focus();
    await fixture.whenStable();
    expect(sprint.getAttribute('aria-expanded')).toBe('false');

    type(sprint, 'sprint 1');
    await fixture.whenStable();
    expect(component.query()).toBe('sprint 1');
    expect(sprint.getAttribute('aria-expanded')).toBe('true');
    expect(sprint.getAttribute('aria-controls')).toBe(listbox()?.id);
    expect(listbox()?.getAttribute('aria-label')).toBe('Suggestions');
    expect(option('Revue du sprint 14').querySelector('b')?.textContent).toBe('sprint 1');
    expect(option('Sprint 14').textContent.trim()).toBe('Sprint 14');
  });

  it('keeps the free text when nothing is highlighted', async () => {
    const sprint: HTMLInputElement = field(host, 'Nom du sprint');
    type(sprint, 'Revue Q4');
    await fixture.whenStable();
    expect(document.body.textContent).toContain('Aucune suggestion : Entrée garde « Revue Q4 ».');

    key(sprint, 'Enter');
    await fixture.whenStable();
    expect(component.sprint.value).toBe('Revue Q4');
    expect(component.picked()).toBeNull();
  });

  it('chooses the highlighted suggestion with the arrows and Enter, past disabled ones', async () => {
    const sprint: HTMLInputElement = field(host, 'Nom du sprint');
    type(sprint, 'sprint');
    await fixture.whenStable();
    expect(sprint.hasAttribute('aria-activedescendant')).toBe(false);

    key(sprint, 'ArrowDown');
    key(sprint, 'ArrowDown');
    await fixture.whenStable();
    expect(option('Sprint 15').getAttribute('aria-disabled')).toBe('true');
    expect(sprint.getAttribute('aria-activedescendant')).toBe(option('Revue du sprint 14').id);

    key(sprint, 'Enter');
    await fixture.whenStable();
    expect(component.picked()).toBe('Revue du sprint 14');
    expect(component.sprint.value).toBe('Revue du sprint 14');
    expect(sprint.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and keeps the text', async () => {
    const sprint: HTMLInputElement = field(host, 'Nom du sprint');
    type(sprint, 'Sprint');
    await fixture.whenStable();
    key(sprint, 'ArrowDown');
    key(sprint, 'Escape');
    await fixture.whenStable();

    expect(sprint.getAttribute('aria-expanded')).toBe('false');
    expect(component.sprint.value).toBe('Sprint');
  });

  it('chooses a suggestion on click', async () => {
    const sprint: HTMLInputElement = field(host, 'Nom du sprint');
    type(sprint, '14');
    await fixture.whenStable();

    option('Sprint 14').click();
    await fixture.whenStable();
    expect(component.sprint.value).toBe('Sprint 14');
    expect(listbox()).toBeNull();
  });

  it('opens after the trigger character and replaces the mention only', async () => {
    const comment: HTMLInputElement = field(host, 'Commentaire');
    type(comment, 'Merci');
    await fixture.whenStable();
    expect(comment.getAttribute('aria-expanded')).toBe('false');

    type(comment, 'Merci @Lé');
    await fixture.whenStable();
    expect(component.mention()).toBe('Lé');
    expect(comment.getAttribute('aria-expanded')).toBe('true');

    key(comment, 'ArrowDown');
    key(comment, 'Tab');
    await fixture.whenStable();
    expect(component.mentioned()).toBe('lea');
    expect(component.comment.value).toBe('Merci @Léa Martin ');
  });

  it('says it is searching while loading', async () => {
    component.loading.set(true);
    const comment: HTMLInputElement = field(host, 'Commentaire');
    type(comment, '@');
    await fixture.whenStable();

    expect(document.body.textContent).toContain('Recherche…');
  });

  it('feeds ngModel through the native input when a suggestion is selected', async () => {
    /**
     * Component TemplateHost
     *
     * @description
     * Exercises a template-driven input with autocomplete.
     */
    @Component({
      imports: [CwAutocomplete, CwAutocompleteOption, CwAutocompleteTrigger, FormsModule],
      template: `
        <input [cwAutocomplete]="cities" [(ngModel)]="city" aria-label="Ville" />
        <cw-autocomplete #cities>
          <cw-autocomplete-option value="Lille">Lille</cw-autocomplete-option>
          <cw-autocomplete-option value="Lyon">Lyon</cw-autocomplete-option>
        </cw-autocomplete>
      `,
    })
    class TemplateHost {
      // #region Properties
      /**
       * Property city
       *
       * @description
       * City synchronized with the native input.
       *
       * @type {string}
       */
      public city: string = '';
      // #endregion
    }

    const templateFixture: ComponentFixture<TemplateHost> = TestBed.createComponent(TemplateHost);
    templateFixture.autoDetectChanges();
    await templateFixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve));
    const city: HTMLInputElement = field(templateFixture.nativeElement as HTMLElement, 'Ville');
    type(city, 'Ly');
    await templateFixture.whenStable();
    option('Lyon').click();
    await templateFixture.whenStable();
    expect(templateFixture.componentInstance.city).toBe('Lyon');
    templateFixture.destroy();
  });

  it('feeds a Signal Forms field through the native accessor', async () => {
    /**
     * Component SignalHost
     *
     * @description
     * Exercises a Signal Forms input with autocomplete.
     */
    @Component({
      imports: [CwAutocomplete, CwAutocompleteOption, CwAutocompleteTrigger, FormField],
      template: `
        <input [cwAutocomplete]="cities" [formField]="profile.city" aria-label="Ville" />
        <cw-autocomplete #cities>
          <cw-autocomplete-option value="Lille">Lille</cw-autocomplete-option>
          <cw-autocomplete-option value="Lyon">Lyon</cw-autocomplete-option>
        </cw-autocomplete>
      `,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       * @readonly
       *
       * @description
       * Signal Forms model for the city.
       *
       * @type {WritableSignal<{ city: string }>}
       */
      public readonly model: WritableSignal<{ city: string }> = signal({ city: '' });

      /**
       * Property profile
       * @readonly
       *
       * @description
       * Signal Forms tree for the profile.
       *
       * @type {FieldTree<{ city: string }>}
       */
      public readonly profile: FieldTree<{ city: string }> = form(this.model);
      // #endregion
    }

    const signalFixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    signalFixture.autoDetectChanges();
    await signalFixture.whenStable();
    const city: HTMLInputElement = field(signalFixture.nativeElement as HTMLElement, 'Ville');

    type(city, 'Ly');
    await signalFixture.whenStable();
    expect(signalFixture.componentInstance.model().city).toBe('Ly');

    option('Lyon').click();
    await signalFixture.whenStable();
    expect(signalFixture.componentInstance.model().city).toBe('Lyon');
  });
});
