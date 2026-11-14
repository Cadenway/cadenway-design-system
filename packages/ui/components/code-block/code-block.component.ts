import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { CwButton } from '@cadenway/ui/components/button';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold, phosphorCopyBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import type { CwCodeBlockLineKind, CwCodeBlockSize, CwCodeBlockVariant } from './code-block.types';

/**
 * Interface Line
 *
 * @description
 * Display model for one line of code.
 */
interface Line {
  // #region Properties
  /**
   * Property text
   * @readonly
   *
   * @description
   * Text shown for the line.
   *
   * @type {string}
   */
  readonly text: string;

  /**
   * Property kind
   * @readonly
   *
   * @description
   * Visual kind of the line.
   *
   * @type {CwCodeBlockLineKind}
   */
  readonly kind: CwCodeBlockLineKind;

  /**
   * Property number
   * @readonly
   *
   * @description
   * Line number, or null for a removed line.
   *
   * @type {number | null}
   */
  readonly number: number | null;

  /**
   * Property rowClasses
   * @readonly
   *
   * @description
   * Classes applied to the row.
   *
   * @type {string}
   */
  readonly rowClasses: string;

  /**
   * Property textClasses
   * @readonly
   *
   * @description
   * Classes applied to the line text.
   *
   * @type {string}
   */
  readonly textClasses: string;
  // #endregion
}

/* Literal class strings (Code Block sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. No syntax coloring: the code stays in ink, comments muted,
   bright colors only for meaning (diff, error). */
/**
 * Constant FRAMES
 *
 * @description
 * Frame classes by block variant.
 *
 * @type {Record<CwCodeBlockVariant, string>}
 */
const FRAMES: Record<CwCodeBlockVariant, string> = {
  default: 'block overflow-hidden rounded-lg border bg-card',
  destructive: 'block overflow-hidden rounded-lg border border-destructive/30 bg-card',
};

/**
 * Constant HEADERS
 *
 * @description
 * Header classes by block variant.
 *
 * @type {Record<CwCodeBlockVariant, string>}
 */
const HEADERS: Record<CwCodeBlockVariant, string> = {
  default: 'flex h-9 items-center gap-2 border-b bg-muted pr-1.5 pl-3',
  destructive:
    'flex h-9 items-center gap-2 border-b border-destructive/30 pr-1.5 pl-3 text-xs font-medium text-destructive',
};

/**
 * Constant TEXT_SIZES
 *
 * @description
 * Text classes by block size.
 *
 * @type {Record<CwCodeBlockSize, string>}
 */
const TEXT_SIZES: Record<CwCodeBlockSize, string> = {
  default: 'text-xs leading-5',
  sm: 'text-[11px] leading-[18px]',
};

/**
 * Constant ROWS
 *
 * @description
 * Row classes by line kind.
 *
 * @type {Record<CwCodeBlockLineKind, string>}
 */
const ROWS: Record<CwCodeBlockLineKind, string> = {
  default: 'flex px-3',
  comment: 'flex px-3',
  highlighted: 'flex border-l-2 border-line-control bg-muted pr-3 pl-2.5',
  added: 'flex bg-jade-soft px-3',
  removed: 'flex bg-grenat-soft px-3',
};

/**
 * Constant NUMBER
 *
 * @description
 * Classes for the line number.
 *
 * @type {string}
 */
const NUMBER: string = 'w-7 shrink-0 pr-3 text-right text-muted-foreground select-none';
/**
 * Constant SIGN
 *
 * @description
 * Classes for the diff sign.
 *
 * @type {string}
 */
const SIGN: string = 'w-3 shrink-0 select-none';
/**
 * Constant COPIED_DURATION
 *
 * @description
 * Duration of the copied state in milliseconds.
 *
 * @type {number}
 */
const COPIED_DURATION: number = 2000;

// A comment line: shell, YAML, Python (`#`) or C-like (`//`) comment.
/**
 * Constant COMMENT
 *
 * @description
 * Pattern matching supported comment lines.
 *
 * @type {RegExp}
 */
const COMMENT: RegExp = /^\s*(#|\/\/)/;

/**
 * Component CwCodeBlock
 *
 * @description
 * Shows code, a terminal output or a diff in Geist Mono, with line numbers, lines put forward and a
 * copy button (Code Block sheet of the Design System artifact). No syntax coloring: plain text.
 *
 * `code` is split on line breaks. With `diff`, a leading `+` or `-` marks an added or removed line:
 * the sign is drawn (never the color alone) with a hidden « ajouté » / « retiré », removed lines have
 * no number, and the copy button copies the resulting code (removed lines dropped, signs stripped).
 * `highlight` lists the line numbers to put forward; in a `destructive` block they are the error
 * lines, in the error color. Numbers and signs are `aria-hidden` and not selectable, so a manual
 * copy takes the code only. The copy button (CDK `Clipboard`) turns into « Copié » for 2 s, is
 * announced (CDK `LiveAnnouncer`) and emits `copied` with the copied text. The code area becomes
 * focusable when its lines overflow, for the arrow keys; `wrap` folds long lines instead.
 */
@Component({
  selector: 'cw-code-block',
  imports: [CwButton, NgIcon],
  providers: [provideIcons({ phosphorCheckBold, phosphorCopyBold, phosphorWarningCircleFill })],
  host: {
    '[class]': 'frameClasses()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './code-block.component.html',
})
export class CwCodeBlock {
  // #region Properties
  /**
   * Property code
   * @readonly
   *
   * @description
   * Code shown in the block.
   *
   * @type {InputSignal<string>}
   */
  public readonly code: InputSignal<string> = input.required<string>();

  /**
   * Property language
   * @readonly
   *
   * @description
   * Language shown in the header.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly language: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property filename
   * @readonly
   *
   * @description
   * File name shown in the header.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly filename: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Visual variant of the block.
   *
   * @type {InputSignal<CwCodeBlockVariant>}
   */
  public readonly variant: InputSignal<CwCodeBlockVariant> = input<CwCodeBlockVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Text size and line height.
   *
   * @type {InputSignal<CwCodeBlockSize>}
   */
  public readonly size: InputSignal<CwCodeBlockSize> = input<CwCodeBlockSize>('default');

  /**
   * Property lineNumbers
   * @readonly
   *
   * @description
   * Whether to show line numbers.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly lineNumbers: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property highlight
   * @readonly
   *
   * @description
   * Line numbers highlighted in the block.
   *
   * @type {InputSignal<readonly number[]>}
   */
  public readonly highlight: InputSignal<readonly number[]> = input<readonly number[]>([]);

  /**
   * Property diff
   * @readonly
   *
   * @description
   * Whether leading signs represent diff lines.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly diff: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property copyable
   * @readonly
   *
   * @description
   * Whether the copy action is shown.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly copyable: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property wrap
   * @readonly
   *
   * @description
   * Whether long lines wrap.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly wrap: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property copyLabel
   * @readonly
   *
   * @description
   * Accessible label of the copy button.
   *
   * @type {InputSignal<string>}
   */
  public readonly copyLabel: InputSignal<string> = input('Copier le code');

  /**
   * Property copiedLabel
   * @readonly
   *
   * @description
   * Text announced when copying succeeds.
   *
   * @type {InputSignal<string>}
   */
  public readonly copiedLabel: InputSignal<string> = input('Copié');

  /**
   * Property addedLabel
   * @readonly
   *
   * @description
   * Accessible label of an added line.
   *
   * @type {InputSignal<string>}
   */
  public readonly addedLabel: InputSignal<string> = input('ajouté');

  /**
   * Property removedLabel
   * @readonly
   *
   * @description
   * Accessible label of a removed line.
   *
   * @type {InputSignal<string>}
   */
  public readonly removedLabel: InputSignal<string> = input('retiré');

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Optional accessible label of the code area.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property copied
   * @readonly
   *
   * @description
   * Emits the copied text after a successful copy.
   *
   * @type {OutputEmitterRef<string>}
   */
  public readonly copied: OutputEmitterRef<string> = output<string>();

  /**
   * Property clipboard
   * @readonly
   *
   * @description
   * Clipboard used by the copy action.
   *
   * @type {Clipboard}
   */
  private readonly clipboard: Clipboard = inject(Clipboard);

  /**
   * Property announcer
   * @readonly
   *
   * @description
   * Announces a successful copy.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property area
   * @readonly
   *
   * @description
   * Rendered code area measured for overflow.
   *
   * @type {Signal<ElementRef<HTMLPreElement>>}
   */
  private readonly area: Signal<ElementRef<HTMLPreElement>> =
    viewChild.required<ElementRef<HTMLPreElement>>('area');

  /**
   * Property timer
   *
   * @description
   * Timer clearing the copied state.
   *
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  private timer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Property copiedNow
   * @readonly
   *
   * @description
   * Whether the copied feedback is visible.
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly copiedNow: WritableSignal<boolean> = signal(false);

  /**
   * Property overflowing
   * @readonly
   *
   * @description
   * Whether the code area overflows.
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly overflowing: WritableSignal<boolean> = signal(false);

  /**
   * Property numberClasses
   * @readonly
   *
   * @description
   * Classes for line numbers.
   *
   * @type {string}
   */
  protected readonly numberClasses: string = NUMBER;

  /**
   * Property signClasses
   * @readonly
   *
   * @description
   * Classes for diff signs.
   *
   * @type {string}
   */
  protected readonly signClasses: string = SIGN;

  /**
   * Property lines
   * @readonly
   *
   * @description
   * Parsed lines and their display classes.
   *
   * @type {Signal<Line[]>}
   */
  protected readonly lines: Signal<Line[]> = computed<Line[]>(() => {
    const diff: boolean = this.diff();
    const highlight: Set<number> = new Set<number>(this.highlight());
    const destructive: boolean = this.variant() === 'destructive';
    const wrap: string = this.wrap() ? 'min-w-0 whitespace-pre-wrap break-all' : 'whitespace-pre';
    let number: number = 0;
    return this.code()
      .replace(/\r\n?/g, '\n')
      .replace(/\n$/, '')
      .split('\n')
      .map((raw): Line => {
        let text: string = raw;
        let kind: CwCodeBlockLineKind = 'default';
        if (diff && raw.startsWith('+')) {
          kind = 'added';
          text = raw.slice(1);
        } else if (diff && raw.startsWith('-')) {
          kind = 'removed';
          text = raw.slice(1);
        }
        const lineNumber: number | null = kind === 'removed' ? null : ++number;
        if (kind === 'default' && lineNumber !== null && highlight.has(lineNumber)) {
          kind = destructive ? 'default' : 'highlighted';
        } else if (kind === 'default' && COMMENT.test(text)) {
          kind = 'comment';
        }
        const isError: boolean = destructive && lineNumber !== null && highlight.has(lineNumber);
        const tone: string = isError
          ? 'text-destructive'
          : kind === 'comment'
            ? 'text-muted-foreground'
            : '';
        return {
          text,
          kind,
          number: lineNumber,
          rowClasses: ROWS[kind],
          textClasses: tone ? `${wrap} ${tone}` : wrap,
        };
      });
  });

  /**
   * Property hasHeader
   * @readonly
   *
   * @description
   * Whether the block header is visible.
   *
   * @type {Signal<boolean>}
   */
  protected readonly hasHeader: Signal<boolean> = computed(
    () => !!this.filename() || !!this.language() || this.copyable(),
  );

  /**
   * Property frameClasses
   * @readonly
   *
   * @description
   * Frame classes for the current variant.
   *
   * @type {Signal<string>}
   */
  protected readonly frameClasses: Signal<string> = computed(() => FRAMES[this.variant()]);

  /**
   * Property headerClasses
   * @readonly
   *
   * @description
   * Header classes for the current variant.
   *
   * @type {Signal<string>}
   */
  protected readonly headerClasses: Signal<string> = computed(() => HEADERS[this.variant()]);
  // In a destructive header the language already pushes the button to the right.
  /**
   * Property copyClasses
   * @readonly
   *
   * @description
   * Copy button classes for the current header.
   *
   * @type {Signal<string>}
   */
  protected readonly copyClasses: Signal<string> = computed(() => {
    if (this.variant() !== 'destructive') return 'ml-auto';
    return this.language() ? 'text-foreground' : 'ml-auto text-foreground';
  });

  /**
   * Property codeClasses
   * @readonly
   *
   * @description
   * Code element classes for the wrap mode.
   *
   * @type {Signal<string>}
   */
  protected readonly codeClasses: Signal<string> = computed(() =>
    this.wrap() ? 'block' : 'block min-w-max',
  );

  /**
   * Property areaClasses
   * @readonly
   *
   * @description
   * Code area classes for size and scrolling.
   *
   * @type {Signal<string>}
   */
  protected readonly areaClasses: Signal<string> = computed(
    () =>
      `py-2 font-mono ${TEXT_SIZES[this.size()]} ${this.wrap() ? 'overflow-x-hidden' : 'overflow-x-auto'} ${ɵFOCUS_INSET}`,
  );

  /**
   * Property areaLabel
   * @readonly
   *
   * @description
   * Accessible name of the code area.
   *
   * @type {Signal<string>}
   */
  protected readonly areaLabel: Signal<string> = computed(() => {
    const given: string | null = this.ariaLabel();
    if (given) return given;
    const count: number = this.lines().length;
    const name: string = this.filename() ?? this.language() ?? 'Code';
    return `${name}, ${String(count)} ${count > 1 ? 'lignes' : 'ligne'}`;
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Measures code overflow and clears pending feedback on destruction.
   */
  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
    });
    // Code Block sheet, "Focus clavier": the area takes the focus only when it overflows, so the
    // arrow keys can scroll it; otherwise it stays out of the tab order.
    afterRenderEffect((onCleanup) => {
      this.lines();
      this.wrap();
      const area: HTMLPreElement = this.area().nativeElement;
      const measure: () => void = (): void => {
        this.overflowing.set(area.scrollWidth > area.clientWidth);
      };
      measure();
      const view: (Window & typeof globalThis) | null = area.ownerDocument.defaultView;
      if (!view || typeof view.ResizeObserver !== 'function') return;
      const observer: ResizeObserver = new view.ResizeObserver(measure);
      observer.observe(area);
      onCleanup(() => {
        observer.disconnect();
      });
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method copy
   *
   * @description
   * Copies the resulting code and displays temporary feedback.
   */
  public copy(): void {
    const text: string = this.diff()
      ? this.lines()
          .filter((line) => line.kind !== 'removed')
          .map((line) => line.text)
          .join('\n')
      : this.code();
    if (!this.clipboard.copy(text)) return;
    clearTimeout(this.timer);
    this.copiedNow.set(true);
    void this.announcer.announce(this.copiedLabel(), 'polite');
    this.timer = setTimeout(() => {
      this.copiedNow.set(false);
    }, COPIED_DURATION);
    this.copied.emit(text);
  }
  // #endregion
}
