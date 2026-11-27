import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';

import { CwRadioGroupItem } from './radio-group-item/radio-group-item.component';
import { CwRadioGroup } from './radio-group.component';

/**
 * Function radio
 *
 * @description
 * Finds a radio button by its associated label.
 *
 * @param {HTMLElement} host - Fixture containing the radio options.
 * @param {string} name - Text of the associated label.
 *
 * @returns {HTMLButtonElement} Matching radio button.
 */
function radio(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    host.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
  ).find(
    (element) =>
      host.querySelector(`label[for="${element.id}"]`)?.textContent.trim().startsWith(name) ===
      true,
  );
  if (!found) throw new Error(`No radio named ${name}`);
  return found;
}

/**
 * Function group
 *
 * @description
 * Finds a radio group by its accessible name.
 *
 * @param {HTMLElement} host - Fixture containing the radio groups.
 * @param {string} name - Accessible name of the group.
 *
 * @returns {HTMLElement} Matching radio group.
 */
function group(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('[role="radiogroup"]'),
  ).find((element) => element.getAttribute('aria-label') === name);
  if (!found) throw new Error(`No radio group named ${name}`);
  return found;
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event to a radio.
 *
 * @param {HTMLElement} target - Element receiving the keyboard event.
 * @param {string} key - Key to dispatch.
 */
function press(target: HTMLElement, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

/**
 * Function leave
 *
 * @description
 * Dispatches a focus-out event from a radio.
 *
 * @param {HTMLElement} target - Radio receiving the focus-out event.
 */
function leave(target: HTMLElement): void {
  target.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
}

/**
 * Class ModelHost
 *
 * @description
 * Hosts radio groups controlled by models.
 */
@Component({
  imports: [CwRadioGroup, CwRadioGroupItem],
  template: `
    <cw-radio-group ariaLabel="Vue par défaut" orientation="horizontal" [(value)]="view">
      <cw-radio-group-item id="v-list" value="list" /><label for="v-list">Liste</label>
      <cw-radio-group-item id="v-board" value="board" /><label for="v-board">Tableau</label>
      <cw-radio-group-item id="v-gantt" value="gantt" disabled /><label for="v-gantt">Gantt</label>
      <cw-radio-group-item id="v-calendar" value="calendar" /><label for="v-calendar"
        >Calendrier</label
      >
    </cw-radio-group>
    <cw-radio-group ariaLabel="Visibilité de l'espace" [(value)]="visibility">
      <cw-radio-group-item variant="card" value="public">Public</cw-radio-group-item>
      <cw-radio-group-item variant="card" value="private">Privé</cw-radio-group-item>
    </cw-radio-group>
  `,
})
class ModelHost {
  // #region Properties
  /**
   * Property view
   * @readonly
   *
   * @description
   * Selected default view.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly view: WritableSignal<string | null> = signal<string | null>('list');

  /**
   * Property visibility
   * @readonly
   *
   * @description
   * Selected visibility.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly visibility: WritableSignal<string | null> = signal<string | null>(null);
  // #endregion
}

/**
 * Interface Option
 *
 * @description
 * Option rendered as one choice card by a `@for`.
 */
interface Option {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Value of the card.
   *
   * @type {string}
   */
  readonly value: string;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Visible text of the card.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Whether the card is disabled; enabled when absent.
   *
   * @type {boolean | undefined}
   */
  readonly disabled?: boolean;
  // #endregion
}

/**
 * Constant TEAM_SIZES
 *
 * @description
 * The four team size cards rendered by the `@for` hosts, in rendering order.
 *
 * @type {readonly Option[]}
 */
const TEAM_SIZES: readonly Option[] = [
  { value: 'solo', label: 'Seul' },
  { value: 'small', label: '2 à 10' },
  { value: 'medium', label: '11 à 50' },
  { value: 'large', label: 'Plus de 50' },
];

/**
 * Class LoopHost
 *
 * @description
 * Hosts choice cards that come from a `@for`, the shape that raised NG0950 when the checked card was
 * not the first one rendered.
 */
@Component({
  imports: [CwRadioGroup, CwRadioGroupItem],
  template: `
    <cw-radio-group ariaLabel="Taille de l'équipe" [(value)]="size">
      @for (option of options(); track option.value) {
        <cw-radio-group-item variant="card" [value]="option.value" [disabled]="option.disabled">{{
          option.label
        }}</cw-radio-group-item>
      }
    </cw-radio-group>
  `,
})
class LoopHost {
  // #region Properties
  /**
   * Property options
   * @readonly
   *
   * @description
   * Cards of the group, in rendering order.
   *
   * @type {WritableSignal<readonly Option[]>}
   */
  public readonly options: WritableSignal<readonly Option[]> =
    signal<readonly Option[]>(TEAM_SIZES);

  /**
   * Property size
   * @readonly
   *
   * @description
   * Selected team size, set to the third card before the first render.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly size: WritableSignal<string | null> = signal<string | null>('medium');
  // #endregion
}

/**
 * Class LoopFormHost
 *
 * @description
 * Hosts choice cards from a `@for` in a group bound to a reactive form control.
 */
@Component({
  imports: [CwRadioGroup, CwRadioGroupItem, ReactiveFormsModule],
  template: `
    <cw-radio-group ariaLabel="Taille de l'équipe" [formControl]="size">
      @for (option of options; track option.value) {
        <cw-radio-group-item variant="card" [value]="option.value">{{
          option.label
        }}</cw-radio-group-item>
      }
    </cw-radio-group>
  `,
})
class LoopFormHost {
  // #region Properties
  /**
   * Property options
   * @readonly
   *
   * @description
   * Cards of the group, in rendering order.
   *
   * @type {readonly Option[]}
   */
  public readonly options: readonly Option[] = TEAM_SIZES;

  /**
   * Property size
   * @readonly
   *
   * @description
   * Team size control, on the third card from the start.
   *
   * @type {FormControl<string | null>}
   */
  public readonly size: FormControl<string | null> = new FormControl<string | null>('medium');
  // #endregion
}

describe('CwRadioGroup', () => {
  describe('with items from a @for', () => {
    let host: HTMLElement;
    let component: LoopHost;
    let fixture: ComponentFixture<LoopHost>;

    /**
     * Function render
     *
     * @description
     * Renders a separate `@for` group whose cards and value are set before its first render.
     *
     * @param {readonly Option[]} options - Cards of the group.
     * @param {string | null} size - Value of the group.
     *
     * @returns {Promise<HTMLElement>} Element of the rendered fixture.
     */
    async function render(options: readonly Option[], size: string | null): Promise<HTMLElement> {
      const rendered: ComponentFixture<LoopHost> = TestBed.createComponent(LoopHost);
      rendered.componentInstance.options.set(options);
      rendered.componentInstance.size.set(size);
      rendered.autoDetectChanges();
      await rendered.whenStable();
      return rendered.nativeElement as HTMLElement;
    }

    beforeEach(async () => {
      fixture = TestBed.createComponent(LoopHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      host = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;
    });

    it('renders when the checked card is the third of four and makes it the only tab stop', () => {
      expect(radio(host, '11 à 50').getAttribute('aria-checked')).toBe('true');
      expect(radio(host, '11 à 50').tabIndex).toBe(0);
      for (const name of ['Seul', '2 à 10', 'Plus de 50']) {
        expect(radio(host, name).getAttribute('aria-checked')).toBe('false');
        expect(radio(host, name).tabIndex).toBe(-1);
      }
    });

    it('selects with the arrows and moves the tab stop, wrapping around', async () => {
      radio(host, '11 à 50').focus();

      press(radio(host, '11 à 50'), 'ArrowDown');
      await fixture.whenStable();
      expect(component.size()).toBe('large');
      expect(document.activeElement).toBe(radio(host, 'Plus de 50'));
      expect(radio(host, 'Plus de 50').tabIndex).toBe(0);
      expect(radio(host, '11 à 50').tabIndex).toBe(-1);

      press(radio(host, 'Plus de 50'), 'ArrowDown');
      await fixture.whenStable();
      expect(component.size()).toBe('solo');
      expect(radio(host, 'Seul').tabIndex).toBe(0);
    });

    it('makes the first card the tab stop when no card is checked before the first render', async () => {
      const element: HTMLElement = await render(TEAM_SIZES, null);

      expect(radio(element, 'Seul').tabIndex).toBe(0);
      expect(radio(element, '11 à 50').getAttribute('aria-checked')).toBe('false');
      expect(radio(element, '11 à 50').tabIndex).toBe(-1);
    });

    it('makes the second card the tab stop when the first is disabled and none is checked', async () => {
      const element: HTMLElement = await render(
        TEAM_SIZES.map((option, index) => (index === 0 ? { ...option, disabled: true } : option)),
        null,
      );

      expect(radio(element, 'Seul').disabled).toBe(true);
      expect(radio(element, 'Seul').tabIndex).toBe(-1);
      expect(radio(element, '2 à 10').tabIndex).toBe(0);
      expect(radio(element, '11 à 50').tabIndex).toBe(-1);
    });

    it('makes the first enabled card the tab stop when the checked card is disabled', async () => {
      const element: HTMLElement = await render(
        TEAM_SIZES.map((option) =>
          option.value === 'medium' ? { ...option, disabled: true } : option,
        ),
        'medium',
      );

      expect(radio(element, '11 à 50').getAttribute('aria-checked')).toBe('true');
      expect(radio(element, '11 à 50').tabIndex).toBe(-1);
      expect(radio(element, 'Seul').tabIndex).toBe(0);
    });

    it('keeps the tab stop on the checked card when a card is prepended, then moves it once that card is removed', async () => {
      const agency: Option = { value: 'agency', label: 'Agence' };
      component.options.set([agency, ...TEAM_SIZES]);
      await fixture.whenStable();

      expect(radio(host, 'Agence').tabIndex).toBe(-1);
      expect(radio(host, '11 à 50').tabIndex).toBe(0);

      component.options.set([agency, ...TEAM_SIZES.filter((option) => option.value !== 'medium')]);
      await fixture.whenStable();

      expect(component.size()).toBe('medium');
      expect(radio(host, 'Agence').tabIndex).toBe(0);
      for (const name of ['Seul', '2 à 10', 'Plus de 50']) {
        expect(radio(host, name).tabIndex).toBe(-1);
      }
    });

    it('renders under a reactive form control whose initial value is the third card', async () => {
      const form: ComponentFixture<LoopFormHost> = TestBed.createComponent(LoopFormHost);
      form.autoDetectChanges();
      await form.whenStable();
      const element: HTMLElement = form.nativeElement as HTMLElement;

      expect(radio(element, '11 à 50').getAttribute('aria-checked')).toBe('true');
      expect(radio(element, '11 à 50').tabIndex).toBe(0);
      expect(radio(element, 'Seul').tabIndex).toBe(-1);

      radio(element, '11 à 50').focus();
      press(radio(element, '11 à 50'), 'ArrowUp');
      await form.whenStable();

      expect(form.componentInstance.size.value).toBe('small');
      expect(radio(element, '2 à 10').tabIndex).toBe(0);
    });

    it('renders when the cards change and the checked card is the third new one', async () => {
      component.options.set([
        { value: 'a', label: 'Produit' },
        { value: 'b', label: 'Design' },
        { value: 'c', label: 'Ingénierie' },
        { value: 'd', label: 'Marketing' },
      ]);
      component.size.set('c');
      await fixture.whenStable();

      expect(radio(host, 'Ingénierie').getAttribute('aria-checked')).toBe('true');
      expect(radio(host, 'Ingénierie').tabIndex).toBe(0);
      expect(radio(host, 'Produit').tabIndex).toBe(-1);
    });
  });

  describe('with models', () => {
    let host: HTMLElement;
    let component: ModelHost;
    let fixture: ComponentFixture<ModelHost>;

    beforeEach(async () => {
      fixture = TestBed.createComponent(ModelHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      host = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;
    });

    it('reflects the value model and selects on click', async () => {
      expect(radio(host, 'Liste').getAttribute('aria-checked')).toBe('true');
      expect(group(host, 'Vue par défaut').dataset['orientation']).toBe('horizontal');

      radio(host, 'Tableau').click();
      await fixture.whenStable();

      expect(component.view()).toBe('board');
      expect(radio(host, 'Tableau').getAttribute('aria-checked')).toBe('true');
      expect(radio(host, 'Liste').getAttribute('aria-checked')).toBe('false');
    });

    it('makes the selected option the only tab stop, or the first one without a value', () => {
      expect(radio(host, 'Liste').tabIndex).toBe(0);
      expect(radio(host, 'Tableau').tabIndex).toBe(-1);
      expect(radio(host, 'Public').tabIndex).toBe(0);
      expect(radio(host, 'Privé').tabIndex).toBe(-1);
    });

    it('selects with the arrows, skipping the disabled option and wrapping around', async () => {
      radio(host, 'Liste').focus();

      press(radio(host, 'Liste'), 'ArrowRight');
      await fixture.whenStable();
      expect(component.view()).toBe('board');
      expect(document.activeElement).toBe(radio(host, 'Tableau'));

      press(radio(host, 'Tableau'), 'ArrowDown');
      await fixture.whenStable();
      expect(component.view()).toBe('calendar');
      expect(radio(host, 'Gantt').disabled).toBe(true);

      press(radio(host, 'Calendrier'), 'ArrowRight');
      await fixture.whenStable();
      expect(component.view()).toBe('list');

      press(radio(host, 'Liste'), 'ArrowUp');
      await fixture.whenStable();
      expect(component.view()).toBe('calendar');
      expect(radio(host, 'Calendrier').tabIndex).toBe(0);
    });

    it('names a choice card by its content and selects it from anywhere in the card', async () => {
      const card: HTMLLabelElement | null = host.querySelector<HTMLLabelElement>(
        `label[for="${radio(host, 'Privé').id}"]`,
      );
      card?.click();
      await fixture.whenStable();

      expect(component.visibility()).toBe('private');
      expect(radio(host, 'Privé').getAttribute('aria-checked')).toBe('true');
    });
  });

  describe('card without indicator', () => {
    /**
     * Class IndicatorHost
     *
     * @description
     * Hosts choice cards whose radio dot is hidden.
     */
    @Component({
      imports: [CwRadioGroup, CwRadioGroupItem],
      template: `
        <cw-radio-group
          ariaLabel="Space template"
          [(value)]="template"
          [invalid]="invalid()"
          [touched]="invalid()"
        >
          <cw-radio-group-item variant="card" value="dev" [indicator]="false">
            Software development
          </cw-radio-group-item>
          <cw-radio-group-item variant="card" value="marketing" [indicator]="false">
            Marketing
          </cw-radio-group-item>
          <cw-radio-group-item variant="card" value="design" [indicator]="false" disabled>
            Design
          </cw-radio-group-item>
        </cw-radio-group>
      `,
    })
    class IndicatorHost {
      // #region Properties
      /**
       * Property template
       * @readonly
       *
       * @description
       * Selected template.
       *
       * @type {WritableSignal<string | null>}
       */
      public readonly template: WritableSignal<string | null> = signal<string | null>('dev');

      /**
       * Property invalid
       * @readonly
       *
       * @description
       * Whether the group shows a touched invalid state.
       *
       * @type {WritableSignal<boolean>}
       */
      public readonly invalid: WritableSignal<boolean> = signal(false);
      // #endregion
    }

    /**
     * Function card
     *
     * @description
     * Finds the card that labels a radio.
     *
     * @param {HTMLElement} scope - Fixture containing the cards.
     * @param {HTMLButtonElement} control - Radio labelled by the card.
     *
     * @returns {HTMLLabelElement} Card of the radio.
     */
    function card(scope: HTMLElement, control: HTMLButtonElement): HTMLLabelElement {
      const found: HTMLLabelElement | null = scope.querySelector<HTMLLabelElement>(
        `label[for="${control.id}"]`,
      );
      if (!found) throw new Error('No card');
      return found;
    }

    let host: HTMLElement;
    let fixture: ComponentFixture<IndicatorHost>;

    beforeEach(async () => {
      fixture = TestBed.createComponent(IndicatorHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      host = fixture.nativeElement as HTMLElement;
    });

    it('keeps each card a named, checkable and focusable radio', async () => {
      const marketing: HTMLButtonElement = radio(host, 'Marketing');
      expect(radio(host, 'Software development').getAttribute('aria-checked')).toBe('true');
      expect(radio(host, 'Software development').tabIndex).toBe(0);

      host.querySelector<HTMLLabelElement>(`label[for="${marketing.id}"]`)?.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.template()).toBe('marketing');
      expect(marketing.getAttribute('aria-checked')).toBe('true');
      expect(marketing.tabIndex).toBe(0);
    });

    it('moves the selection and the focus with the arrows', async () => {
      radio(host, 'Software development').focus();
      press(radio(host, 'Software development'), 'ArrowDown');
      await fixture.whenStable();

      expect(fixture.componentInstance.template()).toBe('marketing');
      expect(document.activeElement).toBe(radio(host, 'Marketing'));
    });

    it('dims a disabled card, ends its hover veil and skips it', async () => {
      const design: HTMLButtonElement = radio(host, 'Design');
      expect(design.disabled).toBe(true);
      expect(card(host, design).classList).toContain('has-disabled:opacity-50');
      expect(card(host, design).classList).toContain('has-disabled:hover:bg-transparent');

      card(host, design).click();
      await fixture.whenStable();
      expect(fixture.componentInstance.template()).toBe('dev');

      radio(host, 'Marketing').focus();
      press(radio(host, 'Marketing'), 'ArrowDown');
      await fixture.whenStable();
      expect(fixture.componentInstance.template()).toBe('dev');
    });

    it('draws the invalid border on the card once the group is invalid', async () => {
      const marketing: HTMLButtonElement = radio(host, 'Marketing');
      expect(marketing.hasAttribute('aria-invalid')).toBe(false);

      fixture.componentInstance.invalid.set(true);
      await fixture.whenStable();

      expect(marketing.getAttribute('aria-invalid')).toBe('true');
      expect(card(host, marketing).classList).toContain(
        'has-[[aria-invalid=true]]:border-destructive',
      );
    });
  });

  it('is the value accessor of a reactive form control and reports its invalid state', async () => {
    /**
     * Class ReactiveHost
     *
     * @description
     * Hosts a radio group bound to a reactive form control.
     */
    @Component({
      imports: [CwRadioGroup, CwRadioGroupItem, ReactiveFormsModule],
      template: `
        <cw-radio-group ariaLabel="Visibilité" [formControl]="visibility">
          <cw-radio-group-item id="r-public" value="public" /><label for="r-public">Public</label>
          <cw-radio-group-item id="r-private" value="private" /><label for="r-private">Privé</label>
        </cw-radio-group>
      `,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property visibility
       * @readonly
       *
       * @description
       * Reactive visibility control.
       *
       * @type {FormControl<string | null>}
       */
      public readonly visibility: FormControl<string | null> = new FormControl<string | null>(
        null,
        {
          validators: [(control) => Validators.required(control)],
        },
      );
      // #endregion
    }

    const fixture: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const visibility: HTMLElement = group(host, 'Visibilité');

    leave(radio(host, 'Public'));
    await fixture.whenStable();
    expect(visibility.getAttribute('aria-invalid')).toBe('true');
    expect(radio(host, 'Public').getAttribute('aria-invalid')).toBe('true');

    radio(host, 'Privé').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.visibility.value).toBe('private');
    expect(visibility.hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.visibility.setValue('public');
    await fixture.whenStable();
    expect(radio(host, 'Public').getAttribute('aria-checked')).toBe('true');

    fixture.componentInstance.visibility.disable();
    await fixture.whenStable();
    expect(radio(host, 'Public').disabled).toBe(true);
    expect(visibility.getAttribute('aria-disabled')).toBe('true');
  });

  it('works with ngModel', async () => {
    /**
     * Class TemplateHost
     *
     * @description
     * Hosts a radio group bound through ngModel.
     */
    @Component({
      imports: [CwRadioGroup, CwRadioGroupItem, FormsModule],
      template: `
        <cw-radio-group ariaLabel="Fréquence" [(ngModel)]="frequency">
          <cw-radio-group-item id="f-now" value="now" /><label for="f-now">Immédiatement</label>
          <cw-radio-group-item id="f-daily" value="daily" /><label for="f-daily"
            >Résumé quotidien</label
          >
        </cw-radio-group>
      `,
    })
    class TemplateHost {
      // #region Properties
      /**
       * Property frequency
       * @readonly
       *
       * @description
       * Selected notification frequency.
       *
       * @type {WritableSignal<string>}
       */
      public readonly frequency: WritableSignal<string> = signal('daily');
      // #endregion
    }

    const fixture: ComponentFixture<TemplateHost> = TestBed.createComponent(TemplateHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    // NgModel writes its value in a microtask after the first check.
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    expect(radio(host, 'Résumé quotidien').getAttribute('aria-checked')).toBe('true');

    radio(host, 'Immédiatement').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.frequency()).toBe('now');
  });

  it('is a Signal Forms value control', async () => {
    /**
     * Class SignalHost
     *
     * @description
     * Hosts a radio group bound to Signal Forms.
     */
    @Component({
      imports: [CwRadioGroup, CwRadioGroupItem, FormField],
      template: `
        <cw-radio-group ariaLabel="Visibilité" [formField]="space.visibility">
          <cw-radio-group-item id="s-public" value="public" /><label for="s-public">Public</label>
          <cw-radio-group-item id="s-private" value="private" /><label for="s-private">Privé</label>
        </cw-radio-group>
      `,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       * @readonly
       *
       * @description
       * Signal-backed form model.
       *
       * @type {WritableSignal<{ visibility: string | null }>}
       */
      public readonly model: WritableSignal<{ visibility: string | null }> = signal<{
        visibility: string | null;
      }>({ visibility: null });

      /**
       * Property space
       * @readonly
       *
       * @description
       * Signal form exposing the required visibility field.
       *
       * @type {FieldTree<{ visibility: string | null }>}
       */
      public readonly space: FieldTree<{ visibility: string | null }> = form(this.model, (path) => {
        required(path.visibility);
      });
      // #endregion
    }

    const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const visibility: HTMLElement = group(host, 'Visibilité');
    expect(visibility.getAttribute('aria-required')).toBe('true');

    leave(radio(host, 'Public'));
    await fixture.whenStable();
    expect(visibility.getAttribute('aria-invalid')).toBe('true');

    radio(host, 'Privé').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().visibility).toBe('private');

    fixture.componentInstance.model.set({ visibility: 'public' });
    await fixture.whenStable();
    expect(radio(host, 'Public').getAttribute('aria-checked')).toBe('true');
    expect(visibility.hasAttribute('aria-invalid')).toBe(false);
  });
});
