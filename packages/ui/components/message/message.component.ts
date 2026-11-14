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
import type { InputSignal, InputSignalWithTransform, OutputEmitterRef } from '@angular/core';
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
import type { MessageGroupRef } from './message.token';
import type {
  CwMessageLabels,
  CwMessageStatus,
  CwMessageTimeFormatter,
  CwMessageTone,
  CwMessageToneLabels,
  CwMessageVariant,
} from './message.types';

/**
 * Type MessageFlag
 *
 * @description
 * Boolean message input accepting Angular's attribute transform.
 *
 * @type {InputSignalWithTransform<boolean, unknown>}
 */
type MessageFlag = InputSignalWithTransform<boolean, unknown>;

/**
 * Type MessageText
 *
 * @description
 * Reactive French labels used by a message.
 *
 * @type {Signal<CwMessageLabels>}
 */
type MessageText = Signal<CwMessageLabels>;

/**
 * Type MessageRole
 *
 * @description
 * Accessible role for a message or system notice.
 *
 * @type {'alert' | 'status' | 'article' | null}
 */
type MessageRole = 'alert' | 'status' | 'article' | null;

/**
 * Constant LABELS
 *
 * @description
 * Default French labels for message actions, state and relative time.
 *
 * @type {CwMessageLabels}
 */
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
/**
 * Constant ROOT
 *
 * @description
 * Root classes for thread messages and system notices.
 *
 * @type {Record<'thread' | 'system', string>}
 */
const ROOT: Record<'thread' | 'system', string> = {
  thread:
    'group/message relative flex w-full min-w-0 gap-2 text-sm data-[variant=outgoing]:flex-row-reverse',
  system: 'flex w-full min-w-0 items-start gap-2.5 rounded-lg px-3 py-2.5',
};

/**
 * Constant SYSTEM_SURFACE
 *
 * @description
 * Background classes for system notices by tone.
 *
 * @type {Record<CwMessageTone, string>}
 */
const SYSTEM_SURFACE: Record<CwMessageTone, string> = {
  default: 'bg-muted',
  info: 'bg-muted',
  success: 'bg-muted',
  warning: 'bg-muted',
  error: 'bg-grenat-soft',
};

// Spacing in a message group: 2 px inside a run of grouped messages, 16 px between runs.
/**
 * Constant SPACING
 *
 * @description
 * Spacing classes for messages within and between runs.
 *
 * @type {Record<'none' | 'run' | 'gap', string>}
 */
const SPACING: Record<'none' | 'run' | 'gap', string> = {
  none: '',
  run: 'mt-0.5',
  gap: 'mt-4',
};

/**
 * Component CwMessage
 *
 * @description
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
        const message: CwMessage = inject(CwMessage);
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
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Message layout: incoming, outgoing or system notice.
   *
   * @type {InputSignal<CwMessageVariant>}
   * @default 'incoming'
   */
  public readonly variant: InputSignal<CwMessageVariant> = input<CwMessageVariant>('incoming');

  /**
   * Property tone
   * @readonly
   *
   * @description
   * Tone of the system notice or the state note drawn from the title.
   *
   * @type {InputSignal<CwMessageTone>}
   * @default 'default'
   */
  public readonly tone: InputSignal<CwMessageTone> = input<CwMessageTone>('default');

  /**
   * Property title
   * @readonly
   *
   * @description
   * System notice title or text of the note beneath the bubbles.
   *
   * @type {InputSignal<string>}
   * @default ''
   */
  public readonly title: InputSignal<string> = input('');

  /**
   * Property action
   * @readonly
   *
   * @description
   * Label of the optional system notice action, such as « Inviter » or « Réessayer ».
   *
   * @type {InputSignal<string>}
   * @default ''
   */
  public readonly action: InputSignal<string> = input('');

  /**
   * Property icon
   * @readonly
   *
   * @description
   * Kebab-case Phosphor icon name for a default-tone system notice.
   *
   * @type {InputSignal<string>}
   * @default ''
   */
  public readonly icon: InputSignal<string> = input('');

  /**
   * Property author
   * @readonly
   *
   * @description
   * Author name shown in the header and read in the accessible name.
   *
   * @type {InputSignal<string>}
   * @default ''
   */
  public readonly author: InputSignal<string> = input('');

  /**
   * Property time
   * @readonly
   *
   * @description
   * Message timestamp; null when unavailable or for a system notice.
   *
   * @type {InputSignal<Date | null>}
   * @default null
   */
  public readonly time: InputSignal<Date | null> = input<Date | null>(null);

  /**
   * Property formatTime
   *
   * @description
   * Optional formatter for the message timestamp; defaults to the French relative-time display.
   *
   * @type {InputSignal<CwMessageTimeFormatter | null>}
   * @readonly
   */
  public readonly formatTime: InputSignal<CwMessageTimeFormatter | null> =
    input<CwMessageTimeFormatter | null>(null);

  /**
   * Property edited
   * @readonly
   *
   * @description
   * Whether the edited label appears after the message time.
   *
   * @type {MessageFlag}
   * @default false
   */
  public readonly edited: MessageFlag = input(false, { transform: booleanAttribute });

  /**
   * Property status
   * @readonly
   *
   * @description
   * Sending state of an outgoing message.
   *
   * @type {InputSignal<CwMessageStatus>}
   * @default 'sent'
   */
  public readonly status: InputSignal<CwMessageStatus> = input<CwMessageStatus>('sent');

  /**
   * Property grouped
   * @readonly
   *
   * @description
   * Whether the avatar and header are hidden for a grouped message.
   *
   * @type {MessageFlag}
   * @default false
   */
  public readonly grouped: MessageFlag = input(false, { transform: booleanAttribute });

  /**
   * Property actions
   * @readonly
   *
   * @description
   * Whether to show the action bar for a non-system message.
   *
   * @type {MessageFlag}
   * @default true
   */
  public readonly actions: MessageFlag = input(true, { transform: booleanAttribute });

  /**
   * Property moreMenu
   * @readonly
   *
   * @description
   * Menu opened by the more-actions button; null causes the more output to be emitted instead.
   *
   * @type {InputSignal<CwMenu | null>}
   * @default null
   */
  public readonly moreMenu: InputSignal<CwMenu | null> = input<CwMenu | null>(null);

  /**
   * Property busy
   * @readonly
   *
   * @description
   * Whether the assistant is still writing, exposed as aria-busy.
   *
   * @type {MessageFlag}
   * @default false
   */
  public readonly busy: MessageFlag = input(false, { transform: booleanAttribute });

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Overrides for the default French message text.
   *
   * @type {InputSignal<Partial<CwMessageLabels>>}
   * @default {}
   */
  public readonly labels: InputSignal<Partial<CwMessageLabels>> = input<Partial<CwMessageLabels>>(
    {},
  );

  /**
   * Property toneLabels
   * @readonly
   *
   * @description
   * Overrides for the default French tone words.
   *
   * @type {InputSignal<Partial<CwMessageToneLabels>>}
   * @default {}
   */
  public readonly toneLabels: InputSignal<Partial<CwMessageToneLabels>> = input<
    Partial<CwMessageToneLabels>
  >({});

  /**
   * Property retry
   * @readonly
   *
   * @description
   * Emits when a failed message or error notice is retried.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly retry: OutputEmitterRef<void> = output();

  /**
   * Property remove
   * @readonly
   *
   * @description
   * Emits when removal of a failed message is requested.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly remove: OutputEmitterRef<void> = output();

  /**
   * Property actionClick
   * @readonly
   *
   * @description
   * Emits when the optional system notice action is activated.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly actionClick: OutputEmitterRef<void> = output();

  /**
   * Property react
   * @readonly
   *
   * @description
   * Emits when the reaction picker is requested.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly react: OutputEmitterRef<void> = output();

  /**
   * Property reply
   * @readonly
   *
   * @description
   * Emits when a reply is requested.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly reply: OutputEmitterRef<void> = output();

  /**
   * Property more
   * @readonly
   *
   * @description
   * Emits when more actions are requested and no menu is supplied.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly more: OutputEmitterRef<void> = output();

  /**
   * Property group
   * @readonly
   *
   * @description
   * Containing message group, or null when rendered outside a group.
   *
   * @type {MessageGroupRef | null}
   */
  private readonly group: MessageGroupRef | null = inject(MESSAGE_GROUP, { optional: true });

  /**
   * Property moreButton
   * @readonly
   *
   * @description
   * More-actions button when it is rendered.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   */
  private readonly moreButton: Signal<ElementRef<HTMLElement> | undefined> =
    viewChild<ElementRef<HTMLElement>>('moreButton');

  /**
   * Property customActions
   * @readonly
   *
   * @description
   * Projected action bar replacing the default bar, if supplied.
   *
   * @type {Signal<CwMessageActions | undefined>}
   */
  protected readonly customActions: Signal<CwMessageActions | undefined> =
    contentChild(CwMessageActions);

  /**
   * Property customNote
   * @readonly
   *
   * @description
   * Projected state note replacing the default note, if supplied.
   *
   * @type {Signal<CwMessageNote | undefined>}
   */
  protected readonly customNote: Signal<CwMessageNote | undefined> = contentChild(CwMessageNote);

  /**
   * Property customFooter
   * @readonly
   *
   * @description
   * Projected footer replacing the default footer, if supplied.
   *
   * @type {Signal<CwMessageFooter | undefined>}
   */
  protected readonly customFooter: Signal<CwMessageFooter | undefined> =
    contentChild(CwMessageFooter);

  /**
   * Property text
   * @readonly
   *
   * @description
   * Default message labels combined with caller overrides.
   *
   * @type {MessageText}
   */
  protected readonly text: MessageText = computed(() => ({ ...LABELS, ...this.labels() }));

  /**
   * Property place
   * @readonly
   *
   * @description
   * Grouping state and bubble position within the containing group.
   *
   * @type {Signal<MessagePlace>}
   */
  public readonly place: Signal<MessagePlace> = computed((): MessagePlace =>
    this.group ? this.group.placeOf(this) : { grouped: false, position: null, first: false },
  );

  /**
   * Property isGrouped
   * @readonly
   *
   * @description
   * Whether grouping hides the avatar and header.
   *
   * @type {Signal<boolean>}
   */
  public readonly isGrouped: Signal<boolean> = computed(
    (): boolean => this.grouped() || this.place().grouped,
  );

  /**
   * Property isSystem
   * @readonly
   *
   * @description
   * Whether the message is a system notice.
   *
   * @type {Signal<boolean>}
   */
  protected readonly isSystem: Signal<boolean> = computed(() => this.variant() === 'system');

  /**
   * Property rootClasses
   * @readonly
   *
   * @description
   * Root classes for the current variant, tone and group spacing.
   *
   * @type {Signal<string>}
   */
  protected readonly rootClasses: Signal<string> = computed(() => {
    const spacing: string = !this.group
      ? SPACING.none
      : this.place().grouped
        ? SPACING.run
        : this.place().first
          ? SPACING.none
          : SPACING.gap;
    const root: string = this.isSystem()
      ? `${ROOT.system} ${SYSTEM_SURFACE[this.tone()]}`
      : ROOT.thread;
    return spacing ? `${root} ${spacing}` : root;
  });

  /**
   * Property role
   * @readonly
   *
   * @description
   * Live role for a system notice or article role for a regular message.
   *
   * @type {Signal<MessageRole>}
   */
  protected readonly role: Signal<MessageRole> = computed(() =>
    this.isSystem() ? toneRole(this.tone()) : 'article',
  );

  /**
   * Property timeText
   * @readonly
   *
   * @description
   * Formatted message time, or an empty string when no time is supplied.
   *
   * @type {Signal<string>}
   */
  protected readonly timeText: Signal<string> = computed(() => {
    const time: Date | null = this.time();
    if (!time) return '';
    const now: Date = new Date();
    const format: CwMessageTimeFormatter | null = this.formatTime();
    return format ? format(time, now) : messageTime(time, now, this.text().justNow);
  });

  /**
   * Property iso
   * @readonly
   *
   * @description
   * ISO timestamp for the time element, or null when no time is supplied.
   *
   * @type {Signal<string | null>}
   */
  protected readonly iso: Signal<string | null> = computed(
    () => this.time()?.toISOString() ?? null,
  );

  /**
   * Property accessibleName
   * @readonly
   *
   * @description
   * Author, time and edited text naming a regular message; null for a system notice.
   *
   * @type {Signal<string | null>}
   */
  protected readonly accessibleName: Signal<string | null> = computed(() => {
    if (this.isSystem()) return null;
    const parts: string[] = [this.author(), this.timeText()].filter((part) => part !== '');
    if (this.edited()) parts.push(this.text().edited);
    return parts.length > 0 ? parts.join(', ') : null;
  });

  /**
   * Property showHeader
   * @readonly
   *
   * @description
   * Whether an incoming message displays its header.
   *
   * @type {Signal<boolean>}
   */
  protected readonly showHeader: Signal<boolean> = computed(
    () => this.variant() === 'incoming' && !this.isGrouped(),
  );

  /**
   * Property toneWord
   * @readonly
   *
   * @description
   * Tone word read before a notice or note, or an empty string for the default tone.
   *
   * @type {Signal<string>}
   */
  protected readonly toneWord: Signal<string> = computed(() => {
    const tone: CwMessageTone = this.tone();
    return tone === 'default' ? '' : { ...TONE_LABELS, ...this.toneLabels() }[tone];
  });

  /**
   * Property systemIcon
   * @readonly
   *
   * @description
   * Icon and color for a system notice, or null when no icon applies.
   *
   * @type {Signal<{ name: string; color: string } | null>}
   */
  protected readonly systemIcon: Signal<{ name: string; color: string } | null> = computed(() => {
    const tone: CwMessageTone = this.tone();
    if (tone !== 'default') return TONE_ICONS[tone];
    return this.icon()
      ? { name: phosphorName(this.icon(), 'Fill'), color: 'shrink-0 text-muted-foreground' }
      : null;
  });
  // #endregion

  // #region Methods
  /**
   * Method act
   *
   * @description
   * Emits the system action and also retry for an error notice.
   */
  protected act(): void {
    this.actionClick.emit();
    if (this.tone() === 'error') this.retry.emit();
  }

  /**
   * Method menuKey
   *
   * @description
   * Opens the more-actions button on Shift+F10 or the Menu key.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the message.
   */
  protected menuKey(event: KeyboardEvent): void {
    // Message sheet, "Clavier": Shift + F10 or the Menu key opens « Plus d'actions ».
    const menuKey: boolean = event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);
    const button: ElementRef<HTMLElement> | undefined = this.moreButton();
    if (!menuKey || !button) return;
    event.preventDefault();
    button.nativeElement.focus();
    button.nativeElement.click();
  }
  // #endregion
}
