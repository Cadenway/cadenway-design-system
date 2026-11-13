import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorUserBold } from '@ng-icons/phosphor-icons/bold';

import { CwAvatarGroup } from './avatar-group.component';
import { ICON_SIZES, SIZES } from './avatar.styles';
import type { CwAvatarLabels, CwAvatarPresence, CwAvatarSize } from './avatar.types';

const LABELS: CwAvatarLabels = {
  unknown: 'Utilisateur inconnu',
  online: 'en ligne',
  away: 'absent',
  disabled: 'désactivé',
};

/* Literal class strings (Avatar sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. */
const INITIALS: Record<CwAvatarSize, string> = {
  xs: 'flex size-full items-center justify-center bg-secondary text-[9px] leading-none font-semibold text-secondary-foreground',
  sm: 'flex size-full items-center justify-center bg-secondary text-[10px] leading-none font-semibold text-secondary-foreground',
  default:
    'flex size-full items-center justify-center bg-secondary text-xs leading-none font-semibold text-secondary-foreground',
  lg: 'flex size-full items-center justify-center bg-secondary text-sm leading-none font-semibold text-secondary-foreground',
};

const DOT_SIZES: Record<CwAvatarSize, string> = {
  xs: 'size-1.5',
  sm: 'size-2',
  default: 'size-2.5',
  lg: 'size-3',
};

const DOT_COLORS: Record<CwAvatarPresence, string> = {
  online: 'bg-jade',
  away: 'bg-ink-muted',
};

const DOT = 'absolute right-0 bottom-0 block rounded-full ring-2 ring-background';

const DISC = {
  alone: 'flex size-full overflow-hidden rounded-full',
  stacked: 'flex size-full overflow-hidden rounded-full ring-2 ring-background',
} as const;

/* Two letters, first name then last name, upper-cased: « Inès Duval » → « ID ». */
function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) return '';
  const first = Array.from(words[0] ?? '')[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1] ?? '')[0] ?? '') : '';
  return `${first}${last}`.toLocaleUpperCase('fr');
}

/**
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  /** Full name: initials, title and hidden text; `null` shows the fallback icon. */
  readonly name = input<string | null>(null);
  /** URL of the photo; the initials show until it loads. */
  readonly src = input<string | null>(null);
  /** Diameter and text size; inside a group, the group's size wins. */
  readonly size = input<CwAvatarSize>('default');
  /** Presence dot; `null` (offline) shows none. */
  readonly presence = input<CwAvatarPresence | null>(null);
  /** Deactivated account: 50 % opacity, « (désactivé) » in the title and the hidden text. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Hidden texts, merged over the French defaults. */
  readonly labels = input<Partial<CwAvatarLabels>>({});
  /** Emits the image's error event when the photo cannot load; the fallback already shows. */
  readonly imageError = output<Event>();

  /** @internal The group this avatar is stacked in, if any. */
  protected readonly group = inject(CwAvatarGroup, { optional: true });
  protected readonly disc = DISC;

  protected readonly loaded = linkedSignal({ source: this.src, computation: () => false });
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });

  /** @internal The size the avatar is drawn at. */
  readonly effectiveSize = computed(() => this.group?.size() ?? this.size());
  /** @internal The text read for this avatar: name, presence, deactivated state. */
  readonly spoken = computed(() => {
    const labels = { ...LABELS, ...this.labels() };
    const presence = this.presence();
    const name = this.name()?.trim() ?? '';
    let text = name === '' ? labels.unknown : name;
    if (presence) text += ` (${labels[presence]})`;
    if (this.disabled()) text += ` (${labels.disabled})`;
    return text;
  });

  protected readonly initials = computed(() => initialsOf(this.name() ?? ''));
  protected readonly iconSize = computed(() => ICON_SIZES[this.effectiveSize()]);
  protected readonly initialsClasses = computed(() => INITIALS[this.effectiveSize()]);
  protected readonly dotClasses = computed(() => {
    const presence = this.presence();
    return presence ? `${DOT} ${DOT_SIZES[this.effectiveSize()]} ${DOT_COLORS[presence]}` : '';
  });
  // Beyond the group's `max`: the native `hidden` attribute, which the Tailwind base layer enforces
  // over `inline-flex`.
  protected readonly hidden = computed(() => this.group?.overflow().includes(this) === true);
  protected readonly classes = computed(
    () => `relative inline-flex shrink-0 data-[disabled]:opacity-50 ${SIZES[this.effectiveSize()]}`,
  );

  protected onImageError(event: Event): void {
    this.failed.set(true);
    this.imageError.emit(event);
  }
}
