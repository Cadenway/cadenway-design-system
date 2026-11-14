import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ESLint, Linter, RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';

import uiDocumentation from './ui-documentation.mjs';
import uiMemberRegions from './ui-member-regions.mjs';
import uiNativeOutputs from './ui-native-outputs.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });

it('checks the configured JSDoc rules for UI declarations', async () => {
  const eslint = new ESLint();
  const config = await eslint.calculateConfigForFile('packages/ui/src/lib/button/button.ts');
  const rules = Object.fromEntries(
    Object.entries(config.rules).filter(([name]) => name.startsWith('jsdoc/')),
  );
  const linter = new Linter();
  const lint = (code) =>
    linter.verify(code, {
      languageOptions: { parser: tseslint.parser },
      plugins: { jsdoc: config.plugins.jsdoc },
      rules,
    });

  assert(
    lint('export class Button {}').some((message) => message.ruleId === 'jsdoc/require-jsdoc'),
  );
  assert(
    lint('export const Disabled: Story = {};').some(
      (message) => message.ruleId === 'jsdoc/require-jsdoc',
    ),
  );
  assert.deepEqual(
    lint('/** Shows the disabled state. */\nexport const Disabled: Story = {};'),
    [],
  );
  const callable = lint(
    '/** Normalizes a label. */\nfunction fold(label: string): string { return label; }',
  );
  assert(callable.some((message) => message.ruleId === 'jsdoc/require-param'));
  assert(callable.some((message) => message.ruleId === 'jsdoc/require-returns'));
  const method = lint(
    '/** Interface. */\ninterface Example { /** Method. */\n run(value: string): string; }',
  );
  assert(method.some((message) => message.ruleId === 'jsdoc/require-param'));
  assert(method.some((message) => message.ruleId === 'jsdoc/require-returns'));
  const tags = lint(
    '/**\n * @param label\n * @returns\n */\nfunction fold(label: string): string { return label; }',
  );
  for (const rule of [
    'require-param-type',
    'require-param-description',
    'require-returns-type',
    'require-returns-description',
  ]) {
    assert(tags.some((message) => message.ruleId === `jsdoc/${rule}`));
  }
});

tester.run('ui-native-outputs', uiNativeOutputs, {
  valid: [
    { code: 'class CwInlineEdit { cancel = output(); }' },
    { code: 'class Other { saved = output(); }' },
  ],
  invalid: [
    { code: 'class Other { cancel = output(); }', errors: [{ messageId: 'noOutputNative' }] },
    { code: 'class CwInlineEdit { click = output(); }', errors: [{ messageId: 'noOutputNative' }] },
  ],
});

tester.run('ui-explicit-destructuring-types', tseslint.plugin.rules.typedef, {
  valid: [
    { code: 'const [first]: string[] = ["a"];', options: [{ arrayDestructuring: true }] },
    {
      code: 'const { value }: { value: number } = { value: 1 };',
      options: [{ objectDestructuring: true }],
    },
  ],
  invalid: [
    {
      code: 'const [first] = ["a"];',
      options: [{ arrayDestructuring: true }],
      errors: [{ messageId: 'expectedTypedef' }],
    },
    {
      code: 'const { value } = { value: 1 };',
      options: [{ objectDestructuring: true }],
      errors: [{ messageId: 'expectedTypedef' }],
    },
  ],
});

tester.run('ui-documentation', uiDocumentation, {
  valid: [
    {
      filename: 'button.ts',
      code: `/**
 * Class Button
 * @class Button
 *
 * @description
 * Invokes an action.
 */
@Component({})
export class Button {
  /**
   * Property disabled
   *
   * @description
   * Whether interaction is disabled.
   *
   * @type {boolean}
   */
  public disabled: boolean = false;
}`,
    },
    {
      filename: 'button.stories.ts',
      code: '/** Shows the disabled state. */\nexport const Disabled: Story = {};',
    },
    {
      filename: 'public-api.ts',
      code: "export { Button } from './button';",
    },
    {
      filename: 'helpers.ts',
      code: `/**
 * Function fold
 *
 * @description
 * Normalizes a label.
 *
 * @param {string} label - Label to normalize.
 * @returns {string} Normalized label.
 */
const fold = (label: string): string => label.toLowerCase();`,
    },
    {
      filename: 'types.ts',
      code: `/**
 * Type Config
 *
 * @description
 * A nested configuration object.
 *
 * @type {Config}
 */
type Config = {
  /**
   * Property options
   *
   * @description
   * Options used by the caller.
   *
   * @type {object}
   */
  options: { nested: string };
};`,
    },
    {
      filename: 'button.ts',
      code: `/**
 * Class Button
 *
 * @description
 * Holds an action label.
 */
class Button {
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Stores the label for the action.
   *
   * @param {string} label - Text shown for the action.
   */
  public constructor(private readonly label: string) {}
}`,
    },
  ],
  invalid: [
    {
      filename: 'button.ts',
      code: '/** A button. */\nexport class Button {}',
      errors: [{ messageId: 'structure' }],
    },
    {
      filename: 'button.ts',
      code: `/**
 * Class Other
 *
 * @description
 * Invokes an action.
 */
class Button {}`,
      errors: [{ messageId: 'structure' }],
    },
    {
      filename: 'button.ts',
      code: `/**
 * Class Button
 *
 * @description
 * Represents a button.
 */
class Button {
  /**
   * Constructor
   *
   * @description
   * Initializes a button.
   */
  public constructor() {}
}`,
      errors: [{ messageId: 'constructor' }],
    },
    {
      filename: 'button.ts',
      code: `/**
 * Class Button
 *
 * @description
 * Represents a button.
 */
class Button {
  /**
   * Property disabled
   *
   * @description
   * Whether the button is disabled.
   */
  public readonly disabled: boolean = false;
}`,
      errors: [{ messageId: 'type' }, { messageId: 'readonly' }],
    },
    {
      filename: 'button.ts',
      code: `/**
 * Class Button
 *
 * @description
 * Represents a button.
 */
class Button {
  /**
   * Property disabled
   * @readonly
   * @access public
   *
   * @description
   * Whether the button is disabled.
   *
   * @type {boolean}
   */
  public disabled: boolean = false;
}`,
      errors: [{ messageId: 'access' }, { messageId: 'unexpectedReadonly' }],
    },
  ],
});

tester.run('ui-member-regions', uiMemberRegions, {
  valid: [
    {
      code: `class Button {
  // #region Properties
  /** First input. */
  public first: boolean = false;

  /** Second input. */
  public second: boolean = false;
  // #endregion

  // #region Methods
  /** Triggers the action. */
  public trigger(): void {}
  // #endregion
}`,
    },
    { code: 'class Empty {}' },
  ],
  invalid: [
    {
      code: 'class Button { public disabled: boolean = false; }',
      errors: [{ messageId: 'open' }, { messageId: 'close' }],
    },
    {
      code: `class Button {
  // #region Properties
  /** First input. */
  public first: boolean = false;
  /** Second input. */
  public second: boolean = false;
  // #endregion
}`,
      errors: [{ messageId: 'separation' }],
    },
    {
      code: `class Button {
  // #region Properties

  /** Input. */
  public disabled: boolean = false;

  // #endregion
}`,
      errors: [{ messageId: 'open' }, { messageId: 'close' }],
    },
    {
      code: `class Button {
  // #region Helpers
  // #endregion
}`,
      errors: [{ messageId: 'marker' }],
    },
    {
      code: `class Button {
  // #endregion
}`,
      errors: [{ messageId: 'unbalanced' }],
    },
    {
      code: `// #region Properties
class Button {}
// #endregion`,
      errors: [{ messageId: 'marker' }, { messageId: 'marker' }],
    },
  ],
});
