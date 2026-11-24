import { _IdGenerator } from '@angular/cdk/a11y';
import {
  afterEveryRender,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  signal,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { CwTooltip } from '@cadenway/ui/components/tooltip';
import { ɵFOCUS } from '@cadenway/ui/core';
import { NgIcon } from '@ng-icons/core';

import type { CwAppRailItemVariant } from '../app-rail.types';

/**
 * Constant BASE
 *
 * @description
 * Mockup `App.dc.html`: a 36 px square with 8 px corners and an 18 px icon, the offset focus ring
 * of standalone controls.
 *
 * @type {string}
 */
const BASE: string =
  'relative isolate inline-flex size-9 shrink-0 items-center justify-center rounded-lg whitespace-nowrap ' +
  'transition-colors motion-reduce:transition-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:18px] ' +
  ɵFOCUS;

/**
 * Constant TAB_BAR_ITEM
 *
 * @description
 * The tab bar shares 320 px between up to nine items: they may narrow there rather than overflow.
 *
 * @type {string}
 */
const TAB_BAR_ITEM: string =
  'max-md:group-data-[phone-layout=tab-bar]/rail:min-w-0 max-md:group-data-[phone-layout=tab-bar]/rail:shrink';

/**
 * Constant VARIANTS
 *
 * @description
 * Mockup `App.dc.html`: an application is muted, accented on hover, tinted violet when it is the
 * current page or when the panel it opens is expanded (the inbox); the organization switcher is a
 * filled square of initials.
 *
 * @type {Record<CwAppRailItemVariant, string>}
 */
const VARIANTS: Record<CwAppRailItemVariant, string> = {
  default:
    'text-muted-foreground hover:bg-accent hover:text-foreground ' +
    'aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary aria-expanded:bg-primary/10 aria-expanded:text-primary',
  primary:
    'bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/90',
};

/**
 * Function filled
 *
 * @description
 * Phosphor names its two weights `…Bold` and `…Fill`: the current item shows the filled one, as
 * `cw-sidebar-item` does.
 *
 * @param {string} icon - Bold icon name to convert when applicable.
 *
 * @returns {string} Fill icon name, or the original name when it has no Bold suffix.
 */
function filled(icon: string): string {
  return icon.endsWith('Bold') ? `${icon.slice(0, -'Bold'.length)}Fill` : icon;
}

/**
 * Component CwAppRailItem
 *
 * @description
 * An icon button or link of `nav[cwAppRail]` (mockup `App.dc.html`). Put it on an `<a>` for a page
 * or on a `<button>` for a panel or a menu (it then gets `type="button"`, and it is tinted while
 * `aria-expanded` is true). Its content is its label (« Accueil »): hidden on screen, it names the
 * item and is its tooltip, shown on the right on hover and keyboard focus (`tooltip` replaces the
 * bubble text, `shortcut` adds keys to it). `icon` is an ng-icons name of the Bold weight; the item
 * marked `current` shows `activeIcon` (by default the Fill weight of `icon`: register both with
 * `provideIcons`) in `text-primary` on a violet tint, and carries `aria-current="page"`; bind
 * `current` to the router (`routerLinkActive`), which `@cadenway/ui` does not depend on. Without
 * `icon`, an element marked `cwAppRailItemMedia` is shown instead (initials, an avatar), hidden from
 * assistive technologies. `badge` writes a count at the top right and is read after the label as
 * `badgeLabel` (« 3 non lues »), or as the count. `variant="primary"` is the filled square of the
 * organization switcher. `desktopOnly` keeps the item out of the tab bar below 768 px.
 */
@Component({
  selector: 'a[cwAppRailItem], button[cwAppRailItem]',
  imports: [NgIcon, CwTooltip],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type',
    '[attr.aria-label]': 'accessibleName()',
    '[attr.aria-current]': 'current() ? "page" : null',
    '[attr.aria-describedby]': 'description() ? descriptionId : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-desktop-only]': 'desktopOnly() ? "true" : null',
    '(focus)': 'forwardFocus("focus")',
    '(blur)': 'forwardFocus("blur")',
  },
  templateUrl: './app-rail-item.component.html',
})
export class CwAppRailItem {
  // #region Properties
  /**
   * Property icon
   *
   * @description
   * ng-icons name of the Bold weight; without it, the `cwAppRailItemMedia` content is shown.
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly icon: InputSignal<string | undefined> = input<string>();

  /**
   * Property activeIcon
   *
   * @description
   * Icon of the current item; by default the Fill weight of `icon`. Give `icon` again for an icon
   * without a filled form (the mockup's inbox tray and goals target).
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly activeIcon: InputSignal<string | undefined> = input<string>();

  /**
   * Property current
   *
   * @description
   * Whether the item leads to the current page: `aria-current="page"`, the violet tint and the
   * active icon.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly current: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property badge
   *
   * @description
   * Count written at the top right (unread items); null, undefined or an empty string shows none.
   *
   * @type {InputSignal<string | number | null | undefined>}
   * @readonly
   */
  public readonly badge: InputSignal<string | number | null | undefined> = input<
    string | number | null | undefined
  >();

  /**
   * Property badgeLabel
   *
   * @description
   * Words read after the label for the badge (« 3 non lues »); by default the count itself.
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly badgeLabel: InputSignal<string | undefined> = input<string>();

  /**
   * Property tooltip
   *
   * @description
   * Bubble text replacing the label (« Rechercher » next to the Ctrl K keys in the mockup); the
   * accessible name stays the label.
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly tooltip: InputSignal<string | undefined> = input<string>();

  /**
   * Property shortcut
   *
   * @description
   * Keys shown in the bubble after its text, as `cwTooltipShortcut` draws them.
   *
   * @type {InputSignal<readonly string[] | null | undefined>}
   * @readonly
   */
  public readonly shortcut: InputSignal<readonly string[] | null | undefined> = input<
    readonly string[] | null | undefined
  >();

  /**
   * Property variant
   *
   * @description
   * Muted application button, or the filled square of the organization switcher.
   *
   * @type {InputSignal<CwAppRailItemVariant>}
   * @readonly
   */
  public readonly variant: InputSignal<CwAppRailItemVariant> =
    input<CwAppRailItemVariant>('default');

  /**
   * Property desktopOnly
   *
   * @description
   * Hides the item in the tab bar below 768 px (not in a `column` rail).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly desktopOnly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property type
   *
   * @description
   * `type` of a button host, `button` unless the consumer declared one, so the item never submits a
   * form; null on a link.
   *
   * @type {string | null}
   * @readonly
   */
  protected readonly type: string | null =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON'
      ? (inject(new HostAttributeToken('type'), { optional: true }) ?? 'button')
      : null;

  /**
   * Property tip
   *
   * @description
   * Layer carrying the tooltip, which receives the item's focus and blur.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly tip: Signal<ElementRef<HTMLElement>> = viewChild.required<
    string,
    ElementRef<HTMLElement>
  >('tip', { read: ElementRef });

  /**
   * Property labelElement
   *
   * @description
   * Hidden element holding the projected label, read after rendering.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly labelElement: Signal<ElementRef<HTMLElement>> = viewChild.required<
    string,
    ElementRef<HTMLElement>
  >('label', { read: ElementRef });

  /**
   * Property label
   *
   * @description
   * Text of the projected label (« Accueil »), the item's name and default tooltip.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  protected readonly label: WritableSignal<string> = signal('');

  /**
   * Property hasBadge
   *
   * @description
   * Whether a count is shown.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hasBadge: Signal<boolean> = computed(() => {
    const badge: string | number | null | undefined = this.badge();
    return badge !== null && badge !== undefined && badge !== '';
  });

  /**
   * Property iconName
   *
   * @description
   * Icon shown for the current state, or null to show the projected content.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly iconName: Signal<string | null> = computed(() => {
    const icon: string | undefined = this.icon();
    if (!icon) return null;
    return this.current() ? (this.activeIcon() ?? filled(icon)) : icon;
  });

  /**
   * Property tooltipText
   *
   * @description
   * Bubble text: `tooltip`, or the label.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly tooltipText: Signal<string> = computed(() => this.tooltip() ?? this.label());

  /**
   * Property descriptionId
   *
   * @description
   * Id of the hidden description the item points to with `aria-describedby`.
   *
   * @type {string}
   * @readonly
   */
  protected readonly descriptionId: string = inject(_IdGenerator).getId(
    'cw-app-rail-item-description-',
  );

  /**
   * Property description
   *
   * @description
   * What the tooltip adds to the label, read as the item's description on focus: a `tooltip`
   * different from the label and the `shortcut` keys; null when the bubble only repeats the label
   * (the tooltip's own `aria-describedby` sits on its hidden layer, not on the item).
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly description: Signal<string | null> = computed(() => {
    const tooltip: string | undefined = this.tooltip();
    const parts: string[] = [
      tooltip !== undefined && tooltip !== this.label() ? tooltip : '',
      this.shortcut()?.join(' ') ?? '',
    ].filter((part) => part !== '');
    return parts.length > 0 ? parts.join(', ') : null;
  });

  /**
   * Property accessibleName
   *
   * @description
   * The label, followed by the badge words when a count is shown. It is an `aria-label` because the
   * tooltip bubble is inserted inside the item (an inline popover) and would otherwise join a name
   * computed from the content; the icon, the projected content and the badge are hidden. Null until
   * the label is read after rendering (server rendering): the name then comes from the hidden label
   * and badge words in the content.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly accessibleName: Signal<string | null> = computed(() => {
    const label: string = this.label();
    if (!label) return null;
    return this.hasBadge() ? `${label}, ${this.spokenBadge()}` : label;
  });

  /**
   * Property spokenBadge
   *
   * @description
   * Words read for the badge: `badgeLabel`, or the count.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly spokenBadge: Signal<string> = computed(
    () => this.badgeLabel() ?? String(this.badge()),
  );

  /**
   * Property classes
   *
   * @description
   * Item classes for its variant and tab bar visibility.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `${BASE} ${TAB_BAR_ITEM} ${VARIANTS[this.variant()]}${
        this.desktopOnly() ? ' max-md:group-data-[phone-layout=tab-bar]/rail:hidden' : ''
      }`,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Reads the projected label after rendering, as `cw-sidebar-item` does, since the name and the
   * tooltip are computed from it.
   *
   * @constructor
   */
  public constructor() {
    afterEveryRender({
      read: () => {
        this.label.set(this.labelElement().nativeElement.textContent.trim());
      },
    });
  }
  // #endregion

  /*
   * The tooltip cannot sit on the item itself (a directive on a component's host cannot be bound by
   * that component), so it sits on a layer that covers the item and catches the pointer. Its
   * keyboard focus opening is the CDK FocusMonitor's: the item's focus and blur are replayed on the
   * layer, as in `cw-sidebar-item`.
   */
  // #region Methods
  /**
   * Method forwardFocus
   *
   * @description
   * Replays the item's focus or blur on the tooltip layer.
   *
   * @param {'focus' | 'blur'} type - Focus event type to forward.
   */
  protected forwardFocus(type: 'focus' | 'blur'): void {
    this.tip().nativeElement.dispatchEvent(new FocusEvent(type));
  }
  // #endregion
}
