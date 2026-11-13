import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwBubble } from '@cadenway/ui/bubble';

import { CwMessage } from './message.component';
import { CwMessageAvatar } from './message-avatar/message-avatar.component';
import { CwMessageGroup } from './message-group/message-group.component';
import { CwMessageThread } from './message-thread/message-thread.component';
import type { CwMessageStatus } from './message.types';

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Missing element');
  return value;
}

const NOW = new Date(2026, 10, 12, 13, 0);

@Component({
  imports: [CwBubble, CwMessage, CwMessageAvatar, CwMessageGroup, CwMessageThread],
  template: `
    <cw-message-group>
      <cw-message
        author="Karim Benali"
        [time]="first"
        edited
        (reply)="events.set([...events(), 'reply'])"
      >
        <cw-message-avatar>KB</cw-message-avatar>
        <cw-bubble>J'ai reproduit le bug.</cw-bubble>
        <cw-message-thread
          [count]="3"
          [lastReplyAt]="lastReply"
          [participants]="['Karim Benali', 'Inès Duval']"
          (open)="events.set([...events(), 'thread'])"
        />
      </cw-message>
      <cw-message author="Karim Benali" [time]="second">
        <cw-message-avatar>KB</cw-message-avatar>
        <cw-bubble>Excel ouvre le CSV en Windows-1252.</cw-bubble>
      </cw-message>
      <cw-message
        variant="outgoing"
        [time]="justNow"
        [status]="status()"
        (retry)="events.set([...events(), 'retry'])"
        (remove)="events.set([...events(), 'remove'])"
      >
        <cw-bubble>Je fusionne ce soir.</cw-bubble>
      </cw-message>
    </cw-message-group>
    <cw-message
      variant="system"
      tone="warning"
      title="Ce commentaire mentionne une personne qui n'a pas accès à l'espace."
      action="Inviter"
      (actionClick)="events.set([...events(), 'invite'])"
      >Samuel Roux ne recevra pas de notification.</cw-message
    >
    <cw-message
      variant="system"
      tone="error"
      title="Impossible de charger les 12 messages précédents."
      action="Réessayer"
      (retry)="events.set([...events(), 'reload'])"
    />
  `,
})
class Host {
  readonly first = new Date(2026, 10, 12, 10, 42);
  readonly second = new Date(2026, 10, 12, 10, 44);
  readonly justNow = new Date(2026, 10, 12, 12, 59, 40);
  readonly lastReply = new Date(2026, 10, 12, 11, 5);
  readonly status = signal<CwMessageStatus>('sent');
  readonly events = signal<string[]>([]);
}

function articles(host: HTMLElement): HTMLElement[] {
  return Array.from(host.querySelectorAll<HTMLElement>('[role="article"]'));
}

function buttonNamed(scope: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(scope.querySelectorAll('button')).find(
    (element) =>
      (element.getAttribute('aria-label') ?? element.textContent.replace(/\s+/g, ' ').trim()) ===
      name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwMessage', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is an article named by its author and time, with a header and a time element', () => {
    const [first] = articles(host);

    expect(first.getAttribute('aria-label')).toBe('Karim Benali, 10:42, modifié');
    const time = first.querySelector('time');
    expect(time?.textContent.trim()).toBe('10:42');
    expect(time?.getAttribute('datetime')).toBe(component.first.toISOString());
  });

  it('groups the consecutive messages of one person and tightens their bubbles', () => {
    const [first, second] = articles(host);
    const bubbles = [first, second].map((article) =>
      article.querySelector<HTMLElement>('cw-bubble'),
    );

    expect(first.textContent).toContain('Karim Benali');
    expect(second.querySelector('time')).toBeNull();
    expect(second.querySelector('cw-message-avatar')?.getAttribute('aria-hidden')).toBe('true');
    expect(bubbles.map((bubble) => bubble?.dataset['position'])).toEqual(['first', 'last']);
    expect(bubbles[0]?.dataset['variant']).toBe('muted');
  });

  it('puts an outgoing message on the right, in secondary, with a relative time in its footer', () => {
    const outgoing = articles(host)[2];
    const bubble = outgoing.querySelector<HTMLElement>('cw-bubble');

    expect(outgoing.dataset['variant']).toBe('outgoing');
    expect(bubble?.dataset['variant']).toBe('secondary');
    expect(bubble?.dataset['align']).toBe('end');
    expect(outgoing.querySelector('time')?.textContent.trim()).toBe("à l'instant");
  });

  it('says « Envoi… » while sending and offers retry and delete when the sending failed', async () => {
    component.status.set('sending');
    await fixture.whenStable();
    const outgoing = articles(host)[2];
    expect(outgoing.querySelector('[role="status"]')?.textContent).toContain('Envoi…');

    component.status.set('failed');
    await fixture.whenStable();
    const alert = outgoing.querySelector<HTMLElement>('[role="alert"]');
    expect(alert?.textContent).toContain("Erreur : Échec de l'envoi");
    buttonNamed(required(alert), 'Réessayer').click();
    buttonNamed(required(alert), 'Supprimer').click();
    expect(component.events()).toEqual(['retry', 'remove']);
  });

  it('offers a toolbar of actions that the arrow keys move through', () => {
    const [first] = articles(host);
    const toolbar = required(first.querySelector<HTMLElement>('[role="toolbar"]'));
    expect(toolbar.getAttribute('aria-label')).toBe('Actions du message');

    const react = buttonNamed(toolbar, 'Réagir');
    react.focus();
    react.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(buttonNamed(toolbar, 'Répondre'));

    buttonNamed(toolbar, 'Répondre').click();
    expect(component.events()).toEqual(['reply']);
  });

  it('summarizes the thread and opens it', () => {
    const thread = Array.from(host.querySelectorAll('button')).find((element) =>
      element.textContent.includes('3 réponses'),
    );
    // The avatars of the participants are hidden: the summary is named by its texts.
    expect(thread?.querySelector('[aria-hidden="true"]')?.textContent).toContain('KB');
    expect(thread?.textContent).toContain('Dernière à 11:05');

    thread?.click();

    expect(component.events()).toEqual(['thread']);
  });

  it('draws system notices with their tone word, role and action', () => {
    const notice = host.querySelector<HTMLElement>('cw-message[data-tone="warning"]');
    expect(notice?.getAttribute('role')).toBe('status');
    expect(notice?.textContent).toContain('Avertissement :');
    expect(notice?.textContent).toContain('Samuel Roux ne recevra pas de notification.');
    buttonNamed(required(notice), 'Inviter').click();

    const error = host.querySelector<HTMLElement>('cw-message[data-tone="error"]');
    expect(error?.getAttribute('role')).toBe('alert');
    buttonNamed(required(error), 'Réessayer').click();

    expect(component.events()).toEqual(['invite', 'reload']);
  });
});
