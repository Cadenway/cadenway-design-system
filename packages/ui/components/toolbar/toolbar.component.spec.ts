import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CwToolbarGroup } from './toolbar-group/toolbar-group.component';
import { CwToolbarItem } from './toolbar-item/toolbar-item.directive';
import { CwToolbarOverflow } from './toolbar-overflow/toolbar-overflow.component';
import { CwToolbarSeparator } from './toolbar-separator/toolbar-separator.component';
import { CwToolbarSpacer } from './toolbar-spacer/toolbar-spacer.component';
import { CwToolbar } from './toolbar.component';

/**
 * Class Host
 *
 * @description
 * Hosts grouped toolbar controls and records overflow events.
 */
@Component({
  imports: [
    CwToolbar,
    CwToolbarGroup,
    CwToolbarItem,
    CwToolbarOverflow,
    CwToolbarSeparator,
    CwToolbarSpacer,
  ],
  template: `
    <cw-toolbar ariaLabel="Vue Liste" [size]="size()" (overflowChange)="counts.push($event)">
      <cw-toolbar-group ariaLabel="Affichage">
        <button type="button" cwToolbarItem pinned>Filtrer</button>
        <button type="button" cwToolbarItem>Trier</button>
        <button
          type="button"
          cwToolbarItem
          overflowLabel="Grouper par"
          (click)="log.push('grouper')"
        >
          Grouper
        </button>
      </cw-toolbar-group>
      <cw-toolbar-separator />
      <button type="button" cwToolbarItem disabled>Exporter</button>
      <cw-toolbar-spacer />
      <input aria-label="Rechercher dans la liste" />
      <cw-toolbar-overflow />
      <button type="button" cwToolbarItem pinned>Créer une tâche</button>
    </cw-toolbar>
  `,
})
class Host {
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Toolbar size controlled by the fixture.
   *
   * @type {WritableSignal<'default' | 'sm'>}
   */
  public readonly size: WritableSignal<'default' | 'sm'> = signal<'default' | 'sm'>('default');

  /**
   * Property counts
   * @readonly
   *
   * @description
   * Recorded overflow counts.
   *
   * @type {number[]}
   */
  public readonly counts: number[] = [];

  /**
   * Property log
   * @readonly
   *
   * @description
   * Recorded control activations.
   *
   * @type {string[]}
   */
  public readonly log: string[] = [];
  // #endregion
}

/**

 * Function key

 *

 * @description

 * Dispatches a keyboard event to a control.

 *
 * @param {Element} target - Control receiving the event.
 * @param {string} value - Keyboard key to dispatch.
 *
 * @returns {KeyboardEvent} Dispatched keyboard event.
 */
function key(target: Element, value: string): KeyboardEvent {
  const event: KeyboardEvent = new KeyboardEvent('keydown', {
    key: value,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

/**

 * Function active

 *

 * @description

 * Returns the currently focused element.

 *
 * @returns {Element} Currently focused element.
 */
function active(): Element {
  const element: Element | null = document.activeElement;
  if (!element) throw new Error('No focused element');
  return element;
}

/**

 * Function button

 *

 * @description

 * Finds a button by accessible label or text.

 *
 * @param {HTMLElement} host - Fixture containing buttons.
 * @param {string} name - Accessible label or text to match.
 *
 * @returns {HTMLButtonElement} Matching button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    host.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name);
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwToolbar', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('renders a named horizontal toolbar with groups and a vertical separator', async () => {
    const toolbar: Element | null = host.querySelector('[role="toolbar"]');
    expect(toolbar?.getAttribute('aria-label')).toBe('Vue Liste');
    expect(toolbar?.getAttribute('aria-orientation')).toBe('horizontal');
    expect(toolbar?.getAttribute('data-size')).toBe('default');
    expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Affichage');
    expect(host.querySelector('[role="separator"]')?.getAttribute('aria-orientation')).toBe(
      'vertical',
    );

    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(toolbar?.getAttribute('data-size')).toBe('sm');
  });

  it('gives one Tab stop to its controls and leaves the other fields alone', () => {
    const stops: HTMLElement[] = Array.from(host.querySelectorAll<HTMLElement>('button')).filter(
      (element) => element.tabIndex === 0,
    );
    expect(stops.map((element) => element.textContent.trim())).toEqual(['Filtrer']);
    expect(
      host.querySelector<HTMLInputElement>('input[aria-label="Rechercher dans la liste"]')
        ?.tabIndex,
    ).toBe(0);
  });

  it('moves with the arrows in a loop, skipping disabled and hidden controls', () => {
    const filter: HTMLButtonElement = button(host, 'Filtrer');
    filter.focus();

    expect(key(filter, 'ArrowRight').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(button(host, 'Trier'));
    key(active(), 'ArrowRight');
    expect(document.activeElement).toBe(button(host, 'Grouper'));
    // Exporter is disabled and the « Plus » button is not shown.
    key(active(), 'ArrowRight');
    expect(document.activeElement).toBe(button(host, 'Créer une tâche'));
    key(active(), 'ArrowRight');
    expect(document.activeElement).toBe(filter);
    key(filter, 'ArrowLeft');
    expect(document.activeElement).toBe(button(host, 'Créer une tâche'));
    key(active(), 'Home');
    expect(document.activeElement).toBe(filter);
    key(filter, 'End');
    expect(document.activeElement).toBe(button(host, 'Créer une tâche'));
  });

  it('keeps the last focused control as the Tab stop', async () => {
    button(host, 'Grouper').focus();
    await fixture.whenStable();
    expect(button(host, 'Grouper').tabIndex).toBe(0);
    expect(button(host, 'Filtrer').tabIndex).toBe(-1);
  });

  it('leaves the arrows of the search field to its caret', () => {
    const search: HTMLInputElement | null = host.querySelector<HTMLInputElement>('input');
    if (!search) throw new Error('No search field');
    search.focus();
    expect(key(search, 'ArrowLeft').defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(search);
  });
});

describe('CwToolbar overflow', () => {
  /**
   * Constant WIDTH
   *
   * @description
   * Simulated width of each visible button in pixels.
   */
  const WIDTH: number = 100;
  let callbacks: (() => void)[];
  let available: number;
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  /* jsdom has no layout: every visible button is 100 px wide, the bar `available` px wide. */
  /**
   * Function visible
   *
   * @description
   * Checks visibility of a control within the fixture hierarchy.
   *
   * @param {HTMLElement} element - Control to inspect.
   * @param {HTMLElement} root - Root of the fixture hierarchy.
   *
   * @returns {boolean} Whether the control is visible within the fixture.
   */
  function visible(element: HTMLElement, root: HTMLElement): boolean {
    for (let node: HTMLElement | null = element; node && node !== root; node = node.parentElement) {
      if (node.style.display === 'none') return false;
    }
    return true;
  }

  beforeEach(async () => {
    callbacks = [];
    available = 450;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        public constructor(callback: () => void) {
          callbacks.push(callback);
        }
        public observe(): void {
          // The test calls the callback itself.
        }
        public disconnect(): void {
          // Nothing to release.
        }
      },
    );

    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const toolbar: HTMLElement | null = host.querySelector<HTMLElement>('[role="toolbar"]');
    if (!toolbar) throw new Error('No toolbar');
    Object.defineProperty(toolbar, 'clientWidth', { get: () => available });
    Object.defineProperty(toolbar, 'scrollWidth', {
      get: () =>
        Array.from(toolbar.querySelectorAll<HTMLElement>('button')).filter((element) =>
          visible(element, toolbar),
        ).length * WIDTH,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Function resize
   *
   * @description
   * Changes the simulated width and invokes resize observers.
   *
   * @param {number} width - Simulated container width in pixels.
   */
  function resize(width: number): void {
    available = width;
    for (const callback of callbacks) callback();
  }

  it('moves the last movable controls into the « Plus » menu and back', async () => {
    resize(450);
    await fixture.whenStable();

    const toolbar: HTMLElement | null = host.querySelector<HTMLElement>('[role="toolbar"]');
    expect(toolbar?.hasAttribute('data-overflowing')).toBe(true);
    expect(button(host, 'Exporter').style.display).toBe('none');
    expect(button(host, 'Grouper').style.display).toBe('none');
    expect(button(host, 'Trier').style.display).toBe('');
    // The separator right before a hidden control hides with it.
    expect(host.querySelector<HTMLElement>('[role="separator"]')?.style.display).toBe('none');
    expect(fixture.componentInstance.counts).toEqual([2]);

    const more: HTMLButtonElement = button(host, 'Plus d’options');
    expect(more.getAttribute('aria-haspopup')).toBe('menu');
    more.click();
    await fixture.whenStable();

    const menu: Element | null = document.querySelector('[role="menu"]');
    expect(menu?.getAttribute('aria-label')).toBe('Plus d’options');
    const entries: Element[] = Array.from(menu?.querySelectorAll('[role="menuitem"]') ?? []);
    expect(entries.map((entry) => entry.textContent.trim())).toEqual(['Grouper par', 'Exporter']);

    (entries[0] as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.log).toEqual(['grouper']);

    resize(1000);
    await fixture.whenStable();
    expect(toolbar?.hasAttribute('data-overflowing')).toBe(false);
    expect(button(host, 'Grouper').style.display).toBe('');
    expect(fixture.componentInstance.counts).toEqual([2, 0]);
  });

  it('never moves pinned controls', async () => {
    resize(150);
    await fixture.whenStable();
    expect(button(host, 'Filtrer').style.display).toBe('');
    expect(button(host, 'Créer une tâche').style.display).toBe('');
    expect(button(host, 'Trier').style.display).toBe('none');
    expect(fixture.componentInstance.counts).toEqual([3]);
  });

  it('lets the arrows reach the « Plus » button once it shows', async () => {
    resize(450);
    await fixture.whenStable();
    const trier: HTMLButtonElement = button(host, 'Trier');
    trier.focus();
    key(trier, 'ArrowRight');
    expect(document.activeElement).toBe(button(host, 'Plus d’options'));
  });
});
