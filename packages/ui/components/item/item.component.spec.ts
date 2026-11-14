import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwItemActions } from './item-actions/item-actions.component';
import { CwItemContent } from './item-content/item-content.component';
import { CwItemDescription } from './item-description/item-description.component';
import { CwItemGroup } from './item-group/item-group.component';
import { CwItemSeparator } from './item-separator/item-separator.component';
import { CwItemTitle } from './item-title/item-title.component';
import { CwItem } from './item.component';

/**
 * Component Host
 *
 * @description
 * Exercises item groups, navigation and selection.
 */
@Component({
  imports: [
    CwItem,
    CwItemGroup,
    CwItemContent,
    CwItemTitle,
    CwItemDescription,
    CwItemActions,
    CwItemSeparator,
  ],
  template: `
    <cw-item-group aria-label="Membres">
      <cw-item size="sm">
        <cw-item-content><cw-item-title>Léa Martin</cw-item-title></cw-item-content>
        <cw-item-actions>
          <button type="button" aria-label="Actions du membre">…</button>
        </cw-item-actions>
      </cw-item>
      <cw-item size="sm" disabled>
        <cw-item-content><cw-item-title>Samuel Roux</cw-item-title></cw-item-content>
      </cw-item>
      <cw-item size="sm">
        <cw-item-content><cw-item-title>Karim Benali</cw-item-title></cw-item-content>
      </cw-item>
      <cw-item size="sm">
        <cw-item-content><cw-item-title>Inès Duval</cw-item-title></cw-item-content>
      </cw-item>
    </cw-item-group>

    <cw-item-group aria-label="Notifications">
      <a
        cwItem
        href="/t/CAD-482"
        unread
        (click)="$event.preventDefault(); opened.set(opened() + 1)"
      >
        <cw-item-content>
          <cw-item-title>Karim Benali vous a mentionné</cw-item-title>
          <cw-item-description>Tu peux relire l'export ? CAD-482</cw-item-description>
        </cw-item-content>
      </a>
      <cw-item-separator />
      <a cwItem href="/t/CAD-479">
        <cw-item-content>
          <cw-item-title>Inès Duval vous a assigné CAD-479</cw-item-title>
        </cw-item-content>
      </a>
    </cw-item-group>

    <cw-item-group aria-label="Fichiers" selectable>
      <cw-item size="xs" [(selected)]="exportSelected">
        <cw-item-content><cw-item-title>export-taches.csv</cw-item-title></cw-item-content>
      </cw-item>
      <button cwItem size="xs">
        <cw-item-content><cw-item-title>maquette.png</cw-item-title></cw-item-content>
      </button>
    </cw-item-group>
  `,
})
class Host {
  // #region Properties
  /**
   * Property opened
   * @readonly
   *
   * @description
   * Number of notification link activations.
   *
   * @type {WritableSignal<number>}
   */
  public readonly opened: WritableSignal<number> = signal(0);

  /**
   * Property exportSelected
   * @readonly
   *
   * @description
   * Selection state of the export item.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly exportSelected: WritableSignal<boolean> = signal(false);
  // #endregion
}

/**
 * Function group
 *
 * @description
 * Finds a group by its accessible name.
 *
 * @param {HTMLElement} host - Container holding item groups.
 * @param {string} name - Accessible name of the group.
 *
 * @returns {HTMLElement} Matching item group element.
 */
function group(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | null = host.querySelector<HTMLElement>(
    `cw-item-group[aria-label="${name}"]`,
  );
  if (!found) throw new Error(`No group named ${name}`);
  return found;
}

/**
 * Function row
 *
 * @description
 * Finds an item row containing the given title.
 *
 * @param {HTMLElement} scope - Group containing candidate rows.
 * @param {string} title - Text identifying the row.
 *
 * @returns {HTMLElement} Matching item row.
 */
function row(scope: HTMLElement, title: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    scope.querySelectorAll<HTMLElement>('cw-item, [cwItem]'),
  ).find((element) => element.textContent.includes(title));
  if (!found) throw new Error(`No row titled ${title}`);
  return found;
}

// The CDK key manager reads `keyCode`, which the KeyboardEvent constructor leaves at 0.
/**
 * Constant KEY_CODES
 *
 * @description
 * Keyboard codes read by the CDK focus manager.
 *
 * @type {Record<string, number>}
 */
const KEY_CODES: Record<string, number> = {
  ' ': 32,
  End: 35,
  Home: 36,
  ArrowUp: 38,
  ArrowDown: 40,
};

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event with the CDK key code.
 *
 * @param {HTMLElement} target - Element receiving the keyboard event.
 * @param {string} key - Keyboard key to dispatch.
 */
function press(target: HTMLElement, key: string): void {
  const event: KeyboardEvent = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperty(event, 'keyCode', { value: KEY_CODES[key] });
  target.dispatchEvent(event);
}

describe('CwItemGroup', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
  });

  it('is a list of list items with a single tab stop', () => {
    const members: HTMLElement = group(host, 'Membres');
    const rows: Element[] = Array.from(members.querySelectorAll('cw-item'));

    expect(members.getAttribute('role')).toBe('list');
    expect(rows.every((element) => element.getAttribute('role') === 'listitem')).toBe(true);
    expect(rows.map((element) => element.getAttribute('tabindex'))).toEqual([
      '0',
      '-1',
      '-1',
      '-1',
    ]);
  });

  it('moves the focus with the arrows, skipping disabled rows, and Home and End', async () => {
    const members: HTMLElement = group(host, 'Membres');
    const lea: HTMLElement = row(members, 'Léa Martin');
    const karim: HTMLElement = row(members, 'Karim Benali');
    const ines: HTMLElement = row(members, 'Inès Duval');
    lea.focus();

    press(lea, 'ArrowDown');
    await fixture.whenStable();

    expect(document.activeElement).toBe(karim);
    expect(karim.getAttribute('tabindex')).toBe('0');
    expect(lea.getAttribute('tabindex')).toBe('-1');
    expect(row(members, 'Samuel Roux').getAttribute('aria-disabled')).toBe('true');

    press(karim, 'End');
    expect(document.activeElement).toBe(ines);
    press(ines, 'Home');
    expect(document.activeElement).toBe(lea);
  });

  it('keeps the native role of links and becomes a plain group around them', () => {
    const notifications: HTMLElement = group(host, 'Notifications');
    const link: HTMLElement = row(notifications, 'mentionné');

    link.click();

    expect(notifications.getAttribute('role')).toBe('group');
    expect(link.getAttribute('role')).toBeNull();
    expect(link.textContent).toContain('(non lu)');
    expect(fixture.componentInstance.opened()).toBe(1);
  });

  it('is a multi-selection listbox whose options toggle on click and Space', async () => {
    const files: HTMLElement = group(host, 'Fichiers');
    const csv: HTMLElement = row(files, 'export-taches.csv');
    const image: HTMLElement = row(files, 'maquette.png');

    expect(files.getAttribute('role')).toBe('listbox');
    expect(files.getAttribute('aria-multiselectable')).toBe('true');
    expect(csv.getAttribute('aria-selected')).toBe('false');

    csv.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.exportSelected()).toBe(true);
    expect(csv.getAttribute('aria-selected')).toBe('true');

    press(image, ' ');
    await fixture.whenStable();
    expect(image.getAttribute('aria-selected')).toBe('true');
    expect(image.getAttribute('type')).toBe('button');
  });
});

/**
 * Component Single
 *
 * @description
 * Exercises a disabled standalone button item.
 */
@Component({
  imports: [CwItem],
  template: `<button cwItem disabled (click)="clicks.set(clicks() + 1)">Configurer</button>`,
})
class Single {
  // #region Properties
  /**
   * Property clicks
   * @readonly
   *
   * @description
   * Number of clicks handled by the button.
   *
   * @type {WritableSignal<number>}
   */
  public readonly clicks: WritableSignal<number> = signal(0);
  // #endregion
}

describe('CwItem', () => {
  it('ignores clicks while disabled and leaves the tab order', () => {
    const fixture: ComponentFixture<Single> = TestBed.createComponent(Single);
    fixture.detectChanges();
    const item: HTMLButtonElement | null = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    );

    item?.click();

    expect(fixture.componentInstance.clicks()).toBe(0);
    expect(item?.getAttribute('aria-disabled')).toBe('true');
    expect(item?.getAttribute('tabindex')).toBe('-1');
  });
});
