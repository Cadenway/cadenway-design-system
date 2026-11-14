import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorUserBold } from '@ng-icons/phosphor-icons/bold';

import type { CwAvatarGroup } from './avatar-group/avatar-group.component';
import { AVATAR_GROUP } from './avatar-group.token';
import { ICON_SIZES, SIZES } from './avatar.styles';
import type { CwAvatarLabels, CwAvatarPresence, CwAvatarSize } from './avatar.types';

/**
 * Constant LABELS
 *
 * @description
 * Default French text used for accessible avatar descriptions.
 *
 * @type {CwAvatarLabels}
 */
const LABELS: CwAvatarLabels = {
  unknown: 'Utilisateur inconnu',
  online: 'en ligne',
  away: 'absent',
  disabled: 'désactivé',
};

/**
 * Constant INITIALS
 *
 * @description
 * Literal fallback classes for each avatar size, discoverable by Tailwind.
 *
 * @type {Record<CwAvatarSize, string>}
 */
const INITIALS: Record<CwAvatarSize, string> = {
  xs: 'flex size-full items-center justify-center bg-secondary text-[9px] leading-none font-semibold text-secondary-foreground',
  sm: 'flex size-full items-center justify-center bg-secondary text-[10px] leading-none font-semibold text-secondary-foreground',
  default:
    'flex size-full items-center justify-center bg-secondary text-xs leading-none font-semibold text-secondary-foreground',
  lg: 'flex size-full items-center justify-center bg-secondary text-sm leading-none font-semibold text-secondary-foreground',
};

/**
 * Constant DOT_SIZES
 *
 * @description
 * Presence indicator dimensions for each avatar size.
 *
 * @type {Record<CwAvatarSize, string>}
 */
const DOT_SIZES: Record<CwAvatarSize, string> = {
  xs: 'size-1.5',
  sm: 'size-2',
  default: 'size-2.5',
  lg: 'size-3',
};

/**
 * Constant DOT_COLORS
 *
 * @description
 * Presence indicator colors for online and away states.
 *
 * @type {Record<CwAvatarPresence, string>}
 */
const DOT_COLORS: Record<CwAvatarPresence, string> = {
  online: 'bg-jade',
  away: 'bg-ink-muted',
};

/**
 * Constant DOT
 *
 * @description
 * Position and ring classes shared by presence indicators.
 *
 * @type {string}
 */
const DOT: string = 'absolute right-0 bottom-0 block rounded-full ring-2 ring-background';

/**
 * Constant DISC
 *
 * @description
 * Disc classes for individual and stacked avatars.
 *
 * @type {typeof DISC}
 */
const DISC: {
  readonly alone: 'flex size-full overflow-hidden rounded-full';
  readonly stacked: 'flex size-full overflow-hidden rounded-full ring-2 ring-background';
} = {
  alone: 'flex size-full overflow-hidden rounded-full',
  stacked: 'flex size-full overflow-hidden rounded-full ring-2 ring-background',
} as const;

/**
 * Function initialsOf
 *
 * @description
 * Returns uppercase initials from the first and last words of a name.
 *
 * @param {string} name - Full name to abbreviate.
 * @returns {string} Initials, or an empty string for a blank name.
 */
function initialsOf(name: string): string {
  const words: string[] = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) return '';
  const first: string = Array.from(words[0] ?? '')[0] ?? '';
  const last: string = words.length > 1 ? (Array.from(words[words.length - 1] ?? '')[0] ?? '') : '';
  return `${first}${last}`.toLocaleUpperCase('fr');
}

/**
 * Class CwAvatar
 * @class CwAvatar
 *
 * @description
 * The disc of a person: their photo, else their initials on the same neutral fill for everyone,
 * else a user icon when the name is unknown (Avatar sheet of the Design System artifact).
 *
 * Everything comes from `name` and `src`; nothing is projected. The initials show while the photo
 * loads and come back if it fails (`imageError` emits the image's error event). The full name, the
 * presence and the deactivated state are always in a visually hidden text and in the `title`, never
 * carried by color alone; the photo has `alt=""` so the name is not read twice. Inside a
 * `cw-avatar-group` the avatar takes the group's size, is ringed with the background and is hidden
 * beyond the group's `max`. Decorative: wrap it in a `<button>` to make it clickable. Style hooks:
 * `data-size`, `data-disabled`.
 */
@Component({
  selector: 'cw-avatar',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorUserBold })],
  host: {
    '[class]': 'classes()',
    '[attr.title]': 'spoken()',
    '[attr.hidden]': 'hidden() ? "" : null',
    '[attr.data-size]': 'effectiveSize()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  templateUrl: './avatar.component.html',
})
export class CwAvatar {
  // #region Properties
  /**
   * Property name
   * @readonly
   *
   * @description
   * Full name used for initials and accessible text; null shows the fallback icon.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly name: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property src
   * @readonly
   *
   * @description
   * Photo URL; initials remain visible until it loads.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly src: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property size
   * @readonly
   *
   * @description
   * Diameter outside a group, whose size takes precedence.
   *
   * @type {InputSignal<CwAvatarSize>}
   */
  public readonly size: InputSignal<CwAvatarSize> = input<CwAvatarSize>('default');

  /**
   * Property presence
   * @readonly
   *
   * @description
   * Presence indicator; null displays no dot.
   *
   * @type {InputSignal<CwAvatarPresence | null>}
   */
  public readonly presence: InputSignal<CwAvatarPresence | null> = input<CwAvatarPresence | null>(
    null,
  );

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Marks a deactivated account in appearance and accessible text.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Accessible text overrides merged over the French defaults.
   *
   * @type {InputSignal<Partial<CwAvatarLabels>>}
   */
  public readonly labels: InputSignal<Partial<CwAvatarLabels>> = input<Partial<CwAvatarLabels>>({});

  /**
   * Property imageError
   * @readonly
   *
   * @description
   * Emits the browser error event when the photo cannot load.
   *
   * @type {OutputEmitterRef<Event>}
   */
  public readonly imageError: OutputEmitterRef<Event> = output<Event>();

  /**
   * Property group
   * @readonly
   *
   * @description
   * Optional group containing the avatar.
   *
   * @type {CwAvatarGroup | null}
   */
  protected readonly group: CwAvatarGroup | null = inject(AVATAR_GROUP, { optional: true });

  /**
   * Property disc
   * @readonly
   *
   * @description
   * Disc classes for standalone and stacked presentation.
   *
   * @type {typeof DISC}
   */
  protected readonly disc: typeof DISC = DISC;

  /**
   * Property loaded
   * @readonly
   *
   * @description
   * Whether the current photo has loaded; resets when its source changes.
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly loaded: WritableSignal<boolean> = linkedSignal({
    source: this.src,
    computation: () => false,
  });

  /**
   * Property failed
   * @readonly
   *
   * @description
   * Whether the current photo failed; resets when its source changes.
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly failed: WritableSignal<boolean> = linkedSignal({
    source: this.src,
    computation: () => false,
  });

  /**
   * Property effectiveSize
   * @readonly
   *
   * @description
   * Size supplied by the group or the local input.
   * @internal
   *
   * @type {Signal<CwAvatarSize>}
   */
  public readonly effectiveSize: Signal<CwAvatarSize> = computed(
    () => this.group?.size() ?? this.size(),
  );

  /**
   * Property spoken
   * @readonly
   *
   * @description
   * Accessible description combining name, presence and account state.
   * @internal
   *
   * @type {Signal<string>}
   */
  public readonly spoken: Signal<string> = computed(() => {
    const labels: CwAvatarLabels = { ...LABELS, ...this.labels() };
    const presence: CwAvatarPresence | null = this.presence();
    const name: string = this.name()?.trim() ?? '';
    let text: string = name === '' ? labels.unknown : name;
    if (presence) text += ` (${labels[presence]})`;
    if (this.disabled()) text += ` (${labels.disabled})`;
    return text;
  });

  /**
   * Property initials
   * @readonly
   *
   * @description
   * Fallback initials derived from the name.
   *
   * @type {Signal<string>}
   */
  protected readonly initials: Signal<string> = computed(() => initialsOf(this.name() ?? ''));

  /**
   * Property iconSize
   * @readonly
   *
   * @description
   * Fallback icon size matching the avatar diameter.
   *
   * @type {Signal<string>}
   */
  protected readonly iconSize: Signal<string> = computed(() => ICON_SIZES[this.effectiveSize()]);

  /**
   * Property initialsClasses
   * @readonly
   *
   * @description
   * Fallback text classes matching the avatar diameter.
   *
   * @type {Signal<string>}
   */
  protected readonly initialsClasses: Signal<string> = computed(
    () => INITIALS[this.effectiveSize()],
  );

  /**
   * Property dotClasses
   * @readonly
   *
   * @description
   * Indicator classes for the current presence and size.
   *
   * @type {Signal<string>}
   */
  protected readonly dotClasses: Signal<string> = computed(() => {
    const presence: CwAvatarPresence | null = this.presence();
    return presence ? `${DOT} ${DOT_SIZES[this.effectiveSize()]} ${DOT_COLORS[presence]}` : '';
  });

  /**
   * Property hidden
   * @readonly
   *
   * @description
   * Whether this avatar falls beyond the group limit.
   *
   * @type {Signal<boolean>}
   */
  protected readonly hidden: Signal<boolean> = computed(
    () => this.group?.overflow().includes(this) === true,
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Host classes for the current effective size and disabled state.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `relative inline-flex shrink-0 data-[disabled]:opacity-50 ${SIZES[this.effectiveSize()]}`,
  );
  // #endregion

  // #region Methods
  /**
   * Method onImageError
   * @method onImageError
   *
   * @description
   * Shows the fallback and emits the image loading error.
   *
   * @param {Event} event - Browser image error event.
   */
  protected onImageError(event: Event): void {
    this.failed.set(true);
    this.imageError.emit(event);
  }
  // #endregion
}
