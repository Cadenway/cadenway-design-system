import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCheckCircleFill,
  phosphorInfoFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import { BUBBLE, BUBBLE_GROUP, type BubbleRef, CW_BUBBLE_DEFAULTS } from './bubble.token';
import type {
  CwBubbleAlign,
  CwBubblePosition,
  CwBubbleSize,
  CwBubbleTone,
  CwBubbleToneLabels,
  CwBubbleVariant,
} from './bubble.types';

const TONE_LABELS: CwBubbleToneLabels = {
  info: 'Information',
  success: 'Succès',
  warning: 'Avertissement',
  error: 'Erreur',
};

/* Literal class strings (Bubble sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Inline `<code>` and links of the content are styled here. */
const SURFACE =
  'w-fit max-w-full min-w-0 overflow-hidden border wrap-break-word [&_code]:rounded-sm [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-xs [&_a]:rounded-sm [&_a]:font-medium [&_a]:underline-offset-2 [&_a]:outline-hidden [&_a:hover]:underline [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-ring [&_a:focus-visible]:ring-offset-2 [&_a:focus-visible]:ring-offset-background';

const VARIANTS: Record<CwBubbleVariant, string> = {
  default: 'border-transparent bg-foreground text-background [&_code]:bg-background/15',
  secondary:
    'border-transparent bg-secondary text-secondary-foreground [&_code]:bg-foreground/[0.07]',
  muted: 'border-transparent bg-muted text-foreground [&_code]:bg-foreground/[0.07]',
  outline: 'border-border bg-background text-foreground [&_code]:bg-foreground/[0.07]',
  ghost: 'border-transparent bg-transparent text-muted-foreground [&_code]:bg-foreground/[0.07]',
};

// The error tone is the one tone that replaces the surface of the variant (Bubble sheet, "Tons").
const ERROR_SURFACE =
  'border-transparent bg-grenat-soft text-grenat-text [&_code]:bg-foreground/[0.07]';

const SIZES: Record<CwBubbleSize, string> = {
  default: 'rounded-xl px-3 py-2 text-sm leading-5',
  sm: 'rounded-lg px-2.5 py-1.5 text-xs leading-4',
};

const CORNERS: Record<CwBubbleAlign, Record<CwBubblePosition, string>> = {
  start: { first: 'rounded-bl-md', middle: 'rounded-l-md', last: 'rounded-tl-md' },
  end: { first: 'rounded-br-md', middle: 'rounded-r-md', last: 'rounded-tr-md' },
};

const TONE_ICONS: Record<Exclude<CwBubbleTone, 'default'>, { name: string; color: string }> = {
  info: { name: 'phosphorInfoFill', color: 'shrink-0 text-primary' },
  success: { name: 'phosphorCheckCircleFill', color: 'shrink-0 text-jade' },
  warning: { name: 'phosphorWarningFill', color: 'shrink-0 text-balise' },
  error: { name: 'phosphorWarningCircleFill', color: 'shrink-0 text-destructive' },
};

/**
 * The surface of a message: a comment, a reply, an assistant answer or suggestion (Bubble sheet of
 * the Design System artifact; mockup `App.dc.html`, comments tab).
 *
 * `variant` defaults to what the surrounding `cw-message` gives (`muted` for the others,
 * `secondary` for oneself), else `muted`; `align` likewise (`start`, `end`). A `tone` with a
 * `title` adds a filled tone icon, whose tone word is read first (« Avertissement : »), and mutes
 * the text; `error` turns the surface to `grenat-soft`. Project a `cw-bubble-quote` first, then the
 * text (inline `<code>`, links and mentions are styled), then a `cw-bubble-reactions` row, drawn
 * under the surface on the bubble's side; its add button emits `reactionAdd`. Inside a
 * `cw-bubble-group` (or a run of grouped messages) the corner on the avatar side tightens
 * (`data-position`). The surface has no role: the message carries it. No animation of its own.
 */
@Component({
  selector: 'cw-bubble',
  imports: [NgIcon],
  providers: [
    provideIcons({
      phosphorCheckCircleFill,
      phosphorInfoFill,
      phosphorWarningCircleFill,
      phosphorWarningFill,
    }),
    { provide: BUBBLE, useExisting: CwBubble },
  ],
  host: {
    '[class]': 'rootClasses()',
    '[attr.data-variant]': 'effectiveVariant()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[attr.data-align]': 'side()',
    '[attr.data-position]': 'position()',
  },
  templateUrl: './bubble.component.html',
})
export class CwBubble implements BubbleRef {
  /** Surface; `null` takes the message's (`muted` or `secondary`), else `muted`. */
  readonly variant = input<CwBubbleVariant | null>(null);
  /** Tone icon and title; `error` also tints the surface. */
  readonly tone = input<CwBubbleTone>('default');
  /** Title next to the tone icon (« Réponse incomplète »). */
  readonly title = input('');
  /** Text size and padding. */
  readonly size = input<CwBubbleSize>('default');
  /** Side of the reactions and of the tightened corners; `null` takes the message's, else `start`. */
  readonly align = input<CwBubbleAlign | null>(null);
  /** Replaces the French tone words. */
  readonly toneLabels = input<Partial<CwBubbleToneLabels>>({});

  /** The add button of the reactions row was pressed: open the reaction picker. */
  readonly reactionAdd = output();

  private readonly defaults = inject(CW_BUBBLE_DEFAULTS, { optional: true });
  private readonly group = inject(BUBBLE_GROUP, { optional: true });

  /** The variant in use. */
  readonly effectiveVariant = computed(() => this.variant() ?? this.defaults?.variant() ?? 'muted');
  /** The alignment in use. */
  readonly side = computed(() => this.align() ?? this.defaults?.align() ?? 'start');
  /** Place in a stack of consecutive bubbles, or `null`. */
  readonly position = computed(() =>
    this.group ? this.group.positionOf(this) : (this.defaults?.position() ?? null),
  );

  protected readonly rootClasses = computed(
    () =>
      `group/bubble relative flex w-fit min-w-0 flex-col gap-1 data-[align=end]:items-end ${
        this.defaults ? 'max-w-full' : 'max-w-[80%]'
      }`,
  );
  protected readonly surfaceClasses = computed(() => {
    const surface = this.tone() === 'error' ? ERROR_SURFACE : VARIANTS[this.effectiveVariant()];
    const position = this.position();
    const corner = position ? ` ${CORNERS[this.side()][position]}` : '';
    return `${SURFACE} ${surface} ${SIZES[this.size()]}${corner}`;
  });
  protected readonly toneIcon = computed(() => {
    const tone = this.tone();
    return tone === 'default' ? null : TONE_ICONS[tone];
  });
  protected readonly toneWord = computed(() => {
    const tone = this.tone();
    return tone === 'default' ? '' : { ...TONE_LABELS, ...this.toneLabels() }[tone];
  });
  protected readonly bodyClasses = computed(() => {
    const tone = this.tone();
    if (tone === 'default') return 'contents';
    return tone === 'error' ? 'text-grenat-text' : 'text-muted-foreground';
  });

  /** Emits `reactionAdd`; called by the add button of the reactions row. */
  addReaction(): void {
    this.reactionAdd.emit();
  }
}
