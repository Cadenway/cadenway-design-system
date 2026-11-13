/*
 * Public API of @cadenway/ui/dropzone (Dropzone sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwDropzone } from './dropzone.component';
export { CwDropzoneFile } from './dropzone-file/dropzone-file.component';
export type {
  CwDropzoneFileLabels,
  CwDropzoneFileState,
  CwDropzoneLabels,
  CwDropzoneRejectReason,
  CwDropzoneRejection,
  CwDropzoneSize,
  CwDropzoneState,
} from './dropzone.types';
