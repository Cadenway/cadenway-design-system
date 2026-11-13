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
} from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { CwButton } from '@cadenway/ui/button';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold, phosphorCopyBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import type { CwCodeBlockLineKind, CwCodeBlockSize, CwCodeBlockVariant } from './code-block.types';

interface Line {
  readonly text: string;
  readonly kind: CwCodeBlockLineKind;
  /** Number in the resulting file; removed lines have none. */
  readonly number: number | null;
  readonly rowClasses: string;
  readonly textClasses: string;
}

/* Literal class strings (Code Block sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. No syntax coloring: the code stays in ink, comments muted,
   bright colors only for meaning (diff, error). */
const FRAMES: Record<CwCodeBlockVariant, string> = {
  default: 'block overflow-hidden rounded-lg border bg-card',
  destructive: 'block overflow-hidden rounded-lg border border-destructive/30 bg-card',
};

const HEADERS: Record<CwCodeBlockVariant, string> = {
  default: 'flex h-9 items-center gap-2 border-b bg-muted pr-1.5 pl-3',
  destructive:
    'flex h-9 items-center gap-2 border-b border-destructive/30 pr-1.5 pl-3 text-xs font-medium text-destructive',
};

const TEXT_SIZES: Record<CwCodeBlockSize, string> = {
  default: 'text-xs leading-5',
  sm: 'text-[11px] leading-[18px]',
};

const ROWS: Record<CwCodeBlockLineKind, string> = {
  default: 'flex px-3',
  comment: 'flex px-3',
  highlighted: 'flex border-l-2 border-line-control bg-muted pr-3 pl-2.5',
  added: 'flex bg-jade-soft px-3',
  removed: 'flex bg-grenat-soft px-3',
};

const NUMBER = 'w-7 shrink-0 pr-3 text-right text-muted-foreground select-none';
const SIGN = 'w-3 shrink-0 select-none';
const COPIED_DURATION = 2000;

// A comment line: shell, YAML, Python (`#`) or C-like (`//`) comment.
const COMMENT = /^\s*(#|\/\/)/;

/**
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
  /** The code, lines separated by line breaks. */
  readonly code = input.required<string>();
  /** Language written in the header (`yaml`, `bash`). */
  readonly language = input<string | null>(null);
  /** File name, the title of the header. */
  readonly filename = input<string | null>(null);
  /** `destructive`: the log of a failed run, error lines from `highlight`. */
  readonly variant = input<CwCodeBlockVariant>('default');
  /** Text size and line height. */
  readonly size = input<CwCodeBlockSize>('default');
  /** Shows the line numbers. */
  readonly lineNumbers = input(true, { transform: booleanAttribute });
  /** Line numbers to put forward (error lines in a `destructive` block). */
  readonly highlight = input<readonly number[]>([]);
  /** Reads the leading `+` and `-` as added and removed lines. */
  readonly diff = input(false, { transform: booleanAttribute });
  /** Shows the copy button. */
  readonly copyable = input(true, { transform: booleanAttribute });
  /** Folds long lines instead of scrolling. */
  readonly wrap = input(false, { transform: booleanAttribute });
  /** Accessible name of the copy button. */
  readonly copyLabel = input('Copier le code');
  /** Text of the button once copied, also announced. */
  readonly copiedLabel = input('Copié');
  /** Hidden text of an added line. */
  readonly addedLabel = input('ajouté');
  /** Hidden text of a removed line. */
  readonly removedLabel = input('retiré');
  /** Accessible name of the code area; « <file or language>, <n> lignes » when not given. */
  readonly ariaLabel = input<string | null>(null);
  /** Emitted with the copied text once it is in the clipboard. */
  readonly copied = output<string>();

  private readonly clipboard = inject(Clipboard);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly area = viewChild.required<ElementRef<HTMLPreElement>>('area');
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly copiedNow = signal(false);
  protected readonly overflowing = signal(false);
  protected readonly numberClasses = NUMBER;
  protected readonly signClasses = SIGN;

  protected readonly lines = computed<Line[]>(() => {
    const diff = this.diff();
    const highlight = new Set(this.highlight());
    const destructive = this.variant() === 'destructive';
    const wrap = this.wrap() ? 'min-w-0 whitespace-pre-wrap break-all' : 'whitespace-pre';
    let number = 0;
    return this.code()
      .replace(/\r\n?/g, '\n')
      .replace(/\n$/, '')
      .split('\n')
      .map((raw): Line => {
        let text = raw;
        let kind: CwCodeBlockLineKind = 'default';
        if (diff && raw.startsWith('+')) {
          kind = 'added';
          text = raw.slice(1);
        } else if (diff && raw.startsWith('-')) {
          kind = 'removed';
          text = raw.slice(1);
        }
        const lineNumber = kind === 'removed' ? null : ++number;
        if (kind === 'default' && lineNumber !== null && highlight.has(lineNumber)) {
          kind = destructive ? 'default' : 'highlighted';
        } else if (kind === 'default' && COMMENT.test(text)) {
          kind = 'comment';
        }
        const isError = destructive && lineNumber !== null && highlight.has(lineNumber);
        const tone = isError
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

  protected readonly hasHeader = computed(
    () => !!this.filename() || !!this.language() || this.copyable(),
  );
  protected readonly frameClasses = computed(() => FRAMES[this.variant()]);
  protected readonly headerClasses = computed(() => HEADERS[this.variant()]);
  // In a destructive header the language already pushes the button to the right.
  protected readonly copyClasses = computed(() => {
    if (this.variant() !== 'destructive') return 'ml-auto';
    return this.language() ? 'text-foreground' : 'ml-auto text-foreground';
  });
  protected readonly codeClasses = computed(() => (this.wrap() ? 'block' : 'block min-w-max'));
  protected readonly areaClasses = computed(
    () =>
      `py-2 font-mono ${TEXT_SIZES[this.size()]} ${this.wrap() ? 'overflow-x-hidden' : 'overflow-x-auto'} ${ɵFOCUS_INSET}`,
  );
  protected readonly areaLabel = computed(() => {
    const given = this.ariaLabel();
    if (given) return given;
    const count = this.lines().length;
    const name = this.filename() ?? this.language() ?? 'Code';
    return `${name}, ${String(count)} ${count > 1 ? 'lignes' : 'ligne'}`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
    });
    // Code Block sheet, "Focus clavier": the area takes the focus only when it overflows, so the
    // arrow keys can scroll it; otherwise it stays out of the tab order.
    afterRenderEffect((onCleanup) => {
      this.lines();
      this.wrap();
      const area = this.area().nativeElement;
      const measure = (): void => {
        this.overflowing.set(area.scrollWidth > area.clientWidth);
      };
      measure();
      const view = area.ownerDocument.defaultView;
      if (!view || typeof view.ResizeObserver !== 'function') return;
      const observer = new view.ResizeObserver(measure);
      observer.observe(area);
      onCleanup(() => {
        observer.disconnect();
      });
    });
  }

  /** Copies the code (the resulting code of a diff) and shows « Copié » for 2 s. */
  copy(): void {
    const text = this.diff()
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
}
