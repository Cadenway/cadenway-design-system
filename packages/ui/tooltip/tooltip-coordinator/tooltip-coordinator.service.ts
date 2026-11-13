import { Injectable } from '@angular/core';

/** What the coordinator needs from an open tooltip: a way to close it at once. */
export interface CoordinatedTooltip {
  /** Removes the bubble without its closing animation. */
  closeImmediately(): void;
}

/**
 * Keeps one tooltip open at a time and remembers when the last one closed, so the next one skips
 * its delay (Tooltip sheet, "Délais": sweeping a toolbar does not wait at every button). Shared by
 * every `[cwTooltip]` of the application; not exported from the entry point.
 */
@Injectable({ providedIn: 'root' })
export class CwTooltipCoordinator {
  private active: CoordinatedTooltip | null = null;
  private closedAt = Number.NEGATIVE_INFINITY;

  /** Whether a bubble is open, or closed less than `skipDelay` ms ago. */
  skipsDelay(skipDelay: number): boolean {
    return this.active !== null || Date.now() - this.closedAt < skipDelay;
  }

  /** Makes `tooltip` the open one; the previous one closes at once, with no fade. */
  claim(tooltip: CoordinatedTooltip): void {
    if (this.active !== null && this.active !== tooltip) this.active.closeImmediately();
    this.active = tooltip;
  }

  /** Records that `tooltip` closed, which starts the skip window. */
  release(tooltip: CoordinatedTooltip): void {
    if (this.active !== tooltip) return;
    this.active = null;
    this.closedAt = Date.now();
  }
}
