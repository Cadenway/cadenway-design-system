/*
 * Public API of @cadenway/ui/breadcrumb (Breadcrumb sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwBreadcrumb } from './breadcrumb.component';
export { CwBreadcrumbEllipsis } from './breadcrumb-ellipsis/breadcrumb-ellipsis.component';
export { CwBreadcrumbLink } from './breadcrumb-link/breadcrumb-link.component';
export { CwBreadcrumbPage } from './breadcrumb-page/breadcrumb-page.component';
export { CwBreadcrumbSeparator } from './breadcrumb-separator/breadcrumb-separator.component';
export type { CwBreadcrumbSeparatorStyle, CwBreadcrumbSize } from './breadcrumb.types';

export { CW_BREADCRUMB_LABELS } from './breadcrumb.constants';
export { provideCwBreadcrumbLabels } from './breadcrumb.providers';
export type { CwBreadcrumbLabels } from './breadcrumb.types';
