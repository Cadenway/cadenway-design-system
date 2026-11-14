import { Service } from '@angular/core';

/**
 * Interface CoordinatedTooltip
 *
 * @description
 * Open tooltip controlled by the shared coordinator.
 */
export interface CoordinatedTooltip {
  // #region Methods
  /**
   * Method closeImmediately
   *
   * @description
   * Removes the bubble without its closing animation.
   */
  closeImmediately(): void;
  // #endregion
}

/**
 * Service CwTooltipCoordinator
 *
 * @description
 * Keeps one tooltip open at a time and remembers when the last one closed, so the next one skips
 * its delay (Tooltip sheet, "Délais": sweeping a toolbar does not wait at every button). Shared by
 * every `[cwTooltip]` of the application; not exported from the entry point.
 */
@Service()
export class CwTooltipCoordinator {
  // #region Properties
  /**
   * Property active
   *
   * @description
   * Tooltip currently owned by the coordinator.
   *
   * @type {CoordinatedTooltip | null}
   */
  private active: CoordinatedTooltip | null = null;

  /**
   * Property closedAt
   *
   * @description
   * Timestamp of the most recent tooltip closure.
   *
   * @type {number}
   */
  private closedAt: number = Number.NEGATIVE_INFINITY;
  // #endregion

  // #region Methods
  /**
   * Method skipsDelay
   *
   * @description
   * Reports whether another tooltip can open without delay.
   *
   * @param {number} skipDelay - Skip window in milliseconds after the last tooltip closes.
   *
   * @returns {boolean} Whether a tooltip is open or the skip window is still active.
   */
  public skipsDelay(skipDelay: number): boolean {
    return this.active !== null || Date.now() - this.closedAt < skipDelay;
  }

  /**
   * Method claim
   *
   * @description
   * Replaces the active tooltip and closes the previous one.
   *
   * @param {CoordinatedTooltip} tooltip - Tooltip becoming the active one.
   */
  public claim(tooltip: CoordinatedTooltip): void {
    if (this.active !== null && this.active !== tooltip) this.active.closeImmediately();
    this.active = tooltip;
  }

  /**
   * Method release
   *
   * @description
   * Records the active tooltip closure and starts the skip window.
   *
   * @param {CoordinatedTooltip} tooltip - Tooltip reporting its closure.
   */
  public release(tooltip: CoordinatedTooltip): void {
    if (this.active !== tooltip) return;
    this.active = null;
    this.closedAt = Date.now();
  }
  // #endregion
}
