/**
 * Type CwKbdVariant
 *
 * @description
 * Key appearance for text and menus, or inverse on a tooltip's ink fill.
 *
 * @type {'default' | 'inverse'}
 */
export type CwKbdVariant = 'default' | 'inverse';

/**
 * Type CwKbdSize
 *
 * @description
 * Key height: 16 pixels for dense rows (the command palette footer), 18 by default, 20 for inline
 * shortcut help, or 24 for the keyboard shortcuts dialog (mockup App.dc.html, « Raccourcis
 * clavier »: `h-6 min-w-6 px-1.5 text-xs`).
 *
 * @type {'sm' | 'default' | 'lg' | 'xl'}
 */
export type CwKbdSize = 'sm' | 'default' | 'lg' | 'xl';

/**
 * Interface CwKbdLabels
 *
 * @description
 * Displayed and spoken shortcut names, replaceable with `provideCwKbdLabels`.
 */
export interface CwKbdLabels {
  // #region Properties
  /**
   * Property then
   *
   * @description
   * Word spoken between shortcut sequence steps.
   *
   * @type {string}
   * @readonly
   */
  readonly then: string;

  /**
   * Property control
   *
   * @description
   * Visible name of the Control key.
   *
   * @type {string}
   * @readonly
   */
  readonly control: string;

  /**
   * Property controlSpoken
   *
   * @description
   * Spoken name of the Control key.
   *
   * @type {string}
   * @readonly
   */
  readonly controlSpoken: string;

  /**
   * Property commandSpoken
   *
   * @description
   * Spoken name of the Command key.
   *
   * @type {string}
   * @readonly
   */
  readonly commandSpoken: string;

  /**
   * Property shift
   *
   * @description
   * Visible name of the Shift key outside macOS.
   *
   * @type {string}
   * @readonly
   */
  readonly shift: string;

  /**
   * Property shiftSpoken
   *
   * @description
   * Spoken name of the Shift key.
   *
   * @type {string}
   * @readonly
   */
  readonly shiftSpoken: string;

  /**
   * Property optionSpoken
   *
   * @description
   * Spoken name of the Option key.
   *
   * @type {string}
   * @readonly
   */
  readonly optionSpoken: string;

  /**
   * Property alt
   *
   * @description
   * Visible and spoken name of the Alt key.
   *
   * @type {string}
   * @readonly
   */
  readonly alt: string;

  /**
   * Property escape
   *
   * @description
   * Visible and spoken name of the Escape key.
   *
   * @type {string}
   * @readonly
   */
  readonly escape: string;

  /**
   * Property enter
   *
   * @description
   * Visible and spoken name of the Enter key.
   *
   * @type {string}
   * @readonly
   */
  readonly enter: string;

  /**
   * Property tab
   *
   * @description
   * Visible and spoken name of the Tab key.
   *
   * @type {string}
   * @readonly
   */
  readonly tab: string;

  /**
   * Property delete
   *
   * @description
   * Visible and spoken name of the Delete key.
   *
   * @type {string}
   * @readonly
   */
  readonly delete: string;

  /**
   * Property backspace
   *
   * @description
   * Visible name of the Backspace key.
   *
   * @type {string}
   * @readonly
   */
  readonly backspace: string;

  /**
   * Property space
   *
   * @description
   * Visible and spoken name of the Space key.
   *
   * @type {string}
   * @readonly
   */
  readonly space: string;

  /**
   * Property upSpoken
   *
   * @description
   * Spoken name of the up arrow.
   *
   * @type {string}
   * @readonly
   */
  readonly upSpoken: string;

  /**
   * Property downSpoken
   *
   * @description
   * Spoken name of the down arrow.
   *
   * @type {string}
   * @readonly
   */
  readonly downSpoken: string;

  /**
   * Property leftSpoken
   *
   * @description
   * Spoken name of the left arrow.
   *
   * @type {string}
   * @readonly
   */
  readonly leftSpoken: string;

  /**
   * Property rightSpoken
   *
   * @description
   * Spoken name of the right arrow.
   *
   * @type {string}
   * @readonly
   */
  readonly rightSpoken: string;
  // #endregion
}
