import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwRelationLeading } from './relation-leading/relation-leading.directive';
import { CwRelationPicker } from './relation-picker/relation-picker.component';
import { CwRelations } from './relations.component';
import type {
  CwRelation,
  CwRelationAddEvent,
  CwRelationChangeTypeEvent,
  CwRelationItem,
  CwRelationType,
} from './relations.types';

/**
 * Constant TYPES
 *
 * @description
 * Relation types used by the test fixtures.
 *
 * @type {CwRelationType[]}
 */
const TYPES: CwRelationType[] = [
  { id: 'parent', label: 'Tâche parente' },
  { id: 'blocked-by', label: 'Bloquée par' },
  { id: 'blocks', label: 'Bloque' },
  { id: 'related', label: 'Liée à' },
];

/**
 * Function named
 *
 * @description
 * Finds a fixture element by selector and accessible name.
 *
 * @param {ParentNode} root - Root containing candidate elements.
 * @param {string} selector - CSS selector used to find candidates.
 * @param {string} name - Accessible name or text to match.
 * @returns {HTMLElement} Matching fixture element.
 */
function named(root: ParentNode, selector: string, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    root.querySelectorAll<HTMLElement>(selector),
  ).find(
    (element: HTMLElement) =>
      (element.getAttribute('aria-label') ?? element.textContent.replace(/\s+/g, ' ').trim()) ===
      name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

/**
 * Component Host
 *
 * @description
 * Hosts a relation list with consumer-controlled data and output signals.
 */
@Component({
  imports: [CwRelations, CwRelationLeading],
  template: `
    <cw-relations
      [relations]="relations()"
      [types]="types"
      [results]="results"
      [readonly]="readonly()"
      (add)="added.set($event)"
      (remove)="removed.set($event)"
      (changeType)="retyped.set($event)"
      (open)="opened.set($event)"
      (search)="query.set($event)"
    >
      <ng-template cwRelationLeading let-item>
        <span role="img" [attr.aria-label]="'Statut de ' + item.title"></span>
      </ng-template>
    </cw-relations>
  `,
})
class Host {
  // #region Properties
  /**
   * Property types
   *
   * @description
   * Relation types available in the fixture.
   *
   * @type {CwRelationType[]}
   * @readonly
   */
  public readonly types: CwRelationType[] = TYPES;

  /**
   * Property relations
   *
   * @description
   * Relations displayed by the fixture.
   *
   * @type {WritableSignal<CwRelation[]>}
   * @readonly
   */
  public readonly relations: WritableSignal<CwRelation[]> = signal<CwRelation[]>([
    {
      id: 'r1',
      type: 'blocked-by',
      item: { id: 't471', reference: 'CAD-471', title: 'Migrer les pièces jointes' },
      warning: 'Non terminée',
    },
    {
      id: 'r2',
      type: 'related',
      item: {
        id: 's2291',
        reference: 'SUP-2291',
        title: 'Export illisible dans Excel',
        path: 'Support › Tickets',
        href: '/support/SUP-2291',
      },
    },
    {
      id: 'r3',
      type: 'parent',
      item: { id: 't470', reference: 'CAD-470', title: 'Refonte des exports' },
    },
  ]);

  /**
   * Property results
   *
   * @description
   * Search results available to the picker.
   *
   * @type {CwRelationItem[]}
   * @readonly
   */
  public readonly results: CwRelationItem[] = [
    { id: 't488', reference: 'CAD-488', title: 'Importer les espaces' },
    { id: 't471', reference: 'CAD-471', title: 'Migrer les pièces jointes' },
  ];

  /**
   * Property readonly
   *
   * @description
   * Whether editing actions are disabled.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly readonly: WritableSignal<boolean> = signal(false);

  /**
   * Property added
   *
   * @description
   * Last relation addition reported by the component.
   *
   * @type {WritableSignal<CwRelationAddEvent | null>}
   * @readonly
   */
  public readonly added: WritableSignal<CwRelationAddEvent | null> =
    signal<CwRelationAddEvent | null>(null);

  /**
   * Property removed
   *
   * @description
   * Last relation removal reported by the component.
   *
   * @type {WritableSignal<CwRelation | null>}
   * @readonly
   */
  public readonly removed: WritableSignal<CwRelation | null> = signal<CwRelation | null>(null);

  /**
   * Property retyped
   *
   * @description
   * Last relation type change reported by the component.
   *
   * @type {WritableSignal<CwRelationChangeTypeEvent | null>}
   * @readonly
   */
  public readonly retyped: WritableSignal<CwRelationChangeTypeEvent | null> =
    signal<CwRelationChangeTypeEvent | null>(null);

  /**
   * Property opened
   *
   * @description
   * Last related item opened by the component.
   *
   * @type {WritableSignal<CwRelationItem | null>}
   * @readonly
   */
  public readonly opened: WritableSignal<CwRelationItem | null> = signal<CwRelationItem | null>(
    null,
  );

  /**
   * Property query
   *
   * @description
   * Last search query emitted by the picker.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  public readonly query: WritableSignal<string> = signal('');
  // #endregion
}

describe('CwRelations', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('groups the relations by type in the given order, without empty groups', () => {
    const groups: (string | undefined)[] = Array.from(host.querySelectorAll('[role="group"]')).map(
      (group: Element) =>
        document
          .getElementById(group.getAttribute('aria-labelledby') ?? '')
          ?.firstChild?.textContent?.trim(),
    );
    expect(groups).toEqual(['Tâche parente', 'Bloquée par', 'Liée à']);
    expect(host.textContent).toContain('Non terminée');
    expect(host.textContent).toContain('Support › Tickets');
    expect(
      host.querySelector('[role="img"][aria-label^="Statut"]')?.getAttribute('aria-label'),
    ).toBe('Statut de Refonte des exports');
  });

  it('opens a related item from its title, a link when it has an address', () => {
    named(host, 'button', 'Migrer les pièces jointes').click();
    expect(component.opened()?.id).toBe('t471');

    const link: HTMLElement = named(host, 'a', 'Export illisible dans Excel');
    expect(link.getAttribute('href')).toBe('/support/SUP-2291');
  });

  it('removes a relation with Delete on its title', () => {
    named(host, 'button', 'Refonte des exports').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
    );

    expect(component.removed()?.id).toBe('r3');
  });

  it('changes the type and removes from the row menu', async () => {
    named(host, 'button', 'Actions de la relation CAD-471').click();
    await fixture.whenStable();
    named(document.body, '[role="menuitem"]', 'Changer le type').click();
    await fixture.whenStable();
    named(document.body, '[role="menuitem"]', 'Bloque').click();
    await fixture.whenStable();

    expect(component.retyped()).toEqual({ relation: component.relations()[0], type: 'blocks' });
  });

  it('adds a relation from the picker: a type, then a search result', async () => {
    named(host, 'button', 'Ajouter').click();
    await fixture.whenStable();
    const dialog: Element | null = document.body.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-label')).toBe('Ajouter une relation');

    const search: HTMLElement = named(document.body, '[role="combobox"]', 'Rechercher une tâche');
    search.click();
    await fixture.whenStable();
    const options: HTMLElement[] = Array.from(
      document.body.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    const linked: HTMLElement | undefined = options.find((option: HTMLElement) =>
      option.textContent.includes('Migrer'),
    );
    expect(linked?.getAttribute('aria-disabled')).toBe('true');
    expect(linked?.textContent).toContain('Déjà liée');
    options.find((option: HTMLElement) => option.textContent.includes('Importer'))?.click();
    await fixture.whenStable();

    expect(component.added()).toEqual({ type: 'parent', item: component.results[0] });
  });

  it('writes the empty state and hides the addition when read-only', async () => {
    component.relations.set([]);
    await fixture.whenStable();
    expect(host.textContent).toContain('Aucune relation.');
    expect(named(host, 'button', 'Ajouter une relation')).toBeTruthy();

    component.readonly.set(true);
    await fixture.whenStable();
    expect(Array.from(host.querySelectorAll('button')).length).toBe(0);
  });
});

describe('CwRelationPicker', () => {
  it('proposes the default type', async () => {
    /**
     * Component PickerHost
     *
     * @description
     * Hosts a standalone relation picker.
     */
    @Component({
      imports: [CwRelationPicker],
      template: `<cw-relation-picker [types]="types" defaultType="blocks" />`,
    })
    class PickerHost {
      // #region Properties
      /**
       * Property types
       *
       * @description
       * Relation types available in the fixture.
       *
       * @type {CwRelationType[]}
       * @readonly
       */
      public readonly types: CwRelationType[] = TYPES;
      // #endregion
    }

    const fixture: ComponentFixture<PickerHost> = TestBed.createComponent(PickerHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[role="combobox"]')?.textContent).toContain('Bloque');
  });
});
