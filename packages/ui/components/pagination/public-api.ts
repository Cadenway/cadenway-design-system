/*
 * Public API of @cadenway/ui/pagination (Pagination sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwPagination } from './pagination.component';
export { CwPaginationEllipsis } from './pagination-ellipsis/pagination-ellipsis.component';
export { CwPaginationLink } from './pagination-link/pagination-link.component';
export type {
  CwPaginationLabels,
  CwPaginationProvidedLabels,
  CwPaginationSize,
  CwPaginationVariant,
} from './pagination.types';

export { CW_PAGINATION_LABELS } from './pagination.constants';
export { provideCwPaginationLabels } from './pagination.providers';
