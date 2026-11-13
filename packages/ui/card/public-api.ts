/*
 * Public API of @cadenway/ui/card (Card sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md). The sheet's `CwTaskCard` is not part
 * of this package: the web application builds its task card on `cw-card` (cw-brick-recipes,
 * "Adaptations to the repository boundaries").
 */

export { CwCardAction } from './card-action.component';
export { CwCardContent } from './card-content.component';
export { CwCardDescription } from './card-description.component';
export { CwCardFooter } from './card-footer.component';
export { CwCardHeader } from './card-header.component';
export { CwCardTitle } from './card-title.component';
export { CwCard } from './card.component';
export type { CwCardSize } from './card.types';
