import { _IdGenerator } from '@angular/cdk/a11y';
import {
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';

import { CwMeter, type CwMeterFormat, type CwMeterZone } from '@cadenway/ui/components/meter';

import { PASSWORD_STRENGTH_LABELS } from './password-strength-labels.token';
import { cwPasswordRules, strengthTone } from './password-strength.constants';
import type {
  CwPasswordRule,
  CwPasswordStrengthLabels,
  CwPasswordStrengthTone,
} from './password-strength.types';

/**
 * Interface RuleResult
 *
 * @description
 * A rule and whether the current password meets it.
 */
interface RuleResult {
  // #region Properties
  /**
   * Property rule
   *
   * @description
   * The rule checked.
   *
   * @type {CwPasswordRule}
   * @readonly
   */
  readonly rule: CwPasswordRule;

  /**
   * Property met
   *
   * @description
   * Whether the password meets the rule.
   *
   * @type {boolean}
   * @readonly
   */
  readonly met: boolean;
  // #endregion
}

/**
 * Constant RULE_CLASSES
 *
 * @description
 * Mockup `Inscription.dc.html` (`cw-rule`): an unmet rule is a dashed ring in the muted color; a
 * met rule turns jade, its ring spins away while a disc grows and the check draws itself.
 *
 * @type {Readonly<Record<'met' | 'unmet', Readonly<Record<'item' | 'ring' | 'fill' | 'check', string>>>>}
 */
const RULE_CLASSES: Readonly<
  Record<'met' | 'unmet', Readonly<Record<'item' | 'ring' | 'fill' | 'check', string>>>
> = {
  met: {
    item: 'flex items-center gap-1.5 text-xs whitespace-nowrap text-jade-text transition-colors duration-300 motion-reduce:transition-none',
    ring:
      'origin-center rotate-[120deg] opacity-0 [stroke-dasharray:3_0] [transform-box:fill-box] ' +
      '[transition:stroke-dasharray_.4s_var(--ease-snap),rotate_.6s_var(--ease-spring),opacity_.2s_var(--ease-snap)_.16s] motion-reduce:transition-none',
    fill: 'origin-center scale-100 [transform-box:fill-box] [transition:scale_.35s_var(--ease-spring)_90ms] motion-reduce:transition-none',
    check:
      'stroke-background [stroke-dasharray:1] [stroke-dashoffset:0] [transition:stroke-dashoffset_.26s_var(--ease-snap)_.23s] motion-reduce:transition-none',
  },
  unmet: {
    item: 'flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground transition-colors duration-300 motion-reduce:transition-none',
    ring:
      'origin-center rotate-0 [stroke-dasharray:2_1] [transform-box:fill-box] ' +
      '[transition:stroke-dasharray_.4s_var(--ease-snap),rotate_.6s_var(--ease-spring),opacity_.2s_var(--ease-snap)] motion-reduce:transition-none',
    fill: 'origin-center scale-0 [transform-box:fill-box] [transition:scale_.35s_var(--ease-spring)] motion-reduce:transition-none',
    check:
      'stroke-background [stroke-dasharray:1] [stroke-dashoffset:1px] [transition:stroke-dashoffset_.26s_var(--ease-snap)] motion-reduce:transition-none',
  },
};

/**
 * Constant ZONES
 *
 * @description
 * Meter zone of each tone: the meter's colors read grenat, balise and jade from weak to good.
 *
 * @type {Readonly<Record<CwPasswordStrengthTone, CwMeterZone>>}
 */
const ZONES: Readonly<Record<CwPasswordStrengthTone, CwMeterZone>> = {
  weak: 'critical',
  fair: 'high',
  good: 'optimum',
};

/**
 * Component CwPasswordStrength
 *
 * @description
 * The strength of a new password as the mockup shows it under the field (`Inscription.dc.html`,
 * `Reinitialisation.dc.html`): a `cw-meter` in `segmented` with one notch per rule (`role="meter"`,
 * its value text is the level) and the list of rules, each read as met or not.
 * `value` is the password; `rules` replaces the four default rules (`minLength` characters, upper and
 * lower case, a digit, a symbol); their texts come from `provideCwPasswordStrengthLabels`. The level
 * («  Trop court » … « Excellent ») is written by `cw-password-strength-level`, which the consumer
 * places next to the field label: `<cw-password-strength #strength … />` and
 * `<cw-password-strength-level [for]="strength" />`. Point the field to the rules with
 * `[attr.aria-describedby]="strength.rulesId"`. Exported as `cwPasswordStrength`; `score`, `total`,
 * `level`, `tone` and `empty` are readable signals (for a submit guard, for example). The meter never
 * validates: the form decides what score it requires.
 */
@Component({
  selector: 'cw-password-strength',
  exportAs: 'cwPasswordStrength',
  imports: [CwMeter],
  host: { class: 'flex flex-col gap-2' },
  templateUrl: './password-strength.component.html',
})
export class CwPasswordStrength {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * The password being typed; empty hides the level and leaves the bars empty.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly value: InputSignal<string> = input<string>('');

  /**
   * Property minLength
   *
   * @description
   * Minimum length of the default length rule, in code points; 12 in the mockup and in the identity
   * service's password policy. At least 1; an invalid value falls back to 12.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly minLength: InputSignalWithTransform<number, unknown> = input(12, {
    transform: (value: unknown) => Math.max(1, numberAttribute(value, 12)),
  });

  /**
   * Property rules
   *
   * @description
   * Rules replacing the four default ones; the meter has one notch per rule. An empty array means no
   * rule (no meter, an empty list), not the defaults.
   *
   * @type {InputSignal<readonly CwPasswordRule[] | undefined>}
   * @readonly
   */
  public readonly rules: InputSignal<readonly CwPasswordRule[] | undefined> = input<
    readonly CwPasswordRule[] | undefined
  >();

  /**
   * Property rulesId
   *
   * @description
   * Id of the rule list, for the field's `aria-describedby`.
   *
   * @type {string}
   * @readonly
   */
  public readonly rulesId: string = inject(_IdGenerator).getId('cw-password-rules-');

  /**
   * Property labels
   *
   * @description
   * Texts given by `provideCwPasswordStrengthLabels`, or the French defaults.
   *
   * @type {CwPasswordStrengthLabels}
   * @readonly
   */
  protected readonly labels: CwPasswordStrengthLabels = inject(PASSWORD_STRENGTH_LABELS);

  /**
   * Property results
   *
   * @description
   * Each rule with whether the current password meets it; an empty password meets none, even a rule
   * whose test accepts an empty string.
   *
   * @type {Signal<readonly RuleResult[]>}
   * @readonly
   */
  protected readonly results: Signal<readonly RuleResult[]> = computed(() => {
    const value: string = this.value();
    return (this.rules() ?? cwPasswordRules(this.labels, this.minLength())).map((rule) => ({
      rule,
      met: value !== '' && rule.test(value),
    }));
  });

  /**
   * Property empty
   *
   * @description
   * Whether no password is typed yet.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly empty: Signal<boolean> = computed(() => this.value() === '');

  /**
   * Property score
   *
   * @description
   * Number of rules the password meets.
   *
   * @type {Signal<number>}
   * @readonly
   */
  public readonly score: Signal<number> = computed(
    () => this.results().filter((result) => result.met).length,
  );

  /**
   * Property total
   *
   * @description
   * Number of rules, the maximum score.
   *
   * @type {Signal<number>}
   * @readonly
   */
  public readonly total: Signal<number> = computed(() => this.results().length);

  /**
   * Property levelIndex
   *
   * @description
   * Position of the level in `labels.levels`, by share of the rules met so that any number of rules
   * reads alike: the first level for an empty password or no rule met, the last one only when every
   * rule is met, the levels in between spread over the shares (with the four default rules and five
   * levels, one level per rule met, as in the mockup).
   *
   * @type {Signal<number>}
   * @readonly
   */
  private readonly levelIndex: Signal<number> = computed(() => {
    const top: number = this.labels.levels.length - 1;
    const score: number = this.score();
    const total: number = this.total();
    if (score === 0 || top <= 0) return 0;
    if (score === total) return top;
    return Math.min(top - 1, 1 + Math.floor((score / total) * (top - 1)));
  });

  /**
   * Property level
   *
   * @description
   * Level of the password, from « Trop court » to « Excellent » (`labels.levels`).
   *
   * @type {Signal<string>}
   * @readonly
   */
  public readonly level: Signal<string> = computed(
    () => this.labels.levels[this.levelIndex()] ?? '',
  );

  /**
   * Property tone
   *
   * @description
   * Tone of the level, so the color always agrees with the text: the first quarter of the levels is
   * weak (grenat), up to the middle is fair (balise), above is good (jade). With the default levels:
   * « Trop court » and « Faible » weak, « Moyen » fair, « Bon » and « Excellent » good.
   *
   * @type {Signal<CwPasswordStrengthTone>}
   * @readonly
   */
  public readonly tone: Signal<CwPasswordStrengthTone> = computed(() =>
    strengthTone(this.levelIndex(), this.labels.levels.length - 1),
  );

  /**
   * Property notches
   *
   * @description
   * Filled notches of the meter: the score, but at least one once something is typed, as in the
   * mockup (`Inscription.dc.html`), so typing always shows a reaction.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly notches: Signal<number> = computed(() =>
    this.empty() ? 0 : Math.min(Math.max(this.score(), 1), this.total()),
  );

  /**
   * Property zone
   *
   * @description
   * Zone of the meter, forced because low values are the bad ones: weak is critical (grenat), fair
   * is high (balise), good is optimum (jade).
   *
   * @type {Signal<CwMeterZone>}
   * @readonly
   */
  protected readonly zone: Signal<CwMeterZone> = computed(() => ZONES[this.tone()]);

  /**
   * Property format
   *
   * @description
   * Value text of the meter: the level, read instead of a number of notches.
   *
   * @type {CwMeterFormat}
   * @readonly
   */
  protected readonly format: CwMeterFormat = (): string => this.level();

  /**
   * Property ruleClasses
   *
   * @description
   * Classes of a rule's line and icon for the met and unmet states.
   *
   * @type {typeof RULE_CLASSES}
   * @readonly
   */
  protected readonly ruleClasses: typeof RULE_CLASSES = RULE_CLASSES;
  // #endregion
}
