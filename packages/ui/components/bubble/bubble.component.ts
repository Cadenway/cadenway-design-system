import {
  Component,
  computed,
  inject,
  input,
  output,
  type InputSignal,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCheckCircleFill,
  phosphorInfoFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import {
  BUBBLE,
  BUBBLE_GROUP,
  type BubbleGroupRef,
  type BubbleRef,
  CW_BUBBLE_DEFAULTS,
} from './bubble.token';
import type {
  CwBubbleAlign,
  CwBubbleDefaults,
  CwBubblePosition,
  CwBubbleSize,
  CwBubbleTone,
  CwBubbleToneLabels,
  CwBubbleVariant,
} from './bubble.types';

/**
 * Constant TONE_LABELS
 *
 * @description
 * Default French labels announced for non-default tones.
 *
 * @type {CwBubbleToneLabels}
 */
const TONE_LABELS: CwBubbleToneLabels = {
  info: 'Information',
  success: 'Succès',
  warning: 'Avertissement',
  error: 'Erreur',
};

/**
 * Constant SURFACE
 *
 * @description
 * Literal bubble surface classes, including inline code and link styling.
 *
 * @type {string}
 */
const SURFACE: string =
  'w-fit max-w-full min-w-0 overflow-hidden border wrap-break-word [&_code]:rounded-sm [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-xs [&_a]:rounded-sm [&_a]:font-medium [&_a]:underline-offset-2 [&_a]:outline-hidden [&_a:hover]:underline [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-ring [&_a:focus-visible]:ring-offset-2 [&_a:focus-visible]:ring-offset-background';

/**
 * Constant VARIANTS
 *
 * @description
 * Surface classes for each visual variant.
 *
 * @type {Record<CwBubbleVariant, string>}
 */
const VARIANTS: Record<CwBubbleVariant, string> = {
  default: 'border-transparent bg-foreground text-background [&_code]:bg-background/15',
  secondary:
    'border-transparent bg-secondary text-secondary-foreground [&_code]:bg-foreground/[0.07]',
  muted: 'border-transparent bg-muted text-foreground [&_code]:bg-foreground/[0.07]',
  outline: 'border-border bg-background text-foreground [&_code]:bg-foreground/[0.07]',
  ghost: 'border-transparent bg-transparent text-muted-foreground [&_code]:bg-foreground/[0.07]',
};

/**
 * Constant ERROR_SURFACE
 *
 * @description
 * Surface classes replacing the variant when the tone is error.
 *
 * @type {string}
 */
const ERROR_SURFACE: string =
  'border-transparent bg-grenat-soft text-grenat-text [&_code]:bg-foreground/[0.07]';

/**
 * Constant SIZES
 *
 * @description
 * Padding and typography classes for each bubble size.
 *
 * @type {Record<CwBubbleSize, string>}
 */
const SIZES: Record<CwBubbleSize, string> = {
  default: 'rounded-xl px-3 py-2 text-sm leading-5',
  sm: 'rounded-lg px-2.5 py-1.5 text-xs leading-4',
};

/**
 * Constant CORNERS
 *
 * @description
 * Tightened corners by alignment and position within a group.
 *
 * @type {Record<CwBubbleAlign, Record<CwBubblePosition, string>>}
 */
const CORNERS: Record<CwBubbleAlign, Record<CwBubblePosition, string>> = {
  start: { first: 'rounded-bl-md', middle: 'rounded-l-md', last: 'rounded-tl-md' },
  end: { first: 'rounded-br-md', middle: 'rounded-r-md', last: 'rounded-tr-md' },
};

/**
 * Constant TONE_ICONS
 *
 * @description
 * Icon names and colors for the non-default tones.
 *
 * @type {Record<Exclude<CwBubbleTone, 'default'>, { name: string; color: string }>}
 */
const TONE_ICONS: Record<Exclude<CwBubbleTone, 'default'>, { name: string; color: string }> = {
  info: { name: 'phosphorInfoFill', color: 'shrink-0 text-primary' },
  success: { name: 'phosphorCheckCircleFill', color: 'shrink-0 text-jade' },
  warning: { name: 'phosphorWarningFill', color: 'shrink-0 text-balise' },
  error: { name: 'phosphorWarningCircleFill', color: 'shrink-0 text-destructive' },
};

/**
 * Class CwBubble
 * @class CwBubble
 *
 * @description
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
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Surface variant, or null to use the container default.
   *
   * @type {InputSignal<CwBubbleVariant | null>}
   */
  public readonly variant: InputSignal<CwBubbleVariant | null> = input<CwBubbleVariant | null>(
    null,
  );

  /**
   * Property tone
   * @readonly
   *
   * @description
   * Tone icon and title; error also tints the surface.
   *
   * @type {InputSignal<CwBubbleTone>}
   */
  public readonly tone: InputSignal<CwBubbleTone> = input<CwBubbleTone>('default');

  /**
   * Property title
   * @readonly
   *
   * @description
   * Title displayed next to the tone icon.
   *
   * @type {InputSignal<string>}
   */
  public readonly title: InputSignal<string> = input('');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Text size and padding.
   *
   * @type {InputSignal<CwBubbleSize>}
   */
  public readonly size: InputSignal<CwBubbleSize> = input<CwBubbleSize>('default');

  /**
   * Property align
   * @readonly
   *
   * @description
   * Reaction and corner alignment, or null to use the container default.
   *
   * @type {InputSignal<CwBubbleAlign | null>}
   */
  public readonly align: InputSignal<CwBubbleAlign | null> = input<CwBubbleAlign | null>(null);

  /**
   * Property toneLabels
   * @readonly
   *
   * @description
   * Overrides for the French tone words.
   *
   * @type {InputSignal<Partial<CwBubbleToneLabels>>}
   */
  public readonly toneLabels: InputSignal<Partial<CwBubbleToneLabels>> = input<
    Partial<CwBubbleToneLabels>
  >({});

  /**
   * Property reactionAdd
   * @readonly
   *
   * @description
   * Emits when the reaction row requests its picker.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly reactionAdd: OutputEmitterRef<void> = output();

  /**
   * Property defaults
   * @readonly
   *
   * @description
   * Optional defaults supplied by the surrounding container.
   *
   * @type {CwBubbleDefaults | null}
   */
  private readonly defaults: CwBubbleDefaults | null = inject(CW_BUBBLE_DEFAULTS, {
    optional: true,
  });

  /**
   * Property group
   * @readonly
   *
   * @description
   * Optional group providing the bubble's stack position.
   *
   * @type {BubbleGroupRef | null}
   */
  private readonly group: BubbleGroupRef | null = inject(BUBBLE_GROUP, { optional: true });

  /**
   * Property effectiveVariant
   * @readonly
   *
   * @description
   * Variant selected from the local input or container default.
   *
   * @type {Signal<CwBubbleVariant>}
   */
  public readonly effectiveVariant: Signal<CwBubbleVariant> = computed(
    () => this.variant() ?? this.defaults?.variant() ?? 'muted',
  );

  /**
   * Property side
   * @readonly
   *
   * @description
   * Alignment selected from the local input or container default.
   *
   * @type {Signal<CwBubbleAlign>}
   */
  public readonly side: Signal<CwBubbleAlign> = computed(
    () => this.align() ?? this.defaults?.align() ?? 'start',
  );

  /**
   * Property position
   * @readonly
   *
   * @description
   * Position in the current stack, or null when ungrouped.
   *
   * @type {Signal<CwBubblePosition | null>}
   */
  public readonly position: Signal<CwBubblePosition | null> = computed(() =>
    this.group ? this.group.positionOf(this) : (this.defaults?.position() ?? null),
  );

  /**
   * Property rootClasses
   * @readonly
   *
   * @description
   * Root layout classes adjusted for a surrounding container.
   *
   * @type {Signal<string>}
   */
  protected readonly rootClasses: Signal<string> = computed(
    () =>
      `group/bubble relative flex w-fit min-w-0 flex-col gap-1 data-[align=end]:items-end ${
        this.defaults ? 'max-w-full' : 'max-w-[80%]'
      }`,
  );

  /**
   * Property surfaceClasses
   * @readonly
   *
   * @description
   * Surface, size and corner classes for the current state.
   *
   * @type {Signal<string>}
   */
  protected readonly surfaceClasses: Signal<string> = computed(() => {
    const surface: string =
      this.tone() === 'error' ? ERROR_SURFACE : VARIANTS[this.effectiveVariant()];
    const position: CwBubblePosition | null = this.position();
    const corner: string = position ? ` ${CORNERS[this.side()][position]}` : '';
    return `${SURFACE} ${surface} ${SIZES[this.size()]}${corner}`;
  });

  /**
   * Property toneIcon
   * @readonly
   *
   * @description
   * Icon metadata for a non-default tone, or null otherwise.
   *
   * @type {Signal<{ name: string; color: string } | null>}
   */
  protected readonly toneIcon: Signal<{ name: string; color: string } | null> = computed(() => {
    const tone: CwBubbleTone = this.tone();
    return tone === 'default' ? null : TONE_ICONS[tone];
  });

  /**
   * Property toneWord
   * @readonly
   *
   * @description
   * Accessible label for the current non-default tone.
   *
   * @type {Signal<string>}
   */
  protected readonly toneWord: Signal<string> = computed(() => {
    const tone: CwBubbleTone = this.tone();
    return tone === 'default' ? '' : { ...TONE_LABELS, ...this.toneLabels() }[tone];
  });

  /**
   * Property bodyClasses
   * @readonly
   *
   * @description
   * Content text classes for the current tone.
   *
   * @type {Signal<string>}
   */
  protected readonly bodyClasses: Signal<string> = computed(() => {
    const tone: CwBubbleTone = this.tone();
    if (tone === 'default') return 'contents';
    return tone === 'error' ? 'text-grenat-text' : 'text-muted-foreground';
  });
  // #endregion

  // #region Methods
  /**
   * Method addReaction
   * @method addReaction
   *
   * @description
   * Emits a request to open the reaction picker.
   */
  public addReaction(): void {
    this.reactionAdd.emit();
  }
  // #endregion
}
