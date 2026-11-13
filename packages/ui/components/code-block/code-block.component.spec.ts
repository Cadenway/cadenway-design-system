import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';

import { CwCodeBlock } from './code-block.component';

const COMPOSE = [
  '# Cadenway — instance de production',
  'services:',
  '  cadenway:',
  '-    image: ghcr.io/cadenway/cadenway:1.3.2',
  '+    image: ghcr.io/cadenway/cadenway:1.4.0',
  '    ports:',
  '      - "8080:8080"',
].join('\n');

@Component({
  imports: [CwCodeBlock],
  template: `
    <cw-code-block
      filename="docker-compose.yml"
      language="yaml"
      diff
      [highlight]="[5]"
      [code]="compose"
      (copied)="copies.set(copies().concat($event))"
    />
    <cw-code-block
      size="sm"
      [lineNumbers]="false"
      [copyable]="copyable()"
      language="bash"
      code="docker compose up -d"
    />
  `,
})
class Host {
  readonly compose = COMPOSE;
  readonly copies = signal<string[]>([]);
  readonly copyable = signal(true);
}

function area(host: HTMLElement, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('[role="group"]')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No code area named ${name}`);
  return found;
}

function copyButton(host: HTMLElement): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) =>
      (element.getAttribute('aria-label') ?? element.textContent.trim()) === 'Copier le code',
  );
  if (!found) throw new Error('No copy button');
  return found;
}

describe('CwCodeBlock', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;
  const copy = vi.fn<(text: string) => boolean>(() => true);
  const announce = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.useFakeTimers();
    copy.mockClear();
    announce.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: Clipboard, useValue: { copy } },
        { provide: LiveAnnouncer, useValue: { announce } },
      ],
    });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('names the code area by its file and line count', () => {
    expect(area(host, 'docker-compose.yml, 7 lignes')).toBeTruthy();
    expect(area(host, 'bash, 1 ligne')).toBeTruthy();
  });

  it('marks diff lines with a sign and a hidden word, and numbers the resulting file', () => {
    const lines = Array.from(
      area(host, 'docker-compose.yml, 7 lignes').querySelectorAll<HTMLElement>('code > span'),
    );
    const removed = lines.at(3);
    const added = lines.at(4);

    expect(removed?.dataset['line']).toBe('removed');
    expect(removed?.textContent).toContain('retiré');
    expect(removed?.textContent).not.toMatch(/^\d/);
    expect(added?.dataset['line']).toBe('added');
    expect(added?.textContent).toContain('ajouté');
    expect(added?.textContent).toMatch(/^4/);
    expect(lines.at(5)?.dataset['line']).toBe('highlighted');
  });

  it('copies the resulting code, announces and shows « Copié » for 2 s', () => {
    const button = copyButton(host);
    button.click();
    fixture.detectChanges();

    const expected = COMPOSE.split('\n')
      .filter((line) => !line.startsWith('-'))
      .map((line) => (line.startsWith('+') ? line.slice(1) : line))
      .join('\n');
    expect(copy).toHaveBeenCalledWith(expected);
    expect(component.copies()).toEqual([expected]);
    expect(announce).toHaveBeenCalledWith('Copié', 'polite');
    expect(button.dataset['state']).toBe('copied');
    expect(button.textContent.trim()).toBe('Copié');
    expect(button.hasAttribute('aria-label')).toBe(false);

    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(button.dataset['state']).toBe('idle');
    expect(button.getAttribute('aria-label')).toBe('Copier le code');
  });

  it('emits nothing when the clipboard refuses the copy', () => {
    copy.mockReturnValueOnce(false);
    copyButton(host).click();
    fixture.detectChanges();

    expect(component.copies()).toEqual([]);
    expect(copyButton(host).dataset['state']).toBe('idle');
  });

  it('hides line numbers from assistive technologies', () => {
    const number = area(host, 'docker-compose.yml, 7 lignes').querySelector('[aria-hidden="true"]');
    expect(number?.textContent).toBe('1');
  });

  it('drops the copy button when not copyable', () => {
    component.copyable.set(false);
    fixture.detectChanges();

    expect(area(host, 'bash, 1 ligne').parentElement?.querySelectorAll('button')).toHaveLength(0);
  });
});
