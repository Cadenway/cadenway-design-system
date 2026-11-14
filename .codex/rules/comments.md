---
paths:
  - 'packages/**/*.ts'
  - 'packages/**/*.html'
  - 'packages/**/*.css'
  - 'apps/storybook/**/*.ts'
---

# Comments and docblocks

- Every exported declaration has a docblock (TSDoc/JSDoc): one sentence on **what it is for**, then
  the contract a caller relies on (inputs, outputs, errors, side effects). Never paraphrase the name.
- Comments explain **why**: a constraint, a trade-off, a link to the rule or the mockup screen that
  imposes the behavior. A comment that restates the code is deleted.
- A rule taken from the mockup or the integration guide cites it: `// Mockup App.dc.html: the label
changes on click, the row moves after 460 ms.`
- No commented-out code, no `TODO` without a task id (`TODO(CAD-512): …`).
- Keep docblocks in sync in the same change as the code they describe.

## `@cadenway/ui` TypeScript

The UI package has a stricter convention, including tests and story files. Apply it to authored
top-level declarations and class, interface, named object type and enum members, including private
ones. Explicit re-exports do not need a duplicate docblock. Story exports use a short prose JSDoc.
Local variables and anonymous object members do not need declaration docblocks.

- Place a JSDoc immediately before the declaration or its first decorator. Use a title matching
  the declaration (`Component CwButton`, `Property disabled`, `Method focus`, `Function format`,
  `Type ButtonSize`, `Interface ButtonOptions`, `Constant SIZES`, or `Constructor`), followed by a
  standalone `@description` and meaningful contract text. Do not put comments inside `@Component`
  metadata or templates; document the declaration or behavior where it belongs instead.
- Document declared types with `@type {Type}`, readonly members with `@readonly`, constructor
  declarations with `@constructor`, named parameters with `@param {Type} name - Description`, and
  non-void return values with `@returns {Type} Description`. Keep types and names accurate; omit
  `@readonly` on writable members and use explicit TypeScript access modifiers, not `@access`.
- Group adjacent members with `// #region Properties`, `// #region Constructor`, or
  `// #region Methods` and close each group with `// #endregion`. Put the first docblock immediately
  after the opener, the closer immediately after the last member, and one blank line between
  documented members. Getters and setters belong to Properties. Use `Traits` only for trait groups.
- Never add inline ESLint suppressions. Fix the cause or discuss a compatibility constraint rather
  than hiding it. For UI changes, run `pnpm lint:ui` and `pnpm format:ui:check`; when changing the
  custom lint rules or their configuration, also run `pnpm test:ui-lint`. The structural checks
  cannot judge whether the prose is useful or the documented types are semantically correct.

For example, document a member in its group as follows:

```ts
// #region Properties
/**
 * Property disabled
 *
 * @description
 * Prevents interaction while the action is unavailable.
 *
 * @type {boolean}
 */
public disabled: boolean = false;
// #endregion
```

## Detailed examples and review

Comments are part of the maintained contract. Write them in English and update them with the code.
Describe what callers can rely on, units, permitted values, defaults, side effects and failure
conditions when relevant. State why an implementation must behave a certain way; do not narrate
obvious operations, repeat a type that already appears in the required tag as prose, or promise
behavior that the implementation or contract does not provide.

### Placement and scope

- Put the JSDoc immediately before the declaration or its first decorator. Document authored
  declarations and members, including private ones; explicit re-exports and local variables do not
  need their own blocks. Document meaningful exported type and interface members individually.
- Put the explanation of a class, component, directive or service above its decorator, not inside
  decorator metadata. Avoid comments in templates; document the behavior at its declaration.
- Keep a single docblock per declaration. Do not leave a second block of stale or duplicated prose
  above it. Keep region markers inside the class, interface or named object type that owns them.
- For tests, document reusable helpers and fixture declarations; make test names describe observable
  behavior. Do not insert comments merely to narrate setup, assertions or framework calls.

### Required tags

- Begin with the declaration kind and exact name, then a standalone `@description` and meaningful
  prose. Use `@type {Type}` for typed properties, constants and type aliases; preserve generics,
  unions, nullability and units where applicable.
- Use `@readonly` only when the member is actually readonly and `@constructor` for constructors.
  Document each named parameter with `@param {Type} name - Description` in declaration order.
  Use `@returns {Type} Description` for non-void results and document a returned Promise as such.
  Describe thrown errors with `@throws` when that is part of the caller's contract.
- Use explicit TypeScript access modifiers where the repository's configuration permits them;
  do not add `@access` tags or change visibility just to satisfy documentation. Keep examples and
  tags consistent with the actual signature. Resolve lint errors instead of inserting ESLint
  suppression comments.

### Example: class, properties, constructor and method

```ts
/**
 * Class RetryPolicy
 *
 * @description
 * Calculates the delay between delivery attempts without scheduling them.
 */
export class RetryPolicy {
  // #region Properties
  /**
   * Property maximumAttempts
   *
   * @description
   * Maximum number of delivery attempts allowed by this policy.
   *
   * @type {number}
   * @readonly
   */
  public readonly maximumAttempts: number;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Stores the configured attempt limit.
   *
   * @param {number} maximumAttempts - Maximum number of delivery attempts.
   * @constructor
   */
  public constructor(maximumAttempts: number) {
    this.maximumAttempts = maximumAttempts;
  }
  // #endregion

  // #region Methods
  /**
   * Method delayFor
   *
   * @description
   * Returns the delay before an attempt, in milliseconds.
   *
   * @param {number} attempt - One-based attempt number.
   * @returns {number} Delay in milliseconds.
   */
  public delayFor(attempt: number): number {
    return attempt * 1000;
  }
  // #endregion
}
```

### Example: interface and type

```ts
/**
 * Interface RetryOptions
 *
 * @description
 * Configuration used to limit delivery attempts.
 */
export interface RetryOptions {
  // #region Properties
  /**
   * Property maximumAttempts
   *
   * @description
   * Maximum number of attempts before delivery is stopped.
   *
   * @type {number}
   * @readonly
   */
  readonly maximumAttempts: number;
  // #endregion
}

/**
 * Type DeliveryState
 *
 * @description
 * Possible outcomes of a delivery attempt.
 *
 * @type {'pending' | 'sent'}
 */
export type DeliveryState = 'pending' | 'sent';
```

### Review and verification

Before finishing, check title and tag names against the actual declaration, review whether every
description adds information, verify that no comment exposes secret values or personal data, and
check that examples still compile or remain syntactically valid for the relevant language. Run the
repository's existing scoped formatter and lint checks. A documentation-only rule does not itself
install an ESLint rule or prove semantic correctness; do not report enforcement that is not present.

### Angular components and templates

Describe inputs, outputs, models, ownership of state, accessibility behavior and timing where they
form part of the component contract. Place this documentation before `@Component`, `@Directive`
or `@Service`; keep decorator objects and templates free of explanatory comments. Use the project's
own form, state and routing rules. Story exports may use concise prose JSDoc when the story's state
is self-evident. Do not copy application-specific behavior into generic design-system components.
