import {
  Component,
  ElementRef,
  type Signal,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CW_BUBBLE_DEFAULTS, type CwBubbleDefaults } from '@cadenway/ui/components/bubble';
import { CwButton } from '@cadenway/ui/components/button';
import { CwRipple } from '@cadenway/ui/core';
import { type CwMenu, CwMenuTriggerFor } from '@cadenway/ui/components/menu';
import { CwSpinner } from '@cadenway/ui/components/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowBendUpLeftBold,
  phosphorArrowClockwiseBold,
  phosphorDotsThreeBold,
  phosphorSmileyBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  phosphorCheckCircleFill,
  phosphorInfoFill,
  phosphorLightningFill,
  phosphorUsersFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import { CwMessageActions } from './message-actions/message-actions.component';
import { CwMessageFooter } from './message-footer/message-footer.component';
import { messageTime } from './message.format';
import { CwMessageNote } from './message-note/message-note.component';
import { TONE_ICONS, TONE_LABELS, phosphorName, toneRole } from './message.styles';
import { MESSAGE, MESSAGE_GROUP, type MessagePlace, type MessageRef } from './message.token';
import type {
  CwMessageLabels,
  CwMessageStatus,
  CwMessageTone,
  CwMessageToneLabels,
  CwMessageVariant,
} from './message.types';

const LABELS: CwMessageLabels = {
  edited: 'modifié',
  sending: 'Envoi…',
  failed: "Échec de l'envoi",
  retry: 'Réessayer',
  remove: 'Supprimer',
  actions: 'Actions du message',
  react: 'Réagir',
  reply: 'Répondre',
  more: "Plus d'actions",
  justNow: "à l'instant",
};

/* Literal class strings (Message sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. */
const ROOT: Record<'thread' | 'system', string> = {
  thread:
    'group/message relative flex w-full min-w-0 gap-2 text-sm data-[variant=outgoing]:flex-row-reverse',
  system: 'flex w-full min-w-0 items-start gap-2.5 rounded-lg px-3 py-2.5',
};

const SYSTEM_SURFACE: Record<CwMessageTone, string> = {
  default: 'bg-muted',
  info: 'bg-muted',
  success: 'bg-muted',
  warning: 'bg-muted',
  error: 'bg-grenat-soft',
};

// Spacing in a message group: 2 px inside a run of grouped messages, 16 px between runs.
const SPACING: Record<'none' | 'run' | 'gap', string> = {
  none: '',
  run: 'mt-0.5',
  gap: 'mt-4',
};

/**
 * One message of a comment thread: incoming, outgoing, or a system notice (Message sheet of the
 * Design System artifact; mockup `App.dc.html`, comments tab).
 *
 * `incoming` puts the projected `cw-message-avatar` on the left and a header (`author` · `time` ·
 * « modifié ») above the bubbles; `outgoing` sits on the right without avatar, the time in the
 * footer; both give their projected `cw-bubble`s the `muted` or `secondary` variant and the side.
 * `time` reads « à l'instant », « il y a 5 min », « 10:42 » or « hier 17:20 » in a
 * `<time datetime>`. The action bar (`actions`) shows on hover or focus: Réagir (`react`), Répondre
 * (`reply`), Plus d'actions (opens `moreMenu`, a `cw-menu`, else emits `more`; Shift + F10 and the
 * Menu key press it too). `status="sending"` dims the bubbles and says « Envoi… »;
 * `status="failed"` adds the error note with Réessayer (`retry`) and Supprimer (`remove`). A
 * `title` adds a state note of the given `tone` under the bubbles; a projected `cw-message-note`,
 * `cw-message-actions` or `cw-message-footer` replaces the default one. Attachments
 * (`cw-attachment`) and the thread summary (`cw-message-thread`) come after the bubbles.
 * `variant="system"` is a full-width notice: tone icon (or `icon` for `default`), `title`, the
 * projected detail, and an optional `action` button (`actionClick`; `retry` too on `error`); errors
 * are alerts, other tones statuses. The root is an `article` named by author and time; `busy` sets
 * `aria-busy` while the assistant writes. Inside `cw-message-group`, consecutive messages hide
 * avatar and header (`grouped`).
 */
@Component({
  selector: 'cw-message',
  imports: [
    CwButton,
    CwMenuTriggerFor,
    CwMessageActions,
    CwMessageFooter,
    CwMessageNote,
    CwRipple,
    CwSpinner,
    NgIcon,
    NgTemplateOutlet,
  ],
  providers: [
    provideIcons({
      phosphorArrowBendUpLeftBold,
      phosphorArrowClockwiseBold,
      phosphorCheckCircleFill,
      phosphorDotsThreeBold,
      phosphorInfoFill,
      phosphorLightningFill,
      phosphorSmileyBold,
      phosphorUsersFill,
      phosphorWarningCircleFill,
      phosphorWarningFill,
    }),
    { provide: MESSAGE, useExisting: CwMessage },
    {
      provide: CW_BUBBLE_DEFAULTS,
      useFactory: (): CwBubbleDefaults => {
        const message = inject(CwMessage);
        return {
          variant: computed(() => (message.variant() === 'outgoing' ? 'secondary' : 'muted')),
          align: computed(() => (message.variant() === 'outgoing' ? 'end' : 'start')),
          position: computed(() => message.place().position),
        };
      },
    },
  ],
  host: {
    '[class]': 'rootClasses()',
    '[attr.role]': 'role()',
    '[attr.aria-label]': 'accessibleName()',
    '[attr.aria-busy]': 'busy() ? "true" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-status]': 'status()',
    '[attr.data-tone]': 'tone()',
    '(keydown)': 'menuKey($event)',
  },
  templateUrl: './message.component.html',
})
export class CwMessage implements MessageRef {
  /** Side, avatar, bubble or notice. */
  readonly variant = input<CwMessageVariant>('incoming');
  /** Tone of the system notice, or of the state note drawn from `title`. */
  readonly tone = input<CwMessageTone>('default');
  /** Title of the system notice, or text of the state note under the bubbles. */
  readonly title = input('');
  /** Label of the optional action of a system notice (« Inviter », « Réessayer »). */
  readonly action = input('');
  /** Phosphor icon name in kebab case of a `default` system notice (`lightning`, `users`). */
  readonly icon = input('');
  /** Name shown in the header and read in the accessible name. */
  readonly author = input('');
  /** When the message was written; required except for a system notice. */
  readonly time = input<Date | null>(null);
  /** Adds « modifié » after the time. */
  readonly edited = input(false, { transform: booleanAttribute });
  /** Sending state of an outgoing message. */
  readonly status = input<CwMessageStatus>('sent');
  /** Hides avatar and header; `cw-message-group` sets it for consecutive messages. */
  readonly grouped = input(false, { transform: booleanAttribute });
  /** Shows the action bar (never on a system notice). */
  readonly actions = input(true, { transform: booleanAttribute });
  /** Menu opened by « Plus d'actions » (Modifier, Copier le lien, Supprimer). */
  readonly moreMenu = input<CwMenu | null>(null);
  /** The assistant is still writing the message: `aria-busy`. */
  readonly busy = input(false, { transform: booleanAttribute });
  /** Replaces the French texts. */
  readonly labels = input<Partial<CwMessageLabels>>({});
  /** Replaces the French tone words. */
  readonly toneLabels = input<Partial<CwMessageToneLabels>>({});

  /** Réessayer: a failed sending, or the action of an `error` system notice. */
  readonly retry = output();
  /** Supprimer, on a failed message. */
  readonly remove = output();
  /** The `action` button of a system notice. */
  readonly actionClick = output();
  /** Réagir: open the reaction picker. */
  readonly react = output();
  /** Répondre. */
  readonly reply = output();
  /** Plus d'actions, when no `moreMenu` is given. */
  readonly more = output();

  private readonly group = inject(MESSAGE_GROUP, { optional: true });
  private readonly moreButton = viewChild<ElementRef<HTMLElement>>('moreButton');
  protected readonly customActions = contentChild(CwMessageActions);
  protected readonly customNote = contentChild(CwMessageNote);
  protected readonly customFooter = contentChild(CwMessageFooter);

  protected readonly text = computed(() => ({ ...LABELS, ...this.labels() }));
  /** Where the message sits in its group. */
  readonly place: Signal<MessagePlace> = computed((): MessagePlace =>
    this.group ? this.group.placeOf(this) : { grouped: false, position: null, first: false },
  );
  /** Whether avatar and header are hidden. */
  readonly isGrouped: Signal<boolean> = computed(
    (): boolean => this.grouped() || this.place().grouped,
  );
  protected readonly isSystem = computed(() => this.variant() === 'system');
  protected readonly rootClasses = computed(() => {
    const spacing = !this.group
      ? SPACING.none
      : this.place().grouped
        ? SPACING.run
        : this.place().first
          ? SPACING.none
          : SPACING.gap;
    const root = this.isSystem() ? `${ROOT.system} ${SYSTEM_SURFACE[this.tone()]}` : ROOT.thread;
    return spacing ? `${root} ${spacing}` : root;
  });
  protected readonly role = computed(() => (this.isSystem() ? toneRole(this.tone()) : 'article'));
  protected readonly timeText = computed(() => {
    const time = this.time();
    return time ? messageTime(time, new Date(), this.text().justNow) : '';
  });
  protected readonly iso = computed(() => this.time()?.toISOString() ?? null);
  protected readonly accessibleName = computed(() => {
    if (this.isSystem()) return null;
    const parts = [this.author(), this.timeText()].filter((part) => part !== '');
    if (this.edited()) parts.push(this.text().edited);
    return parts.length > 0 ? parts.join(', ') : null;
  });
  protected readonly showHeader = computed(
    () => this.variant() === 'incoming' && !this.isGrouped(),
  );
  protected readonly toneWord = computed(() => {
    const tone = this.tone();
    return tone === 'default' ? '' : { ...TONE_LABELS, ...this.toneLabels() }[tone];
  });
  protected readonly systemIcon = computed(() => {
    const tone = this.tone();
    if (tone !== 'default') return TONE_ICONS[tone];
    return this.icon()
      ? { name: phosphorName(this.icon(), 'Fill'), color: 'shrink-0 text-muted-foreground' }
      : null;
  });

  protected act(): void {
    this.actionClick.emit();
    if (this.tone() === 'error') this.retry.emit();
  }

  protected menuKey(event: KeyboardEvent): void {
    // Message sheet, "Clavier": Shift + F10 or the Menu key opens « Plus d'actions ».
    const menuKey = event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);
    const button = this.moreButton();
    if (!menuKey || !button) return;
    event.preventDefault();
    button.nativeElement.focus();
    button.nativeElement.click();
  }
}
