import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';

import { CwToggleGroupItem } from './toggle-group-item/toggle-group-item.component';
import { CwToggleGroup } from './toggle-group.component';
import type { CwToggleGroupValue } from './toggle-group.types';

/**
 * Function group
 *
 * @description
 * Finds a group by its accessible label.
 *
 * @param {HTMLElement} host - Fixture containing toggle groups.
 * @param {string} name - Accessible label of the group.
 *
 * @returns {HTMLElement} Matching group.
 */
function group(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | null = host.querySelector<HTMLElement>(`[aria-label="${name}"]`);
  if (!found) throw new Error(`No group named ${name}`);
  return found;
}

/**
 * Function item
 *
 * @description
 * Finds a button by its accessible label or visible text.
 *
 * @param {HTMLElement} scope - Group containing the item.
 * @param {string} name - Accessible label or visible text.
 *
 * @returns {HTMLButtonElement} Matching button.
 */
function item(scope: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    scope.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name);
  if (!found) throw new Error(`No item named ${name}`);
  return found;
}

// The CDK key manager still reads the legacy `keyCode`, which a synthetic event does not derive.
/**
 * Constant KEY_CODES
 *
 * @description
 * Key codes used by the CDK focus manager.
 *
 * @type {Record<string, number>}
 */
const KEY_CODES: Record<string, number> = { End: 35, Home: 36, ArrowLeft: 37, ArrowRight: 39 };

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event with the CDK key code.
 *
 * @param {HTMLElement} target - Element receiving the keyboard event.
 * @param {string} key - Key to dispatch.
 */
function press(target: HTMLElement, key: string): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, keyCode: KEY_CODES[key], bubbles: true, cancelable: true }),
  );
}

/**
 * Class ModelHost
 *
 * @description
 * Hosts single and multiple choice groups bound to models.
 */
@Component({
  imports: [CwToggleGroup, CwToggleGroupItem],
  template: `
    <cw-toggle-group variant="outline" ariaLabel="Grouper par" [(value)]="groupBy">
      <button cwToggleGroupItem value="status">Statut</button>
      <button cwToggleGroupItem value="priority" disabled>Priorité</button>
      <button cwToggleGroupItem value="assignee">Assigné</button>
    </cw-toggle-group>
    <cw-toggle-group type="multiple" ariaLabel="Mise en forme" [(value)]="marks">
      <button cwToggleGroupItem value="bold" aria-label="Gras"></button>
      <button cwToggleGroupItem value="italic" aria-label="Italique"></button>
      <button cwToggleGroupItem value="underline" aria-label="Souligné"></button>
    </cw-toggle-group>
    <cw-toggle-group ariaLabel="Densité" orientation="vertical" disabled value="compact">
      <button cwToggleGroupItem value="compact">Compacte</button>
      <button cwToggleGroupItem value="comfortable">Confortable</button>
    </cw-toggle-group>
  `,
})
class ModelHost {
  // #region Properties
  /**
   * Property groupBy
   * @readonly
   *
   * @description
   * Current grouping selection.
   *
   * @type {WritableSignal<CwToggleGroupValue>}
   */
  public readonly groupBy: WritableSignal<CwToggleGroupValue> =
    signal<CwToggleGroupValue>('status');

  /**
   * Property marks
   * @readonly
   *
   * @description
   * Current formatting selections.
   *
   * @type {WritableSignal<CwToggleGroupValue>}
   */
  public readonly marks: WritableSignal<CwToggleGroupValue> = signal<CwToggleGroupValue>(['bold']);
  // #endregion
}

describe('CwToggleGroup', () => {
  describe('with models', () => {
    let host: HTMLElement;
    let component: ModelHost;
    let fixture: ComponentFixture<ModelHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(ModelHost);
      fixture.autoDetectChanges();
      host = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;
    });

    it('is a radio group in single choice and keeps one item on', async () => {
      const groupBy: HTMLElement = group(host, 'Grouper par');
      const status: HTMLButtonElement = item(groupBy, 'Statut');
      const assignee: HTMLButtonElement = item(groupBy, 'Assigné');
      expect(groupBy.getAttribute('role')).toBe('radiogroup');
      expect(status.getAttribute('role')).toBe('radio');
      expect(status.getAttribute('aria-checked')).toBe('true');

      assignee.click();
      await fixture.whenStable();
      expect(component.groupBy()).toBe('assignee');
      expect(status.getAttribute('aria-checked')).toBe('false');
      expect(assignee.dataset['state']).toBe('on');

      assignee.click();
      await fixture.whenStable();
      expect(component.groupBy()).toBe('assignee');
    });

    it('gives one Tab stop and selects as the arrows move, skipping disabled items', async () => {
      const groupBy: HTMLElement = group(host, 'Grouper par');
      const status: HTMLButtonElement = item(groupBy, 'Statut');
      const assignee: HTMLButtonElement = item(groupBy, 'Assigné');
      expect(status.tabIndex).toBe(0);
      expect(assignee.tabIndex).toBe(-1);

      status.focus();
      press(status, 'ArrowRight');
      await fixture.whenStable();

      expect(document.activeElement).toBe(assignee);
      expect(component.groupBy()).toBe('assignee');
      expect(assignee.tabIndex).toBe(0);

      press(assignee, 'ArrowRight');
      await fixture.whenStable();
      expect(document.activeElement).toBe(status);
      expect(component.groupBy()).toBe('status');
    });

    it('flips each item alone in multiple choice and only moves the focus with the arrows', async () => {
      const marks: HTMLElement = group(host, 'Mise en forme');
      const bold: HTMLButtonElement = item(marks, 'Gras');
      const italic: HTMLButtonElement = item(marks, 'Italique');
      expect(marks.getAttribute('role')).toBe('group');
      expect(bold.getAttribute('aria-pressed')).toBe('true');
      expect(bold.hasAttribute('role')).toBe(false);

      italic.click();
      bold.click();
      await fixture.whenStable();
      expect(component.marks()).toEqual(['italic']);

      italic.focus();
      press(italic, 'End');
      await fixture.whenStable();
      expect(document.activeElement).toBe(item(marks, 'Souligné'));
      expect(component.marks()).toEqual(['italic']);
    });

    it('disables every item of a disabled group', () => {
      const density: HTMLElement = group(host, 'Densité');

      expect(density.dataset['orientation']).toBe('vertical');
      expect(item(density, 'Compacte').disabled).toBe(true);
      expect(item(density, 'Confortable').disabled).toBe(true);
      expect(item(density, 'Compacte').getAttribute('aria-checked')).toBe('true');
    });
  });

  it('is the value accessor of a reactive form control and reports its invalid state', async () => {
    /**
     * Class ReactiveHost
     *
     * @description
     * Hosts a group bound to a reactive form control.
     */
    @Component({
      imports: [CwToggleGroup, CwToggleGroupItem, ReactiveFormsModule],
      template: `
        <cw-toggle-group ariaLabel="Densité" [formControl]="density">
          <button cwToggleGroupItem value="compact">Compacte</button>
          <button cwToggleGroupItem value="comfortable">Confortable</button>
        </cw-toggle-group>
      `,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property density
       * @readonly
       *
       * @description
       * Reactive density control.
       *
       * @type {FormControl<string | null>}
       */
      public readonly density: FormControl<string | null> = new FormControl<string | null>(null, {
        validators: [(control) => Validators.required(control)],
      });
      // #endregion
    }

    const fixture: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const density: HTMLElement = group(host, 'Densité');
    const compact: HTMLButtonElement = item(density, 'Compacte');

    fixture.componentInstance.density.setValue('comfortable');
    await fixture.whenStable();
    expect(item(density, 'Confortable').getAttribute('aria-checked')).toBe('true');

    fixture.componentInstance.density.setValue(null);
    compact.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(density.getAttribute('aria-invalid')).toBe('true');

    compact.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.density.value).toBe('compact');
    expect(density.hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.density.disable();
    await fixture.whenStable();
    expect(compact.disabled).toBe(true);
  });

  it('is a Signal Forms value control in multiple choice', async () => {
    /**
     * Class SignalHost
     *
     * @description
     * Hosts a multiple-choice group bound through Signal Forms.
     */
    @Component({
      imports: [CwToggleGroup, CwToggleGroupItem, FormField],
      template: `
        <cw-toggle-group type="multiple" ariaLabel="Mise en forme" [formField]="settings.marks">
          <button cwToggleGroupItem value="bold">Gras</button>
          <button cwToggleGroupItem value="italic">Italique</button>
        </cw-toggle-group>
      `,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       * @readonly
       *
       * @description
       * Signal-backed formatting model.
       *
       * @type {WritableSignal<{ marks: CwToggleGroupValue }>}
       */
      public readonly model: WritableSignal<{ marks: CwToggleGroupValue }> = signal<{
        marks: CwToggleGroupValue;
      }>({ marks: [] });

      /**
       * Property settings
       * @readonly
       *
       * @description
       * Signal form exposing required formatting selections.
       *
       * @type {FieldTree<{ marks: CwToggleGroupValue }>}
       */
      public readonly settings: FieldTree<{ marks: CwToggleGroupValue }> = form(
        this.model,
        (path) => {
          required(path.marks);
        },
      );
      // #endregion
    }

    const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const marks: HTMLElement = group(host, 'Mise en forme');

    item(marks, 'Italique').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().marks).toEqual(['italic']);

    fixture.componentInstance.model.set({ marks: ['bold'] });
    await fixture.whenStable();
    expect(item(marks, 'Gras').getAttribute('aria-pressed')).toBe('true');
    expect(item(marks, 'Italique').getAttribute('aria-pressed')).toBe('false');
  });
});
