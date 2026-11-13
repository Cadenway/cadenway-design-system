import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';
import { CwTab, CwTabs, CwTabsList } from '@cadenway/ui/components/tabs';

import { CwPageHeaderActions } from './page-header-actions/page-header-actions.component';
import { CwPageHeader } from './page-header.component';
import { CwPageHeaderDescription } from './page-header-description/page-header-description.component';
import { CwPageHeaderFavorite } from './page-header-favorite/page-header-favorite.component';
import { CwPageHeaderTabs } from './page-header-tabs/page-header-tabs.component';
import { CwPageHeaderTitle } from './page-header-title/page-header-title.component';
import type { CwPageHeaderSize } from './page-header.types';

const PARTS = [
  CwPageHeader,
  CwPageHeaderTitle,
  CwPageHeaderFavorite,
  CwPageHeaderDescription,
  CwPageHeaderActions,
  CwPageHeaderTabs,
  CwTabs,
  CwTabsList,
  CwTab,
  CwButton,
];

function named(scope: ParentNode, selector: string, name: string): HTMLElement {
  const found = Array.from(scope.querySelectorAll<HTMLElement>(selector)).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

@Component({
  imports: PARTS,
  template: `
    <cw-page-header [size]="size()">
      <cw-page-header-title>Sprint 14</cw-page-header-title>
      <cw-page-header-favorite [(favorite)]="favorite" />
      <cw-page-header-description>12 – 26 nov. · 18 tâches ouvertes</cw-page-header-description>
      <cw-page-header-actions>
        <button cwButton>Créer une tâche</button>
      </cw-page-header-actions>
      <cw-page-header-tabs>
        <cw-tabs [(value)]="view">
          <cw-tabs-list ariaLabel="Vues">
            <button cwTab value="liste">Liste</button>
            <button cwTab value="tableau">Tableau</button>
          </cw-tabs-list>
        </cw-tabs>
        <button cwButton variant="ghost" size="xs">Vue</button>
      </cw-page-header-tabs>
    </cw-page-header>
  `,
})
class ViewHeaderHost {
  readonly size = signal<CwPageHeaderSize>('default');
  readonly favorite = signal(false);
  readonly view = signal('liste');
}

@Component({
  imports: [CwPageHeader, CwPageHeaderTitle, CwPageHeaderFavorite],
  template: `
    <cw-page-header>
      <cw-page-header-title>Membres</cw-page-header-title>
      <cw-page-header-favorite ariaLabel="Ajouter aux favoris" [favorite]="true" />
    </cw-page-header>
  `,
})
class PlainHeaderHost {}

describe('CwPageHeader', () => {
  let fixture: ComponentFixture<ViewHeaderHost>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ViewHeaderHost);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders the title as the page heading', () => {
    const headings = host.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent.trim()).toBe('Sprint 14');
  });

  it('flips the favorite on click, under a fixed name', async () => {
    const star = named(host, 'button', 'Favori');
    expect(star.getAttribute('aria-pressed')).toBe('false');
    expect(star.getAttribute('type')).toBe('button');

    star.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.favorite()).toBe(true);
    expect(star.getAttribute('aria-pressed')).toBe('true');
    expect(star.getAttribute('aria-label')).toBe('Favori');

    star.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.favorite()).toBe(false);
  });

  it('follows the favorite model', async () => {
    fixture.componentInstance.favorite.set(true);
    await fixture.whenStable();
    expect(named(host, 'button', 'Favori').getAttribute('aria-pressed')).toBe('true');
  });

  it('renders the view tabs in the bar variant', async () => {
    const list = named(host, '[role="tablist"]', 'Vues');
    expect(list.closest('cw-tabs')?.getAttribute('data-variant')).toBe('bar');
    // The « + Vue » action stays outside the tab list.
    expect(list.contains(named(host, 'button', 'Vue'))).toBe(false);

    named(list, '[role="tab"]', 'Tableau').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.view()).toBe('tableau');
  });

  it('exposes its size', async () => {
    const header = host.querySelector('cw-page-header');
    expect(header?.getAttribute('data-size')).toBe('default');
    fixture.componentInstance.size.set('compact');
    await fixture.whenStable();
    expect(header?.getAttribute('data-size')).toBe('compact');
  });

  it('takes the favorite name from its input', async () => {
    const plain = TestBed.createComponent(PlainHeaderHost);
    await plain.whenStable();
    const star = named(plain.nativeElement as HTMLElement, 'button', 'Ajouter aux favoris');
    expect(star.getAttribute('aria-pressed')).toBe('true');
  });
});
