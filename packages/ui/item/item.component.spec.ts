import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwItemActions } from './item-actions/item-actions.component';
import { CwItemContent } from './item-content/item-content.component';
import { CwItemDescription } from './item-description/item-description.component';
import { CwItemGroup } from './item-group/item-group.component';
import { CwItemSeparator } from './item-separator/item-separator.component';
import { CwItemTitle } from './item-title/item-title.component';
import { CwItem } from './item.component';

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
  readonly opened = signal(0);
  readonly exportSelected = signal(false);
}

function group(host: HTMLElement, name: string): HTMLElement {
  const found = host.querySelector<HTMLElement>(`cw-item-group[aria-label="${name}"]`);
  if (!found) throw new Error(`No group named ${name}`);
  return found;
}

function row(scope: HTMLElement, title: string): HTMLElement {
  const found = Array.from(scope.querySelectorAll<HTMLElement>('cw-item, [cwItem]')).find(
    (element) => element.textContent.includes(title),
  );
  if (!found) throw new Error(`No row titled ${title}`);
  return found;
}

// The CDK key manager reads `keyCode`, which the KeyboardEvent constructor leaves at 0.
const KEY_CODES: Record<string, number> = {
  ' ': 32,
  End: 35,
  Home: 36,
  ArrowUp: 38,
  ArrowDown: 40,
};

function press(target: HTMLElement, key: string): void {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
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
    const members = group(host, 'Membres');
    const rows = Array.from(members.querySelectorAll('cw-item'));

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
    const members = group(host, 'Membres');
    const lea = row(members, 'Léa Martin');
    const karim = row(members, 'Karim Benali');
    const ines = row(members, 'Inès Duval');
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
    const notifications = group(host, 'Notifications');
    const link = row(notifications, 'mentionné');

    link.click();

    expect(notifications.getAttribute('role')).toBe('group');
    expect(link.getAttribute('role')).toBeNull();
    expect(link.textContent).toContain('(non lu)');
    expect(fixture.componentInstance.opened()).toBe(1);
  });

  it('is a multi-selection listbox whose options toggle on click and Space', async () => {
    const files = group(host, 'Fichiers');
    const csv = row(files, 'export-taches.csv');
    const image = row(files, 'maquette.png');

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

@Component({
  imports: [CwItem],
  template: `<button cwItem disabled (click)="clicks.set(clicks() + 1)">Configurer</button>`,
})
class Single {
  readonly clicks = signal(0);
}

describe('CwItem', () => {
  it('ignores clicks while disabled and leaves the tab order', () => {
    const fixture = TestBed.createComponent(Single);
    fixture.detectChanges();
    const item = (fixture.nativeElement as HTMLElement).querySelector('button');

    item?.click();

    expect(fixture.componentInstance.clicks()).toBe(0);
    expect(item?.getAttribute('aria-disabled')).toBe('true');
    expect(item?.getAttribute('tabindex')).toBe('-1');
  });
});
